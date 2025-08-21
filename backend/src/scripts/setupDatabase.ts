#!/usr/bin/env bun
/**
 * データベースのセットアップスクリプト
 * 
 * このスクリプトは以下を実行します：
 * 1. SQLiteデータベースの初期化
 * 2. 必要なテーブルの作成
 * 3. 文科省データのインポート
 * 4. 初期献立パターンの生成
 */

import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'asatan.db');

// データディレクトリが存在しない場合は作成
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
  console.log('📁 データディレクトリを作成しました');
}

// データベースの初期化
console.log('🗄️  データベースを初期化しています...');
const db = new Database(DB_PATH, { create: true });

// テーブルの作成
console.log('📋 テーブルを作成しています...');

// 食品マスタテーブル
db.run(`
  CREATE TABLE IF NOT EXISTS foods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_kana TEXT,
    protein REAL NOT NULL,
    energy REAL,
    fat REAL,
    carbs REAL,
    salt REAL,
    category TEXT,
    sub_category TEXT,
    image_path TEXT,
    is_default INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// インデックスの作成
db.run(`CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_foods_protein ON foods(protein)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_foods_is_default ON foods(is_default)`);

// 献立パターンテーブル
db.run(`
  CREATE TABLE IF NOT EXISTS meal_patterns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    total_protein REAL NOT NULL,
    total_energy REAL,
    total_fat REAL,
    total_carbs REAL,
    pfc_score REAL,
    category TEXT,
    tags TEXT,
    icon TEXT,
    popularity INTEGER DEFAULT 0,
    is_auto_generated BOOLEAN DEFAULT 0,
    main_food_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_food_id) REFERENCES foods(id)
  )
