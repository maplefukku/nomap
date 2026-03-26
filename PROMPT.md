# NoMap 認証+DB実装タスク

## 概要
NoMap（ノーマップ）は「やりたくない」から自分の地図を作るAIツール。

## PRDから抽出した必要機能
1. ユーザー認証（Supabase Auth）
2. ネガティブ入力（拒否リスト）の保存
3. AI変換結果の保存
4. ユーザーごとの履歴管理

## 実装タスク

### 1. Supabase設定
- Supabaseプロジェクト設定（既存のsora-personal組織を使用）
- Supabase Auth（メール認証）

### 2. DBスキーマ設計

```sql
-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 拒否入力セッション
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 拒否入力アイテム
CREATE TABLE rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI変換結果
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  avoid_pattern TEXT NOT NULL,
  direction TEXT NOT NULL,
  first_action TEXT NOT NULL,
  es_phrase TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. RLSポリシー
- profiles: ユーザーは自分のプロファイルのみアクセス可能
- sessions: ユーザーは自分のセッションのみアクセス可能
- rejections: ユーザーは自分の拒否入力のみアクセス可能
- results: ユーザーは自分の結果のみアクセス可能

### 4. データアクセス層
- src/lib/supabase/client.ts - クライアントサイド用
- src/lib/supabase/server.ts - サーバーサイド用
- src/lib/db/sessions.ts - セッション操作
- src/lib/db/results.ts - 結果操作

### 5. Migration作成
- supabase/migrations/20260326_initial_schema.sql

## 注意
- 制限時間45分
- Claude Codeに委任して実装
- LLM: GLM API (GLM-4.7) のみ使用
- OpenAI/GPT/OpenRouter禁止

## 実行手順
1. supabase init
2. migration作成
3. Supabaseクライアント設定
4. データアクセス層実装
5. テスト作成
6. npm run build で確認
