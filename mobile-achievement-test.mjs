import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  ...devices['iPhone 12 Pro']
});
const page = await context.newPage();

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// 20g未満で選択
const cards = page.locator('.food-card');
await cards.nth(0).click(); // 厚揚げ 2g
await cards.nth(1).click(); // ピーナツ 2g
await page.waitForTimeout(500);

// 未達成時のUI確認
await page.screenshot({ path: 'mobile-not-achieved.png', fullPage: false });

// 20gを超えるまで選択
await cards.nth(4).click(); // 豆腐 3g
await cards.nth(8).click(); // 納豆 4g
await cards.nth(13).click(); // 牛乳 5g
await cards.nth(16).click(); // チーズ 4g
await cards.nth(19).click(); // ハム 2g
await page.waitForTimeout(500);

// 達成時のUI確認
await page.screenshot({ path: 'mobile-achieved.png', fullPage: false });

// カウンターをタップして展開
const floatingCounter = page.locator('[class*="mobileHandle"]');
await floatingCounter.click();
await page.waitForTimeout(500);

await page.screenshot({ path: 'mobile-achieved-expanded.png', fullPage: false });

console.log('Mobile achievement UI test completed');
await browser.close();