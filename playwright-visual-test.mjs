import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// スクリーンショットを撮る
await page.screenshot({ path: 'layout-after-fix.png', fullPage: false });

// いくつか食品を選択してレイアウトの動作を確認
const cards = page.locator('.food-card');
await cards.nth(0).click();
await cards.nth(2).click();
await cards.nth(5).click();

await page.waitForTimeout(500);

// 選択後のスクリーンショット
await page.screenshot({ path: 'layout-with-selection.png', fullPage: false });

// レイアウトの詳細情報を取得
const gridInfo = await page.evaluate(() => {
  const grid = document.querySelector('.food-grid');
  const cards = document.querySelectorAll('.food-card');
  
  if (grid) {
    const computedStyle = getComputedStyle(grid);
    return {
      gridColumns: computedStyle.gridTemplateColumns,
      gap: computedStyle.gap,
      cardsPerRow: Math.floor(grid.offsetWidth / (cards[0]?.offsetWidth || 180)),
      totalCards: cards.length,
      gridWidth: grid.offsetWidth
    };
  }
  return null;
});

console.log('Grid Info:', JSON.stringify(gridInfo, null, 2));

await browser.close();