import { describe, it, expect } from "vitest";
import { formatNumber, formatDate, formatRelativeTime } from "../i18n";

describe("i18n utilities", () => {
  describe("formatNumber", () => {
    it("数値がカンマ区切りでフォーマットされる", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1234567)).toBe("1,234,567");
    });

    it("小さい数値はそのまま返される", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(999)).toBe("999");
    });
  });

  describe("formatDate", () => {
    const date = new Date("2024-01-15T00:00:00");

    it("short形式で日付がフォーマットされる", () => {
      const result = formatDate(date, "short");
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/1/);
      expect(result).toMatch(/15/);
    });

    it("long形式で日付がフォーマットされる", () => {
      const result = formatDate(date, "long");
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/1月/);
    });

    it("time形式で時刻がフォーマットされる", () => {
      const result = formatDate(date, "time");
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it("デフォルトはshort形式", () => {
      const result = formatDate(date);
      expect(result).toBe(formatDate(date, "short"));
    });
  });

  describe("formatRelativeTime", () => {
    const base = new Date("2024-06-15T12:00:00");

    it("過去の日付の相対時間が正しくフォーマットされる", () => {
      const past = new Date(base.getTime() - 60 * 60 * 1000); // 1時間前
      const result = formatRelativeTime(past, base);
      expect(result).toMatch(/時間/);
    });

    it("未来の日付の相対時間が正しくフォーマットされる", () => {
      const future = new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000); // 2日後
      const result = formatRelativeTime(future, base);
      expect(result).toMatch(/日/);
    });

    it("現在に近い日付は秒単位でフォーマットされる", () => {
      const result = formatRelativeTime(base, base);
      expect(result).toBeTruthy();
    });

    it("月単位の差がフォーマットされる", () => {
      const past = new Date(base.getTime() - 45 * 24 * 60 * 60 * 1000); // 約1.5ヶ月前
      const result = formatRelativeTime(past, base);
      expect(result).toMatch(/か月|先月/);
    });

    it("年単位の差がフォーマットされる", () => {
      const past = new Date(base.getTime() - 400 * 24 * 60 * 60 * 1000); // 1年以上前
      const result = formatRelativeTime(past, base);
      expect(result).toMatch(/年/);
    });
  });
});
