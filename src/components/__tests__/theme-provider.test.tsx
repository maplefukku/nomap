import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-themes", () => ({
  ThemeProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
  }) => (
    <div
      data-testid="theme-provider"
      data-attribute={props.attribute}
      data-default-theme={props.defaultTheme}
      data-enable-system={String(props.enableSystem)}
    >
      {children}
    </div>
  ),
}));

vi.mock("framer-motion", () => ({
  MotionConfig: ({
    children,
    reducedMotion,
  }: {
    children: React.ReactNode;
    reducedMotion?: string;
  }) => (
    <div data-testid="motion-config" data-reduced-motion={reducedMotion}>
      {children}
    </div>
  ),
}));

describe("ThemeProvider", () => {
  it("子要素をレンダリングする", async () => {
    const { ThemeProvider } = await import("../theme-provider");
    render(
      <ThemeProvider>
        <p>テストコンテンツ</p>
      </ThemeProvider>,
    );
    expect(screen.getByText("テストコンテンツ")).toBeInTheDocument();
  });

  it("NextThemesProviderにclass属性とsystemテーマを設定する", async () => {
    const { ThemeProvider } = await import("../theme-provider");
    render(
      <ThemeProvider>
        <p>child</p>
      </ThemeProvider>,
    );
    const provider = screen.getByTestId("theme-provider");
    expect(provider).toHaveAttribute("data-attribute", "class");
    expect(provider).toHaveAttribute("data-default-theme", "system");
    expect(provider).toHaveAttribute("data-enable-system", "true");
  });

  it("MotionConfigにreducedMotion='user'を設定する", async () => {
    const { ThemeProvider } = await import("../theme-provider");
    render(
      <ThemeProvider>
        <p>child</p>
      </ThemeProvider>,
    );
    const motionConfig = screen.getByTestId("motion-config");
    expect(motionConfig).toHaveAttribute("data-reduced-motion", "user");
  });
});
