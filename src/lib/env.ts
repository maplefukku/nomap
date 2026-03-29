// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------

interface ServerEnv {
  GLM_API_KEY: string | undefined;
  GLM_BASE_URL: string;
  GLM_MODEL: string;
}

interface ClientEnv {
  NEXT_PUBLIC_SUPABASE_URL: string | undefined;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string | undefined;
}

/** 本番環境で未設定の環境変数を検出し、警告済みキーは重複ログを抑制する */
const warnedKeys = new Set<string>();

function requiredInProduction(
  value: string | undefined,
  name: string,
): string | undefined {
  if (
    !value &&
    process.env.NODE_ENV === "production" &&
    !warnedKeys.has(name)
  ) {
    warnedKeys.add(name);
    console.warn("[env]", { error: "missing required variable", name });
  }
  return value;
}

/**
 * 本番環境で必須の環境変数を取得する。
 * ビルド時ではなく実際のリクエスト時に検証するため、
 * 遅延評価のゲッターとして使用する。
 */
function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`[env] 必須環境変数が未設定: ${name}`);
  }
  return value ?? "";
}

export const serverEnv: ServerEnv = {
  // ビルド時は未設定でも許容し、リクエスト時に厳格検証するゲッター
  get GLM_API_KEY() {
    return assertEnv("GLM_API_KEY") || undefined;
  },
  GLM_BASE_URL:
    process.env.GLM_BASE_URL || "https://api.z.ai/api/coding/paas/v4/",
  GLM_MODEL: process.env.GLM_MODEL || "glm-4.7",
};

export const clientEnv: ClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: requiredInProduction(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredInProduction(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ),
};
