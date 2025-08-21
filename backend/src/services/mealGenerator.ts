/**
 * 献立自動生成サービス
 * 
 * このモジュールは、指定された条件に基づいて献立パターンを自動生成します。
 * アルゴリズムは栄養バランス、カテゴリーの多様性、タンパク質目標を考慮します。
 */

import { getDatabase } from '../db/database';
import type { Food, MealPattern } from '../types/food';

/**
 * 献立生成のオプション
 */
interface GenerateOptions {
  targetProtein: number;      // 目標タンパク質(g)
  mainFoodId?: string;        // メイン食品ID
  maxItems: number;           // 最大品目数
  excludeCategories: string[]; // 除外カテゴリー
  preferCategories: string[];  // 優先カテゴリー
  count: number;              // 生成する献立数
}

/**
 * 献立パターンを自動生成
 * 
 * アルゴリズム:
 * 1. メイン食品を選択（指定されている場合はそれを使用）
 * 2. 残りの必要タンパク質を計算
 * 3. カテゴリーバランスを考慮して追加食品を選択
 * 4. 目標タンパク質に近づくように調整
 * 
 * @param options 生成オプション
 * @returns 生成された献立パターンの配列
 */
export async function generateMealPatterns(
  options: GenerateOptions
): Promise<MealPattern[]> {
  const db = getDatabase();
  const patterns: MealPattern[] = [];
  
  try {
    // メイン食品の取得
    let mainFood: Food | undefined;
    if (options.mainFoodId) {
      const stmt = db.prepare('SELECT * FROM foods WHERE id = ?');
      mainFood = stmt.get(options.mainFoodId) as Food | undefined;
      
      if (!mainFood) {
        console.warn(`メイン食品 ${options.mainFoodId} が見つかりません`);
      }
    }
    
    // 生成ループ
    for (let i = 0; i < options.count; i++) {
      const pattern = await generateSinglePattern({
        ...options,
        mainFood,
        patternIndex: i,  // パターンごとに異なる組み合わせを生成するため
      });
      
      if (pattern) {
        patterns.push(pattern);
      }
    }
    
    return patterns;
    
  } catch (error) {
    console.error('献立生成エラー:', error);
    throw error;
  }
}

/**
 * 単一の献立パターンを生成
 */
async function generateSinglePattern(
  options: GenerateOptions & { 
    mainFood?: Food; 
    patternIndex: number;
  }
): Promise<MealPattern | null> {
  const db = getDatabase();
  
  // 選択された食品リスト
  const selectedFoods: Food[] = [];
  let currentProtein = 0;
  
  // メイン食品を追加
  if (options.mainFood) {
    selectedFoods.push(options.mainFood);
    currentProtein += options.mainFood.protein;
  }
  
  // 残りの必要タンパク質
  let remainingProtein = options.targetProtein - currentProtein;
  
  // 候補食品の取得
  let candidatesSql = `
    SELECT * FROM foods
    WHERE 1=1
  `;
  const params: any[] = [];
  
  // 除外条件
  if (options.excludeCategories.length > 0) {
    candidatesSql += ` AND category NOT IN (${options.excludeCategories.map(() => '?').join(',')})`;
    params.push(...options.excludeCategories);
  }
  
  // 既に選択された食品を除外
  if (selectedFoods.length > 0) {
    candidatesSql += ` AND id NOT IN (${selectedFoods.map(() => '?').join(',')})`;
    params.push(...selectedFoods.map(f => f.id));
  }
  
  // タンパク質の範囲で絞り込み（効率化のため）
  candidatesSql += ' AND protein > 0 AND protein <= ?';
  params.push(remainingProtein + 5);  // 少し余裕を持たせる
  
  // 優先カテゴリーがある場合はソート順を調整
  if (options.preferCategories.length > 0) {
    candidatesSql += `
      ORDER BY 
        CASE 
          ${options.preferCategories.map((cat, idx) => 
            `WHEN category = ? THEN ${idx}`
          ).join(' ')}
          ELSE 999
        END,
        ABS(protein - ?) ASC,
        RANDOM()
    `;
    params.push(...options.preferCategories);
    params.push(remainingProtein / (options.maxItems - selectedFoods.length));
  } else {
    // ランダム性を加えて多様な献立を生成
    candidatesSql += `
      ORDER BY 
        ABS(protein - ?) ASC,
        RANDOM()
    `;
    params.push(remainingProtein / (options.maxItems - selectedFoods.length));
  }
  
  candidatesSql += ' LIMIT 50';  // 候補を絞る
  
  const stmt = db.prepare(candidatesSql);
  const candidates = stmt.all(...params) as Food[];
  
  // 貪欲法で食品を選択
  while (
    selectedFoods.length < options.maxItems && 
    remainingProtein > 0 && 
    candidates.length > 0
  ) {
    // 最適な食品を選択
    const bestFood = selectBestFood(
      candidates,
      remainingProtein,
      selectedFoods,
      options.patternIndex
    );
    
    if (!bestFood) break;
    
    // 選択した食品を追加
    selectedFoods.push(bestFood);
    currentProtein += bestFood.protein;
    remainingProtein = options.targetProtein - currentProtein;
    
    // 候補から削除
    const index = candidates.findIndex(f => f.id === bestFood.id);
    if (index !== -1) {
      candidates.splice(index, 1);
    }
  }
  
  // 最低2品目以上で献立を構成
  if (selectedFoods.length < 2) {
    return null;
  }
  
  // 献立パターンオブジェクトを作成
  const pattern: MealPattern = {
    id: `generated-${Date.now()}-${options.patternIndex}`,
    name: generatePatternName(selectedFoods),
    description: generatePatternDescription(selectedFoods),
    total_protein: currentProtein,
    total_energy: selectedFoods.reduce((sum, f) => sum + (f.energy || 0), 0),
    category: determinePatternCategory(selectedFoods),
    tags: generateTags(selectedFoods),
    icon: selectIcon(selectedFoods),
    is_auto_generated: true,
    main_food_id: options.mainFood?.id,
    foods: selectedFoods.map(f => ({
      food_id: f.id,
      food: f,
      quantity: 1.0,
      serving_size: f.typical_amount
    }))
  };
  
  return pattern;
}

