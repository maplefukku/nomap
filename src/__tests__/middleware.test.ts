import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn().mockResolvedValue(new Response()),
}));

describe("middleware", () => {
  let updateSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    const supabaseMw = await import("@/lib/supabase/middleware");
    updateSession = supabaseMw.updateSession as ReturnType<typeof vi.fn>;
    updateSession.mockClear();
  });

  async function callMiddleware(pathname: string) {
    const { middleware } = await import("../middleware");
    const request = new NextRequest(new URL(pathname, "http://localhost:3000"));
    return middleware(request);
  }

  it("APIルートではupdateSessionをスキップする", async () => {
    const result = await callMiddleware("/api/transform");
    expect(result).toBeUndefined();
    expect(updateSession).not.toHaveBeenCalled();
  });

  it("/api/で始まる全てのパスをスキップする", async () => {
    await callMiddleware("/api/health");
    expect(updateSession).not.toHaveBeenCalled();

    await callMiddleware("/api/foo/bar");
    expect(updateSession).not.toHaveBeenCalled();
  });

  it("通常のページリクエストではupdateSessionを呼ぶ", async () => {
    await callMiddleware("/");
    expect(updateSession).toHaveBeenCalledTimes(1);
  });

  it("非APIのパスではupdateSessionを呼ぶ", async () => {
    await callMiddleware("/dashboard");
    expect(updateSession).toHaveBeenCalledTimes(1);
  });

  it("matcherの設定がエクスポートされている", async () => {
    const { config } = await import("../middleware");
    expect(config.matcher).toBeDefined();
    expect(config.matcher).toHaveLength(1);
  });
});
