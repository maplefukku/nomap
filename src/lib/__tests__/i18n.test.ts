import { describe, it, expect } from "vitest";
import { LOCALE_MAP, LOCALE, LOCALE_SHORT, messages } from "../i18n";

describe("i18n - ロケール設定", () => {
  it("LOCALE_MAPが全ロケールを含む", () => {
    expect(LOCALE_MAP["ja-JP"]).toBe("ja");
    expect(LOCALE_MAP["en-US"]).toBe("en");
  });

  it("デフォルトロケールはja-JP", () => {
    expect(LOCALE).toBe("ja-JP");
  });

  it("LOCALE_SHORTはLOCALEに対応する短縮名", () => {
    expect(LOCALE_SHORT).toBe("ja");
  });
});

describe("i18n - messages構造の完全性", () => {
  it("全てのトップレベルカテゴリが存在する", () => {
    const expectedKeys = [
      "api",
      "validation",
      "client",
      "lp",
      "input",
      "result",
      "resultCard",
      "actionCard",
      "esCopy",
      "emptyState",
      "errorBoundary",
      "errorPage",
      "skeleton",
      "theme",
      "layout",
      "meta",
      "share",
      "a11y",
      "footer",
    ];
    for (const key of expectedKeys) {
      expect(messages).toHaveProperty(key);
    }
  });

  // -------------------------------------------------------------------------
  // 動的メッセージ関数のテスト
  // -------------------------------------------------------------------------

  it("api.statusError: ステータスコードを含むメッセージを返す", () => {
    expect(messages.api.statusError(500)).toBe(
      "GLM APIエラー（ステータス: 500）",
    );
    expect(messages.api.statusError(404)).toBe(
      "GLM APIエラー（ステータス: 404）",
    );
  });

  it("validation.tooManyRejections: 最大数を含むメッセージを返す", () => {
    expect(messages.validation.tooManyRejections(10)).toBe(
      "拒否項目は最大10個までです",
    );
  });

  it("validation.tooLong: 最大文字数を含むメッセージを返す", () => {
    expect(messages.validation.tooLong(200)).toBe(
      "各項目は200文字以内で入力してください",
    );
  });

  it("input.removeItem: アイテム名を含むメッセージを返す", () => {
    expect(messages.input.removeItem("満員電車")).toBe("「満員電車」を削除");
  });

  it("input.charLimit: 文字数上限を含むメッセージを返す", () => {
    expect(messages.input.charLimit(200)).toBe("200文字以内で入力してください");
  });

  it("input.itemCount: 件数と上限を含むメッセージを返す", () => {
    expect(messages.input.itemCount(0, 20)).toBe("0 / 20");
    expect(messages.input.itemCount(5, 20)).toBe("5 / 20");
  });

  it("share.tweet: 方向とアクションを含むメッセージを返す", () => {
    expect(messages.share.tweet("自由な働き方", "副業を始める")).toBe(
      "私のNoMap: 自由な働き方 - 副業を始める #NoMap",
    );
  });

  it("a11y.resultsStatus: 件数を含むメッセージを返す", () => {
    expect(messages.a11y.resultsStatus(3)).toBe("3件の結果が表示されました。");
  });

  // -------------------------------------------------------------------------
  // 静的メッセージが空文字列でないことの確認
  // -------------------------------------------------------------------------

  it("静的メッセージは空文字列でない", () => {
    expect(messages.api.timeout).toBeTruthy();
    expect(messages.api.emptyResponse).toBeTruthy();
    expect(messages.api.parseFailed).toBeTruthy();
    expect(messages.validation.emptyRejections).toBeTruthy();
    expect(messages.client.networkError).toBeTruthy();
    expect(messages.input.heading).toBeTruthy();
    expect(messages.input.placeholderEmpty).toBeTruthy();
    expect(messages.result.heading).toBeTruthy();
    expect(messages.meta.title).toBeTruthy();
    expect(messages.meta.description).toBeTruthy();
    expect(messages.errorPage.heading).toBeTruthy();
    expect(messages.footer.tagline).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // エッジケース: 動的関数に境界値を渡す
  // -------------------------------------------------------------------------

  it("動的関数に0や負数を渡してもクラッシュしない", () => {
    expect(messages.api.statusError(0)).toContain("0");
    expect(messages.validation.tooManyRejections(0)).toContain("0");
    expect(messages.validation.tooLong(0)).toContain("0");
    expect(messages.input.itemCount(0, 0)).toContain("0");
    expect(messages.a11y.resultsStatus(0)).toContain("0");
  });

  it("動的関数に空文字列を渡してもクラッシュしない", () => {
    expect(messages.input.removeItem("")).toBe("「」を削除");
    expect(messages.share.tweet("", "")).toBe("私のNoMap:  -  #NoMap");
  });
});
