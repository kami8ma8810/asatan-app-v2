/**
 * 食品関連の型定義
 * 
 * データベースのスキーマと対応する型定義です。
 * フロントエンドとも共有される可能性があるため、
 * 将来的にはsharedディレクトリに移動する可能性があります。
 */

/**
 * 食品の基本情報
 */
export interface Food {
  id: string;                // 食品番号（文科省の食品番号）
  name: string;              // 食品名
  name_kana?: string;        // よみがな（ひらがな）
  name_english?: string;     // 英語名
  protein: number;           // タンパク質(g) per 100g
  energy?: number;           // エネルギー(kcal) per 100g
  fat?: number;              // 脂質(g) per 100g
  carbs?: number;            // 炭水化物(g) per 100g
  fiber?: number;            // 食物繊維(g) per 100g
  calcium?: number;          // カルシウム(mg) per 100g
  iron?: number;             // 鉄(mg) per 100g
  vitamin_a?: number;        // ビタミンA(μg) per 100g
  vitamin_b1?: number;       // ビタミンB1(mg) per 100g
  vitamin_b2?: number;       // ビタミンB2(mg) per 100g
  vitamin_c?: number;        // ビタミンC(mg) per 100g
  salt?: number;             // 食塩相当量(g) per 100g
  category?: string;         // カテゴリー（穀類、豆類、魚介類など）
  subcategory?: string;      // サブカテゴリー
  typical_amount?: number;   // 一般的な1食あたりの量(g)
  unit?: string;             // 単位の説明（1個、1枚など）
  image_url?: string;        // 画像URL
  created_at?: string;       // 作成日時
  updated_at?: string;       // 更新日時
}

/**
 * 献立パターン
 */
export interface MealPattern {
  id: string;                // 献立ID
  name: string;              // 献立名
  description?: string;      // 説明
  total_protein: number;     // 合計タンパク質(g)
  total_energy?: number;     // 合計エネルギー(kcal)
  category?: string;         // カテゴリー（和食、洋食など）
  tags?: string[];           // タグ
  icon?: string;             // アイコン（絵文字）
  popularity?: number;       // 人気度
  is_auto_generated?: boolean; // 自動生成フラグ
  main_food_id?: string;     // メイン食品のID
  foods?: MealPatternFood[]; // 含まれる食品リスト
  created_at?: string;       // 作成日時
  updated_at?: string;       // 更新日時
}

/**
 * 献立に含まれる食品
 */
export interface MealPatternFood {
  food_id: string;           // 食品ID
  food?: Food;               // 食品情報（JOINした場合）
  quantity: number;          // 数量（倍率）
  serving_size?: number;     // 実際の提供量(g)
  notes?: string;            // 備考
}

/**
 * 食品検索のクエリパラメータ
 */
export interface FoodSearchQuery {
  q?: string;                // 検索クエリ
  category?: string;         // カテゴリーフィルタ
  limit?: number;            // 取得件数
  offset?: number;           // オフセット
  sort?: 'protein' | 'name' | 'energy' | 'fat' | 'carbs';  // ソート項目
  order?: 'asc' | 'desc';    // ソート順
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  total: number;             // 総件数
  limit: number;             // 1ページあたりの件数
  offset: number;            // オフセット
  hasMore: boolean;          // 次のページがあるか
}

/**
 * 食品カテゴリー情報
 */
export interface FoodCategory {
  category: string;          // カテゴリー名
  count: number;             // 食品数
  avg_protein: number;       // 平均タンパク質量
}

/**
 * 献立生成リクエスト
 */
export interface GenerateMealRequest {
  targetProtein: number;     // 目標タンパク質(g)
  mainFoodId?: string;       // メイン食品ID
  maxItems?: number;         // 最大品目数
  excludeCategories?: string[]; // 除外カテゴリー
  preferCategories?: string[];  // 優先カテゴリー
}