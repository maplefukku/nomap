import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      whileTap: _whileTap,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & { whileTap?: unknown }) => (
      <button {...props}>{children}</button>
    ),
  },
}));

import { ThemeToggle } from "../theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockTheme = "light";
    mockSetTheme.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("マウント前はプレースホルダーを表示する", () => {
    const { container } = render(<ThemeToggle />);
    const placeholder = container.querySelector("div.h-9.w-9");
    expect(placeholder).toBeInTheDocument();
  });

  it("マウント後にボタンを表示する", async () => {
    render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("ライトモード時にダークモード切り替えラベルを表示する", async () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByLabelText("ダークモードに切り替え")).toBeInTheDocument();
  });

  it("ダークモード時にライトモード切り替えラベルを表示する", async () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByLabelText("ライトモードに切り替え")).toBeInTheDocument();
  });

  it("ライトモードでクリックするとdarkに切り替える", async () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("ダークモードでクリックするとlightに切り替える", async () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByRole("button"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("ダークモード時に太陽アイコンを表示する", async () => {
    mockTheme = "dark";
    const { container } = render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThan(0);
  });

  it("ライトモード時に月アイコンを表示する", async () => {
    mockTheme = "light";
    const { container } = render(<ThemeToggle />);
    await act(async () => {
      vi.runAllTimers();
    });
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });
});
