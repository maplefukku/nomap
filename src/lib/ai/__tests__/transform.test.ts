import { describe, it, expect, vi, beforeEach } from "vitest";
import { transformRejections } from "../transform";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("transformRejections", () => {
  beforeEach(() => {
    mockFetch.mockReset();
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
      })
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

    await expect(
      transformRejections(["残業する"], "test-key")
    ).rejects.toThrow("GLM API error: 500");
  });

  it("throws on empty response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "" } }],
      }),
    });

    await expect(
      transformRejections(["残業する"], "test-key")
    ).rejects.toThrow("Empty response from GLM API");
  });

  it("throws on invalid JSON in response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "not json" } }],
      }),
    });

    await expect(
      transformRejections(["残業する"], "test-key")
    ).rejects.toThrow();
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
});
