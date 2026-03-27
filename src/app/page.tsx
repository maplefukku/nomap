"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Header } from "@/components/header";
import { RejectionInput } from "@/components/rejection-input";
import { ResultCard, type ResultData } from "@/components/result-card";
import { ActionCard } from "@/components/action-card";
import { ESCopyCard } from "@/components/es-copy-card";
import { EmptyState } from "@/components/empty-state";
import { fade, fadeInUp, hoverTap } from "@/lib/constants";

type Phase = "lp" | "input" | "loading" | "result";

const errorFade = fadeInUp(8);

export default function Home() {
  const [phase, setPhase] = useState<Phase>("lp");
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

  const handleShare = useCallback(() => {
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
  }, [results]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10 md:max-w-2xl">
        <AnimatePresence mode="wait">
          {phase === "lp" && (
            <motion.section
              key="lp"
              {...fade}
              className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                「やりたくない」から
                <br />
                自分の地図を作る
              </h1>
              <p className="mt-4 max-w-sm text-lg text-muted-foreground md:max-w-md">
                絶対に嫌なことを入れると、AIが避けるべき方向と今日できる最初の1アクションを返します
              </p>
              <motion.button
                {...hoverTap}
                type="button"
                onClick={() => setPhase("input")}
                className="mt-8 h-12 rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="無料で始める"
              >
                無料で始める
              </motion.button>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md" role="group" aria-label="5分で完了">
                  <span className="text-2xl" aria-hidden="true">🎯</span>
                  <h2 className="mt-2 font-semibold">5分で完了</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    就活で話せる「軸」ができる
                  </p>
                </div>
                <div className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md" role="group" aria-label="ESに使える">
                  <span className="text-2xl" aria-hidden="true">💡</span>
                  <h2 className="mt-2 font-semibold">ESに使える</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    「嫌なこと」が「軸」に変わる
                  </p>
                </div>
                <div className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md" role="group" aria-label="シェア可能">
                  <span className="text-2xl" aria-hidden="true">📱</span>
                  <h2 className="mt-2 font-semibold">シェア可能</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    「私のNoMap」を画像で共有
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {phase === "result" ? (
            <motion.div
              key="results"
              {...fade}
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
                    {...hoverTap}
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    aria-label="Xでシェア"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    Xでシェア
                  </motion.button>
                  <motion.button
                    {...hoverTap}
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    aria-label="やり直す"
                  >
                    やり直す
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {results.map((result, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <ResultCard result={result} index={i} />
                    <ActionCard action={result.firstAction} />
                    {result.esPhrase && (
                      <ESCopyCard phrase={result.esPhrase} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            phase !== "lp" && (
              <motion.div
                key="input"
                {...fade}
                className="flex flex-col gap-8"
              >
                <RejectionInput
                  onSubmit={handleSubmit}
                  isLoading={phase === "loading"}
                />

                {error && (
                  <motion.div
                    {...errorFade}
                    className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                {results.length === 0 && phase === "input" && <EmptyState />}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-lg px-6 md:max-w-2xl">
          <p className="text-center text-xs text-muted-foreground">
            NoMap — 「やりたくないこと」からあなたの地図をつくる
          </p>
        </div>
      </footer>
    </div>
  );
}
