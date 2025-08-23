/**
 * 献立関連のAPIエンドポイント
 * 
 * このモジュールは献立パターンの取得、生成、管理に関するAPIを提供します。
 * 各食品に対して複数の献立パターンを自動生成し、提案します。
 */

import { Hono } from 'hono';
import { getDatabase } from '../db/database';
import { generateMealPatterns } from '../services/mealGenerator';
import type { MealPattern, GenerateMealRequest } from '../types/food';

/**
 * 献立APIのルーター
 */
export const mealsRouter = new Hono();

/**
 * GET /api/meals/patterns
 * 献立パターン一覧の取得
 * 
 * クエリパラメータ:
 * - foodId: 特定の食品を含む献立のみ取得
 * - category: カテゴリーでのフィルタリング（和食、洋食など）
 * - limit: 取得件数（デフォルト: 20）
 * - offset: オフセット
 * - popular: true の場合、人気順でソート
 */
mealsRouter.get('/patterns', async (c) => {
  try {
    const db = getDatabase();
    
    // クエリパラメータの取得
    const foodId = c.req.query('foodId');
    const category = c.req.query('category');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = parseInt(c.req.query('offset') || '0');
    const popular = c.req.query('popular') === 'true';
    
    // SQLクエリの構築
    let sql = `
      SELECT DISTINCT
        mp.*,
        json_group_array(
          json_object(
            'food_id', mpf.food_id,
            'quantity', mpf.quantity,
            'serving_size', mpf.serving_size,
            'food_name', f.name,
            'food_protein', f.protein
          )
        ) as foods_json
      FROM meal_patterns mp
      LEFT JOIN meal_pattern_foods mpf ON mp.id = mpf.pattern_id
      LEFT JOIN foods f ON mpf.food_id = f.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // フィルタリング条件の追加
    if (foodId) {
      // 特定の食品を含む献立のみ
      sql = `
        SELECT DISTINCT
          mp.*,
          json_group_array(
            json_object(
              'food_id', mpf2.food_id,
              'quantity', mpf2.quantity,
              'serving_size', mpf2.serving_size,
              'food_name', f2.name,
              'food_protein', f2.protein
            )
          ) as foods_json
        FROM meal_patterns mp
        JOIN meal_pattern_foods mpf ON mp.id = mpf.pattern_id AND mpf.food_id = ?
        LEFT JOIN meal_pattern_foods mpf2 ON mp.id = mpf2.pattern_id
        LEFT JOIN foods f2 ON mpf2.food_id = f2.id
        WHERE 1=1
      `;
      params.push(foodId);
    }
    
    if (category) {
      sql += ' AND mp.category = ?';
      params.push(category);
    }
    
    // グループ化
    sql += ' GROUP BY mp.id';
    
    // ソート
    if (popular) {
      sql += ' ORDER BY mp.popularity DESC';
    } else {
      sql += ' ORDER BY mp.total_protein DESC';
    }
    
    // ページネーション
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // クエリの実行
    const stmt = db.prepare(sql);
    const patterns = stmt.all(...params) as any[];
    
    // JSONデータのパース
    const formattedPatterns = patterns.map(pattern => {
      const foods = pattern.foods_json ? 
        JSON.parse(pattern.foods_json) : 
        [];
      
      return {
        ...pattern,
        foods,
        foods_json: undefined  // 不要なフィールドを削除
      };
    });
    
    return c.json({
      patterns: formattedPatterns,
      pagination: {
        limit,
        offset,
        hasMore: formattedPatterns.length === limit
      }
    });
    
  } catch (error) {
    console.error('献立パターン取得エラー:', error);
    return c.json({ error: '献立パターンの取得に失敗しました' }, 500);
  }
});

/**
 * POST /api/meals/generate
 * 献立を自動生成
 * 
 * リクエストボディ:
 * - targetProtein: 目標タンパク質量(g)
 * - mainFoodId: メインとなる食品のID（オプション）
 * - maxItems: 最大品目数（デフォルト: 4）
 * - excludeCategories: 除外するカテゴリー
 * - preferCategories: 優先するカテゴリー
 */
mealsRouter.post('/generate', async (c) => {
  try {
    const request = await c.req.json<GenerateMealRequest>();
    
    // バリデーション
    if (!request.targetProtein || request.targetProtein < 1 || request.targetProtein > 100) {
      return c.json({ error: '目標タンパク質は1〜100gの範囲で指定してください' }, 400);
    }
    
    // 献立生成サービスを呼び出し
    const patterns = await generateMealPatterns({
      targetProtein: request.targetProtein,
      mainFoodId: request.mainFoodId,
      maxItems: request.maxItems || 4,
      excludeCategories: request.excludeCategories || [],
      preferCategories: request.preferCategories || [],
      count: 3  // 3パターン生成
    });
    
    if (patterns.length === 0) {
      return c.json({ 
        error: '条件に合う献立を生成できませんでした。条件を緩めて再度お試しください。' 
      }, 404);
    }
    
    return c.json({
      patterns,
      message: `${patterns.length}個の献立パターンを生成しました`
    });
    
  } catch (error) {
    console.error('献立生成エラー:', error);
    return c.json({ error: '献立の生成に失敗しました' }, 500);
  }
});

/**
 * GET /api/meals/patterns/:id
 * 特定の献立パターンの詳細を取得
 */
mealsRouter.get('/patterns/:id', async (c) => {
  try {
    const db = getDatabase();
    const patternId = c.req.param('id');
    
    // 献立パターンの基本情報を取得
    const patternStmt = db.prepare('SELECT * FROM meal_patterns WHERE id = ?');
    const pattern = patternStmt.get(patternId) as MealPattern | undefined;
    
    if (!pattern) {
      return c.json({ error: '指定された献立パターンが見つかりません' }, 404);
    }
    
    // 含まれる食品の詳細情報を取得
    const foodsStmt = db.prepare(`
      SELECT 
        f.*,
        mpf.quantity,
        mpf.serving_size,
        mpf.notes
      FROM meal_pattern_foods mpf
      JOIN foods f ON mpf.food_id = f.id
      WHERE mpf.pattern_id = ?
    `);
    
    const foods = foodsStmt.all(patternId);
    
    // 人気度を1増やす（閲覧カウント）
    db.prepare('UPDATE meal_patterns SET popularity = popularity + 1 WHERE id = ?')
      .run(patternId);
    
    return c.json({
      ...pattern,
      foods
    });
    
  } catch (error) {
    console.error('献立詳細取得エラー:', error);
    return c.json({ error: '献立情報の取得に失敗しました' }, 500);
  }
});

/**
 * GET /api/meals/recommend
 * 選択済み食品に基づくレコメンド
 * 
 * クエリパラメータ:
 * - selectedFoodIds: 既に選択された食品のIDリスト（カンマ区切り）
 * - currentProtein: 現在の合計タンパク質量
 * - targetProtein: 目標タンパク質量（デフォルト: 20g）
 */
mealsRouter.get('/recommend', async (c) => {
  try {
    const db = getDatabase();
    
    // パラメータの取得
    const selectedFoodIds = c.req.query('selectedFoodIds')?.split(',') || [];
    const currentProtein = parseFloat(c.req.query('currentProtein') || '0');
    const targetProtein = parseFloat(c.req.query('targetProtein') || '20');
    
    // 不足分を計算
    const proteinGap = targetProtein - currentProtein;
    
    if (proteinGap <= 0) {
      return c.json({ 
        message: '目標タンパク質量を達成しています！',
        recommendations: [] 
      });
    }
    
    // レコメンド対象の食品を取得
    // 条件: 
    // 1. まだ選択されていない
    // 2. タンパク質が不足分の範囲内（±3g）
    // 3. 選択済み食品と相性が良い（同じ献立パターンに含まれる）
    
    let sql = `
      SELECT DISTINCT
        f.*,
        COUNT(DISTINCT mp.id) as compatibility_score
      FROM foods f
      LEFT JOIN meal_pattern_foods mpf ON f.id = mpf.food_id
      LEFT JOIN meal_patterns mp ON mpf.pattern_id = mp.id
      WHERE f.protein BETWEEN ? AND ?
    `;
    
    const params: any[] = [
      Math.max(0, proteinGap - 3),  // 下限
      proteinGap + 3                 // 上限
    ];
    
    // 選択済み食品を除外
    if (selectedFoodIds.length > 0) {
      sql += ` AND f.id NOT IN (${selectedFoodIds.map(() => '?').join(',')})`;
      params.push(...selectedFoodIds);
      
      // 相性スコアの計算（選択済み食品と同じ献立に含まれる回数）
      sql += `
        AND mp.id IN (
          SELECT DISTINCT pattern_id 
          FROM meal_pattern_foods 
          WHERE food_id IN (${selectedFoodIds.map(() => '?').join(',')})
        )
      `;
      params.push(...selectedFoodIds);
    }
    
    sql += `
      GROUP BY f.id
      ORDER BY 
        compatibility_score DESC,
        ABS(f.protein - ?) ASC
      LIMIT 5
    `;
    params.push(proteinGap);
    
    const stmt = db.prepare(sql);
    const recommendations = stmt.all(...params);
    
    return c.json({
      proteinGap,
      recommendations,
      message: `あと${proteinGap.toFixed(1)}gのタンパク質が必要です`
    });
    
  } catch (error) {
    console.error('レコメンド取得エラー:', error);
    return c.json({ error: 'レコメンドの取得に失敗しました' }, 500);
  }
});