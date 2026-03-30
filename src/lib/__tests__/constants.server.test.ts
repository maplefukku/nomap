import { describe, it, expect, vi, afterEach } from "vitest";

describe("constants.server - envInt / envFloat", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("envInt: 環境変数が未定義の場合はfallbackを返す", async () => {
    delete process.env.GLM_API_TIMEOUT_MS;
    const { GLM_API_TIMEOUT_MS } = await import("../constants.server");
    expect(GLM_API_TIMEOUT_MS).toBe(30_000);
  });

  it("envInt: 有効な数値の環境変数をパースする", async () => {
    process.env.GLM_MAX_TOKENS = "4000";
    const { GLM_MAX_TOKENS } = await import("../constants.server");
    expect(GLM_MAX_TOKENS).toBe(4000);
  });

  it("envInt: NaN値の場合はfallbackを返す", async () => {
    process.env.GLM_MAX_TOKENS = "not-a-number";
    const { GLM_MAX_TOKENS } = await import("../constants.server");
    expect(GLM_MAX_TOKENS).toBe(2000);
  });

  it("envInt: Infinityの場合はfallbackを返す", async () => {
    process.env.GLM_MAX_TOKENS = "Infinity";
    const { GLM_MAX_TOKENS } = await import("../constants.server");
    expect(GLM_MAX_TOKENS).toBe(2000);
  });

  it("envFloat: 環境変数が未定義の場合はfallbackを返す", async () => {
    delete process.env.GLM_TEMPERATURE;
    const { GLM_TEMPERATURE } = await import("../constants.server");
    expect(GLM_TEMPERATURE).toBe(0.7);
  });

  it("envFloat: 有効な小数の環境変数をパースする", async () => {
    process.env.GLM_TEMPERATURE = "0.9";
    const { GLM_TEMPERATURE } = await import("../constants.server");
    expect(GLM_TEMPERATURE).toBe(0.9);
  });

  it("envFloat: NaN値の場合はfallbackを返す", async () => {
    process.env.GLM_TEMPERATURE = "abc";
    const { GLM_TEMPERATURE } = await import("../constants.server");
    expect(GLM_TEMPERATURE).toBe(0.7);
  });

  it("envFloat: Infinityの場合はfallbackを返す", async () => {
    process.env.GLM_TEMPERATURE = "Infinity";
    const { GLM_TEMPERATURE } = await import("../constants.server");
    expect(GLM_TEMPERATURE).toBe(0.7);
  });

  it("envInt: 最小値未満の場合は最小値にクランプされる", async () => {
    process.env.GLM_API_TIMEOUT_MS = "100";
    const { GLM_API_TIMEOUT_MS } = await import("../constants.server");
    expect(GLM_API_TIMEOUT_MS).toBe(1000);
  });

  it("envFloat: 最小値未満の場合は最小値にクランプされる", async () => {
    process.env.GLM_TEMPERATURE = "-1";
    const { GLM_TEMPERATURE } = await import("../constants.server");
    expect(GLM_TEMPERATURE).toBe(0);
  });
});
