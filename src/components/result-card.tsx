"use client";

import { motion } from "framer-motion";

export interface ResultData {
  avoidPattern: string;
  direction: string;
  values?: string;
  firstAction: string;
  esPhrase?: string;
}

interface ResultCardProps {
  result: ResultData;
  index?: number;
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function ResultCard({ result, index = 0 }: ResultCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-md"
    >
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        あなたのNoMap
      </h2>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          避けるべき構造
        </span>
        <p className="text-sm leading-relaxed text-foreground/80">{result.avoidPattern}</p>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          進むべき方向
        </span>
        <p className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {result.direction}
        </p>
      </div>

      {result.values && (
        <>
          <div className="h-px bg-border" />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              あなたの価値観
            </span>
            <p className="text-sm leading-relaxed text-foreground/80">{result.values}</p>
          </div>
        </>
      )}
    </motion.div>
  );
}

export { ResultCard as NoMapCard };
