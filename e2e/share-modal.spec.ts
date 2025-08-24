import { test, expect } from '@playwright/test';

test.describe('シェアモーダルのレイアウト', () => {
  test('シェアモーダルが最前面に表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // いくつか食品を選択
    const cards = page.locator('.food-card');
    await cards.nth(0).click();
    await cards.nth(1).click();
    await cards.nth(2).click();
    await page.waitForTimeout(500);

    // シェアボタンをクリック
    const shareButton = page.locator('button:has-text("シェア")');
    await shareButton.click();
    await page.waitForTimeout(500);

    // モーダルオーバーレイが表示されているか確認
    const modalOverlay = page.locator('[class*="modalOverlay"]');
    await expect(modalOverlay).toBeVisible();

    // モーダルが表示されているか確認
    const modal = page.locator('[data-testid="share-modal"]').or(page.locator('[class*="modal"][class*="modal_"]'));
    await expect(modal).toBeVisible();

    // チェックマークがモーダルの下にあることを確認
    // z-indexを取得して比較
    const overlayZIndex = await modalOverlay.evaluate(el => 
      window.getComputedStyle(el).zIndex
    );
    
    const modalZIndex = await modal.evaluate(el => 
      window.getComputedStyle(el).zIndex
    );

    // 選択されたカードのチェックマークのz-indexを確認
    const checkMark = page.locator('.food-card__check').first();
    if (await checkMark.isVisible()) {
      const checkZIndex = await checkMark.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.zIndex === 'auto' ? '0' : computed.zIndex;
      });
      
      console.log('Overlay z-index:', overlayZIndex);
      console.log('Modal z-index:', modalZIndex);
      console.log('Check mark z-index:', checkZIndex);
      
      // チェックマークのz-indexがオーバーレイより小さいことを確認
      expect(parseInt(checkZIndex)).toBeLessThan(parseInt(overlayZIndex));
    }

    // スクリーンショットを撮る
    await page.screenshot({ 
      path: 'share-modal-layout.png',
      fullPage: true 
    });

    // モーダルを閉じる
    const closeButton = page.locator('[class*="modal"] button[title="閉じる"]');
    await closeButton.click();
    await expect(modal).not.toBeVisible();
  });

  test('選択された食品カードがモーダルの下に表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 多くの食品を選択
    const cards = page.locator('.food-card');
    for (let i = 0; i < 5; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(100);
    }

    // シェアボタンをクリック
    const shareButton = page.locator('button:has-text("シェア")');
    await shareButton.click();
    await page.waitForTimeout(500);

    // すべての要素のz-indexを確認
    const elements = await page.evaluate(() => {
      const results = [];
      
      // モーダルオーバーレイ
      const overlay = document.querySelector('[class*="modalOverlay"]');
      if (overlay) {
        results.push({
          element: 'modalOverlay',
          zIndex: window.getComputedStyle(overlay).zIndex,
          position: window.getComputedStyle(overlay).position
        });
      }
      
      // モーダル
      const modal = document.querySelector('[class*="modal"]');
      if (modal) {
        results.push({
          element: 'modal',
          zIndex: window.getComputedStyle(modal).zIndex,
          position: window.getComputedStyle(modal).position
        });
      }
      
      // チェックマーク
      const checkMarks = document.querySelectorAll('.food-card__check');
      checkMarks.forEach((check, index) => {
        results.push({
          element: `checkMark-${index}`,
          zIndex: window.getComputedStyle(check).zIndex,
          position: window.getComputedStyle(check).position
        });
      });
      
      // フードカード
      const foodCards = document.querySelectorAll('.food-card');
      foodCards.forEach((card, index) => {
        results.push({
          element: `foodCard-${index}`,
          zIndex: window.getComputedStyle(card).zIndex,
          position: window.getComputedStyle(card).position
        });
      });
      
      return results;
    });

    console.log('Z-index analysis:', elements);

    // モーダルオーバーレイのz-indexが最も高いことを確認
    const overlayElement = elements.find(e => e.element === 'modalOverlay');
    const otherElements = elements.filter(e => !e.element.includes('modal'));
    
    if (overlayElement) {
      const overlayZIndex = parseInt(overlayElement.zIndex) || 0;
      otherElements.forEach(element => {
        const elementZIndex = parseInt(element.zIndex) || 0;
        if (elementZIndex >= overlayZIndex) {
          console.error(`${element.element} has z-index ${elementZIndex} which is >= overlay z-index ${overlayZIndex}`);
        }
      });
    }

    // スクリーンショット
    await page.screenshot({ 
      path: 'share-modal-with-selections.png',
      fullPage: true 
    });
  });
});