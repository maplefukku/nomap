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

function requiredInProduction(
  value: string | undefined,
  name: string,
): string | undefined {
  if (!value && process.env.NODE_ENV === "production") {
    console.warn(
      `⚠ 環境変数 ${name} が未設定です。本番環境では機能が正常に動作しない可能性があります`,
    );
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
