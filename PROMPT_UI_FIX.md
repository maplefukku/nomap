# NoMap UI修正プロンプト

## 現状の問題点（tech-cto指摘）

現在の実装は機能的に動作するが、UXデザイン文書に準拠していない:

1. **LPがない** — 現在は直接入力画面から始まるが、UXデザインでは「LP → 拒否入力 → 結果」の3画面フロー
2. **NoMapCardの形式が違う** — 「あなたの価値観」セクションがない
3. **ActionCardが独立していない** — firstActionがResultCard内に埋まっている

## UXデザイン文書の要件

### 画面フロー
```
LP → 拒否入力 → 結果（NoMapカード）→ シェア
```

### 画面1: ランディングページ（LP）
- ヒーロー見出し: 「やりたくない」から自分の地図を作る
- 3つの特徴: 5分で完了 / ESに使える / シェア可能
- CTAボタン: 「無料で始める」
- デザイン: `text-4xl font-bold tracking-tight` / `rounded-full h-12 w-full`

### 画面3: 結果画面（NoMapカード）
```
┌─────────────────────────────────┐
│    あなたのNoMap                │
│    ─────────────────────        │
│    避けるべき構造               │
│    「朝の型にハマる環境」       │
│    ─────────────────────        │
│    進むべき方向                 │
│    「成果で評価される環境」     │
│    ─────────────────────        │
│    あなたの価値観               │
│    自律性・成果主義・人との関わり│
└─────────────────────────────────┘

今日できる最初の1アクション
┌─────────────────────────────────┐
│ 自分のペースで働ける            │
│ 会社を3社調べてみる             │
└─────────────────────────────────┘

ESに使える「軸」
┌─────────────────────────────────┐
│ 「自分のペースで成果を          │
│  出せる環境を重視しています」   │
│                         📋 コピー│
└─────────────────────────────────┘
```

## 修正指示

### 1. LP（ランディングページ）の実装

`src/app/page.tsx` を修正:
- 初期状態でLPを表示
- 「無料で始める」ボタンで拒否入力画面に遷移
- フロー: LP → 入力 → ローディング → 結果

LPコンテンツ:
```tsx
<section className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
    「やりたくない」から<br />自分の地図を作る
  </h1>
  <p className="mt-4 max-w-sm text-lg text-muted-foreground">
    絶対に嫌なことを入れると、AIが避けるべき方向と今日できる最初の1アクションを返します
  </p>
  <Button size="lg" className="mt-8 rounded-full px-8 text-base h-12">
    無料で始める
  </Button>
  
  {/* 3つの特徴 */}
  <div className="mt-12 grid gap-4 sm:grid-cols-3">
    <div className="rounded-2xl border bg-card p-6 text-left">
      <span className="text-2xl">🎯</span>
      <h3 className="mt-2 font-semibold">5分で完了</h3>
      <p className="mt-1 text-sm text-muted-foreground">就活で話せる「軸」ができる</p>
    </div>
    <div className="rounded-2xl border bg-card p-6 text-left">
      <span className="text-2xl">💡</span>
      <h3 className="mt-2 font-semibold">ESに使える</h3>
      <p className="mt-1 text-sm text-muted-foreground">「嫌なこと」が「軸」に変わる</p>
    </div>
    <div className="rounded-2xl border bg-card p-6 text-left">
      <span className="text-2xl">📱</span>
      <h3 className="mt-2 font-semibold">シェア可能</h3>
      <p className="mt-1 text-sm text-muted-foreground">「私のNoMap」を画像で共有</p>
    </div>
  </div>
</section>
```

### 2. NoMapCardの修正

`src/components/result-card.tsx` を修正:
- タイトル: 「あなたのNoMap」
- セクション: 避けるべき構造 / 進むべき方向 / あなたの価値観
- デザイン: `rounded-2xl border bg-card p-6 shadow-md`

### 3. ActionCardの独立

`src/components/action-card.tsx` を新規作成:
```tsx
<div className="rounded-2xl border bg-muted/50 p-4">
  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    今日できる最初の1アクション
  </p>
  <p className="mt-2 text-base">
    {action}
  </p>
</div>
```

### 4. 結果画面のレイアウト修正

`src/app/page.tsx` の結果表示部分:
```tsx
{/* NoMapカード */}
<NoMapCard result={result} />

{/* アクションカード */}
<ActionCard action={result.firstAction} />

{/* ESコピー */}
<ESCopyCard phrase={result.esPhrase} />
```

## APIレスポンスの修正が必要な場合

現在のAPIレスポンスに「価値観（values）」フィールドがない場合、`src/app/api/transform/route.ts` と `src/lib/ai/transform.ts` を修正して、GLM APIのプロンプトに価値観推論を追加する。

必要なフィールド:
- avoidPattern: 避けるべき構造
- direction: 進むべき方向
- values: あなたの価値観（例: 「自律性・成果主義・人との関わり」）
- firstAction: 最初の1アクション
- esPhrase: ES用フレーズ

## デザインルール（DESIGN_SYSTEM.md準拠）

- グレースケール + アクセント1色（黒またはインディゴ）
- `rounded-2xl` / `shadow-sm` / `backdrop-blur-xl`
- framer-motionでアニメーション
- ダークモード必須
- ボタン: `rounded-full h-12`
- カード: `rounded-2xl border bg-card p-6 shadow-sm`

## 禁止事項

- グラデーション背景
- shadcn/uiデフォルトそのまま
- 英語のまま残す
- 色を3色以上使う

## テスト

- 既存テストが通ることを確認
- 新しいコンポーネントにテストを追加
- `npm run build` が通ること
