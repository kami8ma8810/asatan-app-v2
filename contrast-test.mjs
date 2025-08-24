import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// いくつか食品を選択
const cards = page.locator('.food-card');
await cards.nth(18).click(); // ししゃも
await page.waitForTimeout(500);

await page.screenshot({ path: 'contrast-improved.png', fullPage: false });

// モバイルでも確認
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(500);

await page.screenshot({ path: 'contrast-improved-mobile.png', fullPage: false });

console.log('Contrast test completed');
await browser.close();