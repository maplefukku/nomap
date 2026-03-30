import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

describe("Error page", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
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
});
