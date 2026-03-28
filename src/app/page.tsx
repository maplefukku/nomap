"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Header } from "@/components/header";
import { RejectionInput } from "@/components/rejection-input";
import type { ResultData } from "@/components/result-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorBoundary } from "@/components/error-boundary";
import { CardSkeleton } from "@/components/card-skeleton";
import { fade, fadeInUp, hoverTap } from "@/lib/constants";
import { messages } from "@/lib/i18n";

const LoadingFallback = () => <CardSkeleton />;

const ResultCard = dynamic(
  () => import("@/components/result-card").then((m) => m.ResultCard),
  { ssr: false, loading: LoadingFallback },
);
const ActionCard = dynamic(
  () => import("@/components/action-card").then((m) => m.ActionCard),
  { ssr: false, loading: LoadingFallback },
);
const ESCopyCard = dynamic(
  () => import("@/components/es-copy-card").then((m) => m.ESCopyCard),
  { ssr: false, loading: LoadingFallback },
);

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
      let response: Response;
      try {
        response = await fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejections }),
        });
      } catch {
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

  const handleReset = useCallback(() => {
    setResults([]);
    setPhase("input");
    setError(null);
  }, []);

  const handleShare = useCallback(() => {
    const first = results[0];
    if (!first) return;
    const text = encodeURIComponent(
      `私のNoMap: ${first.direction} - ${first.firstAction} #NoMap`,
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [results]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10 md:max-w-2xl"
      >
        <AnimatePresence mode="wait">
          {phase === "lp" && (
            <motion.section
              key="lp"
              {...fade}
              className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl whitespace-pre-line">
                {messages.lp.heading}
              </h1>
              <p className="mt-4 max-w-sm text-lg text-muted-foreground md:max-w-md">
                {messages.lp.description}
              </p>
              <motion.button
                {...hoverTap}
                type="button"
                onClick={() => setPhase("input")}
                className="mt-8 h-12 rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={messages.lp.cta}
              >
                {messages.lp.cta}
              </motion.button>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                <div
                  className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
                  role="group"
                  aria-label={messages.lp.feature1Title}
                >
                  <span className="text-2xl" aria-hidden="true">
                    🎯
                  </span>
                  <h2 className="mt-2 font-semibold">
                    {messages.lp.feature1Title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {messages.lp.feature1Desc}
                  </p>
                </div>
                <div
                  className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
                  role="group"
                  aria-label={messages.lp.feature2Title}
                >
                  <span className="text-2xl" aria-hidden="true">
                    💡
                  </span>
                  <h2 className="mt-2 font-semibold">
                    {messages.lp.feature2Title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {messages.lp.feature2Desc}
                  </p>
                </div>
                <div
                  className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
                  role="group"
                  aria-label={messages.lp.feature3Title}
                >
                  <span className="text-2xl" aria-hidden="true">
                    📱
                  </span>
                  <h2 className="mt-2 font-semibold">
                    {messages.lp.feature3Title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {messages.lp.feature3Desc}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {phase === "result" ? (
            <motion.div key="results" {...fade} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {messages.result.heading}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {messages.result.subheading}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    {...hoverTap}
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    aria-label={messages.result.share}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    {messages.result.share}
                  </motion.button>
                  <motion.button
                    {...hoverTap}
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    aria-label={messages.result.reset}
                  >
                    {messages.result.reset}
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-col gap-4" aria-live="polite">
                {results.map((result, i) => (
                  <ErrorBoundary
                    key={`${result.avoidPattern}-${result.direction}`}
                    fallbackMessage="結果の表示中にエラーが発生しました"
                  >
                    <div className="flex flex-col gap-4">
                      <ResultCard result={result} index={i} />
                      <ActionCard action={result.firstAction} />
                      {result.esPhrase && (
                        <ESCopyCard phrase={result.esPhrase} />
                      )}
                    </div>
                  </ErrorBoundary>
                ))}
              </div>
            </motion.div>
          ) : (
            phase !== "lp" && (
              <motion.div key="input" {...fade} className="flex flex-col gap-8">
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

      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {phase === "loading" && "分析中です。しばらくお待ちください。"}
        {phase === "result" && `${results.length}件の結果が表示されました。`}
      </div>

      <footer className="border-t border-border/50 py-6">
        <div className="mx-auto max-w-lg px-6 md:max-w-2xl">
          <p className="text-center text-xs text-muted-foreground">
            {messages.footer.tagline}
          </p>
        </div>
      </footer>
    </div>
  );
}
