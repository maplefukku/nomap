import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultCard, type ResultData } from "../result-card";

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
  },
}));

const mockResult: ResultData = {
  avoidPattern: "他人に合わせて自分を消すパターン",
  direction: "自分の価値観を軸にした選択",
  firstAction: "今日、自分が本当にやりたいことを1つ書き出す",
  esPhrase: "あなたの拒否は、あなたの羅針盤",
};

describe("ResultCard", () => {
  it("renders avoid pattern", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText("他人に合わせて自分を消すパターン")
    ).toBeInTheDocument();
  });

  it("renders direction", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText("自分の価値観を軸にした選択")
    ).toBeInTheDocument();
  });

  it("renders first action", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText("今日、自分が本当にやりたいことを1つ書き出す")
    ).toBeInTheDocument();
  });

  it("renders essential phrase when provided", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText(/あなたの拒否は、あなたの羅針盤/)
    ).toBeInTheDocument();
  });

  it("does not render essential phrase when not provided", () => {
    const resultWithoutPhrase: ResultData = {
      avoidPattern: "パターン",
      direction: "方向",
      firstAction: "アクション",
    };
    render(<ResultCard result={resultWithoutPhrase} />);
    expect(screen.queryByText(/"/)).not.toBeInTheDocument();
  });

  it("renders all section labels", () => {
    render(<ResultCard result={mockResult} />);
    expect(screen.getByText("回避パターン")).toBeInTheDocument();
    expect(screen.getByText("進むべき方向")).toBeInTheDocument();
    expect(screen.getByText("最初の一歩")).toBeInTheDocument();
  });

  it("renders copy button for esPhrase", () => {
    render(<ResultCard result={mockResult} />);
    const copyButton = screen.getByRole("button", { name: "ESにコピー" });
    expect(copyButton).toBeInTheDocument();
  });

  it("does not render copy button when esPhrase is not provided", () => {
    const resultWithoutPhrase: ResultData = {
      avoidPattern: "パターン",
      direction: "方向",
      firstAction: "アクション",
    };
    render(<ResultCard result={resultWithoutPhrase} />);
    expect(screen.queryByRole("button", { name: "ESにコピー" })).not.toBeInTheDocument();
  });
});
