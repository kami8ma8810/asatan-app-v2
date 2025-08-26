# 開発ドキュメント - 朝たん計算アプリ v2.0

## 🎯 開発方針

### TDD（テスト駆動開発）の徹底

このプロジェクトは**100% TDD**で開発しています。

#### TDDサイクル
1. **RED**: まずテストを書く（失敗することを確認）
2. **GREEN**: テストを通す最小限の実装
3. **REFACTOR**: コードを改善（テストは通ったまま）

#### 実装例
```typescript
// 1. RED - テストファースト
describe("ProteinCalculator", () => {
  it("選択された食品のタンパク質を合計する", () => {
    const foods = [
      createFood("納豆", 4, "item13.jpg"),
      createFood("卵", 6, "item35.jpg")
    ];
    const calculator = new ProteinCalculator();
    expect(calculator.calculate(foods)).toBe(10);
  });
});

// 2. GREEN - 最小限の実装
export class ProteinCalculator {
  calculate(foods: Food[]): number {
    return foods.reduce((sum, food) => sum + food.protein, 0);
  }
}

// 3. REFACTOR - 必要に応じて改善
```

### テスト戦略
- **単体テスト**: モデル層・サービス層
- **コンポーネントテスト**: Solid.jsコンポーネント
- **統合テスト**: アプリ全体の動作確認

### テスト実行
```bash
# 全テスト実行
bun run test

# ウォッチモード（開発中推奨）
bun run test:watch

# カバレッジ確認
bun run test:coverage
```

## 🎨 デザインシステム

### ポケモン風デザインコンセプト

ポケモントレーディングカードゲームポケット（ポケポケ）をインスパイアしたデザイン。

#### カラーパレット
```css
:root {
  /* メインカラー - ポケモンタイプカラー風 */
  --primary-red: #ff6b6b;      /* ほのおタイプ */
  --primary-yellow: #ffd93d;   /* でんきタイプ */
  --primary-blue: #6bcf7f;     /* みずタイプ */
  --primary-purple: #a685e2;   /* エスパータイプ */
  
  /* グラデーション */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #f093fb 100%);
  --gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  --gradient-warning: linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%);
}
```

#### カードデザイン要素
1. **食品カード**
   - TCG風のカードレイアウト
   - 選択時のキラキラエフェクト
   - ホバー時の浮遊アニメーション

2. **レアリティ表現**（実装予定）
   - タンパク質量に応じたレアリティ
   - 1-3g: コモン（グレー枠）
   - 4-5g: アンコモン（シルバー枠）
   - 6g以上: レア（ゴールド枠）

3. **アニメーション**
   ```css
   /* カード選択時のアニメーション */
   @keyframes checkIn {
     from {
       transform: scale(0);
       opacity: 0;
     }
     to {
       transform: scale(1);
       opacity: 1;
     }
   }
   
   /* 目標達成時のパルス */
   @keyframes achievedPulse {
     0%, 100% { transform: scale(1); }
     50% { transform: scale(1.02); }
   }
   ```

4. **インタラクション**
   - カード選択: スケールアップ + チェックマーク
   - 20g達成: 背景グラデーション変化 + 祝福アニメーション
   - プログレスバー: 滑らかな伸縮

#### UI/UXの特徴
- **ゲーミフィケーション要素**
  - プログレスバーで進捗を可視化
  - 達成時の演出でモチベーション向上
  - カード収集感覚で楽しく選択

- **視認性の工夫**
  - 高コントラストな配色
  - 大きめのフォントサイズ
  - 明確なホバー/選択状態

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────────────────┐
│                   フロントエンド                      │
│                 (Solid.js + Vite)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  Components (View Layer)                    │   │
│  │  - FoodCard: 食品カード表示                  │   │
│  │  - ProteinCounter: 合計表示                  │   │
│  │  - MealPatterns: 献立パターン表示            │   │
│  │  - ShareButton: SNSシェア機能                │   │
│  │  - SelectionSidebar: 選択状態管理           │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                  │   │
│  │  - ProteinCalculator: 計算ロジック           │   │
│  │  - MealPatternsService: API通信             │   │
│  │  - MealRecommenderService: レコメンド       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Models/Types (Domain Layer)                │   │
│  │  - Food: 食品エンティティ                    │   │
│  │  - MealPattern: 献立パターン型              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────┐
│                    バックエンド                       │
│                  (Bun + Hono)                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  API Routes (Presentation Layer)            │   │
│  │  - /api/foods: 食品一覧・検索                │   │
│  │  - /api/meals/patterns: 献立パターン        │   │
│  │  - /api/meals/generate: 献立生成            │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                  │   │
│  │  - MealGenerator: 献立生成ロジック           │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Database (SQLite)                          │   │
│  │  - foods: 食品マスタ                         │   │
│  │  - meal_patterns: 献立パターン               │   │
│  │  - meal_pattern_foods: 献立構成食品         │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### ディレクトリ構造と責務

