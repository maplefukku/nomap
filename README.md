# NoMap

> 「嫌なこと」から今日の一歩を出すAI

**[nomap-blue.vercel.app](https://nomap-blue.vercel.app)**

---

## 特徴

### ネガティブ変換エンジン

「やりたくないこと」を3〜5個入力するだけ。AIが逆算して、あなたの方向性と最初の行動を提案します。

- **避けるべき構造** — 嫌なことに共通するパターンを抽出
- **逆方向の軸** — そのパターンの裏返しから、あなたに合う方向を導出
- **今日の1アクション** — 考え込まずに動き出せる、具体的な最初の一歩

### ESコピー出力

変換結果を「自己PR・志望動機に使えるフレーズ」としてワンタップでコピー。就活のESにそのまま活かせます。

---

## 使い方

1. 「嫌なこと・やりたくないこと」を3〜5個入力
2. AIが分析して、方向性と最初のアクションを提案
3. 結果をESコピーやSNSシェアで活用

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16 / React 19 |
| スタイリング | Tailwind CSS 4 / shadcn/ui |
| アニメーション | Framer Motion |
| AI | GLM API (glm-4.7) |
| BaaS | Supabase |
| テスト | Vitest / Testing Library |
| デプロイ | Vercel |

---

## セットアップ

### 必要要件

- Node.js 20以上
- npm

### インストール

```bash
git clone https://github.com/your-org/nomap.git
cd nomap
npm install
```

### 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、値を設定してください。

```bash
cp .env.local.example .env.local
```

| 変数名 | 必須 | 説明 | デフォルト値 |
|---|---|---|---|
| `GLM_API_KEY` | ✅ | GLM APIの認証キー | — |
| `GLM_BASE_URL` | — | GLM APIのベースURL | `https://api.z.ai/api/coding/paas/v4/` |
| `GLM_MODEL` | — | 使用するGLMモデル | `glm-4.7` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | SupabaseプロジェクトのURL | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabaseの匿名キー | — |

### 開発サーバー

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
npx vitest       # テスト実行
```

---

## API仕様

### POST `/api/transform`

「やりたくないこと」のリストをAIで変換するエンドポイント。

**リクエスト**

```json
{
  "rejections": ["満員電車で通勤", "上司の顔色をうかがう", "毎日同じ作業の繰り返し"]
}
```

| フィールド | 型 | 制約 |
|---|---|---|
| `rejections` | `string[]` | 1〜10個、各項目200文字以内 |

**レスポンス（成功: 200）**

```json
{
  "results": {
    "avoidance_structure": "...",
    "reverse_axis": "...",
    "first_action": "...",
    "es_copy": "..."
  }
}
```

**エラーレスポンス**

| ステータス | 意味 |
|---|---|
| 400 | バリデーションエラー（空リスト、文字数超過など） |
| 429 | レートリミット超過 |
| 500 | APIキー未設定 |
| 502 | GLM API呼び出し失敗 |
