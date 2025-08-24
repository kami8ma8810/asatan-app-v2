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

// サイドバーの選択中食品にホバー
const selectedItems = page.locator('[class*="selectedItem"]').first();
await selectedItems.hover();
await page.waitForTimeout(500);

await page.screenshot({ path: 'sidebar-hover-fixed.png', fullPage: false });

console.log('Sidebar hover test completed');
await browser.close();