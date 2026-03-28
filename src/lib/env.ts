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
    console.warn(`[env] missing required variable: ${name}`);
  }
  return value;
}

export const serverEnv: ServerEnv = {
  GLM_API_KEY: requiredInProduction(process.env.GLM_API_KEY, "GLM_API_KEY"),
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
