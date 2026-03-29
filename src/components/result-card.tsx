"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { EASE_OUT_QUART, fadeInUp } from "@/lib/constants";
import { messages } from "@/lib/i18n";

/**
 * GLM APIが返す分析結果1件分のデータ構造。
 *
 * 「やりたくないこと」リストを分析した結果として、回避パターンの本質・
 * 進むべき方向性・具体的アクションを含む。LLMレスポンスのJSONから
 * {@link parseResultsFromContent} でパースされ、API→hook→UIの各層を通過する。
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

interface ResultCardProps {
  /** 表示する分析結果データ */
  result: ResultData;
  /** カードの表示順（アニメーション遅延に使用、デフォルト0） */
  index?: number;
}

const { initial, animate } = fadeInUp(16);

export const ResultCard = memo(function ResultCard({
  result,
  index = 0,
}: ResultCardProps) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{ duration: 0.4, delay: index * 0.1, ease: EASE_OUT_QUART }}
      role="article"
      aria-label={`NoMap: ${result.direction}`}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="text-xl font-bold tracking-tight text-foreground">
        {messages.resultCard.title}
      </h3>

      <div className="h-px bg-border" aria-hidden="true" />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {messages.resultCard.avoidPattern}
        </span>
        <p className="break-words text-sm leading-relaxed text-foreground/80">
          {result.avoidPattern}
        </p>
      </div>

      <div className="h-px bg-border" aria-hidden="true" />

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">
          {messages.resultCard.direction}
        </span>
        <p className="break-words text-lg font-semibold leading-snug tracking-tight text-foreground">
          {result.direction}
        </p>
      </div>

      {result.values && (
        <>
          <div className="h-px bg-border" aria-hidden="true" />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {messages.resultCard.values}
            </span>
            <p className="text-sm leading-relaxed text-foreground/80">
              {result.values}
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
});
