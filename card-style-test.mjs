import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// カードの初期状態を確認
await page.screenshot({ path: 'card-default-shadow.png', fullPage: false });

// いくつかカードを選択
const cards = page.locator('.food-card');
await cards.nth(0).click();
await cards.nth(1).click();
await cards.nth(2).click();
await page.waitForTimeout(500);

// 選択状態のカードを確認
await page.screenshot({ path: 'card-selected-state.png', fullPage: false });

console.log('Card style test completed');
await browser.close();