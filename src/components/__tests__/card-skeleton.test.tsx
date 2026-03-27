import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardSkeleton } from "../card-skeleton";

describe("CardSkeleton", () => {
  it("正しくレンダリングされる", () => {
    render(<CardSkeleton />);
    const el = screen.getByRole("status");
    expect(el).toBeInTheDocument();
  });

  it('aria-label="読み込み中"が設定されている', () => {
    render(<CardSkeleton />);
    expect(screen.getByLabelText("読み込み中")).toBeInTheDocument();
  });

  it("スクリーンリーダー用テキストが表示される", () => {
    render(<CardSkeleton />);
    expect(screen.getByText("結果を読み込み中...")).toBeInTheDocument();
  });
});
