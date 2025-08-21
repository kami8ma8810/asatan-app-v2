#!/usr/bin/env bun
/**
 * 献立パターンの自動生成スクリプト（PFCバランス考慮版）
 * 
 * このスクリプトは以下を実行します：
 * 1. 既存の食品データから献立パターンを自動生成
 * 2. PFCバランスを考慮した組み合わせを作成
 * 3. タンパク質20g前後、総カロリー400-600kcalになる組み合わせを優先
 * 4. カテゴリーバランスを考慮した組み合わせ
 */

import { Database } from 'bun:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'asatan.db');

interface Food {
  id: string;
  name: string;
  protein: number;
  energy: number;
  fat: number;
  carbs: number;
  category: string;
}

interface MealPattern {
  id: string;
  name: string;
  description: string;
  foods: Array<{
    food_id: string;
    quantity: number;
  }>;
  total_protein: number;
  total_energy: number;
  total_fat: number;
  total_carbs: number;
  pfc_score: number;
  category: string;
}

// PFCバランスの目標値
const PFC_TARGETS = {
  // 朝食の目標値
  energy: { min: 400, ideal: 500, max: 600 },      // カロリー (kcal)
  protein: { min: 17, ideal: 20, max: 25 },        // タンパク質 (g)
  fat: { min: 13, ideal: 17, max: 22 },            // 脂質 (g)
  carbs: { min: 50, ideal: 62, max: 75 },          // 炭水化物 (g)
  
  // PFCバランス比率（エネルギー比）
  // P:F:C = 3:3:4 (タンパク質30%, 脂質30%, 炭水化物40%)
  ratios: {
    protein: 0.16,  // 20g * 4kcal = 80kcal / 500kcal = 0.16
    fat: 0.31,      // 17g * 9kcal = 153kcal / 500kcal = 0.31
    carbs: 0.53     // 62g * 4kcal = 248kcal / 500kcal = 0.53
  }
};

/**
 * 食品データを取得
 */
function getFoods(db: Database): Food[] {
  return db.query(`
    SELECT id, name, protein, energy, fat, carbs, category 
    FROM foods 
    WHERE is_default = 1
    ORDER BY protein DESC
  `).all() as Food[];
}

/**
 * PFCバランススコアを計算
 * 理想的なバランスに近いほど高いスコア（0-100）
 */
function calculatePFCScore(protein: number, fat: number, carbs: number, energy: number): number {
  if (energy === 0) return 0;
  
  // 各栄養素のエネルギー換算
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  const carbsCal = carbs * 4;
  const totalCal = proteinCal + fatCal + carbsCal;
  
  // 実際の比率
  const actualRatios = {
    protein: proteinCal / totalCal,
    fat: fatCal / totalCal,
    carbs: carbsCal / totalCal
  };
  
  // 理想比率との差を計算
  const proteinDiff = Math.abs(actualRatios.protein - PFC_TARGETS.ratios.protein);
  const fatDiff = Math.abs(actualRatios.fat - PFC_TARGETS.ratios.fat);
  const carbsDiff = Math.abs(actualRatios.carbs - PFC_TARGETS.ratios.carbs);
  
  // 差の合計（0に近いほど良い）
  const totalDiff = proteinDiff + fatDiff + carbsDiff;
  
  // スコア化（100点満点）
  const score = Math.max(0, 100 - (totalDiff * 100));
  
  // カロリーが目標範囲内かチェック
  const calorieBonus = 
    energy >= PFC_TARGETS.energy.min && energy <= PFC_TARGETS.energy.max ? 10 : 0;
  
  return Math.min(100, score + calorieBonus);
}

/**
 * 献立パターンを生成
 */
