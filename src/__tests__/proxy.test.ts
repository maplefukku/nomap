import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/middleware", () => ({
  updateSession: vi.fn().mockResolvedValue(new Response()),
}));

describe("proxy", () => {
  let updateSession: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    const supabaseMw = await import("@/lib/supabase/middleware");
    updateSession = supabaseMw.updateSession as ReturnType<typeof vi.fn>;
    updateSession.mockClear();
  });

  async function callProxy(pathname: string) {
    const { proxy } = await import("../proxy");
    const request = new NextRequest(new URL(pathname, "http://localhost:3000"));
    return proxy(request);
  }

  it("APIルートではupdateSessionをスキップする", async () => {
    const result = await callProxy("/api/transform");
    expect(result).toBeUndefined();
    expect(updateSession).not.toHaveBeenCalled();
  });

  it("/api/で始まる全てのパスをスキップする", async () => {
    await callProxy("/api/health");
    expect(updateSession).not.toHaveBeenCalled();

    await callProxy("/api/foo/bar");
    expect(updateSession).not.toHaveBeenCalled();
  });

  it("通常のページリクエストではupdateSessionを呼ぶ", async () => {
    await callProxy("/");
    expect(updateSession).toHaveBeenCalledTimes(1);
  });

  it("非APIのパスではupdateSessionを呼ぶ", async () => {
    await callProxy("/dashboard");
    expect(updateSession).toHaveBeenCalledTimes(1);
  });

  it("matcherの設定がエクスポートされている", async () => {
    const { config } = await import("../proxy");
    expect(config.matcher).toBeDefined();
    expect(config.matcher).toHaveLength(1);
  });
});
