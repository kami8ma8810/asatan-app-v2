import { chromium, devices } from 'playwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  ...devices['iPhone 12 Pro']
});
const page = await context.newPage();

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// 食品をいくつか選択
const cards = page.locator('.food-card');
await cards.nth(0).click();
await cards.nth(2).click();
await cards.nth(5).click();
await page.waitForTimeout(500);

// フローティングカウンターの確認
await page.screenshot({ path: 'mobile-floating-counter.png', fullPage: false });

// カウンターをタップして展開
const floatingCounter = page.locator('[class*="mobileHandle"]');
await floatingCounter.click();
await page.waitForTimeout(500);

await page.screenshot({ path: 'mobile-expanded.png', fullPage: false });

// 下にスクロールしてフローティングの挙動を確認
await page.evaluate(() => window.scrollBy(0, 500));
await page.waitForTimeout(500);

await page.screenshot({ path: 'mobile-scrolled.png', fullPage: false });

console.log('Mobile UI test completed');
await browser.close();