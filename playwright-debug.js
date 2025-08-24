const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // スクリーンショットを撮る
  await page.screenshot({ path: 'layout-before.png', fullPage: false });
  
  // レイアウトの幅を確認
  const layoutWidth = await page.evaluate(() => {
    const layout = document.querySelector('.app-layout');
    const main = document.querySelector('.app-main');
    const sidebar = document.querySelector('[class*="sidebar"]');
    
    return {
      layout: layout ? layout.getBoundingClientRect() : null,
      main: main ? main.getBoundingClientRect() : null,
      sidebar: sidebar ? sidebar.getBoundingClientRect() : null,
      window: { width: window.innerWidth, height: window.innerHeight }
    };
  });
  
  console.log('Layout dimensions:', layoutWidth);
  
  // ブラウザは開いたままにして確認
  // await browser.close();
})();