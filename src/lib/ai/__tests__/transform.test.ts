import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/env", () => ({
  serverEnv: {
    GLM_API_KEY: "test-key",
    GLM_BASE_URL: "https://api.z.ai/api/coding/paas/v4/",
    GLM_MODEL: "glm-4.7",
  },
}));

import { transformRejections } from "../transform";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("transformRejections", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends correct request to GLM API", async () => {
    const mockResponse = [
      {
        avoidPattern: "パターン",
        direction: "方向",
        firstAction: "アクション",
        esPhrase: "フレーズ",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    await transformRejections(["残業する"], "test-key");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.z.ai/api/coding/paas/v4/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-key",
        },
      }),
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe("glm-4.7");
    expect(body.messages).toHaveLength(2);
    expect(body.messages[1].content).toContain("残業する");
  });

  it("parses valid response correctly", async () => {
    const mockResponse = [
      {
        avoidPattern: "回避パターン",
        direction: "進む方向",
        firstAction: "最初の一歩",
        esPhrase: "背中を押す一言",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    const results = await transformRejections(["残業する"], "test-key");

    expect(results).toHaveLength(1);
    expect(results[0].avoidPattern).toBe("回避パターン");
    expect(results[0].direction).toBe("進む方向");
    expect(results[0].firstAction).toBe("最初の一歩");
    expect(results[0].esPhrase).toBe("背中を押す一言");
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      "GLM APIエラー（ステータス: 500）",
    );
  });

  it("throws on empty response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "" } }],
      }),
    });

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      "GLM APIから空の応答が返されました",
    );
  });

  it("throws on invalid JSON in response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "not json" } }],
      }),
    });

    await expect(
      transformRejections(["残業する"], "test-key"),
    ).rejects.toThrow();
  });

  it("タイムアウト時にエラーをスローする", async () => {
    const abortError = new DOMException(
      "The operation was aborted",
      "AbortError",
    );
    mockFetch.mockRejectedValueOnce(abortError);

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      "GLM APIがタイムアウトしました",
    );
  });

  it("ネットワークエラー時にそのままスローする", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      "fetch failed",
    );
  });

  it("DOMExceptionでもAbortError以外はそのままスローする", async () => {
    const nonAbortError = new DOMException("Some other error", "NetworkError");
    mockFetch.mockRejectedValueOnce(nonAbortError);

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      nonAbortError,
    );
  });

  it("一般的なErrorオブジェクトのcatchはそのままスローする", async () => {
    const genericError = new Error("connection refused");
    mockFetch.mockRejectedValueOnce(genericError);

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      "connection refused",
    );
  });

  it("fetchにAbortSignalが渡される", async () => {
    const mockResponse = [
      { avoidPattern: "p", direction: "d", firstAction: "a" },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    await transformRejections(["残業する"], "test-key");

    // fetchにAbortSignalが渡されていることを確認
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.signal).toBeInstanceOf(AbortSignal);
  });

  it("配列以外のレスポンスでエラーをスローする", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"key": "value"}' } }],
      }),
    });

    await expect(transformRejections(["残業する"], "test-key")).rejects.toThrow(
      "GLM APIの応答形式が不正です",
    );
  });

  it("handles missing optional fields", async () => {
    const mockResponse = [
      {
        avoidPattern: "パターン",
        direction: "方向",
        firstAction: "アクション",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    const results = await transformRejections(["残業する"], "test-key");
    expect(results[0].esPhrase).toBeUndefined();
  });

  it("配列要素がオブジェクトでない場合にinvalidFormatエラーになる", async () => {
    const mockResponse = ["文字列", 42, null];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    await expect(transformRejections(["テスト"], "test-key")).rejects.toThrow(
      "GLM APIの応答形式が不正です",
    );
  });

  it("必須フィールドが欠けた要素はフィルタされ有効な要素のみ返る", async () => {
    const mockResponse = [
      {
        avoidPattern: "パターン",
        direction: "方向",
        firstAction: 123, // 文字列でないため空文字→フィルタ対象
        esPhrase: "フレーズ",
      },
      {
        avoidPattern: "有効パターン",
        direction: "有効方向",
        firstAction: "有効アクション",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    const results = await transformRejections(["テスト"], "test-key");

    expect(results).toHaveLength(1);
    expect(results[0].avoidPattern).toBe("有効パターン");
  });

  it("必須フィールドが全て欠けた場合にinvalidFormatエラーになる", async () => {
    const mockResponse = [
      {
        // avoidPattern, direction, firstAction が未定義
        values: "自律性・成長",
        esPhrase: "フレーズ",
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }],
      }),
    });

    await expect(transformRejections(["テスト"], "test-key")).rejects.toThrow(
      "GLM APIの応答形式が不正です",
    );
  });

  it("response.json()が失敗した場合、parseFailedエラーをthrowする", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(transformRejections(["テスト"], "test-key")).rejects.toThrow(
      "GLM APIの応答をパースできませんでした",
    );
  });
});
