import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard, type ResultData } from "../result-card";
import { buildResultData } from "@/test/factories";

vi.mock("framer-motion", () => import("@/test/mock-framer-motion"));

describe("ResultCard", () => {
  const mockResult = buildResultData();

  it("renders avoid pattern", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText("他人に合わせて自分を消すパターン"),
    ).toBeInTheDocument();
  });

  it("renders direction", () => {
    render(<ResultCard result={mockResult} />);
    expect(screen.getByText("自分の価値観を軸にした選択")).toBeInTheDocument();
  });

  it("renders values when provided", () => {
    render(<ResultCard result={mockResult} />);
    expect(
      screen.getByText("自律性・成果主義・人との関わり"),
    ).toBeInTheDocument();
  });

  it("does not render values section when not provided", () => {
    const resultWithoutValues: ResultData = buildResultData({
      values: undefined,
    });
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
