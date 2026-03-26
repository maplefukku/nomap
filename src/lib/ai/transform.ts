import type { ResultData } from "@/components/result-card";

const GLM_BASE_URL = "https://api.z.ai/api/coding/paas/v4/";
const GLM_MODEL = "glm-4.7";

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
    "firstAction": "今日からできる具体的な最初の一歩",
    "esPhrase": "背中を押す一言（エッセンシャルフレーズ）"
  }
]

ルール:
- 各拒否項目を独立に分析せず、全体からパターンを見つけてグループ化する
- 結果は1〜3個に絞る
- 「やりたくない」の裏にある本当の欲求を読み取る
- 具体的で実行可能なアドバイスにする`;

export async function transformRejections(
  rejections: string[],
  apiKey: string
): Promise<ResultData[]> {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `やりたくないことリスト:\n${rejections.map((r) => `- ${r}`).join("\n")}`,
    },
  ];

  const response = await fetch(`${GLM_BASE_URL}chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`GLM API error: ${response.status}`);
  }

  const data: GLMResponse = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from GLM API");
  }

  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid response format");
  }

  return parsed.map((item: Record<string, string>) => ({
    avoidPattern: item.avoidPattern || "",
    direction: item.direction || "",
    firstAction: item.firstAction || "",
    esPhrase: item.esPhrase,
  }));
}
