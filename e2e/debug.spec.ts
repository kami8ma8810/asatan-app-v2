import { test, expect } from '@playwright/test';

test('デバッグ: 食品カードの表示を確認', async ({ page }) => {
  // ページを開く
  await page.goto('/');
  
  // コンソールログを収集
  page.on('console', msg => {
    console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
  });
  
  // エラーを収集
  page.on('pageerror', error => {
    console.log(`Browser error: ${error.message}`);
  });
  
  // ページが読み込まれるのを待つ
  await page.waitForLoadState('networkidle');
  
  // アプリヘッダーが表示されることを確認
  const header = page.locator('.app-header');
  await expect(header).toBeVisible();
  
  // 食品カードの数を確認
  const foodCards = page.locator('.food-card');
  const count = await foodCards.count();
  console.log(`Found ${count} food cards`);
  
  // カテゴリーの数を確認
  const categories = page.locator('.food-category');
  const catCount = await categories.count();
  console.log(`Found ${catCount} categories`);
  
  // 最初のカテゴリーの内容を確認
  if (catCount > 0) {
    const firstCategory = categories.first();
    const title = await firstCategory.locator('.category-title').textContent();
    console.log(`First category: ${title}`);
    
    const cardsInCategory = await firstCategory.locator('.food-card').count();
    console.log(`Cards in first category: ${cardsInCategory}`);
  }
  
  // スクリーンショットを撮る
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  
  expect(count).toBeGreaterThan(0);
});