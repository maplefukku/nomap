// ---------------------------------------------------------------------------
// Server-only constants — env-overridable via envInt/envFloat.
//
// This module is separated from constants.ts so that envInt/envFloat and
// server-only values (GLM settings, rate limits) are NOT bundled into the
// client-side JavaScript.
// ---------------------------------------------------------------------------

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function envFloat(key: string, fallback: number): number {
  const v = process.env[key];
  if (v === undefined) return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

// ---------------------------------------------------------------------------
// API settings
// ---------------------------------------------------------------------------
export const GLM_API_TIMEOUT_MS = envInt("GLM_API_TIMEOUT_MS", 30_000);
export const GLM_MAX_TOKENS = envInt("GLM_MAX_TOKENS", 2000);
export const GLM_TEMPERATURE = envFloat("GLM_TEMPERATURE", 0.7);

// ---------------------------------------------------------------------------
// Input validation limits
// ---------------------------------------------------------------------------
export const MAX_REJECTIONS = envInt("MAX_REJECTIONS", 20);
export const MAX_REJECTION_LENGTH = envInt("MAX_REJECTION_LENGTH", 200);

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
export const RATE_LIMIT_WINDOW_MS = envInt("RATE_LIMIT_WINDOW_MS", 60_000);
export const RATE_LIMIT_MAX_REQUESTS = envInt("RATE_LIMIT_MAX_REQUESTS", 10);
