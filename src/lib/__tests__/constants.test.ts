import { describe, it, expect } from "vitest";
import { fadeInUp, fade, animations, MAX_REJECTION_LENGTH } from "../constants";

describe("constants - animation presets", () => {
  it("fadeInUp: デフォルト引数で正しいアニメーションを返す", () => {
    const result = fadeInUp();
    expect(result.initial).toEqual({ opacity: 0, y: 12 });
    expect(result.animate).toEqual({ opacity: 1, y: 0 });
    expect(result.transition.duration).toBe(0.4);
    expect(result.transition.delay).toBe(0);
  });

  it("fadeInUp: カスタム引数を受け付ける", () => {
    const result = fadeInUp(24, 0.5, 0.8);
    expect(result.initial.y).toBe(24);
    expect(result.transition.delay).toBe(0.5);
    expect(result.transition.duration).toBe(0.8);
  });

  it("fade: 正しいプリセットを持つ", () => {
    expect(fade.initial).toEqual({ opacity: 0 });
    expect(fade.animate).toEqual({ opacity: 1 });
    expect(fade.exit).toEqual({ opacity: 0 });
  });

  it("animations: 全てのプリセットが定義されている", () => {
    expect(animations.actionCard).toBeDefined();
    expect(animations.esCard).toBeDefined();
    expect(animations.errorBoundary).toBeDefined();
    expect(animations.errorInline).toBeDefined();
    expect(animations.emptyState).toBeDefined();
  });

  it("MAX_REJECTION_LENGTH: クライアント用のデフォルト値を返す", () => {
    expect(MAX_REJECTION_LENGTH).toBe(200);
  });
});