```
asatan-app-v2/
├── src/                     # フロントエンド
│   ├── components/         # UIコンポーネント（View層）
│   │   ├── FoodCard/      # 食品カード
│   │   ├── ProteinCounter/ # タンパク質カウンター
│   │   └── MealPatterns/  # 献立パターン
│   ├── models/            # データモデル（Domain層）
│   │   └── Food.ts        # 食品エンティティ
│   ├── types/             # 型定義
│   │   └── MealPattern.ts # 献立パターン型
│   ├── services/          # ビジネスロジック（Service層）
│   │   ├── ProteinCalculator.ts      # 計算ロジック
│   │   ├── MealPatternsService.ts    # API通信
│   │   └── MealRecommenderService.ts # レコメンド
│   ├── data/              # 静的データ（Data層）
│   │   └── foods.ts       # 食品マスターデータ
│   └── App.tsx            # アプリケーションルート
│
└── backend/                # バックエンド
    ├── src/
    │   ├── api/           # APIエンドポイント
    │   │   ├── foods.ts   # 食品API
    │   │   ├── meals.ts   # 献立API
    │   │   └── admin.ts   # 管理API
    │   ├── db/            # データベース
    │   │   └── database.ts # DB接続管理
    │   ├── services/      # サービス層
    │   │   └── mealGenerator.ts # 献立生成
    │   ├── scripts/       # ユーティリティ
    │   │   ├── setupDatabase.ts    # DB初期化
    │   │   ├── importFoodData.ts   # データインポート
    │   │   └── generateMealPatterns.ts # 献立生成
    │   └── index.ts       # サーバーエントリポイント
    └── data/
        └── asatan.db      # SQLiteデータベース
```

### データフロー

#### 1. 食品選択フロー
```
User Action → FoodCard → App State → ProteinCounter
                ↓
         ProteinCalculator
                ↓
         合計タンパク質表示
```

#### 2. 献立パターン取得フロー
```
Component Mount → MealPatternsService.fetchPatterns()
                          ↓
                   HTTP GET /api/meals/patterns
                          ↓
                   Backend: meals.ts
                          ↓
                   SQLite Query (JOIN)
                          ↓
                   JSON Response
                          ↓
                   Component State Update
                          ↓
                   UI Render
```

#### 3. レコメンデーションフロー
```
Selected Foods → MealRecommenderService
                        ↓
                Calculate Remaining Protein
                        ↓
                Score & Rank Foods
                        ↓
                Generate Recommendations
                        ↓
                Display Suggestions
```

#### 4. シェア機能フロー
```
Selected Foods → ShareButton Component
                        ↓
                Generate Share Text
                        ↓
            ┌───────────┴───────────┐
            ↓                       ↓
     SNS Share API           Canvas API
      (X, LINE)            (Image Generation)
            ↓                       ↓
      Open Share URL         Download PNG
```

### 設計原則
1. **単一責任の原則**: 各コンポーネント/サービスは1つの責務のみ
2. **依存性逆転の原則**: 抽象に依存（TypeScript interface活用）
3. **テスタビリティ**: 全コンポーネントが独立してテスト可能
4. **レイヤードアーキテクチャ**: 明確な層分離
5. **APIファースト**: フロントエンドとバックエンドの疎結合

## 🚀 パフォーマンス最適化

### Solid.jsの利点
- **仮想DOMなし**: 直接DOM操作で超高速
- **細粒度リアクティビティ**: 必要な部分のみ更新
- **コンパイル時最適化**: ランタイムオーバーヘッド最小

### 測定結果
```
初回ロード: 150ms
カード選択: 1-2ms
36枚全選択: 10ms
Lighthouse: 95点（現状）→ 100点（目標）
```

## 📋 コーディング規約

### TypeScript
- `any`型は絶対禁止
- 型推論を活用しつつ、複雑な型は明示的に定義
- `interface`優先（`type`は必要時のみ）

### Solid.js
- `createSignal`は最小限に
- `createMemo`で計算値をメモ化
- `Show`/`For`で条件付きレンダリング

### CSS
- BEM記法ベース（例: `.food-card__image`）
- CSS変数で共通値管理
- レスポンシブはモバイルファースト

### Git
- コミットは機能単位で細かく
- プレフィックス使用（feat, fix, chore, docs等）
- TDDサイクルごとにコミット

## 🔧 開発環境

### 必須ツール
- Node.js: v20以上
- Bun: v1.2以上
- VSCode推奨

### VSCode拡張機能
- Solid.js Language Support
- ESLint
- Prettier
- Vitest

### 開発コマンド
```bash
# 開発サーバー起動
bun run dev

# テスト実行
bun run test

# 型チェック
bun run typecheck

# ビルド
bun run build
```

## 📝 今後の開発計画

### Phase 1（現在）: 基本機能
- ✅ 食品選択・計算機能
- ✅ 目標達成表示
- ✅ カテゴリー分類

### Phase 2: 付加価値機能
- ✅ 献立パターン提案
- ✅ 食品レコメンド
- ✅ SNSシェア（X, LINE, 画像生成）

### Phase 3: UX向上
- ⏳ ホログラムエフェクト
- ⏳ レアリティシステム
- ⏳ サウンドエフェクト

### Phase 4: 高度な機能
- ⏳ PWA化
- ⏳ オフライン対応
- ⏳ AI連携

---

最終更新: 2024-08-20
作成者: 上かるび with Claude Code