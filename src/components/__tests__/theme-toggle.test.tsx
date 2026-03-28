import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

import { ThemeToggle } from "../theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockTheme = "light";
    mockSetTheme.mockReset();
  });

  it("マウント後にボタンを表示する", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("ライトモード時にダークモード切り替えラベルを表示する", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    expect(screen.getByLabelText("ダークモードに切り替え")).toBeInTheDocument();
  });

  it("ダークモード時にライトモード切り替えラベルを表示する", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    expect(screen.getByLabelText("ライトモードに切り替え")).toBeInTheDocument();
  });

  it("ライトモードでクリックするとdarkに切り替える", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("ダークモードでクリックするとlightに切り替える", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("ダークモード時に太陽アイコンを表示する", () => {
    mockTheme = "dark";
    const { container } = render(<ThemeToggle />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(0);
  });

  it("ライトモード時に月アイコンを表示する", () => {
    mockTheme = "light";
    const { container } = render(<ThemeToggle />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });
});
