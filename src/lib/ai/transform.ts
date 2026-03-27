import type { ResultData } from "@/components/result-card";
import {
  GLM_API_TIMEOUT_MS,
  GLM_MAX_TOKENS,
  GLM_TEMPERATURE,
} from "@/lib/constants";
import { serverEnv } from "@/lib/env";
import { messages } from "@/lib/i18n";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

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
export async function transformRejections(
  rejections: string[],
  apiKey: string,
): Promise<ResultData[]> {
  const chatMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `やりたくないことリスト:\n${rejections.map((r) => `- ${r}`).join("\n")}`,
    },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GLM_API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${serverEnv.GLM_BASE_URL}chat/completions`, {
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
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(messages.api.timeout);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(messages.api.statusError(response.status));
  }

  const data: GLMResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error(messages.api.emptyResponse);
  }

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

  return parsed.map((item: Record<string, string>) => ({
    avoidPattern: item.avoidPattern || "",
    direction: item.direction || "",
    values: item.values,
    firstAction: item.firstAction || "",
    esPhrase: item.esPhrase,
  }));
}
