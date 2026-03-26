"use client";

import { motion } from "framer-motion";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

export interface ResultData {
  avoidPattern: string;
  direction: string;
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
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          回避パターン
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

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          最初の一歩
        </span>
        <p className="text-sm leading-relaxed text-foreground/80">{result.firstAction}</p>
      </div>

      {result.esPhrase && (
        <div className="relative rounded-xl bg-accent-muted px-4 py-3">
          <p className="pr-10 text-sm font-medium italic text-accent">
            &ldquo;{result.esPhrase}&rdquo;
          </p>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(result.esPhrase!);
              toast.success("ES用フレーズをコピーしました");
            }}
            className="absolute bottom-3 right-3 rounded-lg p-1.5 text-accent/60 transition-colors hover:bg-accent/10 hover:text-accent"
            aria-label="ESにコピー"
          >
            <ClipboardCopy className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
