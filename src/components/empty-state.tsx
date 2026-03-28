"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { fade } from "@/lib/constants";
import { messages } from "@/lib/i18n";

const emptyFade = {
  ...fade,
  transition: { duration: 0.5, delay: 0.2 },
} as const;

export const EmptyState = memo(function EmptyState() {
  return (
    <motion.div
      {...emptyFade}
      className="flex flex-col items-center gap-4 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-muted-foreground"
        >
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
          {messages.emptyState.heading}
        </h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          {messages.emptyState.description}
        </p>
      </div>
    </motion.div>
  );
});
