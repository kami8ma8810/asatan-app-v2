# 開発コマンド一覧

## フロントエンド開発（ルートディレクトリ）
```bash
bun run dev          # 開発サーバー起動（http://localhost:5173）
bun run build        # プロダクションビルド
bun run preview      # ビルドのプレビュー
bun run test         # テスト実行
bun run test:watch   # テスト（ウォッチモード）
bun run test:coverage # テストカバレッジ
bun run typecheck    # TypeScript型チェック
```

## バックエンド開発（backend/ディレクトリ）
```bash
cd backend
bun run dev          # APIサーバー起動（http://localhost:3001）
bun run start        # プロダクション実行
bun run db:setup     # データベース初期化＋データインポート
bun run db:update    # 食品データ更新
bun run db:seed      # 献立パターンシード
bun run test         # APIテスト
bun run typecheck    # TypeScript型チェック
```

## 依存関係のインストール
```bash
bun install          # フロントエンドの依存関係
cd backend && bun install # バックエンドの依存関係
```

## Git操作
```bash
git status           # 変更状況確認
git diff             # 差分確認
git log              # コミット履歴
```

## ディレクトリ移動
```bash
cd /Users/h.kamiyama/GitHub/asatan-app-v2  # プロジェクトルート
cd backend           # バックエンドディレクトリ
cd src               # フロントエンドソース
```