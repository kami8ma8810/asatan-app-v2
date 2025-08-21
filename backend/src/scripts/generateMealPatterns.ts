/**
 * 献立パターン一括生成スクリプト
 * 
 * すべての食品に対して複数の献立パターンを自動生成します
 */

import { getDatabase, transaction } from '../db/database';
import { generateMealPatterns } from '../services/mealGenerator';
import type { Food } from '../types/food';

interface GenerateAllOptions {
  patternsPerFood: number;  // 各食品あたりの献立数
  targetProtein: number;     // 目標タンパク質
  clearExisting: boolean;    // 既存の自動生成献立をクリア
}

interface GenerateResult {
  generatedCount: number;
  processedFoods: number;
  duration: number;
}

/**
 * すべての食品に対して献立パターンを生成
 * 
 * @param options 生成オプション
 * @returns 生成結果
 */
export async function generateAllMealPatterns(
  options: GenerateAllOptions
): Promise<GenerateResult> {
  const startTime = Date.now();
  const db = getDatabase();
  
  const result: GenerateResult = {
    generatedCount: 0,
    processedFoods: 0,
    duration: 0
  };
  
  try {
    console.log('🍱 献立パターンの一括生成を開始します...');
    
    // 既存の自動生成献立をクリア（オプション）
    if (options.clearExisting) {
      console.log('🗑️ 既存の自動生成献立をクリア中...');
      const deleteResult = db.prepare(`
        DELETE FROM meal_patterns 
        WHERE is_auto_generated = 1
      `).run();
      console.log(`   ${deleteResult.changes}件の献立を削除しました`);
    }
    
    // すべての食品を取得
    console.log('📋 食品リストを取得中...');
    const foods = db.prepare(`
      SELECT * FROM foods 
      WHERE protein > 2  -- タンパク質が少なすぎる食品は除外
      ORDER BY protein DESC
    `).all() as Food[];
    
    console.log(`   ${foods.length}件の食品を処理します`);
    
    // 各食品に対して献立を生成
    for (const food of foods) {
      try {
        console.log(`🥘 ${food.name} の献立を生成中...`);
        
        // 献立パターンを生成
        const patterns = await generateMealPatterns({
          targetProtein: options.targetProtein,
          mainFoodId: food.id,
          maxItems: 4,
          excludeCategories: [],
          preferCategories: [],
          count: options.patternsPerFood
        });
        
        // データベースに保存
        for (const pattern of patterns) {
          await saveMealPattern(pattern);
          result.generatedCount++;
        }
        
        result.processedFoods++;
        
        // 進捗表示
        if (result.processedFoods % 10 === 0) {
          console.log(`   進捗: ${result.processedFoods}/${foods.length} 食品処理済み`);
        }
        
      } catch (error) {
        console.error(`   ❌ ${food.name} の献立生成に失敗:`, error.message);
      }
    }
    
    result.duration = Date.now() - startTime;
    
    console.log('✅ 献立パターンの生成が完了しました！');
    console.log(`   生成献立数: ${result.generatedCount}個`);
    console.log(`   処理食品数: ${result.processedFoods}個`);
    console.log(`   処理時間: ${result.duration}ms`);
    
    return result;
    
  } catch (error) {
    console.error('❌ 献立生成エラー:', error);
    throw error;
  }
}

/**
 * 献立パターンをデータベースに保存
 */
async function saveMealPattern(pattern: any): Promise<void> {
  const db = getDatabase();
  
  await transaction(async (db) => {
    // 献立パターンを保存
    const patternStmt = db.prepare(`
      INSERT INTO meal_patterns (
        id, name, description, total_protein, total_energy,
        category, tags, icon, is_auto_generated, main_food_id,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
    
    patternStmt.run(
      pattern.id,
      pattern.name,
      pattern.description,
      pattern.total_protein,
      pattern.total_energy || 0,
      pattern.category,
      JSON.stringify(pattern.tags || []),
      pattern.icon || '🍽️',
      1,  // is_auto_generated = true
      pattern.main_food_id
    );
    
    // 献立に含まれる食品を保存
    const foodStmt = db.prepare(`
      INSERT INTO meal_pattern_foods (
        pattern_id, food_id, quantity, serving_size
      ) VALUES (?, ?, ?, ?)
    `);
    
    for (const food of pattern.foods || []) {
      foodStmt.run(
        pattern.id,
        food.food_id,
        food.quantity || 1.0,
        food.serving_size || null
      );
    }
  });
}

/**
 * スタンドアロン実行用
 * 
 * このスクリプトを直接実行する場合の処理
 */
if (import.meta.main) {
  console.log('🚀 献立パターン生成スクリプトを実行します');
  
  // データベースを初期化
  await import('../db/database').then(m => m.initializeDatabase());
  
  // 献立を生成
  await generateAllMealPatterns({
    patternsPerFood: 3,
    targetProtein: 20,
    clearExisting: true
  });
  
  // データベースを閉じる
  await import('../db/database').then(m => m.closeDatabase());
  
  console.log('✅ スクリプトが完了しました');
}