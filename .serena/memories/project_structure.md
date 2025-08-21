# プロジェクト構造

## ルートディレクトリ
```
asatan-app-v2/
├── src/                      # フロントエンドソース
│   ├── components/          # UIコンポーネント
│   ├── models/              # 型定義
│   ├── services/            # APIクライアント
│   ├── data/                # 静的データ
│   ├── assets/              # 画像などの静的ファイル
│   ├── App.tsx              # ルートコンポーネント
│   ├── App.css              # アプリスタイル
│   ├── App.test.tsx         # テスト
│   └── index.tsx            # エントリーポイント
│
├── backend/                  # バックエンドサーバー
│   ├── src/
│   │   ├── api/            # APIエンドポイント
│   │   ├── db/             # データベース層
│   │   ├── services/       # ビジネスロジック
│   │   ├── scripts/        # ユーティリティ
│   │   ├── types/          # 型定義
│   │   └── index.ts        # サーバーエントリー
│   ├── data/               # SQLiteデータベース
│   └── package.json        # バックエンド依存関係
│
├── public/                   # 静的公開ファイル
│
├── package.json             # フロントエンド依存関係
├── tsconfig.json            # TypeScript設定（ルート）
├── tsconfig.app.json        # TypeScript設定（アプリ）
├── vite.config.ts           # Vite設定
├── vitest.config.ts         # Vitest設定
├── bunfig.toml              # Bun設定
├── .mise.toml               # Node.jsバージョン管理
├── README.md                # プロジェクトドキュメント
├── DEVELOPMENT.md           # 開発ドキュメント
└── TODO.md                  # タスクリスト
```

## 主要なディレクトリの役割
- **src/**: フロントエンドのソースコード（Solid.js）
- **backend/**: バックエンドAPIサーバー（Bun + Hono）
- **public/**: ビルド時にそのまま公開される静的ファイル

## データフロー
1. フロントエンド（Solid.js）がユーザーインターフェースを提供
2. APIクライアント（services/）がバックエンドと通信
3. バックエンド（Hono）がリクエストを処理
4. SQLiteデータベースから食品データを取得
5. レスポンスをフロントエンドに返却