/**
 * 最適な食品を選択
 * 
 * スコアリング基準:
 * 1. タンパク質の適合度（目標に近いほど高スコア）
 * 2. カテゴリーの多様性（既存と異なるカテゴリーほど高スコア）
 * 3. ランダム性（パターンごとに異なる結果を生成）
 */
function selectBestFood(
  candidates: Food[],
  remainingProtein: number,
  selectedFoods: Food[],
  patternIndex: number
): Food | null {
  if (candidates.length === 0) return null;
  
  // 各候補のスコアを計算
  const scoredCandidates = candidates.map(food => {
    let score = 0;
    
    // タンパク質適合度スコア（0-100点）
    const proteinDiff = Math.abs(food.protein - remainingProtein);
    const proteinScore = Math.max(0, 100 - proteinDiff * 10);
    score += proteinScore;
    
    // カテゴリー多様性スコア（0-50点）
    const selectedCategories = selectedFoods.map(f => f.category);
    if (food.category && !selectedCategories.includes(food.category)) {
      score += 50;
    }
    
    // ランダム性を加える（0-30点）
    // パターンインデックスをシードとして使用
    const randomScore = (patternIndex * 7 + food.id.charCodeAt(0)) % 30;
    score += randomScore;
    
    return { food, score };
  });
  
  // スコアでソート
  scoredCandidates.sort((a, b) => b.score - a.score);
  
  // 上位からランダムに選択（完全に決定的にならないように）
  const topCandidates = scoredCandidates.slice(0, 3);
  const selected = topCandidates[patternIndex % topCandidates.length];
  
  return selected?.food || null;
}

/**
 * 献立パターンの名前を生成
 */
function generatePatternName(foods: Food[]): string {
  // メインとなる食品（タンパク質が最も多い）を特定
  const mainFood = foods.reduce((max, f) => 
    f.protein > max.protein ? f : max
  );
  
  // カテゴリーの特徴を判定
  const categories = foods.map(f => f.category).filter(Boolean);
  const uniqueCategories = [...new Set(categories)];
  
  if (uniqueCategories.includes('穀類') && uniqueCategories.includes('魚介類')) {
    return `${mainFood.name}定食`;
  } else if (uniqueCategories.includes('乳製品') && uniqueCategories.includes('穀類')) {
    return `${mainFood.name}モーニング`;
  } else if (uniqueCategories.length >= 3) {
    return `バランス${mainFood.name}セット`;
  } else {
    return `${mainFood.name}セット`;
  }
}

/**
 * 献立パターンの説明を生成
 */
function generatePatternDescription(foods: Food[]): string {
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  const foodNames = foods.slice(0, 3).map(f => f.name).join('・');
  
  return `${foodNames}の組み合わせ（タンパク質${totalProtein.toFixed(1)}g）`;
}

/**
 * 献立のカテゴリーを判定
 */
function determinePatternCategory(foods: Food[]): string {
  const categories = foods.map(f => f.category).filter(Boolean);
  
  // 和食判定
  if (categories.includes('穀類') && 
      (categories.includes('魚介類') || categories.includes('豆類'))) {
    return 'japanese';
  }
  
  // 洋食判定
  if (categories.includes('乳製品') || 
      categories.includes('肉類')) {
    return 'western';
  }
  
  // ヨーグルト系
  if (categories.filter(c => c === '乳製品').length >= 2) {
    return 'yogurt';
  }
  
  // 軽食
  if (foods.length <= 2) {
    return 'light';
  }
  
  return 'balanced';
}

/**
 * タグを生成
 */
function generateTags(foods: Food[]): string[] {
  const tags: string[] = [];
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  
  // タンパク質量でタグ付け
  if (totalProtein >= 25) {
    tags.push('高タンパク');
  } else if (totalProtein >= 20) {
    tags.push('タンパク質20g以上');
  }
  
  // カテゴリーベースのタグ
  const categories = foods.map(f => f.category).filter(Boolean);
  if (categories.includes('魚介類')) {
    tags.push('魚料理');
  }
  if (categories.includes('豆類')) {
    tags.push('大豆製品');
  }
  if (categories.includes('乳製品')) {
    tags.push('乳製品');
  }
  
  // 品目数
  if (foods.length >= 4) {
    tags.push('品数豊富');
  }
  
  return tags;
}

/**
 * アイコンを選択
 */
function selectIcon(foods: Food[]): string {
  const category = determinePatternCategory(foods);
  
  const iconMap: Record<string, string> = {
    japanese: '🍚',
    western: '🥖',
    yogurt: '🥛',
    light: '☕',
    balanced: '🍱'
  };
  
  return iconMap[category] || '🍽️';
}