`);

// 献立と食品の関連テーブル
db.run(`
  CREATE TABLE IF NOT EXISTS meal_pattern_foods (
    pattern_id TEXT NOT NULL,
    food_id TEXT NOT NULL,
    quantity REAL DEFAULT 1.0,
    serving_size REAL,
    notes TEXT,
    PRIMARY KEY (pattern_id, food_id),
    FOREIGN KEY (pattern_id) REFERENCES meal_patterns(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
  )
`);

// データ更新履歴テーブル
db.run(`
  CREATE TABLE IF NOT EXISTS update_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    update_type TEXT NOT NULL,
    target_table TEXT,
    record_count INTEGER,
    status TEXT,
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ テーブルの作成が完了しました');

// 初期データの投入（既存の36品目）
console.log('🍳 初期データを投入しています...');

const initialFoods = [
  // 卵・乳製品カテゴリー
  { id: 'egg_1', name: '卵（1個）', protein: 6.2, energy: 91, fat: 6.2, carbs: 0.2, category: '卵・乳製品', image_path: 'egg.jpg' },
  { id: 'yogurt_1', name: 'ヨーグルト（1個）', protein: 4.3, energy: 61, fat: 3.0, carbs: 4.9, category: '卵・乳製品', image_path: 'yogurt.jpg' },
  { id: 'milk_1', name: '牛乳（200ml）', protein: 6.6, energy: 134, fat: 7.6, carbs: 9.6, category: '卵・乳製品', image_path: 'milk.jpg' },
  { id: 'cheese_1', name: 'チーズ（1個）', protein: 4.5, energy: 68, fat: 5.2, carbs: 0.3, category: '卵・乳製品', image_path: 'cheese.jpg' },
  { id: 'cheese_toast_1', name: 'チーズトースト', protein: 10.5, energy: 240, fat: 10.8, carbs: 22.5, category: '卵・乳製品', image_path: 'cheese_toast.jpg' },
  { id: 'pudding_1', name: 'プリン（1個）', protein: 5.6, energy: 126, fat: 5.0, carbs: 15.3, category: '卵・乳製品', image_path: 'pudding.jpg' },
  
  // 大豆製品カテゴリー
  { id: 'natto_1', name: '納豆（1パック）', protein: 8.3, energy: 100, fat: 5.0, carbs: 6.1, category: '大豆製品', image_path: 'natto.jpg' },
  { id: 'tofu_1', name: '豆腐（半丁）', protein: 10.0, energy: 108, fat: 6.0, carbs: 2.4, category: '大豆製品', image_path: 'tofu.jpg' },
  { id: 'miso_soup_tofu_1', name: '味噌汁（豆腐）', protein: 4.5, energy: 45, fat: 2.1, carbs: 3.2, category: '大豆製品', image_path: 'miso_soup_tofu.jpg' },
  { id: 'soymilk_1', name: '豆乳（200ml）', protein: 7.2, energy: 92, fat: 4.0, carbs: 6.2, category: '大豆製品', image_path: 'soymilk.jpg' },
  { id: 'atsuage_1', name: '厚揚げ（1/2枚）', protein: 5.3, energy: 75, fat: 5.6, carbs: 0.4, category: '大豆製品', image_path: 'atsuage.jpg' },
  { id: 'edamame_1', name: '枝豆（50g）', protein: 5.8, energy: 67, fat: 3.1, carbs: 4.3, category: '大豆製品', image_path: 'edamame.jpg' },
  
  // 肉類カテゴリー
  { id: 'ham_1', name: 'ハム（2枚）', protein: 3.3, energy: 39, fat: 2.8, carbs: 0.4, category: '肉類', image_path: 'ham.jpg' },
  { id: 'sausage_1', name: 'ウインナー（2本）', protein: 5.2, energy: 96, fat: 8.6, carbs: 0.6, category: '肉類', image_path: 'sausage.jpg' },
  { id: 'bacon_1', name: 'ベーコン（2枚）', protein: 5.9, energy: 81, fat: 7.8, carbs: 0.1, category: '肉類', image_path: 'bacon.jpg' },
  { id: 'chicken_1', name: '鶏むね肉（50g）', protein: 11.5, energy: 54, fat: 0.8, carbs: 0, category: '肉類', image_path: 'chicken.jpg' },
  { id: 'chicken_salad_1', name: 'サラダチキン', protein: 21.7, energy: 108, fat: 1.5, carbs: 0.1, category: '肉類', image_path: 'chicken_salad.jpg' },
  { id: 'meatball_1', name: 'ミートボール（3個）', protein: 6.1, energy: 99, fat: 6.6, carbs: 4.5, category: '肉類', image_path: 'meatball.jpg' },
  
  // 魚介類カテゴリー
  { id: 'salmon_1', name: '鮭（1切れ）', protein: 17.8, energy: 133, fat: 4.1, carbs: 0.1, category: '魚介類', image_path: 'salmon.jpg' },
  { id: 'tuna_can_1', name: 'ツナ缶（1/2缶）', protein: 8.8, energy: 71, fat: 4.5, carbs: 0.1, category: '魚介類', image_path: 'tuna_can.jpg' },
  { id: 'saba_can_1', name: 'サバ缶（1/2缶）', protein: 13.0, energy: 95, fat: 5.3, carbs: 0.2, category: '魚介類', image_path: 'saba_can.jpg' },
  { id: 'shirasu_1', name: 'しらす（大さじ2）', protein: 4.1, energy: 19, fat: 0.4, carbs: 0.1, category: '魚介類', image_path: 'shirasu.jpg' },
  { id: 'kamaboko_1', name: 'かまぼこ（2切れ）', protein: 2.4, energy: 19, fat: 0.2, carbs: 1.9, category: '魚介類', image_path: 'kamaboko.jpg' },
  { id: 'chikuwa_1', name: 'ちくわ（1本）', protein: 3.7, energy: 30, fat: 0.5, carbs: 3.4, category: '魚介類', image_path: 'chikuwa.jpg' },
  
  // 主食カテゴリー
  { id: 'rice_1', name: 'ご飯（茶碗1杯）', protein: 3.8, energy: 252, fat: 0.5, carbs: 55.7, category: '主食', image_path: 'rice.jpg' },
  { id: 'bread_1', name: '食パン（6枚切1枚）', protein: 5.6, energy: 158, fat: 2.6, carbs: 28.0, category: '主食', image_path: 'bread.jpg' },
  { id: 'udon_1', name: 'うどん（1玉）', protein: 6.1, energy: 210, fat: 0.6, carbs: 43.2, category: '主食', image_path: 'udon.jpg' },
  { id: 'pasta_1', name: 'パスタ（80g）', protein: 10.4, energy: 299, fat: 1.5, carbs: 57.0, category: '主食', image_path: 'pasta.jpg' },
  { id: 'oatmeal_1', name: 'オートミール（30g）', protein: 4.1, energy: 114, fat: 1.7, carbs: 20.7, category: '主食', image_path: 'oatmeal.jpg' },
  { id: 'granola_1', name: 'グラノーラ（40g）', protein: 3.6, energy: 180, fat: 6.4, carbs: 28.0, category: '主食', image_path: 'granola.jpg' },
  
  // その他カテゴリー
  { id: 'nuts_1', name: 'ミックスナッツ（25g）', protein: 4.8, energy: 152, fat: 13.6, carbs: 5.1, category: 'その他', image_path: 'nuts.jpg' },
  { id: 'kinako_1', name: 'きなこ（大さじ2）', protein: 4.4, energy: 45, fat: 2.3, carbs: 3.1, category: 'その他', image_path: 'kinako.jpg' },
  { id: 'protein_bar_1', name: 'プロテインバー', protein: 15.0, energy: 200, fat: 8.0, carbs: 18.0, category: 'その他', image_path: 'protein_bar.jpg' },
  { id: 'banana_1', name: 'バナナ（1本）', protein: 1.1, energy: 86, fat: 0.2, carbs: 22.5, category: 'その他', image_path: 'banana.jpg' },
  { id: 'tomato_1', name: 'トマト（1個）', protein: 0.9, energy: 30, fat: 0.2, carbs: 7.0, category: 'その他', image_path: 'tomato.jpg' },
  { id: 'avocado_1', name: 'アボカド（1/2個）', protein: 1.8, energy: 131, fat: 13.1, carbs: 3.5, category: 'その他', image_path: 'avocado.jpg' }
];

// INSERT文の準備
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO foods (id, name, protein, energy, fat, carbs, category, image_path, is_default)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

// トランザクション内で一括挿入
const insertAll = db.transaction((foods) => {
  for (const food of foods) {
    insertStmt.run(food.id, food.name, food.protein, food.energy, food.fat, food.carbs, food.category, food.image_path);
  }
});

insertAll(initialFoods);

console.log(`✅ ${initialFoods.length}件の初期データを投入しました`);

// 更新履歴の記録
db.run(`
  INSERT INTO update_history (update_type, target_table, record_count, status, created_by)
  VALUES ('initial_setup', 'foods', ?, 'success', 'setup_script')
`, initialFoods.length);

// データベースを閉じる
db.close();

console.log('🎉 データベースのセットアップが完了しました！');
console.log(`📂 データベースの場所: ${DB_PATH}`);
console.log('\n次のコマンドで他のデータをインポートできます:');
console.log('  bun run db:update    # 文科省データの更新');
console.log('  bun run db:seed      # 献立パターンの生成');