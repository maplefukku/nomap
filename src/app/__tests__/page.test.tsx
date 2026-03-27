import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { messages } from "@/lib/i18n";

// Mock framer-motion
const motionProps = [
  "whileHover",
  "whileTap",
  "whileFocus",
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "layout",
];

function filterMotionProps(props: Record<string, unknown>) {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!motionProps.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

vi.mock("framer-motion", () => ({
  motion: {
    section: ({ children, ...props }: Record<string, unknown>) => (
      <section {...filterMotionProps(props)}>
        {children as React.ReactNode}
      </section>
    ),
    button: ({ children, ...props }: Record<string, unknown>) => (
      <button {...filterMotionProps(props)}>
        {children as React.ReactNode}
      </button>
    ),
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...filterMotionProps(props)}>{children as React.ReactNode}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock next/dynamic to render components synchronously
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<{ default?: unknown } | unknown>) => {
    const Component = vi.fn(() => null);
    // Eagerly resolve the dynamic import for testing
    loader().then((mod: { default?: unknown } | unknown) => {
      const resolved =
        mod && typeof mod === "object" && "default" in mod
          ? (mod as { default: unknown }).default
          : mod;
      Object.assign(Component, resolved);
    });
    return Component;
  },
}));

// Mock child components
vi.mock("@/components/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("@/components/rejection-input", () => ({
  RejectionInput: ({
    onSubmit,
    isLoading,
  }: {
    onSubmit: (items: string[]) => void;
    isLoading?: boolean;
  }) => (
    <div data-testid="rejection-input">
      <button
        data-testid="submit-btn"
        disabled={isLoading}
        onClick={() => onSubmit(["満員電車で通勤する"])}
      >
        送信
      </button>
      {isLoading && <span data-testid="loading">Loading...</span>}
    </div>
  ),
}));

vi.mock("@/components/result-card", () => ({
  ResultCard: ({ result }: { result: { direction: string } }) => (
    <div data-testid="result-card">{result.direction}</div>
  ),
}));

vi.mock("@/components/action-card", () => ({
  ActionCard: ({ action }: { action: string }) => (
    <div data-testid="action-card">{action}</div>
  ),
}));

vi.mock("@/components/es-copy-card", () => ({
  ESCopyCard: ({ phrase }: { phrase: string }) => (
    <div data-testid="es-copy-card">{phrase}</div>
  ),
}));

vi.mock("@/components/empty-state", () => ({
  EmptyState: () => <div data-testid="empty-state">Empty</div>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Need to import after mocks
import Home from "../page";

describe("Home (page.tsx)", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders LP phase by default", () => {
    render(<Home />);
    expect(screen.getByText(messages.lp.cta)).toBeInTheDocument();
    expect(screen.getByText(messages.footer.tagline)).toBeInTheDocument();
  });

  it("transitions from LP to input phase on CTA click", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));

    expect(screen.getByTestId("rejection-input")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows results after successful API call", async () => {
    const mockResults = [
      {
        avoidPattern: "パターン",
        direction: "自由な働き方",
        values: "自律性",
        firstAction: "リモート求人を探す",
        esPhrase: "自律的な環境",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    const user = userEvent.setup();
    render(<Home />);

    // Go to input phase
    await user.click(screen.getByText(messages.lp.cta));

    // Submit
    await user.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByText(messages.result.heading)).toBeInTheDocument();
    });
  });

  it("shows network error when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));
    await user.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        messages.client.networkError,
      );
    });
  });

  it("shows error when response JSON is invalid", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));
    await user.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        messages.client.invalidResponse,
      );
    });
  });

  it("shows server error message from response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "カスタムエラー" }),
    });

    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));
    await user.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("カスタムエラー");
    });
  });

  it("shows fallback error when server error is not a string", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 42 }),
    });

    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));
    await user.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        messages.client.transformFailed,
      );
    });
  });

  it("resets to input phase when reset button is clicked", async () => {
    const mockResults = [
      {
        avoidPattern: "パターン",
        direction: "方向",
        firstAction: "アクション",
        esPhrase: "フレーズ",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));
    await user.click(screen.getByTestId("submit-btn"));

    await waitFor(() => {
      expect(screen.getByText(messages.result.reset)).toBeInTheDocument();
    });

    await user.click(screen.getByText(messages.result.reset));

    expect(screen.getByTestId("rejection-input")).toBeInTheDocument();
  });

  it("shows network error when fetch rejects with non-Error", async () => {
     
    mockFetch.mockRejectedValueOnce("string error");

    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByText(messages.lp.cta));
    await user.click(screen.getByTestId("submit-btn"));

    // Inner catch wraps any fetch failure as networkError
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        messages.client.networkError,
      );
    });
  });
});
