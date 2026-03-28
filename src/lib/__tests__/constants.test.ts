import { describe, it, expect, vi, afterEach } from "vitest";

describe("constants - envInt / envFloat", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("envInt: 環境変数が未定義の場合はfallbackを返す", async () => {
    delete process.env.GLM_API_TIMEOUT_MS;
    const { GLM_API_TIMEOUT_MS } = await import("../constants");
    expect(GLM_API_TIMEOUT_MS).toBe(30_000);
  });

  it("envInt: 有効な数値の環境変数をパースする", async () => {
    process.env.GLM_MAX_TOKENS = "4000";
    const { GLM_MAX_TOKENS } = await import("../constants");
    expect(GLM_MAX_TOKENS).toBe(4000);
  });

  it("envInt: NaN値の場合はfallbackを返す", async () => {
    process.env.GLM_MAX_TOKENS = "not-a-number";
    const { GLM_MAX_TOKENS } = await import("../constants");
    expect(GLM_MAX_TOKENS).toBe(2000);
  });

  it("envInt: Infinityの場合はfallbackを返す", async () => {
    process.env.GLM_MAX_TOKENS = "Infinity";
    const { GLM_MAX_TOKENS } = await import("../constants");
    expect(GLM_MAX_TOKENS).toBe(2000);
  });

  it("envFloat: 環境変数が未定義の場合はfallbackを返す", async () => {
    delete process.env.GLM_TEMPERATURE;
    const { GLM_TEMPERATURE } = await import("../constants");
    expect(GLM_TEMPERATURE).toBe(0.7);
  });

  it("envFloat: 有効な小数の環境変数をパースする", async () => {
    process.env.GLM_TEMPERATURE = "0.9";
    const { GLM_TEMPERATURE } = await import("../constants");
    expect(GLM_TEMPERATURE).toBe(0.9);
  });

  it("envFloat: NaN値の場合はfallbackを返す", async () => {
    process.env.GLM_TEMPERATURE = "abc";
    const { GLM_TEMPERATURE } = await import("../constants");
    expect(GLM_TEMPERATURE).toBe(0.7);
  });

  it("envFloat: Infinityの場合はfallbackを返す", async () => {
    process.env.GLM_TEMPERATURE = "Infinity";
    const { GLM_TEMPERATURE } = await import("../constants");
    expect(GLM_TEMPERATURE).toBe(0.7);
  });
});

describe("constants - animation presets", () => {
  it("fadeInUp: デフォルト引数で正しいアニメーションを返す", async () => {
    const { fadeInUp } = await import("../constants");
    const result = fadeInUp();
    expect(result.initial).toEqual({ opacity: 0, y: 12 });
    expect(result.animate).toEqual({ opacity: 1, y: 0 });
    expect(result.transition.duration).toBe(0.4);
    expect(result.transition.delay).toBe(0);
  });

  it("fadeInUp: カスタム引数を受け付ける", async () => {
    const { fadeInUp } = await import("../constants");
    const result = fadeInUp(24, 0.5, 0.8);
    expect(result.initial.y).toBe(24);
    expect(result.transition.delay).toBe(0.5);
    expect(result.transition.duration).toBe(0.8);
  });

  it("fade: 正しいプリセットを持つ", async () => {
    const { fade } = await import("../constants");
    expect(fade.initial).toEqual({ opacity: 0 });
    expect(fade.animate).toEqual({ opacity: 1 });
    expect(fade.exit).toEqual({ opacity: 0 });
  });

  it("animations: 全てのプリセットが定義されている", async () => {
    const { animations } = await import("../constants");
    expect(animations.actionCard).toBeDefined();
    expect(animations.esCard).toBeDefined();
    expect(animations.errorBoundary).toBeDefined();
    expect(animations.errorInline).toBeDefined();
    expect(animations.emptyState).toBeDefined();
  });
});
