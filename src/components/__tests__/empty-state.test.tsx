import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../empty-state";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
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
