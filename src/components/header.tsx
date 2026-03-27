"use client";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-6 md:max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            NoMap
          </span>
          <span className="rounded-lg bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
            beta
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
