# コードスタイルと規約

## TypeScript設定
### 厳格な設定
- `strict: true` - 厳格な型チェック有効
- `noUnusedLocals: true` - 未使用のローカル変数エラー
- `noUnusedParameters: true` - 未使用のパラメータエラー
- `noFallthroughCasesInSwitch: true` - switch文のフォールスルー禁止

### モジュール設定
- ESモジュール形式を使用
- `moduleResolution: bundler`
- TypeScriptの拡張子インポート許可

### JSX設定
- Solid.js用のJSX設定（`jsxImportSource: "solid-js"`）
- `jsx: "preserve"`

## コーディング規約
### 必須規約
- **any型の使用禁止** - 型安全性を損なうため絶対に使用しない
- 代替案：
  - `unknown`: 型が不明な場合
  - `Record<string, unknown>`: オブジェクト型で値の型が不明な場合
  - ジェネリクス: 型パラメータを使用
  - Union型: 複数の可能な型がある場合
  - 具体的なインターフェースの定義

### ディレクトリ構造
```
フロントエンド:
- src/components/ - UIコンポーネント
- src/models/ - 型定義
- src/services/ - APIクライアント
- src/assets/ - 静的ファイル

バックエンド:
- backend/src/api/ - APIエンドポイント
- backend/src/db/ - データベース層
- backend/src/services/ - ビジネスロジック
- backend/src/scripts/ - ユーティリティスクリプト
- backend/src/types/ - 型定義
```

### 命名規則
- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE
- ファイル名: camelCase（コンポーネントはPascalCase）

## テスト規約
- Vitestを使用
- テストファイルは`.test.ts`または`.test.tsx`
- コンポーネントテストは`@solidjs/testing-library`を使用