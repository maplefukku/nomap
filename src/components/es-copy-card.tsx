"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { fadeInUp } from "@/lib/constants";

interface ESCopyCardProps {
  phrase: string;
}

const esFadeIn = fadeInUp(12, 0.3);

export const ESCopyCard = memo(function ESCopyCard({ phrase }: ESCopyCardProps) {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(phrase);
    toast.success("ES用フレーズをコピーしました");
  }, [phrase]);

  return (
    <motion.div
      {...esFadeIn}
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        ESに使える「軸」
      </p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-relaxed text-foreground">
          &ldquo;{phrase}&rdquo;
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          aria-label="ESにコピー"
        >
          <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
});
