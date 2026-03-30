import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

describe("Error page", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.doUnmock("react");
    vi.resetModules();
  });

  async function renderError(
    errorOverrides: Partial<Error & { digest?: string }> = {},
  ) {
    const ErrorComponent = (await import("../error")).default;
    const error = Object.assign(new Error("テストエラー"), errorOverrides);
    const reset = vi.fn();
    render(<ErrorComponent error={error} reset={reset} />);
    return { reset };
  }

  it("見出しとエラー説明を表示する", async () => {
    await renderError();
    expect(screen.getByText("問題が発生しました")).toBeInTheDocument();
    expect(
      screen.getByText(
        "予期しないエラーが発生しました。もう一度お試しください。",
      ),
    ).toBeInTheDocument();
  });

  it("再試行ボタンを表示する", async () => {
    await renderError();
    expect(screen.getByText("もう一度試す")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("再試行ボタンをクリックするとreset関数が呼ばれる", async () => {
    const { reset } = await renderError();
    fireEvent.click(screen.getByText("もう一度試す"));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("エラー情報をconsole.errorに出力する", async () => {
    await renderError({ message: "DB接続エラー", digest: "abc123" });
    expect(console.error).toHaveBeenCalledWith(
      "[app-error]",
      expect.objectContaining({
        message: "DB接続エラー",
        digest: "abc123",
      }),
    );
  });

  it("digestがないエラーでもログ出力される", async () => {
    await renderError({ message: "一般エラー" });
    expect(console.error).toHaveBeenCalledWith(
      "[app-error]",
      expect.objectContaining({
        message: "一般エラー",
        digest: undefined,
      }),
    );
  });

  it("windowが定義されている場合、pathにwindow.location.pathnameが設定される", async () => {
    await renderError({ message: "パスエラー" });
    expect(console.error).toHaveBeenCalledWith(
      "[app-error]",
      expect.objectContaining({
        path: window.location.pathname,
      }),
    );
  });

  it("NODE_ENVがdevelopmentの場合、stackが含まれる", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      vi.resetModules();
      const ErrorComponent = (await import("../error")).default;
      const error = new Error("開発エラー");
      const reset = vi.fn();
      render(<ErrorComponent error={error} reset={reset} />);
      expect(console.error).toHaveBeenCalledWith(
        "[app-error]",
        expect.objectContaining({
          stack: error.stack,
        }),
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("windowがundefinedの場合、pathがundefinedになる", async () => {
    let capturedEffect: (() => void) | null = null;
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useEffect: (cb: () => void) => {
          capturedEffect = cb;
        },
      };
    });
    vi.resetModules();
    const ErrorComponent = (await import("../error")).default;
    const error = new Error("SSRエラー");
    const reset = vi.fn();
    render(<ErrorComponent error={error} reset={reset} />);

    const origWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      configurable: true,
    });
    try {
      capturedEffect!();
      expect(console.error).toHaveBeenCalledWith(
        "[app-error]",
        expect.objectContaining({ path: undefined }),
      );
    } finally {
      Object.defineProperty(globalThis, "window", {
        value: origWindow,
        configurable: true,
      });
    }
  });
});
