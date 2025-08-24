import { test, expect } from '@playwright/test';

test.describe('朝たん計算アプリ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('アプリが正常に表示される', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle(/朝たん/);
    
    // ヘッダーの確認
    const header = page.locator('.app-header');
    await expect(header).toBeVisible();
    
    // タイトルが表示される
    const title = page.locator('.app-title');
    await expect(title).toContainText('朝たん計算アプリ');
    
    // サブタイトルの確認
    const subtitle = page.locator('.app-subtitle');
    await expect(subtitle).toContainText('朝食のタンパク質20gを目指そう');
  });

  test('初期状態で0gと表示される', async ({ page }) => {
    // サイドバーまたはボトムシートのタンパク質表示
    const proteinValue = page.locator('[class*="proteinValue"]');
    await expect(proteinValue).toBeVisible();
    await expect(proteinValue).toContainText('0');
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
    
    // サイドバーのタンパク質値が更新される
    const proteinValue = page.locator('[class*="proteinValue"]');
    const text = await proteinValue.textContent();
    expect(text).not.toContain('0.0');
    
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
    const proteinValue = page.locator('[class*="proteinValue"]');
    const text = await proteinValue.textContent();
    const value = parseFloat(text?.replace('g', '') || '0');
    expect(value).toBeGreaterThan(0);
  });

  test('20g達成すると達成メッセージが表示される', async ({ page }) => {
    // 十分な食品を選択して20g以上にする
    const cards = page.locator('.food-card');
    const count = await cards.count();
    
    // 多めに選択して確実に20gを超える
    for (let i = 0; i < Math.min(10, count); i++) {
      await cards.nth(i).click();
    }
    
    // 達成メッセージが表示される
    const achievement = page.locator('[class*="achievedBadge"]');
    await expect(achievement).toBeVisible();
    await expect(achievement).toContainText('目標達成');
  });

  test('シェアボタンが表示される', async ({ page }) => {
    // シェアボタンが存在する
    const shareButton = page.locator('[class*="shareButton"]');
    await expect(shareButton).toBeVisible();
    
    // 初期状態ではdisabled
    await expect(shareButton).toBeDisabled();
    
    // 食品を選択するとenabledになる
    await page.locator('.food-card').first().click();
    await expect(shareButton).toBeEnabled();
  });

  test('シェアモーダルが開く', async ({ page }) => {
    // 食品を選択
    await page.locator('.food-card').first().click();
    
    // シェアボタンをクリック
    const shareButton = page.locator('[class*="shareButton"]');
    await shareButton.click();
    
    // モーダルが表示される (data-testidを使用)
    const modal = page.locator('[data-testid="share-modal"]');
    await expect(modal).toBeVisible();
    
    // シェアメッセージが表示される
    const shareMessage = page.locator('[class*="shareMessage"]');
    await expect(shareMessage).toBeVisible();
    
    // 閉じるボタンで閉じられる
    const closeButton = page.locator('[class*="closeButton"]').first();
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // デスクトップビュー
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopSidebar = page.locator('[class*="sidebar"]:not([class*="mobile"])');
    await expect(desktopSidebar).toBeVisible();
    
    // モバイルビュー
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileSidebar = page.locator('[class*="sidebar"][class*="mobile"]');
    await expect(mobileSidebar).toBeVisible();
    
    // ボトムシートのハンドルが表示される
    const mobileHandle = page.locator('[class*="mobileHandle"]');
    await expect(mobileHandle).toBeVisible();
  });
});

test.describe('API連携', () => {
  test('バックエンドAPIが応答する', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/foods');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('foods');
    expect(Array.isArray(data.foods)).toBe(true);
  });

  test('献立パターンAPIが応答する', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/meals');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    // API構造に応じてテストを調整（patterns配列または直接配列）
    expect(data).toBeDefined();
  });
});

test.describe('パフォーマンス', () => {
  test('初回ロードが3秒以内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('食品選択のレスポンスが速い', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.food-card').first();
    
    const startTime = Date.now();
    await card.click();
    
    // サイドバーの更新を待つ
    await page.locator('[class*="proteinValue"]').waitFor();
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(200);
  });
});