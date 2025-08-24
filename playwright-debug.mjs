import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

await page.goto('http://localhost:5173');
await page.waitForLoadState('networkidle');

// スクリーンショットを撮る
await page.screenshot({ path: 'layout-before.png', fullPage: false });

// レイアウトの幅を確認
const layoutInfo = await page.evaluate(() => {
  const layout = document.querySelector('.app-layout');
  const main = document.querySelector('.app-main');
  const sidebar = document.querySelector('[class*="sidebar"]');
  const foods = document.querySelector('.app-foods');
  
  return {
    layout: layout ? {
      width: layout.offsetWidth,
      computedStyle: getComputedStyle(layout).maxWidth,
      padding: getComputedStyle(layout).padding
    } : null,
    main: main ? {
      width: main.offsetWidth,
      computedStyle: getComputedStyle(main).maxWidth
    } : null,
    sidebar: sidebar ? {
      width: sidebar.offsetWidth
    } : null,
    foods: foods ? {
      width: foods.offsetWidth
    } : null,
    window: { width: window.innerWidth, height: window.innerHeight }
  };
});

console.log('Layout dimensions:', JSON.stringify(layoutInfo, null, 2));

// 5秒待ってからブラウザを閉じる
await page.waitForTimeout(5000);
await browser.close();