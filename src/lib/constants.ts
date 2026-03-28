// ---------------------------------------------------------------------------
// API settings
// ---------------------------------------------------------------------------
export const GLM_API_TIMEOUT_MS = 30_000;
export const GLM_MAX_TOKENS = 2000;
export const GLM_TEMPERATURE = 0.7;

// ---------------------------------------------------------------------------
// Input validation limits
// ---------------------------------------------------------------------------
export const MAX_REJECTIONS = 20;
export const MAX_REJECTION_LENGTH = 200;

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 10;

// ---------------------------------------------------------------------------
// Shared animation primitives (framer-motion)
// ---------------------------------------------------------------------------

/** Standard easing curve used across the app */
export const EASE_OUT_QUART = [0.25, 0.46, 0.45, 0.94] as const;

/** Fade-in with upward slide – the most common entry animation */
export function fadeInUp(y = 12, delay = 0, duration = 0.4) {
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
