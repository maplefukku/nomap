"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, memo } from "react";
import { motion } from "framer-motion";
import { messages } from "@/lib/i18n";

const tapAnimation = { scale: 0.92 } as const;

const emptySubscribe = () => () => {};
const returnTrue = () => true;
const returnFalse = () => false;

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, returnTrue, returnFalse);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      whileTap={tapAnimation}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      aria-label={isDark ? messages.theme.toLight : messages.theme.toDark}
    >
      {isDark ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 9.27A6.5 6.5 0 1 1 6.73 2 5 5 0 0 0 14 9.27Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </motion.button>
  );
});
