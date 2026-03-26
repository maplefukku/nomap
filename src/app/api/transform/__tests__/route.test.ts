/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

// transformRejectionsをモック
vi.mock("@/lib/ai/transform", () => ({
  transformRejections: vi.fn(),
}));

const mockTransformRejections = vi.mocked(
  (await import("@/lib/ai/transform")).transformRejections
);

describe("POST /api/transform", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    // 環境変数を設定
    process.env.GLM_API_KEY = "test-key";

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: ["残業する"] }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].avoidPattern).toBe("パターン");
  });

  it("returns 400 for empty rejections array", async () => {
    process.env.GLM_API_KEY = "test-key";

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: [] }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("returns 400 for missing rejections", async () => {
    process.env.GLM_API_KEY = "test-key";

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("returns 500 when API key is not configured", async () => {
    delete process.env.GLM_API_KEY;

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: ["残業する"] }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("GLM API key not configured");
  });

  it("returns 400 for invalid JSON", async () => {
    process.env.GLM_API_KEY = "test-key";

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("リクエストの形式が不正です");
  });

  it("returns 502 when transformRejections throws an error", async () => {
    process.env.GLM_API_KEY = "test-key";
    mockTransformRejections.mockRejectedValueOnce(new Error("API error"));

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: ["残業する"] }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("API error");
  });

  it("calls transformRejections with correct parameters", async () => {
    process.env.GLM_API_KEY = "my-api-key";

    mockTransformRejections.mockResolvedValueOnce([]);

    const request = new Request("http://localhost/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejections: ["残業する", "夜勤"] }),
    });

    await POST(request as any);

    expect(mockTransformRejections).toHaveBeenCalledWith(
      ["残業する", "夜勤"],
      "my-api-key"
    );
  });
});
