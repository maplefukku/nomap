import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// envInt / envFloat はモジュールスコープで実行されるため、
// 環境変数を設定してからモジュールキャッシュをリセットして再インポートする

describe("envInt", () => {
  const original = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("環境変数が設定されている場合、その値が返される", async () => {
    process.env.GLM_API_TIMEOUT_MS = "5000";
    const mod = await import("./constants.server.ts");
    expect(mod.GLM_API_TIMEOUT_MS).toBe(5000);
  });

  it("環境変数が無効な値の場合、フォールバック値が返される", async () => {
    process.env.GLM_MAX_TOKENS = "not_a_number";
    const mod = await import("./constants.server.ts");
    expect(mod.GLM_MAX_TOKENS).toBe(2000);
  });

  it("環境変数が未設定の場合、フォールバック値が返される", async () => {
    delete process.env.GLM_API_TIMEOUT_MS;
    const mod = await import("./constants.server.ts");
    expect(mod.GLM_API_TIMEOUT_MS).toBe(30_000);
  });
});

describe("envFloat", () => {
  const original = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...original };
  });

  afterEach(() => {
    process.env = original;
  });

  it("環境変数が設定されている場合、その値が返される", async () => {
    process.env.GLM_TEMPERATURE = "0.5";
    const mod = await import("./constants.server.ts");
    expect(mod.GLM_TEMPERATURE).toBe(0.5);
  });

  it("環境変数が無効な値の場合、フォールバック値が返される", async () => {
    process.env.GLM_TEMPERATURE = "invalid";
    const mod = await import("./constants.server.ts");
    expect(mod.GLM_TEMPERATURE).toBe(0.7);
  });

  it("環境変数が未設定の場合、フォールバック値が返される", async () => {
    delete process.env.GLM_TEMPERATURE;
    const mod = await import("./constants.server.ts");
    expect(mod.GLM_TEMPERATURE).toBe(0.7);
  });
});
