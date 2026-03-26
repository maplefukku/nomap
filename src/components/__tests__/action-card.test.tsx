import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActionCard } from "../action-card";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

describe("ActionCard", () => {
  it("renders the action text", () => {
    render(<ActionCard action="自分のペースで働ける会社を3社調べてみる" />);
    expect(
      screen.getByText("自分のペースで働ける会社を3社調べてみる")
    ).toBeInTheDocument();
  });

  it("renders the section label", () => {
    render(<ActionCard action="テストアクション" />);
    expect(screen.getByText("今日できる最初の1アクション")).toBeInTheDocument();
  });
});
