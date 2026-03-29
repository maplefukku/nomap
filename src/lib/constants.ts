// ---------------------------------------------------------------------------
// Client-safe constants
//
// Server-only constants (GLM settings, rate limits, env-overridable values)
// are in constants.server.ts to keep them out of the client bundle.
// ---------------------------------------------------------------------------

/** Validation limit used by client-side input component */
export const MAX_REJECTION_LENGTH = 200;

// ---------------------------------------------------------------------------
// Shared animation primitives (framer-motion)
// ---------------------------------------------------------------------------

/** Standard easing curve used across the app */
export const EASE_OUT_QUART = [0.25, 0.46, 0.45, 0.94] as const;

/** Fade-in with upward slide – the most common entry animation */
export function fadeInUp(
  y = 12,
  delay = 0,
  duration = 0.4,
): {
  readonly initial: { readonly opacity: 0; readonly y: number };
  readonly animate: { readonly opacity: 1; readonly y: 0 };
  readonly transition: {
    readonly duration: number;
    readonly delay: number;
    readonly ease: typeof EASE_OUT_QUART;
  };
} {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: EASE_OUT_QUART },
  } as const;
}

/** Simple opacity fade (with optional exit) */
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
} as const;

/** Scale pop for tags */
export const tagAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.15 },
} as const;

/** Hover + tap micro-interaction */
export const hoverTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
} as const;

// ---------------------------------------------------------------------------
// Component-specific animation presets (centralised to avoid scattered defs)
// ---------------------------------------------------------------------------
export const animations = {
  actionCard: fadeInUp(12, 0.2),
  esCard: fadeInUp(12, 0.3),
  errorBoundary: fadeInUp(8),
  errorInline: fadeInUp(8),
  emptyState: { ...fade, transition: { duration: 0.5, delay: 0.2 } },
} as const;
