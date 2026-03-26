"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/constants";

interface ActionCardProps {
  action: string;
}

const actionFadeIn = fadeInUp(12, 0.2);

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
