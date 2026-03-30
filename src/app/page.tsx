"use client";

import { memo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, RotateCcw } from "lucide-react";
import { Header } from "@/components/header";
import { RejectionInput } from "@/components/rejection-input";
import { EmptyState } from "@/components/empty-state";
import { ErrorBoundary } from "@/components/error-boundary";
import { CardSkeleton } from "@/components/card-skeleton";
import { fade, animations, hoverTap } from "@/lib/constants";
import { messages } from "@/lib/i18n";
import { useTransformApi } from "@/hooks/use-transform-api";

const LoadingFallback = memo(function LoadingFallback() {
  return <CardSkeleton />;
});

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

const LP_FEATURES = [
  {
    emoji: "\u{1F3AF}",
    title: messages.lp.feature1Title,
    desc: messages.lp.feature1Desc,
  },
  {
    emoji: "\u{1F4A1}",
    title: messages.lp.feature2Title,
    desc: messages.lp.feature2Desc,
  },
  {
    emoji: "\u{1F4F1}",
    title: messages.lp.feature3Title,
    desc: messages.lp.feature3Desc,
  },
] as const;

export default function Home() {
  const {
    phase,
    results,
    error,
    setPhase,
    handleSubmit,
    handleRetry,
    handleReset,
    handleShare,
  } = useTransformApi();

  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (phase === "result") {
      resultHeadingRef.current?.focus();
    }
  }, [phase]);

  const handleStartInput = useCallback(() => setPhase("input"), [setPhase]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 md:max-w-2xl"
      >
        <AnimatePresence mode="wait">
          {phase === "lp" && (
            <motion.section
              key="lp"
              {...fade}
              className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center"
            >
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl whitespace-pre-line">
                {messages.lp.heading}
              </h1>
              <p className="mt-4 max-w-sm text-lg text-muted-foreground md:max-w-md">
                {messages.lp.description}
              </p>
              <motion.button
                {...hoverTap}
                type="button"
                onClick={handleStartInput}
                className="focus-ring mt-8 h-12 rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90"
                aria-label={messages.lp.cta}
              >
                {messages.lp.cta}
              </motion.button>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {LP_FEATURES.map((f) => (
                  <article
                    key={f.title}
                    className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {f.emoji}
                    </span>
                    <h2 className="mt-2 font-semibold">{f.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {f.desc}
                    </p>
                  </article>
                ))}
              </div>
            </motion.section>
          )}

          {phase === "result" ? (
            <motion.div key="results" {...fade} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <h2
                    ref={resultHeadingRef}
                    tabIndex={-1}
                    className="text-2xl font-semibold tracking-tight text-foreground outline-none"
                  >
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
                    className="focus-ring flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={messages.result.share}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    {messages.result.share}
                  </motion.button>
                  <motion.button
                    {...hoverTap}
                    type="button"
                    onClick={handleReset}
                    className="focus-ring rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                    fallbackMessage={messages.errorBoundary.resultError}
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
                    {...animations.errorInline}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3"
                    role="alert"
                  >
                    <p className="text-sm text-destructive">{error}</p>
                    <button
                      type="button"
                      onClick={handleRetry}
                      className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      {messages.client.retry}
                    </button>
                  </motion.div>
                )}

                {results.length === 0 && phase === "input" && <EmptyState />}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </main>

      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {phase === "loading" && messages.a11y.analyzingStatus}
        {phase === "result" && messages.a11y.resultsStatus(results.length)}
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
