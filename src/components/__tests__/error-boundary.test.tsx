import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../error-boundary";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      variants?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
    button: ({
      children,
      whileTap: _whileTap,
      whileHover: _whileHover,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
      whileTap?: unknown;
      whileHover?: unknown;
    }) => <button {...props}>{children}</button>,
  },
}));

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("テストエラー");
  return <div>正常な子コンポーネント</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("エラーがない場合、childrenが表示される", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("正常な子コンポーネント")).toBeInTheDocument();
  });

  it("エラーがある場合、エラーメッセージが表示される", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("表示中にエラーが発生しました"),
    ).toBeInTheDocument();
  });

  it("「再表示する」ボタンでリセットできる", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // リセット後にエラーを投げないように再レンダリング
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByText("再表示する"));

    expect(screen.getByText("正常な子コンポーネント")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("fallbackMessageをカスタマイズできる", () => {
    render(
      <ErrorBoundary fallbackMessage="カスタムエラー">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("カスタムエラー")).toBeInTheDocument();
  });

  it("開発環境でconsole.errorが呼ばれる", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    try {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );
      const calls = (console.error as ReturnType<typeof vi.fn>).mock.calls;
      const boundaryCall = calls.find(
        (c: unknown[]) => c[0] === "[ErrorBoundary]",
      );
      expect(boundaryCall).toBeDefined();
      expect(boundaryCall![1]).toMatchObject({ message: expect.any(String) });
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
