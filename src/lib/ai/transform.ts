import type { ResultData } from "@/types/result";
import {
  GLM_API_TIMEOUT_MS,
  GLM_MAX_TOKENS,
  GLM_TEMPERATURE,
  GLM_RETRY_COUNT,
  GLM_RETRY_DELAY_MS,
} from "@/lib/constants.server";
import { serverEnv } from "@/lib/env";
import { messages } from "@/lib/i18n";

/** GLM API (OpenAI互換) に送信するチャットメッセージ */
interface ChatMessage {
  /** system: LLMへの指示, user: ユーザー入力, assistant: LLMの応答 */
  role: "system" | "user" | "assistant";
  content: string;
}

/** GLM APIのChat Completionsレスポンス（使用フィールドのみ定義） */
interface GLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const SYSTEM_PROMPT = `あなたはキャリア・ライフコーチです。ユーザーが「やりたくないこと」のリストを提供します。
それを分析し、以下のJSON形式で回答してください。日本語で、自然で励ましのある表現を使ってください。

応答は必ず以下のJSON配列形式で返してください（マークダウンなし、純粋なJSON）:
[
  {
    "avoidPattern": "回避しているパターンの本質的な説明",
    "direction": "その拒否が示す、進むべき方向性",
    "values": "拒否から読み取れる価値観キーワード（例: 自律性・成果主義・人との関わり）",
    "firstAction": "今日からできる具体的な最初の一歩",
    "esPhrase": "ESに使える就活の軸フレーズ（例: 自分のペースで成果を出せる環境を重視しています）"
  }
]

ルール:
- 各拒否項目を独立に分析せず、全体からパターンを見つけてグループ化する
- 結果は1〜3個に絞る
- 「やりたくない」の裏にある本当の欲求を読み取る
- 具体的で実行可能なアドバイスにする
- valuesは「・」区切りで3〜5個のキーワードにする`;

/** GLM APIにチャットリクエストを送信し、レスポンスを返す */
async function fetchGLMCompletion(
  chatMessages: ChatMessage[],
  apiKey: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GLM_API_TIMEOUT_MS);

  try {
    const response = await fetch(`${serverEnv.GLM_BASE_URL}chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: serverEnv.GLM_MODEL,
        messages: chatMessages,
        temperature: GLM_TEMPERATURE,
        max_tokens: GLM_MAX_TOKENS,
      }),
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(messages.api.timeout);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/** GLMレスポンスからコンテンツ文字列を抽出・検証する */
function extractContent(response: GLMResponse): string {
  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(messages.api.emptyResponse);
  }
  return content;
}

/** LLMが返したJSON文字列をResultData配列にパースし、必須フィールドで絞り込む */
function parseResultsFromContent(content: string): ResultData[] {
  // LLMがmarkdownコードブロック（```json ... ```）で囲む場合があるため除去
  const jsonStr = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(messages.api.parseFailed);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(messages.api.invalidFormat);
  }

  // 各要素を型安全にマッピング。必須フィールド（avoidPattern, direction, firstAction）は
  // 欠損時に空文字、任意フィールド（values, esPhrase）はundefinedにフォールバックする
  const results = parsed.map((item: unknown) => {
    const obj =
      typeof item === "object" && item !== null
        ? (item as Record<string, unknown>)
        : {};
    return {
      avoidPattern:
        typeof obj.avoidPattern === "string" ? obj.avoidPattern : "",
      direction: typeof obj.direction === "string" ? obj.direction : "",
      values: typeof obj.values === "string" ? obj.values : undefined,
      firstAction: typeof obj.firstAction === "string" ? obj.firstAction : "",
      esPhrase: typeof obj.esPhrase === "string" ? obj.esPhrase : undefined,
    };
  });

  // 必須3フィールドが全て空でない要素のみを有効な結果として返す
  const valid = results.filter(
    (r) => r.avoidPattern && r.direction && r.firstAction,
  );
  if (valid.length === 0) {
    throw new Error(messages.api.invalidFormat);
  }
  return valid;
}

/**
 * 「やりたくないこと」リストをGLM APIで分析し、構造化された結果に変換する。
 *
 * GLM API (OpenAI互換) にシステムプロンプトとユーザー入力を送信し、
 * 回避パターン・進むべき方向・価値観・最初のアクション・ES用フレーズを
 * 含むJSON配列として応答を受け取る。
 *
 * @param rejections - ユーザーが入力した「やりたくないこと」の文字列配列
 * @param apiKey - GLM APIの認証キー
 * @returns 分析結果の配列（1〜3件）
 * @throws タイムアウト、APIエラー、パース失敗時にErrorをスロー
 */
/** 一時的なネットワークエラーかどうかを判定する */
function isTransientError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch network failure
  if (err instanceof Error && err.message === messages.api.timeout) return true;
  return false;
}

export async function transformRejections(
  rejections: readonly string[],
  apiKey: string,
): Promise<ResultData[]> {
  const chatMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `やりたくないことリスト:\n${rejections.map((r) => `- ${r}`).join("\n")}`,
    },
  ];

  const totalStart = performance.now();
  let lastError: unknown;
  for (let attempt = 0; attempt <= GLM_RETRY_COUNT; attempt++) {
    try {
      const fetchStart = performance.now();
      const response = await fetchGLMCompletion(chatMessages, apiKey);
      const fetchDuration = Math.round(performance.now() - fetchStart);

      if (!response.ok) {
        console.warn("[glm]", {
          event: "api_error",
          status: response.status,
          attempt,
          durationMs: fetchDuration,
        });
        throw new Error(messages.api.statusError(response.status));
      }

      let data: GLMResponse;
      try {
        data = await response.json();
      } catch {
        throw new Error(messages.api.parseFailed);
      }

      const content = extractContent(data);
      const results = parseResultsFromContent(content);
      const totalDuration = Math.round(performance.now() - totalStart);
      console.info("[glm]", {
        event: "success",
        attempt,
        fetchMs: fetchDuration,
        totalMs: totalDuration,
        resultCount: results.length,
      });
      return results;
    } catch (err) {
      lastError = err;
      const canRetry = attempt < GLM_RETRY_COUNT && isTransientError(err);
      if (!canRetry) {
        const totalDuration = Math.round(performance.now() - totalStart);
        console.warn("[glm]", {
          event: "failure",
          attempt,
          totalMs: totalDuration,
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
      // エクスポネンシャルバックオフ: attempt 0 → 1x, attempt 1 → 2x, ...
      const backoff = GLM_RETRY_DELAY_MS * (attempt + 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastError;
}
