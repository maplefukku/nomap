import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";
import { MAX_REJECTIONS, MAX_REJECTION_LENGTH } from "@/lib/constants.server";

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

function makeRequest(
  body: unknown,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest("http://localhost/api/transform", {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("正常なリクエストで結果を返す", async () => {
    const mockResults = [
      {
        avoidPattern: "パターン",
        direction: "方向",
        firstAction: "アクション",
        esPhrase: "フレーズ",
      },
    ];

    mockTransformRejections.mockResolvedValueOnce(mockResults);

    const response = await POST(makeRequest({ rejections: ["残業する"] }));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].avoidPattern).toBe("パターン");
  });

  it("空の拒否リストで400を返す", async () => {
    const response = await POST(makeRequest({ rejections: [] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("rejectionsフィールド未指定で400を返す", async () => {
    const response = await POST(makeRequest({}));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("APIキー未設定で503を返す", async () => {
    delete process.env.GLM_API_KEY;

    const response = await POST(makeRequest({ rejections: ["残業する"] }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe("GLM APIキーが設定されていません");
  });

  it("不正なJSONリクエストで400を返す", async () => {
    const request = new NextRequest("http://localhost/api/transform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "json-test",
      },
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("リクエストの形式が不正です");
  });

  it("transformRejectionsの例外時に汎用エラーメッセージで502を返す", async () => {
    mockTransformRejections.mockRejectedValueOnce(new Error("API error"));

    const response = await POST(makeRequest({ rejections: ["残業する"] }));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("変換処理に失敗しました");
  });

  it("安全なGLM APIエラーメッセージはそのまま返される", async () => {
    mockTransformRejections.mockRejectedValueOnce(
      new Error("GLM APIエラー（ステータス: 503）"),
    );

    const response = await POST(makeRequest({ rejections: ["残業する"] }));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("GLM APIエラー（ステータス: 503）");
  });

  it("transformRejectionsに正しい引数を渡す", async () => {
    process.env.GLM_API_KEY = "my-api-key";
    mockTransformRejections.mockResolvedValueOnce([]);

    await POST(makeRequest({ rejections: ["残業する", "夜勤"] }));

    expect(mockTransformRejections).toHaveBeenCalledWith(
      ["残業する", "夜勤"],
      "my-api-key",
    );
  });

  it("拒否項目に文字列以外が含まれる場合400を返す", async () => {
    const response = await POST(makeRequest({ rejections: [123, true] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否項目は文字列で指定してください");
  });

  it("拒否項目数が上限を超えた場合400を返す", async () => {
    const tooMany = Array.from(
      { length: MAX_REJECTIONS + 1 },
      (_, i) => `項目${i}`,
    );

    const response = await POST(makeRequest({ rejections: tooMany }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain(`${MAX_REJECTIONS}`);
  });

  it("拒否項目の文字数が上限を超えた場合400を返す", async () => {
    const longItem = "あ".repeat(MAX_REJECTION_LENGTH + 1);

    const response = await POST(makeRequest({ rejections: [longItem] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain(`${MAX_REJECTION_LENGTH}`);
  });

  it("空白のみの拒否項目を除外し、全て空なら400を返す", async () => {
    const response = await POST(makeRequest({ rejections: ["  ", "\t", ""] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("同一IPからの連続リクエストでレート制限（429）を返す", async () => {
    mockTransformRejections.mockResolvedValue([]);
    const sharedIp = "rate-limit-test-ip";

    // Send max requests
    for (let i = 0; i < 10; i++) {
      await POST(
        makeRequest(
          { rejections: ["テスト"] },
          { "x-forwarded-for": sharedIp },
        ),
      );
    }

    // Next request should be rate limited
    const response = await POST(
      makeRequest({ rejections: ["テスト"] }, { "x-forwarded-for": sharedIp }),
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
      makeRequest({ rejections: ["テスト"] }, { "x-forwarded-for": cleanupIp }),
    );

    // CLEANUP_INTERVAL_MS(60s)以上 + RATE_LIMIT_WINDOW_MS(60s)以上を
    // 未来に進めてクリーンアップをトリガー
    // lastCleanupはモジュールロード時のDate.now()なので、
    // 現在時刻+120s以上にする
    const futureTime = Date.now() + 200_000;
    const _dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(futureTime);

    // 別のIPでリクエスト → クリーンアップが実行される
    const response = await POST(
      makeRequest(
        { rejections: ["テスト"] },
        { "x-forwarded-for": "trigger-cleanup-ip" },
      ),
    );

    expect(response.status).toBe(200);

    // cleanupIpのエントリが削除されたことを確認:
    // 同じ時刻で再度リクエストしても429にならない（エントリが消えている）
    const afterCleanup = await POST(
      makeRequest({ rejections: ["テスト"] }, { "x-forwarded-for": cleanupIp }),
    );
    expect(afterCleanup.status).toBe(200);
  });

  it("IPヘッダー未設定時にフォールバックIPを使用する", async () => {
    mockTransformRejections.mockResolvedValueOnce([]);

    const request = new NextRequest("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: ["テスト"] }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it("Error以外の例外時に汎用エラーメッセージで502を返す", async () => {
    mockTransformRejections.mockRejectedValueOnce("string error");

    const response = await POST(makeRequest({ rejections: ["テスト"] }));
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
      ),
    );

    // activeIp のエントリを T+2 で作成
    const activeIp = "active-keep-" + Math.random();
    dateNowSpy.mockReturnValue(T + 2);
    await POST(
      makeRequest({ rejections: ["テスト"] }, { "x-forwarded-for": activeIp }),
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
      ),
    );
    expect(response.status).toBe(200);
  });

  it("リクエストボディが配列の場合400を返す", async () => {
    const response = await POST(makeRequest(["item1", "item2"]));
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("リクエストの形式が不正です");
  });
});