function generateMealPatterns(foods: Food[]): MealPattern[] {
  const patterns: MealPattern[] = [];
  let patternId = 1;
  
  // 1. 単品で高タンパクな食品のパターン
  console.log('📝 高タンパク単品パターンを生成中...');
  foods.filter(f => f.protein >= 15).forEach(mainFood => {
    const pfcScore = calculatePFCScore(mainFood.protein, mainFood.fat, mainFood.carbs, mainFood.energy);
    patterns.push({
      id: `pattern_${patternId++}`,
      name: `${mainFood.name}中心の朝食`,
      description: `${mainFood.name}をメインにしたシンプルな朝食（${mainFood.energy}kcal）`,
      foods: [{
        food_id: mainFood.id,
        quantity: 1
      }],
      total_protein: mainFood.protein,
      total_energy: mainFood.energy,
      total_fat: mainFood.fat,
      total_carbs: mainFood.carbs,
      pfc_score: pfcScore,
      category: 'single'
    });
  });
  
  // 2. 定番の組み合わせパターン（栄養データ付き）
  console.log('📝 定番パターンを生成中...');
  const classicPatterns = [
    // 和食パターン
    {
      name: '和朝食セット（ご飯・納豆・卵）',
      description: '定番の和食スタイル',
      foods: ['rice_1', 'natto_1', 'egg_1'],
      category: 'japanese'
    },
    {
      name: '和朝食セット（ご飯・鮭・味噌汁）',
      description: '焼き魚メインの和食',
      foods: ['rice_1', 'salmon_1', 'miso_soup_tofu_1'],
      category: 'japanese'
    },
    {
      name: '納豆定食',
      description: '納豆と豆腐でタンパク質豊富',
      foods: ['rice_1', 'natto_1', 'tofu_1'],
      category: 'japanese'
    },
    
    // 洋食パターン
    {
      name: '洋朝食セット（パン・卵・ハム）',
      description: '定番の洋食スタイル',
      foods: ['bread_1', 'egg_1', 'ham_1', 'milk_1'],
      category: 'western'
    },
    {
      name: 'チーズトーストセット',
      description: 'チーズトーストとヨーグルト',
      foods: ['cheese_toast_1', 'yogurt_1', 'milk_1'],
      category: 'western'
    },
    {
      name: 'シリアルボウル',
      description: 'グラノーラと乳製品の組み合わせ',
      foods: ['granola_1', 'yogurt_1', 'milk_1', 'banana_1'],
      category: 'western'
    },
    
    // バランス重視パターン
    {
      name: 'PFCバランス朝食',
      description: 'タンパク質・脂質・炭水化物のバランス重視',
      foods: ['rice_1', 'egg_1', 'natto_1', 'avocado_1'],
      category: 'balanced'
    },
    {
      name: 'タンパク質強化セット',
      description: 'サラダチキンでタンパク質20g超え',
      foods: ['chicken_salad_1', 'bread_1', 'tomato_1'],
      category: 'high_protein'
    },
    {
      name: 'ヘルシー朝食',
      description: '豆腐と野菜中心の低カロリー',
      foods: ['tofu_1', 'edamame_1', 'tomato_1', 'miso_soup_tofu_1'],
      category: 'healthy'
    }
  ];
  
  // パターンをデータベース形式に変換
  classicPatterns.forEach(pattern => {
    const patternFoods = pattern.foods.map(foodId => {
      const food = foods.find(f => f.id === foodId);
      if (!food) return null;
      return { food, quantity: 1 };
    }).filter(f => f !== null) as Array<{ food: Food; quantity: number }>;
    
    const totalProtein = patternFoods.reduce((sum, f) => sum + f.food.protein, 0);
    const totalEnergy = patternFoods.reduce((sum, f) => sum + f.food.energy, 0);
    const totalFat = patternFoods.reduce((sum, f) => sum + f.food.fat, 0);
    const totalCarbs = patternFoods.reduce((sum, f) => sum + f.food.carbs, 0);
    const pfcScore = calculatePFCScore(totalProtein, totalFat, totalCarbs, totalEnergy);
    
    patterns.push({
      id: `pattern_${patternId++}`,
      name: pattern.name,
      description: `${pattern.description}（${totalEnergy}kcal, P:${totalProtein.toFixed(1)}g, F:${totalFat.toFixed(1)}g, C:${totalCarbs.toFixed(1)}g）`,
      foods: patternFoods.map(f => ({
        food_id: f.food.id,
        quantity: f.quantity
      })),
      total_protein: totalProtein,
      total_energy: totalEnergy,
      total_fat: totalFat,
      total_carbs: totalCarbs,
      pfc_score: pfcScore,
      category: pattern.category
    });
  });
  
  // 3. PFCバランス最適化パターン（自動生成）
  console.log('📝 PFCバランス最適化パターンを生成中...');
  
  // カテゴリー別に食品を分類
  const foodsByCategory = new Map<string, Food[]>();
  foods.forEach(food => {
    if (!foodsByCategory.has(food.category)) {
      foodsByCategory.set(food.category, []);
    }
    foodsByCategory.get(food.category)!.push(food);
  });
  
  // 主食カテゴリーの食品を基準にパターンを生成
  const mainDishes = foodsByCategory.get('主食') || [];
  const proteinSources = [...(foodsByCategory.get('卵・乳製品') || []), 
                          ...(foodsByCategory.get('大豆製品') || []),
                          ...(foodsByCategory.get('肉類') || []),
                          ...(foodsByCategory.get('魚介類') || [])];
  
  // 各主食に対して最適な組み合わせを探索
  mainDishes.forEach(mainDish => {
    let bestCombination: Food[] = [mainDish];
    let bestScore = 0;
    
    // タンパク源を1-2つ追加
    for (const protein1 of proteinSources) {
      const combo1 = [mainDish, protein1];
      const totalProtein1 = combo1.reduce((sum, f) => sum + f.protein, 0);
      const totalEnergy1 = combo1.reduce((sum, f) => sum + f.energy, 0);
      const totalFat1 = combo1.reduce((sum, f) => sum + f.fat, 0);
      const totalCarbs1 = combo1.reduce((sum, f) => sum + f.carbs, 0);
      
      // カロリーとタンパク質が目標範囲内かチェック
      if (totalEnergy1 <= PFC_TARGETS.energy.max && 
          totalProtein1 >= PFC_TARGETS.protein.min) {
        
        const score1 = calculatePFCScore(totalProtein1, totalFat1, totalCarbs1, totalEnergy1);
        if (score1 > bestScore) {
          bestScore = score1;
          bestCombination = combo1;
        }
        
        // さらに1品追加してみる
        for (const protein2 of proteinSources) {
          if (protein2.id === protein1.id) continue;
          
          const combo2 = [...combo1, protein2];
          const totalProtein2 = combo2.reduce((sum, f) => sum + f.protein, 0);
          const totalEnergy2 = combo2.reduce((sum, f) => sum + f.energy, 0);
          const totalFat2 = combo2.reduce((sum, f) => sum + f.fat, 0);
          const totalCarbs2 = combo2.reduce((sum, f) => sum + f.carbs, 0);
          
          if (totalEnergy2 <= PFC_TARGETS.energy.max && 
              totalProtein2 <= PFC_TARGETS.protein.max) {
            
            const score2 = calculatePFCScore(totalProtein2, totalFat2, totalCarbs2, totalEnergy2);
            if (score2 > bestScore) {
              bestScore = score2;
              bestCombination = combo2;
            }
          }
        }
      }
    }
    
    // 最適な組み合わせをパターンとして保存
    if (bestCombination.length >= 2 && bestScore >= 60) {
      const totalProtein = bestCombination.reduce((sum, f) => sum + f.protein, 0);
      const totalEnergy = bestCombination.reduce((sum, f) => sum + f.energy, 0);
      const totalFat = bestCombination.reduce((sum, f) => sum + f.fat, 0);
      const totalCarbs = bestCombination.reduce((sum, f) => sum + f.carbs, 0);
      
      const foodNames = bestCombination.map(f => f.name.replace(/（.*?）/g, '')).join('・');
      patterns.push({
        id: `pattern_${patternId++}`,
        name: `PFCバランス献立（${foodNames}）`,
        description: `バランススコア${bestScore.toFixed(0)}点（${totalEnergy}kcal, P:${totalProtein.toFixed(1)}g, F:${totalFat.toFixed(1)}g, C:${totalCarbs.toFixed(1)}g）`,
        foods: bestCombination.map(f => ({
          food_id: f.id,
          quantity: 1
        })),
        total_protein: totalProtein,
        total_energy: totalEnergy,
        total_fat: totalFat,
        total_carbs: totalCarbs,
        pfc_score: bestScore,
        category: 'pfc_optimized'
      });
    }
  });
  
  return patterns;
}

