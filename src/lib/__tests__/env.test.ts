import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// env.ts reads process.env at module scope, so we need to control env
// before each import. We use dynamic import with vi.resetModules().

describe("env - requiredInProduction / assertEnv / validateBaseURL", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // serverEnv.GLM_BASE_URL - validateBaseURL
  // ---------------------------------------------------------------------------

  it("デフォルトのGLM_BASE_URLが末尾スラッシュ付きで返される", async () => {
    delete process.env.GLM_BASE_URL;
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_BASE_URL).toBe("https://api.z.ai/api/coding/paas/v4/");
  });

  it("カスタムGLM_BASE_URLが正規化される", async () => {
    process.env.GLM_BASE_URL = "https://example.com/api";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_BASE_URL).toBe("https://example.com/api/");
  });

  it("末尾スラッシュ付きURLはそのまま返される", async () => {
    process.env.GLM_BASE_URL = "https://example.com/api/";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_BASE_URL).toBe("https://example.com/api/");
  });

  it("不正なURLはフォールバックURLを返す", async () => {
    process.env.GLM_BASE_URL = "not-a-url";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_BASE_URL).toBe("https://api.z.ai/api/coding/paas/v4/");
    expect(console.error).toHaveBeenCalledWith(
      "[env]",
      expect.objectContaining({ error: "invalid URL format" }),
    );
  });

  it("本番環境でHTTP URLを使用すると警告が出る", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.GLM_BASE_URL = "http://example.com/api/";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_BASE_URL).toBe("http://example.com/api/");
    expect(console.warn).toHaveBeenCalledWith(
      "[env]",
      expect.objectContaining({ warning: "non-HTTPS URL in production" }),
    );
  });

  it("開発環境ではHTTP URLでも警告が出ない", async () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.GLM_BASE_URL = "http://localhost:3000/api/";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_BASE_URL).toBe("http://localhost:3000/api/");
    expect(console.warn).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // serverEnv.GLM_MODEL
  // ---------------------------------------------------------------------------

  it("GLM_MODELのデフォルト値はglm-4.7", async () => {
    delete process.env.GLM_MODEL;
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_MODEL).toBe("glm-4.7");
  });

  it("GLM_MODELをカスタム設定できる", async () => {
    process.env.GLM_MODEL = "glm-4.8";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_MODEL).toBe("glm-4.8");
  });

  // ---------------------------------------------------------------------------
  // serverEnv.GLM_API_KEY - assertEnv
  // ---------------------------------------------------------------------------

  it("GLM_API_KEYが未設定の開発環境ではundefinedを返す", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.GLM_API_KEY;
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_API_KEY).toBeUndefined();
  });

  it("GLM_API_KEYが設定されていると値を返す", async () => {
    process.env.GLM_API_KEY = "test-key-123";
    const { serverEnv } = await import("../env");
    expect(serverEnv.GLM_API_KEY).toBe("test-key-123");
  });

  it("本番環境でGLM_API_KEYが未設定だとエラーをスローする", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.GLM_API_KEY;
    const { serverEnv } = await import("../env");
    expect(() => serverEnv.GLM_API_KEY).toThrow(
      "[env] 必須環境変数が未設定: GLM_API_KEY",
    );
  });

  // ---------------------------------------------------------------------------
  // clientEnv - requiredInProduction
  // ---------------------------------------------------------------------------

  it("開発環境でSupabase環境変数が未設定でもundefinedを返す", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { clientEnv } = await import("../env");
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeUndefined();
  });

  it("本番環境でSupabase環境変数が未設定だと警告を出す", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { clientEnv } = await import("../env");
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      "[env]",
      expect.objectContaining({
        error: "missing required variable",
        name: "NEXT_PUBLIC_SUPABASE_URL",
      }),
    );
  });

  it("Supabase環境変数が設定されていると値を返す", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-123";
    const { clientEnv } = await import("../env");
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe(
      "https://example.supabase.co",
    );
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe("anon-key-123");
  });
});
