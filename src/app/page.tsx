"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Header } from "@/components/header";
import { RejectionInput } from "@/components/rejection-input";
import { ResultCard, type ResultData } from "@/components/result-card";
import { EmptyState } from "@/components/empty-state";

type Phase = "input" | "loading" | "result";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("input");
  const [results, setResults] = useState<ResultData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (rejections: string[]) => {
    setPhase("loading");
    setError(null);

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejections }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "変換に失敗しました");
      }

      const data = await response.json();
      setResults(data.results);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setPhase("input");
    }
  }, []);

  const handleReset = useCallback(() => {
    setResults([]);
    setPhase("input");
    setError(null);
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
        <AnimatePresence mode="wait">
          {phase === "result" ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    あなたの地図
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    拒否の裏にある、本当に進みたい方向
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const first = results[0];
                      if (!first) return;
                      const text = encodeURIComponent(
                        `私のNoMap: ${first.direction} - ${first.firstAction} #NoMap`
                      );
                      window.open(
                        `https://twitter.com/intent/tweet?text=${text}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Share2 className="h-4 w-4" />
                    Xでシェア
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    やり直す
                  </motion.button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {results.map((result, i) => (
                  <ResultCard key={i} result={result} index={i} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8"
            >
              <RejectionInput
                onSubmit={handleSubmit}
                isLoading={phase === "loading"}
              />

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              {results.length === 0 && phase === "input" && <EmptyState />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-2xl px-6">
          <p className="text-center text-xs text-muted-foreground">
            NoMap — 「やりたくないこと」からあなたの地図をつくる
          </p>
        </div>
      </footer>
    </div>
  );
}
