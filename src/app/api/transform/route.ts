import { NextRequest, NextResponse } from "next/server";
import { transformRejections } from "@/lib/ai/transform";
import {
  MAX_REJECTIONS,
  MAX_REJECTION_LENGTH,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "@/lib/constants";
import { serverEnv } from "@/lib/env";
import { messages } from "@/lib/i18n";

/** IPごとのリクエストタイムスタンプを保持するインメモリストア */
const requestLog = new Map<string, number[]>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

/**
 * スライディングウィンドウ方式のIPベースレートリミッター。
 *
 * RATE_LIMIT_WINDOW_MS 内のリクエスト数が RATE_LIMIT_MAX_REQUESTS を超えると
 * true を返す。CLEANUP_INTERVAL_MS ごとに古いエントリを削除し、
 * Map の無制限な肥大化を防止する。
 *
 * @param ip - クライアントのIPアドレス
 * @returns レート制限に達している場合 true
 */
/** ウィンドウ外のタイムスタンプを除去した配列を返す */
function filterRecent(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodically purge stale entries to prevent unbounded Map growth
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [key, timestamps] of requestLog) {
      const recent = filterRecent(timestamps, now);
      if (recent.length === 0) {
        requestLog.delete(key);
      } else {
        requestLog.set(key, recent);
      }
    }
    lastCleanup = now;
  }

  const recent = filterRecent(requestLog.get(ip) ?? [], now);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

/**
 * 未検証の入力を安全な拒否項目リストに変換する。
 *
 * 配列チェック → 上限チェック → 各要素の型・長さチェック → 空文字除去
 * の順にバリデーションし、最初のエラーを即座に返す。
 *
 * @param raw - リクエストボディから取得した未検証の値
 * @returns 成功時は `{ rejections }`, 失敗時は `{ error }`
 */
function sanitizeRejections(
  raw: unknown,
): { rejections: string[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: messages.validation.emptyRejections };
  }

  if (raw.length > MAX_REJECTIONS) {
    return { error: messages.validation.tooManyRejections(MAX_REJECTIONS) };
  }

  const rejections: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") {
      return { error: messages.validation.notString };
    }
    const trimmed = item.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length > MAX_REJECTION_LENGTH) {
      return {
        error: messages.validation.tooLong(MAX_REJECTION_LENGTH),
      };
    }
    rejections.push(trimmed);
  }

  if (rejections.length === 0) {
    return { error: messages.validation.emptyRejections };
  }

  return { rejections };
}

export async function POST(request: NextRequest) {
  const apiKey = serverEnv.GLM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: messages.api.missingKey },
      { status: 500 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: messages.validation.rateLimited },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: messages.validation.invalidRequest },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: messages.validation.invalidRequest },
      { status: 400 },
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
    // ユーザー向けに安全なエラーメッセージのみ返す（内部詳細を露出しない）
    const safeMessages: string[] = [
      messages.api.timeout,
      messages.api.emptyResponse,
      messages.api.parseFailed,
      messages.api.invalidFormat,
    ];
    const rawMessage = err instanceof Error ? err.message : "";
    const isSafe =
      rawMessage.startsWith("GLM APIエラー（ステータス:") ||
      safeMessages.includes(rawMessage);
    const message = isSafe ? rawMessage : messages.api.transformFailed;
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
