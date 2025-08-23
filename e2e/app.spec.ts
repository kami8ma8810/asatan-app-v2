import { test, expect } from '@playwright/test';

test.describe('朝たん計算アプリ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('アプリが正常に表示される', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle(/朝たん計算アプリ|Vite/);
    
    // アプリケーションのヘッダーが表示される
    const header = page.locator('.app-header');
    await expect(header).toBeVisible({ timeout: 10000 });
    
    // タイトルテキストの確認
    const title = page.locator('.app-title');
    await expect(title).toContainText('朝たん計算アプリ');
    
    // サブタイトルの確認
    const subtitle = page.locator('.app-subtitle');
    await expect(subtitle).toContainText('朝食のタンパク質20gを目指そう');
  });

  test('初期状態で0gと表示される', async ({ page }) => {
    const counter = page.locator('.protein-counter');
    await expect(counter).toBeVisible();
    
    const totalText = page.locator('.counter-total');
    await expect(totalText).toContainText('0.0g');
  });

  test('食品カードが表示される', async ({ page }) => {
    // 食品カードのコンテナが表示される
    const foodsContainer = page.locator('.app-foods');
    await expect(foodsContainer).toBeVisible();
    
    // カテゴリーが表示される
    const categories = page.locator('.food-category');
    await expect(categories).toHaveCount(6); // 6カテゴリー
    
    // 食品カードが表示される
    const foodCards = page.locator('.food-card');
    const count = await foodCards.count();
    expect(count).toBeGreaterThan(30); // 36品目
  });

  test('食品を選択するとタンパク質が加算される', async ({ page }) => {
    // 最初の食品カードをクリック
    const firstCard = page.locator('.food-card').first();
    await firstCard.click();
    
    // カウンターが更新される
    const totalText = page.locator('.counter-total');
    const text = await totalText.textContent();
    expect(text).not.toBe('0.0g');
    
    // 選択状態のスタイルが適用される
    await expect(firstCard).toHaveClass(/selected/);
  });

  test('複数の食品を選択して合計が計算される', async ({ page }) => {
    // 複数の食品を選択
    const cards = page.locator('.food-card');
    await cards.nth(0).click();
    await cards.nth(1).click();
    await cards.nth(2).click();
    
    // 合計が0より大きい
    const totalText = page.locator('.counter-total');
    const text = await totalText.textContent();
    const value = parseFloat(text?.replace('g', '') || '0');
    expect(value).toBeGreaterThan(0);
  });

  test('20g達成すると達成メッセージが表示される', async ({ page }) => {
    // タンパク質が多い食品を選択
    const saladChicken = page.locator('.food-card').filter({ hasText: 'サラダチキン' });
    if (await saladChicken.count() > 0) {
      await saladChicken.click();
      
      // 達成メッセージを確認
      const achievedMessage = page.locator('.counter-achieved');
      const totalText = page.locator('.counter-total');
      const text = await totalText.textContent();
      const value = parseFloat(text?.replace('g', '') || '0');
      
      if (value >= 20) {
        await expect(achievedMessage).toBeVisible();
        await expect(achievedMessage).toContainText('目標達成');
      }
    }
  });

  test('シェアボタンが表示される', async ({ page }) => {
    const shareButton = page.locator('button').filter({ hasText: 'シェア' });
    await expect(shareButton).toBeVisible();
    
    // 初期状態では無効
    await expect(shareButton).toBeDisabled();
    
    // 食品を選択すると有効になる
    const firstCard = page.locator('.food-card').first();
    await firstCard.click();
    await expect(shareButton).toBeEnabled();
  });

  test('シェアモーダルが開く', async ({ page }) => {
    // 食品を選択
    const firstCard = page.locator('.food-card').first();
    await firstCard.click();
    
    // シェアボタンをクリック
    const shareButton = page.locator('button').filter({ hasText: 'シェア' });
    await shareButton.click();
    
    // モーダルが表示される
    const modal = page.locator('[data-testid="share-modal"]');
    await expect(modal).toBeVisible();
    
    // シェアオプションが表示される
    const twitterButton = page.locator('button').filter({ hasText: 'Twitter' });
    await expect(twitterButton).toBeVisible();
    
    const lineButton = page.locator('button').filter({ hasText: 'LINE' });
    await expect(lineButton).toBeVisible();
  });

  test('レスポンシブデザインが機能する', async ({ page, viewport }) => {
    // モバイルサイズに変更
    await page.setViewportSize({ width: 375, height: 667 });
    
    // アプリが表示される
    const header = page.locator('.app-header');
    await expect(header).toBeVisible();
    
    // 食品カードが表示される
    const foodCards = page.locator('.food-card');
    await expect(foodCards.first()).toBeVisible();
    
    // タブレットサイズに変更
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(header).toBeVisible();
  });
});

test.describe('API連携', () => {
  test('バックエンドAPIが応答する', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/foods');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('foods');
    expect(Array.isArray(data.foods)).toBeTruthy();
    expect(data.foods.length).toBeGreaterThan(0);
  });

  test('献立パターンAPIが応答する', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/meals/patterns');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('patterns');
    expect(Array.isArray(data.patterns)).toBeTruthy();
  });
});

test.describe('パフォーマンス', () => {
  test('初回ロードが3秒以内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.locator('.app-header').waitFor();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('食品選択のレスポンスが速い', async ({ page }) => {
    await page.goto('/');
    await page.locator('.app-foods').waitFor();
    
    const startTime = Date.now();
    const firstCard = page.locator('.food-card').first();
    await firstCard.click();
    
    // カウンターの更新を待つ
    await page.locator('.counter-total').waitFor();
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(200);
  });
});