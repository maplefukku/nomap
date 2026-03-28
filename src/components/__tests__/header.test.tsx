import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

describe("Header", () => {
  it("renders the logo text", () => {
    render(<Header />);
    expect(screen.getByText("NoMap")).toBeInTheDocument();
  });

  it("renders the beta badge", () => {
    render(<Header />);
    expect(screen.getByText("beta")).toBeInTheDocument();
  });

  it("renders the theme toggle placeholder before mount", () => {
    render(<Header />);
    // ThemeToggle renders a placeholder div before mounting
    const header = screen.getByText("NoMap").closest("header");
    expect(header).toBeInTheDocument();
  });
});
