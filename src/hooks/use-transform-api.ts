"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { ResultData } from "@/components/result-card";
import { messages } from "@/lib/i18n";

type Phase = "lp" | "input" | "loading" | "result";

interface TransformApiResponse {
  results?: ResultData[];
  error?: string;
}

interface UseTransformApiReturn {
  readonly phase: Phase;
  readonly results: ResultData[];
  readonly error: string | null;
  readonly setPhase: (phase: Phase) => void;
  readonly handleSubmit: (rejections: string[]) => Promise<void>;
  readonly handleRetry: () => void;
  readonly handleReset: () => void;
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
      setError(
        err instanceof Error ? err.message : messages.client.unexpectedError,
      );
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
      `https://twitter.com/intent/tweet?text=${text}`,
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
