# NoMap（ノーマップ）- メインUI実装

## 概要
「嫌なこと」から今日の一歩を出すAIアプリのメインUIを実装する。

## アーキテクチャ
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: Supabase (Auth, DB) + Next.js API Routes
- AI: GLM API (glm-4.7)
- Hosting: Vercel
- Domain: nomap.vercel.app

## 実装する画面

### 1. ランディングページ（LP）
- ヒーロー: 「やりたくない」から自分の地図を作る
- CTA: 「無料で始める」ボタン
- 3つの特徴: 5分で完了 / ESに使える / シェア可能

### 2. 拒否入力画面
- 「絶対に嫌なこと」を3-5個入力
- プレースホルダーに具体例を表示
- 3つ以上入力でボタン活性化

### 3. 結果画面（NoMapカード）
- 避けるべき構造
- 進むべき方向
- あなたの価値観
- 今日できる最初の1アクション
- ESに使える「軸」（コピーボタン付き）

## デザインルール（DESIGN_SYSTEM.md準拠）
- Apple/Notion/Linearレベルのデザイン品質
- グレースケール + アクセント1色
- rounded-2xl / shadow-sm / backdrop-blur-xl
- 1画面1意思決定
- ダークモード必須（next-themes）
- framer-motionでアニメーション
- shadcn/ui + カスタマイズ

## 技術スタック
```bash
# セットアップ済み
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
npx shadcn@latest init
npx shadcn@latest add button card input dialog
npm install framer-motion lucide-react next-themes
```

## GLM API設定
```env
GLM_API_KEY=d4d5b41fda2845b48f8f55c4e3a1e3e9.TMSBR1aLRdCgSkEo
GLM_BASE_URL=https://api.z.ai/api/coding/paas/v4/
GLM_MODEL=glm-4.7
```

## 実装手順

### Phase 1: 基本セットアップ（10分）
1. shadcn/uiのセットアップ
2. framer-motion, lucide-react, next-themesのインストール
3. ダークモード設定
4. 基本レイアウト（Header, Footer）

### Phase 2: ランディングページ（15分）
1. Heroセクション
2. 特徴セクション（3つの特徴）
3. CTAセクション

### Phase 3: 拒否入力画面（15分）
1. 入力フォーム（3-5個）
2. バリデーション
3. 送信ボタン

### Phase 4: 結果画面（15分）
1. NoMapカード
2. アクションカード
3. ESコピーボタン
4. シェアボタン

### Phase 5: テスト（10分）
1. テスト作成
2. ビルド確認

## 注意事項
- テスト駆動開発（TDD）で実装
- 日本語UI（翻訳くさくない自然な日本語）
- 1画面1意思決定の原則
- モバイルファースト

## 完了報告フォーマット
STATUS: OK または FAIL
FILES_CHANGED: [変更したファイルリスト]
TEST_RESULT: X passed, Y failed
BUILD: pass/fail
