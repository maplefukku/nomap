# ESLint警告修正

## 警告一覧
1. src/components/__tests__/header.test.tsx: 'whileTap' is defined but never used
2. src/components/__tests__/rejection-input.test.tsx: 'fireEvent' is defined but never used
3. src/components/__tests__/rejection-input.test.tsx: 'whileHover' is defined but never used
4. src/components/__tests__/rejection-input.test.tsx: 'whileTap' is defined but never used
5. src/components/__tests__/result-card.test.tsx: 'variants' is defined but never used
6. src/components/__tests__/result-card.test.tsx: 'initial' is defined but never used
7. src/components/__tests__/result-card.test.tsx: 'animate' is defined but never used
8. src/components/__tests__/result-card.test.tsx: 'transition' is defined but never used
9. src/lib/supabase/middleware.ts: '_options' is defined but never used

## 修正方法
- 未使用のimportを削除
- 未使用の変数に_プレフィックスを追加

## 実行後
- npm run lint で警告0を確認
- npm run build でビルド確認
