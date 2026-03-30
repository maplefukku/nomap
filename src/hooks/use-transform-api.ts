"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { ResultData, TransformApiResponse } from "@/types/result";
import { messages } from "@/lib/i18n";

/**
 * 画面の状態遷移を表すフェーズ。
 *
 * - `"lp"` → ランディングページ（初回表示）
 * - `"input"` → 拒否項目の入力画面
 * - `"loading"` → API呼び出し中
 * - `"result"` → 分析結果の表示
 */
type Phase = "lp" | "input" | "loading" | "result";

/** {@link useTransformApi} が返す状態とハンドラ一式 */
interface UseTransformApiReturn {
  /** 現在の画面フェーズ */
  readonly phase: Phase;
  /** 最後に取得した分析結果（未取得時は空配列） */
  readonly results: ResultData[];
  /** 直近のエラーメッセージ（エラーなしの場合null） */
  readonly error: string | null;
  /** フェーズを直接切り替える（LP→inputの遷移等に使用） */
  readonly setPhase: (phase: Phase) => void;
  /** 拒否項目を送信しAPI呼び出しを実行する */
  readonly handleSubmit: (rejections: string[]) => Promise<void>;
  /** 直前の入力内容で再送信する */
  readonly handleRetry: () => void;
  /** 入力画面に戻し結果をクリアする */
  readonly handleReset: () => void;
  /** 結果をTwitterでシェアする */
  readonly handleShare: () => void;
}

export function useTransformApi(): UseTransformApiReturn {
  const [phase, setPhase] = useState<Phase>("lp");
  const [results, setResults] = useState<ResultData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  /** リトライ時に直前の入力を再送するためのキャッシュ */
  const lastRejectionsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSubmit = useCallback(async (rejections: string[]) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    lastRejectionsRef.current = rejections;
    setPhase("loading");
    setError(null);

    try {
      // 内側のtry-catchでfetchとJSONパースの各段階のエラーを
      // ユーザー向けメッセージに変換し、外側のcatchで一括処理する
      let response: Response;
      try {
        response = await fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejections }),
          signal: controller.signal,
        });
      } catch (err) {
        // ユーザー操作による中断は正常フローなので何もしない
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw new Error(messages.client.networkError);
      }

      let data: TransformApiResponse;
      try {
        data = await response.json();
      } catch {
        throw new Error(messages.client.invalidResponse);
      }

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : messages.client.transformFailed,
        );
      }

      if (!Array.isArray(data.results) || data.results.length === 0) {
        throw new Error(messages.client.invalidResponse);
      }
      // サーバー側でもバリデーション済みだが、予期しない形式のデータが
      // UIコンポーネントに渡りクラッシュしないよう二重チェックする
      const hasRequiredFields = data.results.every(
        (r) =>
          typeof r === "object" &&
          r !== null &&
          typeof r.avoidPattern === "string" &&
          typeof r.direction === "string" &&
          typeof r.firstAction === "string",
      );
      if (!hasRequiredFields) {
        throw new Error(messages.client.invalidResponse);
      }
      setResults(data.results);
      setPhase("result");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : messages.client.unexpectedError;
      setError(errorMessage);
      toast.error(errorMessage);
      setPhase("input");
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastRejectionsRef.current.length > 0) {
      handleSubmit(lastRejectionsRef.current);
    }
  }, [handleSubmit]);

  const handleReset = useCallback(() => {
    setResults([]);
    setPhase("input");
    setError(null);
  }, []);

  const handleShare = useCallback(() => {
    const first = results[0];
    if (!first) return;
    const text = encodeURIComponent(
      messages.share.tweet(first.direction, first.firstAction),
    );
    const win = window.open(
      `https://x.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
    if (!win) {
      toast.error(messages.client.sharePopupBlocked);
    }
  }, [results]);

  return {
    phase,
    results,
    error,
    setPhase,
    handleSubmit,
    handleRetry,
    handleReset,
    handleShare,
  } as const;
}
