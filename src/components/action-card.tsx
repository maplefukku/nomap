"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { animations } from "@/lib/constants";
import { messages } from "@/lib/i18n";

interface ActionCardProps {
  action: string;
}

export const ActionCard = memo(function ActionCard({
  action,
}: ActionCardProps) {
  return (
    <motion.div
      {...animations.actionCard}
      className="rounded-2xl border bg-muted/50 p-4"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {messages.actionCard.label}
      </p>
      <p className="mt-2 text-base text-foreground">{action}</p>
    </motion.div>
  );
});
