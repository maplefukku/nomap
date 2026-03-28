import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ESCopyCard } from "../es-copy-card";

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("ESCopyCard", () => {
  it("renders the phrase text", () => {
    render(
      <ESCopyCard phrase="自分のペースで成果を出せる環境を重視しています" />,
    );
    expect(
      screen.getByText(/自分のペースで成果を出せる環境を重視しています/),
    ).toBeInTheDocument();
  });

  it("renders the section label", () => {
    render(<ESCopyCard phrase="テストフレーズ" />);
    expect(screen.getByText("ESに使える「軸」")).toBeInTheDocument();
  });

  it("renders copy button", () => {
    render(<ESCopyCard phrase="テストフレーズ" />);
    expect(
      screen.getByRole("button", { name: "ESにコピー" }),
    ).toBeInTheDocument();
  });

  it("copies phrase to clipboard on button click", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ESCopyCard phrase="コピーするフレーズ" />);
    const button = screen.getByRole("button", { name: "ESにコピー" });
    await user.click(button);

    expect(writeText).toHaveBeenCalledWith("コピーするフレーズ");
  });

  it("clipboard APIが失敗した場合にエラーtoastを表示する", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard error"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<ESCopyCard phrase="失敗するフレーズ" />);
    const button = screen.getByRole("button", { name: "ESにコピー" });
    await user.click(button);

    const { toast } = await import("sonner");
    expect(toast.error).toHaveBeenCalledWith(
      "コピーに失敗しました。手動でコピーしてください",
    );
  });
});
