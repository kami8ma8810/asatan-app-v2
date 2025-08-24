import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// いくつか食品を選択
const cards = page.locator('.food-card');
await cards.nth(0).click();
await cards.nth(2).click();
await cards.nth(5).click();
await page.waitForTimeout(500);

// 初期位置でスクリーンショット
await page.screenshot({ path: 'sticky-test-top.png', fullPage: false });

// スクロールしてsticky動作を確認
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(500);
await page.screenshot({ path: 'sticky-test-middle.png', fullPage: false });

// さらにスクロール
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(500);
await page.screenshot({ path: 'sticky-test-bottom.png', fullPage: false });

// サイドバーとシェアボタンの位置を確認
const positions = await page.evaluate(() => {
  const sidebar = document.querySelector('[class*="sidebar"]');
  const shareButton = document.querySelector('[class*="shareButton"]');
  const header = document.querySelector('.app-header');
  
  return {
    sidebar: sidebar ? sidebar.getBoundingClientRect() : null,
    shareButton: shareButton ? shareButton.getBoundingClientRect() : null,
    header: header ? header.getBoundingClientRect() : null,
    scrollY: window.scrollY
  };
});

console.log('Component positions:', JSON.stringify(positions, null, 2));

await browser.close();