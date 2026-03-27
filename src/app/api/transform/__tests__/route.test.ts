/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { MAX_REJECTIONS, MAX_REJECTION_LENGTH } from "@/lib/constants";

// transformRejectionsをモック
vi.mock("@/lib/ai/transform", () => ({
  transformRejections: vi.fn(),
}));

const mockTransformRejections = vi.mocked(
  (await import("@/lib/ai/transform")).transformRejections
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

    const response = await POST(makeRequest({ rejections: ["残業する"] }) as any);
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

    const response = await POST(makeRequest({ rejections: ["残業する"] }) as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("GLM API key not configured");
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

    const response = await POST(makeRequest({ rejections: ["残業する"] }) as any);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("API error");
  });

  it("calls transformRejections with correct parameters", async () => {
    process.env.GLM_API_KEY = "my-api-key";
    mockTransformRejections.mockResolvedValueOnce([]);

    await POST(makeRequest({ rejections: ["残業する", "夜勤"] }) as any);

    expect(mockTransformRejections).toHaveBeenCalledWith(
      ["残業する", "夜勤"],
      "my-api-key"
    );
  });

  it("returns 400 when rejections contain non-string items", async () => {
    const response = await POST(makeRequest({ rejections: [123, true] }) as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否項目は文字列で指定してください");
  });

  it("returns 400 when rejections exceed max count", async () => {
    const tooMany = Array.from({ length: MAX_REJECTIONS + 1 }, (_, i) => `項目${i}`);

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
    const response = await POST(makeRequest({ rejections: ["  ", "\t", ""] }) as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("拒否リストが空です");
  });

  it("returns 429 when rate limited", async () => {
    mockTransformRejections.mockResolvedValue([]);
    const sharedIp = "rate-limit-test-ip";

    // Send max requests
    for (let i = 0; i < 10; i++) {
      await POST(makeRequest({ rejections: ["テスト"] }, { "x-forwarded-for": sharedIp }) as any);
    }

    // Next request should be rate limited
    const response = await POST(
      makeRequest({ rejections: ["テスト"] }, { "x-forwarded-for": sharedIp }) as any
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain("リクエストが多すぎます");
  });
});