/**
 * データベースに献立パターンを保存
 */
function saveMealPatterns(db: Database, patterns: MealPattern[]): number {
  console.log('💾 献立パターンをデータベースに保存中...');
  
  // 既存のパターンを削除
  db.run('DELETE FROM meal_pattern_foods');
  db.run('DELETE FROM meal_patterns');
  
  // パターンの挿入
  const insertPattern = db.prepare(`
    INSERT INTO meal_patterns (
      id, name, description, 
      total_protein, total_energy, total_fat, total_carbs, pfc_score,
      category, is_auto_generated
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertFood = db.prepare(`
    INSERT INTO meal_pattern_foods (pattern_id, food_id, quantity, serving_size, notes)
    VALUES (?, ?, ?, NULL, NULL)
  `);
  
  // トランザクション内で一括挿入
  const saveAll = db.transaction((patterns: MealPattern[]) => {
    for (const pattern of patterns) {
      const isAutoGenerated = pattern.category === 'pfc_optimized' ? 1 : 0;
      insertPattern.run(
        pattern.id,
        pattern.name,
        pattern.description,
        pattern.total_protein,
        pattern.total_energy,
        pattern.total_fat,
        pattern.total_carbs,
        pattern.pfc_score,
        pattern.category,
        isAutoGenerated
      );
      
      for (const food of pattern.foods) {
        insertFood.run(
          pattern.id,
          food.food_id,
          food.quantity
        );
      }
    }
  });
  
  saveAll(patterns);
  
  return patterns.length;
}

/**
 * メイン処理
 */
function main() {
  console.log('🚀 PFCバランス考慮の献立パターン生成を開始します');
  console.log('━'.repeat(50));
  
  const db = new Database(DB_PATH);
  
  try {
    // 1. 食品データの取得
    const foods = getFoods(db);
    console.log(`📊 ${foods.length}件の食品データを取得しました`);
    
    // 2. 献立パターンの生成
    const patterns = generateMealPatterns(foods);
    console.log(`🍱 ${patterns.length}件の献立パターンを生成しました`);
    
    // 3. データベースへの保存
    const savedCount = saveMealPatterns(db, patterns);
    
    // 4. 統計情報の表示
    const stats = db.query(`
      SELECT 
        COUNT(DISTINCT mp.id) as pattern_count,
        COUNT(DISTINCT mp.category) as category_count,
        AVG(mp.total_protein) as avg_protein,
        AVG(mp.total_energy) as avg_energy,
        AVG(mp.total_fat) as avg_fat,
        AVG(mp.total_carbs) as avg_carbs,
        AVG(mp.pfc_score) as avg_score,
        MIN(mp.pfc_score) as min_score,
        MAX(mp.pfc_score) as max_score
      FROM meal_patterns mp
    `).get() as {
      pattern_count: number;
      category_count: number;
      avg_protein: number;
      avg_energy: number;
      avg_fat: number;
      avg_carbs: number;
      avg_score: number;
      min_score: number;
      max_score: number;
    };
    
    const categoryStats = db.query(`
      SELECT category, COUNT(*) as count, AVG(pfc_score) as avg_score
      FROM meal_patterns
      GROUP BY category
      ORDER BY avg_score DESC
    `).all() as Array<{ category: string; count: number; avg_score: number }>;
    
    console.log('━'.repeat(50));
    console.log(`✅ 完了: ${savedCount}件の献立パターンを保存しました`);
    console.log('\n📊 献立パターン統計:');
    console.log(`  総パターン数: ${stats.pattern_count}件`);
    console.log(`  カテゴリー数: ${stats.category_count}種類`);
    console.log(`  平均栄養素:`);
    console.log(`    タンパク質: ${stats.avg_protein.toFixed(1)}g`);
    console.log(`    エネルギー: ${stats.avg_energy.toFixed(0)}kcal`);
    console.log(`    脂質: ${stats.avg_fat.toFixed(1)}g`);
    console.log(`    炭水化物: ${stats.avg_carbs.toFixed(1)}g`);
    console.log(`  PFCバランススコア:`);
    console.log(`    平均: ${stats.avg_score.toFixed(1)}点`);
    console.log(`    最小: ${stats.min_score.toFixed(1)}点`);
    console.log(`    最大: ${stats.max_score.toFixed(1)}点`);
    console.log('\n📂 カテゴリー別:');
    categoryStats.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count}件 (平均スコア: ${cat.avg_score.toFixed(1)}点)`);
    });
    
    // 更新履歴の記録
    db.run(`
      INSERT INTO update_history (update_type, target_table, record_count, status, created_by)
      VALUES ('meal_patterns_seed', 'meal_patterns', ?, 'success', 'seed_script_pfc')
    `, savedCount);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    
    // エラー履歴の記録
    db.run(`
      INSERT INTO update_history (update_type, target_table, record_count, status, error_message, created_by)
      VALUES ('meal_patterns_seed', 'meal_patterns', 0, 'error', ?, 'seed_script_pfc')
    `, String(error));
    
    process.exit(1);
  } finally {
    db.close();
  }
}

// スクリプトの実行
if (import.meta.main) {
  main();
}