"use client";

import { memo } from "react";

export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-sm"
      role="status"
      aria-label="読み込み中"
    >
      <div className="flex flex-col gap-5">
        <div className="h-5 w-32 rounded-lg bg-muted" />
        <div className="h-px bg-border" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-4 w-full rounded-lg bg-muted" />
        </div>
        <div className="h-px bg-border" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-5 w-3/4 rounded-lg bg-muted" />
        </div>
      </div>
      <span className="sr-only">結果を読み込み中...</span>
    </div>
  );
});
