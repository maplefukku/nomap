import { NextRequest, NextResponse } from "next/server";
import { transformRejections } from "@/lib/ai/transform";
import {
  MAX_REJECTIONS,
  MAX_REJECTION_LENGTH,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "@/lib/constants";
import { serverEnv } from "@/lib/env";

// Simple in-memory rate limiter (per IP)
const requestLog = new Map<string, number[]>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodically purge stale entries to prevent unbounded Map growth
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
    lastCleanup = now;
  }

  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

function sanitizeRejections(
  raw: unknown
): { rejections: string[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "拒否リストが空です" };
  }

  if (raw.length > MAX_REJECTIONS) {
    return { error: `拒否項目は最大${MAX_REJECTIONS}個までです` };
  }

  const rejections: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") {
      return { error: "拒否項目は文字列で指定してください" };
    }
    const trimmed = item.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length > MAX_REJECTION_LENGTH) {
      return {
        error: `各項目は${MAX_REJECTION_LENGTH}文字以内で入力してください`,
      };
    }
    rejections.push(trimmed);
  }

  if (rejections.length === 0) {
    return { error: "拒否リストが空です" };
  }

  return { rejections };
}

export async function POST(request: NextRequest) {
  const apiKey = serverEnv.GLM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GLM APIキーが設定されていません" },
      { status: 500 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってからお試しください" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です" },
      { status: 400 }
    );
  }

  const { rejections: rawRejections } = body as { rejections?: unknown };
  const validated = sanitizeRejections(rawRejections);

  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  try {
    const results = await transformRejections(validated.rejections, apiKey);
    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "変換処理に失敗しました";
    return NextResponse.json(
      { error: message },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
