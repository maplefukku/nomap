"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { ResultData } from "@/components/result-card";
import { messages } from "@/lib/i18n";

type Phase = "lp" | "input" | "loading" | "result";

export function useTransformApi() {
  const [phase, setPhase] = useState<Phase>("lp");
  const [results, setResults] = useState<ResultData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
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
      let response: Response;
      try {
        response = await fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejections }),
          signal: controller.signal,
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        throw new Error(messages.client.networkError);
      }

      let data: Record<string, unknown>;
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

      if (!Array.isArray(data.results)) {
        throw new Error(messages.client.invalidResponse);
      }
      setResults(data.results as ResultData[]);
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
