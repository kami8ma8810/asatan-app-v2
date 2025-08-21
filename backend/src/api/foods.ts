/**
 * 食品関連のAPIエンドポイント
 * 
 * このモジュールは食品データの検索、取得、管理に関するAPIを提供します。
 * 文科省の食品成分データベースから取得したデータを扱います。
 */

import { Hono } from 'hono';
import { getDatabase } from '../db/database';
import type { Food } from '../types/food';

/**
 * 食品APIのルーター
 */
export const foodsRouter = new Hono();

/**
 * GET /api/foods
 * 食品一覧の取得・検索
 * 
 * クエリパラメータ:
 * - q: 検索クエリ（食品名での部分一致検索）
 * - category: カテゴリーでのフィルタリング
 * - limit: 取得件数の上限（デフォルト: 20、最大: 100）
 * - offset: オフセット（ページネーション用）
 * - sort: ソート項目（protein, name, energy）
 * - order: ソート順（asc, desc）
 * 
 * @example
 * GET /api/foods?q=納豆&category=豆類&limit=10
 */
foodsRouter.get('/', async (c) => {
  try {
    const db = getDatabase();
    
    // クエリパラメータの取得と検証
    const query = c.req.query('q') || '';
    const category = c.req.query('category') || '';
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = parseInt(c.req.query('offset') || '0');
    const sort = c.req.query('sort') || 'protein';
    const order = c.req.query('order') || 'desc';
    
    // SQLクエリの構築
    let sql = 'SELECT * FROM foods WHERE 1=1';
    const params: any[] = [];
    
    // 検索条件の追加
    if (query) {
      // 食品名またはよみがなでの部分一致検索
      sql += ' AND (name LIKE ? OR name_kana LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    
    if (category) {
      // カテゴリーでのフィルタリング
      sql += ' AND category = ?';
      params.push(category);
    }
    
    // ソートの追加（SQLインジェクション対策のためホワイトリスト方式）
    const allowedSortFields = ['protein', 'name', 'energy', 'fat', 'carbs'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'protein';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;
    
    // ページネーション
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // クエリの実行
    const stmt = db.prepare(sql);
    const foods = stmt.all(...params) as Food[];
    
    // 総件数の取得（ページネーション情報のため）
    let countSql = 'SELECT COUNT(*) as total FROM foods WHERE 1=1';
    const countParams: any[] = [];
    
    if (query) {
      countSql += ' AND (name LIKE ? OR name_kana LIKE ?)';
      countParams.push(`%${query}%`, `%${query}%`);
    }
    
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    
    const countStmt = db.prepare(countSql);
    const countResult = countStmt.get(...countParams) as { total: number };
    
    // レスポンスの返却
    return c.json({
      foods,
      pagination: {
        total: countResult.total,
        limit,
        offset,
        hasMore: offset + limit < countResult.total
      }
    });
    
  } catch (error) {
    console.error('食品検索エラー:', error);
    return c.json({ error: '食品の検索に失敗しました' }, 500);
  }
});

/**
 * GET /api/foods/:id
 * 特定の食品の詳細情報を取得
 * 
 * @param id 食品ID（文科省の食品番号）
 */
foodsRouter.get('/:id', async (c) => {
  try {
    const db = getDatabase();
    const id = c.req.param('id');
    
    // 食品情報の取得
    const stmt = db.prepare('SELECT * FROM foods WHERE id = ?');
    const food = stmt.get(id) as Food | undefined;
    
    if (!food) {
      return c.json({ error: '指定された食品が見つかりません' }, 404);
    }
    
    // この食品を含む献立パターンも取得
    const patternStmt = db.prepare(`
      SELECT mp.* 
      FROM meal_patterns mp
      JOIN meal_pattern_foods mpf ON mp.id = mpf.pattern_id
      WHERE mpf.food_id = ?
      ORDER BY mp.popularity DESC
      LIMIT 5
    `);
    const relatedPatterns = patternStmt.all(id);
    
    return c.json({
      food,
      relatedPatterns
    });
    
  } catch (error) {
    console.error('食品詳細取得エラー:', error);
    return c.json({ error: '食品情報の取得に失敗しました' }, 500);
  }
});

/**
 * GET /api/foods/categories
 * 利用可能なカテゴリー一覧を取得
 */
foodsRouter.get('/categories', async (c) => {
  try {
    const db = getDatabase();
    
    // カテゴリーごとの食品数を集計
    const stmt = db.prepare(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(protein) as avg_protein
      FROM foods
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);
    
    const categories = stmt.all();
    
    return c.json({ categories });
    
  } catch (error) {
    console.error('カテゴリー取得エラー:', error);
    return c.json({ error: 'カテゴリー情報の取得に失敗しました' }, 500);
  }
});

/**
 * GET /api/foods/search/suggestions
 * 検索サジェスト（オートコンプリート）
 * 
 * @param q 検索クエリの先頭部分
 */
foodsRouter.get('/search/suggestions', async (c) => {
  try {
    const db = getDatabase();
    const query = c.req.query('q') || '';
    
    if (query.length < 1) {
      return c.json({ suggestions: [] });
    }
    
    // 名前とよみがなの両方から候補を取得
    const stmt = db.prepare(`
      SELECT DISTINCT name, name_kana, protein
      FROM foods
      WHERE name LIKE ? OR name_kana LIKE ?
      ORDER BY 
        CASE 
          WHEN name LIKE ? THEN 0  -- 前方一致を優先
          ELSE 1
        END,
        protein DESC
      LIMIT 10
    `);
    
    const suggestions = stmt.all(
      `%${query}%`, 
      `%${query}%`, 
      `${query}%`
    );
    
    return c.json({ suggestions });
    
  } catch (error) {
    console.error('サジェスト取得エラー:', error);
    return c.json({ suggestions: [] });
  }
});

/**
 * GET /api/foods/ranking/protein
 * タンパク質ランキング
 * 
 * タンパク質が多い食品のランキングを返す
 */
foodsRouter.get('/ranking/protein', async (c) => {
  try {
    const db = getDatabase();
    const limit = Math.min(parseInt(c.req.query('limit') || '10'), 50);
    
    const stmt = db.prepare(`
      SELECT 
        id,
        name,
        protein,
        energy,
        category,
        typical_amount,
        unit
      FROM foods
      ORDER BY protein DESC
      LIMIT ?
    `);
    
    const ranking = stmt.all(limit);
    
    return c.json({ ranking });
    
  } catch (error) {
    console.error('ランキング取得エラー:', error);
    return c.json({ error: 'ランキングの取得に失敗しました' }, 500);
  }
});