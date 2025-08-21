/**
 * 食品データインポートスクリプト
 * 
 * 文部科学省の食品成分データベースからデータをダウンロードして
 * SQLiteデータベースにインポートします
 */

import { getDatabase, transaction } from '../db/database';
import { parse } from 'csv-parse/sync';

interface ImportOptions {
  source: 'mext' | 'local';
  forceUpdate?: boolean;
  filePath?: string;
}

interface ImportResult {
  importedCount: number;
  updatedCount: number;
  failedCount: number;
  duration: number;
}

/**
 * 食品データをインポート
 * 
 * @param options インポートオプション
 * @returns インポート結果
 */
export async function importFoodData(
  options: ImportOptions
): Promise<ImportResult> {
  const startTime = Date.now();
  const result: ImportResult = {
    importedCount: 0,
    updatedCount: 0,
    failedCount: 0,
    duration: 0
  };
  
  try {
    console.log('📥 食品データのインポートを開始します...');
    
    // データの取得
    let csvData: Buffer;
    
    if (options.source === 'mext') {
      // 文科省からダウンロード（実際のURLは要確認）
      console.log('🌐 文科省データをダウンロード中...');
      
      // TODO: 実際の文科省データベースのURLに置き換える
      // 現在はサンプルデータを使用
      csvData = await downloadMextData();
      
    } else if (options.source === 'local' && options.filePath) {
      // ローカルファイルから読み込み
      console.log(`📁 ローカルファイル ${options.filePath} を読み込み中...`);
      const file = Bun.file(options.filePath);
      csvData = Buffer.from(await file.arrayBuffer());
      
    } else {
      throw new Error('無効なインポートオプション');
    }
    
    // CSVのパース
    console.log('📊 CSVデータをパース中...');
    const records = parseCsvData(csvData);
    console.log(`✅ ${records.length}件のレコードを読み込みました`);
    
    // データベースへのインポート
    console.log('💾 データベースにインポート中...');
    const importResult = await importToDatabase(records, options.forceUpdate);
    
    result.importedCount = importResult.imported;
    result.updatedCount = importResult.updated;
    result.failedCount = importResult.failed;
    
    // 更新履歴を記録
    await recordUpdateHistory({
      updateType: 'import',
      targetTable: 'foods',
      recordCount: result.importedCount + result.updatedCount,
      status: 'success'
    });
    
    result.duration = Date.now() - startTime;
    
    console.log(`✅ インポート完了！`);
    console.log(`   新規: ${result.importedCount}件`);
    console.log(`   更新: ${result.updatedCount}件`);
    console.log(`   失敗: ${result.failedCount}件`);
    console.log(`   処理時間: ${result.duration}ms`);
    
    return result;
    
  } catch (error) {
    console.error('❌ インポートエラー:', error);
    
    // エラー履歴を記録
    await recordUpdateHistory({
      updateType: 'import',
      targetTable: 'foods',
      recordCount: 0,
      status: 'failed',
      errorMessage: error.message
    });
    
    throw error;
  }
}

/**
 * 文科省データをダウンロード
 * 
 * TODO: 実際のダウンロード処理を実装
 */
async function downloadMextData(): Promise<Buffer> {
  // 仮のサンプルデータ
  const sampleCsv = `食品番号,食品名,よみがな,たんぱく質,エネルギー,脂質,炭水化物,カテゴリー
01001,米・精白米,こめせいはくまい,2.5,168,0.3,37.1,穀類
04001,納豆,なっとう,16.5,200,10.0,12.1,豆類
11001,鶏卵・全卵,けいらんぜんらん,12.3,151,10.3,0.3,卵類
13001,牛乳,ぎゅうにゅう,3.3,67,3.8,4.8,乳類
10001,鮭,さけ,22.3,133,4.1,0.1,魚介類`;
  
  return Buffer.from(sampleCsv);
}

/**
 * CSVデータをパース
 */
function parseCsvData(csvData: Buffer): any[] {
  try {
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      encoding: 'utf-8',
      trim: true
    });
    
    return records;
  } catch (error) {
    console.error('CSVパースエラー:', error);
    throw new Error('CSVデータのパースに失敗しました');
  }
}

/**
 * データベースにインポート
 */
async function importToDatabase(
  records: any[],
  forceUpdate: boolean = false
): Promise<{ imported: number; updated: number; failed: number }> {
  const db = getDatabase();
  let imported = 0;
  let updated = 0;
  let failed = 0;
  
  return await transaction(async (db) => {
    // Upsert用のステートメントを準備
    const stmt = db.prepare(`
      INSERT INTO foods (
        id, name, name_kana, protein, energy, fat, carbs, category,
        typical_amount, unit, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        name_kana = excluded.name_kana,
        protein = excluded.protein,
        energy = excluded.energy,
        fat = excluded.fat,
        carbs = excluded.carbs,
        category = excluded.category,
        typical_amount = excluded.typical_amount,
        unit = excluded.unit,
        updated_at = CURRENT_TIMESTAMP
      WHERE ? = 1
    `);
    
    for (const record of records) {
      try {
        // データの正規化
        const foodData = normalizeFoodData(record);
        
        // 既存レコードの確認
        const existing = db.prepare('SELECT id FROM foods WHERE id = ?')
          .get(foodData.id);
        
        // インポート実行
        stmt.run(
          foodData.id,
          foodData.name,
          foodData.name_kana,
          foodData.protein,
          foodData.energy,
          foodData.fat,
          foodData.carbs,
          foodData.category,
          foodData.typical_amount,
          foodData.unit,
          forceUpdate ? 1 : 0
        );
        
        if (existing) {
          updated++;
        } else {
          imported++;
        }
        
      } catch (error) {
        console.error(`レコードインポートエラー: ${record['食品名']}`, error);
        failed++;
      }
    }
    
    return { imported, updated, failed };
  });
}

/**
 * 食品データを正規化
 */
function normalizeFoodData(record: any): any {
  return {
    id: record['食品番号'] || generateFoodId(record['食品名']),
    name: record['食品名'] || '',
    name_kana: record['よみがな'] || '',
    protein: parseFloat(record['たんぱく質']) || 0,
    energy: parseFloat(record['エネルギー']) || 0,
    fat: parseFloat(record['脂質']) || 0,
    carbs: parseFloat(record['炭水化物']) || 0,
    category: record['カテゴリー'] || record['食品群'] || 'その他',
    typical_amount: 100,  // デフォルト100g
    unit: '100g'
  };
}

/**
 * 食品IDを生成（食品番号がない場合）
 */
function generateFoodId(name: string): string {
  const timestamp = Date.now();
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `auto-${timestamp}-${hash}`;
}

/**
 * 更新履歴を記録
 */
async function recordUpdateHistory(data: {
  updateType: string;
  targetTable: string;
  recordCount: number;
  status: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    const db = getDatabase();
    
    db.prepare(`
      INSERT INTO update_history (
        update_type, target_table, record_count, status, 
        error_message, started_at, completed_at, created_by
      ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), 'system')
    `).run(
      data.updateType,
      data.targetTable,
      data.recordCount,
      data.status,
      data.errorMessage || null
    );
    
  } catch (error) {
    console.error('更新履歴の記録に失敗:', error);
  }
}