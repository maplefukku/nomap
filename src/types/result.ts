// ---------------------------------------------------------------------------
// Shared type definitions for transform results
// ---------------------------------------------------------------------------

/**
 * GLM APIが返す分析結果1件分のデータ構造。
 *
 * 「やりたくないこと」リストを分析した結果として、回避パターンの本質・
 * 進むべき方向性・具体的アクションを含む。LLMレスポンスのJSONから
 * パースされ、API→hook→UIの各層を通過する。
 */
export interface ResultData {
  /** 回避しているパターンの本質的な説明 */
  avoidPattern: string;
  /** 拒否が示す、進むべき方向性 */
  direction: string;
  /** 拒否から読み取れる価値観キーワード（「・」区切り）。LLMが省略した場合undefined */
  values?: string;
  /** 今日からできる具体的な最初の一歩 */
  firstAction: string;
  /** ESに使える就活の軸フレーズ。LLMが省略した場合undefined */
  esPhrase?: string;
}

/** `/api/transform` のレスポンス形状。成功時は `results`、失敗時は `error` が設定される */
export interface TransformApiResponse {
  results?: ResultData[];
  error?: string;
}
