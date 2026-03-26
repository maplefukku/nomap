-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 拒否入力セッション
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 拒否入力アイテム
CREATE TABLE rejections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI変換結果
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  avoid_pattern TEXT NOT NULL,
  direction TEXT NOT NULL,
  first_action TEXT NOT NULL,
  es_phrase TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- インデックス
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_rejections_session_id ON rejections(session_id);
CREATE INDEX idx_results_session_id ON results(session_id);

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejections ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のみ
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- sessions: 自分のみ
CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_delete_own" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- rejections: セッション所有者のみ
CREATE POLICY "rejections_select_own" ON rejections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = rejections.session_id AND sessions.user_id = auth.uid())
  );
CREATE POLICY "rejections_insert_own" ON rejections
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = rejections.session_id AND sessions.user_id = auth.uid())
  );
CREATE POLICY "rejections_delete_own" ON rejections
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = rejections.session_id AND sessions.user_id = auth.uid())
  );

-- results: セッション所有者のみ
CREATE POLICY "results_select_own" ON results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = results.session_id AND sessions.user_id = auth.uid())
  );
CREATE POLICY "results_insert_own" ON results
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = results.session_id AND sessions.user_id = auth.uid())
  );

-- 新規ユーザー作成時にprofileを自動作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
