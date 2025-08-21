/**
 * SQLiteデータベース接続・管理モジュール
 * 
 * このモジュールは、SQLiteデータベースへの接続と基本的な操作を提供します。
 * BunのネイティブSQLiteドライバーを使用して高速なデータベースアクセスを実現します。
 */

import { Database } from 'bun:sqlite';
import { join } from 'path';

/**
 * データベースファイルのパス
 * 環境変数で指定可能、デフォルトは ./data/asatan.db
 */
const dbPath = process.env.DATABASE_PATH || join(import.meta.dir, '../../data/asatan.db');

/**
 * SQLiteデータベースのインスタンス
 * このインスタンスを通じてすべてのDB操作を行います
 */
let db: Database;

/**
 * データベースの初期化
 * 
 * 1. データベースファイルへの接続
 * 2. 必要なテーブルの作成
 * 3. インデックスの作成
 * 
 * @returns Promise<void>
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // SQLiteデータベースに接続
    db = new Database(dbPath, { create: true });
    
    console.log('📦 データベースに接続しました:', dbPath);
    
    // 外部キー制約を有効化（データ整合性を保つため）
    db.run('PRAGMA foreign_keys = ON');
    
    // テーブルの作成
    await createTables();
    
    // インデックスの作成（検索パフォーマンス向上のため）
    await createIndexes();
    
    console.log('✅ データベースの初期化が完了しました');
  } catch (error) {
    console.error('❌ データベースの初期化に失敗しました:', error);
    throw error;
  }
}

/**
 * 必要なテーブルを作成
 * 
 * 作成するテーブル:
 * 1. foods - 食品マスタ（文科省データ）
 * 2. meal_patterns - 献立パターン
 * 3. meal_pattern_foods - 献立と食品の関連
 */
async function createTables(): Promise<void> {
  // 食品テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,              -- 食品番号（文科省の食品番号を使用）
      name TEXT NOT NULL,                -- 食品名
      name_kana TEXT,                    -- よみがな（ひらがな）
      name_english TEXT,                 -- 英語名
      protein REAL NOT NULL DEFAULT 0,   -- タンパク質(g) per 100g
      energy REAL DEFAULT 0,             -- エネルギー(kcal) per 100g
      fat REAL DEFAULT 0,                -- 脂質(g) per 100g
      carbs REAL DEFAULT 0,              -- 炭水化物(g) per 100g
      fiber REAL DEFAULT 0,              -- 食物繊維(g) per 100g
      calcium REAL DEFAULT 0,            -- カルシウム(mg) per 100g
      iron REAL DEFAULT 0,               -- 鉄(mg) per 100g
      vitamin_a REAL DEFAULT 0,          -- ビタミンA(μg) per 100g
      vitamin_b1 REAL DEFAULT 0,         -- ビタミンB1(mg) per 100g
      vitamin_b2 REAL DEFAULT 0,         -- ビタミンB2(mg) per 100g
      vitamin_c REAL DEFAULT 0,          -- ビタミンC(mg) per 100g
      salt REAL DEFAULT 0,               -- 食塩相当量(g) per 100g
      category TEXT,                     -- カテゴリー（穀類、豆類、魚介類など）
      subcategory TEXT,                  -- サブカテゴリー
      typical_amount REAL DEFAULT 100,   -- 一般的な1食あたりの量(g)
      unit TEXT DEFAULT '100g',          -- 単位の説明（1個、1枚など）
      image_url TEXT,                    -- 画像URL
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 献立パターンテーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS meal_patterns (
      id TEXT PRIMARY KEY,               -- 献立ID（UUID形式）
      name TEXT NOT NULL,                -- 献立名（例：和食セット）
      description TEXT,                  -- 説明
      total_protein REAL NOT NULL,       -- 合計タンパク質(g)
      total_energy REAL,                 -- 合計エネルギー(kcal)
      category TEXT,                     -- カテゴリー（和食、洋食、など）
      tags TEXT,                         -- タグ（JSON配列形式）
      icon TEXT,                         -- アイコン（絵文字）
      popularity INTEGER DEFAULT 0,      -- 人気度（選択回数）
      is_auto_generated BOOLEAN DEFAULT 0, -- 自動生成フラグ
      main_food_id TEXT,                 -- メイン食品のID
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (main_food_id) REFERENCES foods(id)
    )
  `);
  
  // 献立と食品の関連テーブル（多対多の関係）
  db.run(`
    CREATE TABLE IF NOT EXISTS meal_pattern_foods (
      pattern_id TEXT NOT NULL,          -- 献立ID
      food_id TEXT NOT NULL,             -- 食品ID
      quantity REAL DEFAULT 1.0,         -- 数量（デフォルトの量に対する倍率）
      serving_size REAL,                 -- 実際の提供量(g)
      notes TEXT,                        -- 備考
      PRIMARY KEY (pattern_id, food_id),
      FOREIGN KEY (pattern_id) REFERENCES meal_patterns(id) ON DELETE CASCADE,
      FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
    )
  `);
  
  // 更新履歴テーブル（データ更新の追跡用）
  db.run(`
    CREATE TABLE IF NOT EXISTS update_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      update_type TEXT NOT NULL,         -- 更新タイプ（import, manual, auto）
      target_table TEXT NOT NULL,        -- 対象テーブル
      record_count INTEGER,              -- 処理レコード数
      status TEXT,                       -- ステータス（success, failed）
      error_message TEXT,                -- エラーメッセージ
      started_at DATETIME,               -- 開始時刻
      completed_at DATETIME,             -- 完了時刻
      created_by TEXT                    -- 実行者
    )
  `);
}

/**
 * パフォーマンス向上のためのインデックスを作成
 * 
 * インデックスは検索速度を大幅に向上させますが、
 * 挿入・更新処理は若干遅くなるトレードオフがあります
 */
async function createIndexes(): Promise<void> {
  // 食品名での検索用インデックス
  db.run('CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name)');
  
  // カテゴリーでの絞り込み用インデックス
  db.run('CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category)');
  
  // タンパク質量でのソート用インデックス
  db.run('CREATE INDEX IF NOT EXISTS idx_foods_protein ON foods(protein DESC)');
  
  // 献立カテゴリーでの検索用インデックス
  db.run('CREATE INDEX IF NOT EXISTS idx_meal_patterns_category ON meal_patterns(category)');
  
  // 献立の人気度でのソート用インデックス
  db.run('CREATE INDEX IF NOT EXISTS idx_meal_patterns_popularity ON meal_patterns(popularity DESC)');
  
  // メイン食品での検索用インデックス
  db.run('CREATE INDEX IF NOT EXISTS idx_meal_patterns_main_food ON meal_patterns(main_food_id)');
}

/**
 * データベースインスタンスを取得
 * 
 * @returns Database インスタンス
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('データベースが初期化されていません。initializeDatabase()を先に実行してください。');
  }
  return db;
}

/**
 * データベース接続を閉じる
 * 
 * アプリケーション終了時やテスト後に呼び出します
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    console.log('📦 データベース接続を閉じました');
  }
}

/**
 * トランザクション処理のヘルパー関数
 * 
 * 複数の操作をアトミックに実行します（全部成功or全部失敗）
 * 
 * @param callback トランザクション内で実行する処理
 * @returns 処理結果
 */
export async function transaction<T>(
  callback: (db: Database) => T
): Promise<T> {
  const database = getDatabase();
  
  try {
    database.run('BEGIN TRANSACTION');
    const result = await callback(database);
    database.run('COMMIT');
    return result;
  } catch (error) {
    database.run('ROLLBACK');
    throw error;
  }
}