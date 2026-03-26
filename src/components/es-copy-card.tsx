"use client";

import { motion } from "framer-motion";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

interface ESCopyCardProps {
  phrase: string;
}

export function ESCopyCard({ phrase }: ESCopyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
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
          onClick={async () => {
            await navigator.clipboard.writeText(phrase);
            toast.success("ES用フレーズをコピーしました");
          }}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="ESにコピー"
        >
          <ClipboardCopy className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
