// ---------------------------------------------------------------------------
// Server-only constants — env-overridable via envInt/envFloat.
//
// This module is separated from constants.ts so that envInt/envFloat and
// server-only values (GLM settings, rate limits) are NOT bundled into the
// client-side JavaScript.
// ---------------------------------------------------------------------------

/**
 * 環境変数を数値として読み取り、バリデーション・下限クランプを行う汎用ヘルパー。
 * @param parser - 文字列→数値の変換関数（Number or parseFloat）
 */
function envNum(
  key: string,
  fallback: number,
  min: number | undefined,
  parser: (v: string) => number,
): number {
  const v = process.env[key];
  if (v === undefined) return fallback;
  const n = parser(v);
  if (!Number.isFinite(n)) {
    console.warn("[constants]", {
      warning: "invalid number, using fallback",
      key,
      value: v,
      fallback,
    });
    return fallback;
  }
  if (min !== undefined && n < min) {
    console.warn("[constants]", {
      warning: "value below minimum, clamped",
      key,
      value: n,
      min,
    });
    return min;
  }
  return n;
}

function envInt(key: string, fallback: number, min?: number): number {
  return envNum(key, fallback, min, Number);
}

function envFloat(key: string, fallback: number, min?: number): number {
  return envNum(key, fallback, min, parseFloat);
}

// ---------------------------------------------------------------------------
// API settings
// ---------------------------------------------------------------------------
export const GLM_API_TIMEOUT_MS = envInt("GLM_API_TIMEOUT_MS", 30_000, 1000);
export const GLM_MAX_TOKENS = envInt("GLM_MAX_TOKENS", 2000, 1);
export const GLM_TEMPERATURE = envFloat("GLM_TEMPERATURE", 0.7, 0);
export const GLM_RETRY_COUNT = envInt("GLM_RETRY_COUNT", 1, 0);
export const GLM_RETRY_DELAY_MS = envInt("GLM_RETRY_DELAY_MS", 1000, 0);

// ---------------------------------------------------------------------------
// Input validation limits
// ---------------------------------------------------------------------------
export const MAX_REJECTIONS = envInt("MAX_REJECTIONS", 20);
export const MAX_REJECTION_LENGTH = envInt("MAX_REJECTION_LENGTH", 200);

// ---------------------------------------------------------------------------
// HTTP status codes
// ---------------------------------------------------------------------------
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  TOO_MANY_REQUESTS: 429,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
export const RATE_LIMIT_WINDOW_MS = envInt(
  "RATE_LIMIT_WINDOW_MS",
  60_000,
  1000,
);
export const RATE_LIMIT_MAX_REQUESTS = envInt("RATE_LIMIT_MAX_REQUESTS", 10, 1);
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = envInt(
  "RATE_LIMIT_CLEANUP_INTERVAL_MS",
  60_000,
  1000,
);
