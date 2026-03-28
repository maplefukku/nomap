"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/constants";
import { messages } from "@/lib/i18n";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <motion.div {...fadeInUp(12)} className="text-center space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">
          {messages.errorPage.heading}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {messages.errorPage.description}
        </p>
      </motion.div>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        type="button"
        onClick={reset}
        className="rounded-2xl bg-foreground text-background px-6 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={messages.errorPage.retryLabel}
      >
        {messages.errorPage.retryText}
      </motion.button>
    </div>
  );
}
