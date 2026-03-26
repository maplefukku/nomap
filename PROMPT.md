# ESコピー・SNSシェア機能追加

## 目的
PRDのコア機能を実装し、Week 1 KPIを測定可能にする

## 実装内容

### 1. ESコピーボタン
ResultCardに「ESにコピー」ボタンを追加:
- クリックでesPhraseをクリップボードにコピー
- トースト通知で「ES用フレーズをコピーしました」を表示
- アイコン: ClipboardCopy (Lucide)
- 位置: esPhraseカードの右下

### 2. Xでシェアボタン
結果画面（page.tsx）に「Xでシェア」ボタンを追加:
- クリックでTwitter Web Intentを開く
- プリセットテキスト: 「私のNoMap: [direction] - [firstAction] #NoMap」
- アイコン: Twitter (Lucide)
- 位置: 「やり直す」ボタンの横

### 3. トースト通知
sonnerパッケージを使用:
- インストール: npm install sonner
- layout.tsxに<Toaster />を追加
- コピー成功時にtoast.success()で通知

## 技術スタック
- React + TypeScript
- Tailwind CSS
- navigator.clipboard API
- Twitter Web Intent (https://twitter.com/intent/tweet)
- sonner (トースト通知)

## 関連ファイル
- src/components/result-card.tsx
- src/app/page.tsx
- src/app/layout.tsx
- package.json

## 注意事項
- `npm run build`が通ることを確認
- テストを追加
- コミットは修正ファイルのみ

## 制限時間
15分
