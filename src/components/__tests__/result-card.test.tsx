import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  values: "自律性・成果主義・人との関わり",
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

  it("renders values when provided", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText("自律性・成果主義・人との関わり")
    ).toBeInTheDocument();
  });

  it("does not render values section when not provided", () => {
    const resultWithoutValues: ResultData = {
      avoidPattern: "パターン",
      direction: "方向",
      firstAction: "アクション",
    };
    render(<ResultCard result={resultWithoutValues} />);
    expect(screen.queryByText("あなたの価値観")).not.toBeInTheDocument();
  });

  it("renders all section labels", () => {
    render(<ResultCard result={mockResult} />);
    expect(screen.getByText("避けるべき構造")).toBeInTheDocument();
    expect(screen.getByText("進むべき方向")).toBeInTheDocument();
    expect(screen.getByText("あなたの価値観")).toBeInTheDocument();
  });

  it("renders card title", () => {
    render(<ResultCard result={mockResult} />);
    expect(screen.getByText("あなたのNoMap")).toBeInTheDocument();
  });
});
