"use client";

import { motion } from "framer-motion";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-foreground">
          地図はまだない
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          「やりたくないこと」を入力すると、あなたが本当に進みたい方向が見えてきます
        </p>
      </div>
    </motion.div>
  );
}
