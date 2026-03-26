import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../empty-state";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
    }) => <div {...props}>{children}</div>,
  },
}));

describe("EmptyState", () => {
  it("renders heading", () => {
    render(<EmptyState />);
    expect(screen.getByText("地図はまだない")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<EmptyState />);
    expect(
      screen.getByText(/「やりたくないこと」を入力すると/)
    ).toBeInTheDocument();
  });
});
