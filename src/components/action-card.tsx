"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface ActionCardProps {
  action: string;
}

const actionFadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
} as const;

export const ActionCard = memo(function ActionCard({ action }: ActionCardProps) {
  return (
    <motion.div
      {...actionFadeIn}
      className="rounded-2xl border bg-muted/50 p-4"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        今日できる最初の1アクション
      </p>
      <p className="mt-2 text-base text-foreground">
        {action}
      </p>
    </motion.div>
  );
});
