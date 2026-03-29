/**
 * Test data factories for commonly used mock objects.
 */
import type { ResultData } from "@/components/result-card";

/**
 * Create a ResultData object with sensible defaults.
 * Override any field via the `overrides` parameter.
 */
export function buildResultData(
  overrides: Partial<ResultData> = {},
): ResultData {
  return {
    avoidPattern: "他人に合わせて自分を消すパターン",
    direction: "自分の価値観を軸にした選択",
    values: "自律性・成果主義・人との関わり",
    firstAction: "今日、自分が本当にやりたいことを1つ書き出す",
    esPhrase: "自分のペースで成果を出せる環境を重視しています",
    ...overrides,
  };
}

/**
 * Create a mock client-side API response (from /api/transform).
 */
export function buildClientAPIResponse(results: ResultData[]): {
  ok: true;
  json: () => Promise<{ results: ResultData[] }>;
} {
  return {
    ok: true,
    json: async () => ({ results }),
  };
}

/**
 * Create a mock GLM API chat completion response (for fetch mock).
 * Pass the content that the LLM would return in `choices[0].message.content`.
 */
export function buildGLMResponse(content: unknown): {
  ok: true;
  json: () => Promise<{
    choices: [{ message: { content: string } }];
  }>;
} {
  return {
    ok: true,
    json: async () => ({
      choices: [
        {
          message: {
            content:
              typeof content === "string" ? content : JSON.stringify(content),
          },
        },
      ],
    }),
  };
}
