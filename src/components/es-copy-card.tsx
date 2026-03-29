"use client";

import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { animations } from "@/lib/constants";
import { messages } from "@/lib/i18n";

interface ESCopyCardProps {
  phrase: string;
}

export const ESCopyCard = memo(function ESCopyCard({
  phrase,
}: ESCopyCardProps) {
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(phrase);
      toast.success(messages.esCopy.copySuccess);
    } catch {
      toast.error(messages.esCopy.copyError);
    }
  }, [phrase]);

  return (
    <motion.div
      {...animations.esCard}
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {messages.esCopy.label}
      </p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="min-w-0 break-words text-sm font-medium leading-relaxed text-foreground">
          &ldquo;{phrase}&rdquo;
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={messages.esCopy.copyButton}
        >
          <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
});
