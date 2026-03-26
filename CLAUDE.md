# CLAUDE.md

## ビルド・テスト
npm run dev          # 開発サーバー
npm run build        # ビルド確認
npx vitest           # テスト実行

## コードスタイル
- TypeScript strict mode
- ES modules (import/export)
- Tailwind CSS + shadcn/ui（カスタマイズ必須、デフォルト禁止）
- framer-motion でアニメーション
- 日本語UI（翻訳くさくない自然な日本語）

## デザインルール
- Apple/Notion/Linearレベルの品質
- グレースケール + アクセント1色
- rounded-2xl / shadow-sm / backdrop-blur-xl
- 1画面1意思決定
- ダークモード必須（next-themes）

## LLM API設定
- GLM API (OpenAI互換)
- baseURL: https://api.z.ai/api/coding/paas/v4/
- model: glm-4.7
- env: GLM_API_KEY

## 禁止事項
- OpenAI API / GPT 使用禁止（GLM APIのみ）
- グラデーション背景
- shadcn/uiデフォルトそのまま
