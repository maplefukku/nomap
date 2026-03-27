/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { MAX_REJECTIONS, MAX_REJECTION_LENGTH } from "@/lib/constants";

// envモジュールをモック
vi.mock("@/lib/env", () => ({
  serverEnv: {
    get GLM_API_KEY() {
      return process.env.GLM_API_KEY;
    },
    GLM_BASE_URL: "https://api.z.ai/api/coding/paas/v4/",
    GLM_MODEL: "glm-4.7",
  },
}));

// transformRejectionsをモック
vi.mock("@/lib/ai/transform", () => ({
  transformRejections: vi.fn(),
}));

const mockTransformRejections = vi.mocked(
  (await import("@/lib/ai/transform")).transformRejections,
);

function makeRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("http://localhost/api/transform", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `${Math.random()}`,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/transform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GLM_API_KEY = "test-key";
  });

  it("returns results for valid request", async () => {
    const mockResults = [
      {
        avoidPattern: "パターン",
        direction: "方向",
        firstAction: "アクション",
        esPhrase: "フレーズ",
      },
    ];

    mockTransformRejections.mockResolvedValueOnce(mockResults);

    const response = await POST(
      makeRequest({ rejections: ["残業する"] }) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].avoidPattern).toBe("パターン");
  });

  it("returns 400 for empty rejections array", async () => {
    const response = await POST(makeRequest({ rejections: [] }) as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("returns 400 for missing rejections", async () => {
    const response = await POST(makeRequest({}) as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("returns 500 when API key is not configured", async () => {
    delete process.env.GLM_API_KEY;

    const response = await POST(
      makeRequest({ rejections: ["残業する"] }) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("GLM APIキーが設定されていません");
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "json-test",
      },
      body: "invalid json",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("リクエストの形式が不正です");
  });

  it("returns 502 when transformRejections throws an error", async () => {
    mockTransformRejections.mockRejectedValueOnce(new Error("API error"));

    const response = await POST(
      makeRequest({ rejections: ["残業する"] }) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("変換処理に失敗しました");
  });

  it("安全なGLM APIエラーメッセージはそのまま返される", async () => {
    mockTransformRejections.mockRejectedValueOnce(
      new Error("GLM APIエラー（ステータス: 503）"),
    );

    const response = await POST(
      makeRequest({ rejections: ["残業する"] }) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("GLM APIエラー（ステータス: 503）");
  });

  it("calls transformRejections with correct parameters", async () => {
    process.env.GLM_API_KEY = "my-api-key";
    mockTransformRejections.mockResolvedValueOnce([]);

    await POST(makeRequest({ rejections: ["残業する", "夜勤"] }) as any);

    expect(mockTransformRejections).toHaveBeenCalledWith(
      ["残業する", "夜勤"],
      "my-api-key",
    );
  });

  it("returns 400 when rejections contain non-string items", async () => {
    const response = await POST(
      makeRequest({ rejections: [123, true] }) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否項目は文字列で指定してください");
  });

  it("returns 400 when rejections exceed max count", async () => {
    const tooMany = Array.from(
      { length: MAX_REJECTIONS + 1 },
      (_, i) => `項目${i}`,
    );

    const response = await POST(makeRequest({ rejections: tooMany }) as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain(`${MAX_REJECTIONS}`);
  });

  it("returns 400 when a rejection exceeds max length", async () => {
    const longItem = "あ".repeat(MAX_REJECTION_LENGTH + 1);

    const response = await POST(makeRequest({ rejections: [longItem] }) as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain(`${MAX_REJECTION_LENGTH}`);
  });

  it("trims whitespace-only rejections and returns 400 if all empty", async () => {
    const response = await POST(
      makeRequest({ rejections: ["  ", "\t", ""] }) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("returns 429 when rate limited", async () => {
    mockTransformRejections.mockResolvedValue([]);
    const sharedIp = "rate-limit-test-ip";

    // Send max requests
    for (let i = 0; i < 10; i++) {
      await POST(
        makeRequest(
          { rejections: ["テスト"] },
          { "x-forwarded-for": sharedIp },
        ) as any,
      );
    }

    // Next request should be rate limited
    const response = await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": sharedIp },
      ) as any,
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain("リクエストが多すぎます");
  });

  it("クリーンアップで古いエントリが削除される", async () => {
    mockTransformRejections.mockResolvedValue([]);
    const cleanupIp = "cleanup-test-ip-unique";

    // まず通常のリクエストを送信してrequestLogにエントリを作成
    await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": cleanupIp },
      ) as any,
    );

    // CLEANUP_INTERVAL_MS(60s)以上 + RATE_LIMIT_WINDOW_MS(60s)以上を
    // 未来に進めてクリーンアップをトリガー
    // lastCleanupはモジュールロード時のDate.now()なので、
    // 現在時刻+120s以上にする
    const futureTime = Date.now() + 200_000;
    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(futureTime);

    // 別のIPでリクエスト → クリーンアップが実行される
    const response = await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": "trigger-cleanup-ip" },
      ) as any,
    );

    expect(response.status).toBe(200);

    // cleanupIpのエントリが削除されたことを確認:
    // 同じ時刻で再度リクエストしても429にならない（エントリが消えている）
    const afterCleanup = await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": cleanupIp },
      ) as any,
    );
    expect(afterCleanup.status).toBe(200);

    dateNowSpy.mockRestore();
  });

  it("uses 'unknown' as IP when x-forwarded-for header is missing", async () => {
    mockTransformRejections.mockResolvedValueOnce([]);

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: ["テスト"] }),
    });

    const response = await POST(request as any);
    expect(response.status).toBe(200);
  });

  it("returns fallback message when non-Error is thrown", async () => {
    mockTransformRejections.mockRejectedValueOnce("string error");

    const response = await POST(makeRequest({ rejections: ["テスト"] }) as any);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("変換処理に失敗しました");
  });

  it("クリーンアップでアクティブなエントリは保持される", async () => {
    mockTransformRejections.mockResolvedValue([]);

    // 十分大きな値で lastCleanup をリセットする
    const T = Date.now() + 1_000_000;
    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(T);

    // リクエストでクリーンアップをトリガーし lastCleanup = T にリセット
    await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": "reset-" + Math.random() },
      ) as any,
    );

    // activeIp のエントリを T+2 で作成
    const activeIp = "active-keep-" + Math.random();
    dateNowSpy.mockReturnValue(T + 2);
    await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": activeIp },
      ) as any,
    );
    // requestLog[activeIp] = [T+2]

    // T + 60_001 でクリーンアップをトリガー
    // now - lastCleanup(T) = 60_001 > 60_000 → クリーンアップ発動
    // activeIp: every(t => 60_001 - 2 >= 60_000) → 59_999 >= 60_000 → false → 保持! ✓
    dateNowSpy.mockReturnValue(T + 60_001);
    const response = await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": "trigger-" + Math.random() },
      ) as any,
    );
    expect(response.status).toBe(200);

    dateNowSpy.mockRestore();
  });
});
