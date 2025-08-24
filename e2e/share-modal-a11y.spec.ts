import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('シェアモーダルのアクセシビリティ', () => {
  test('WCAG AAコントラスト比を満たす', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 食品を選択
    const firstCard = page.locator('button[class*="food-card"]').first();
    await firstCard.click();
    
    // シェアボタンをクリック
    const shareButton = page.locator('button').filter({ hasText: 'シェア' }).first();
    await shareButton.click();
    
    // モーダルが表示されるのを待つ
    const modal = page.locator('[data-testid="share-modal"]');
    await expect(modal).toBeVisible();

    // アクセシビリティテスト
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="share-modal"]')
      .analyze();

    // コントラスト比の違反を確認
    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log('コントラスト比の違反:');
      contrastViolations.forEach(violation => {
        violation.nodes.forEach(node => {
          console.log(`- ${node.html}`);
          console.log(`  影響: ${node.impact}`);
          console.log(`  対象: ${node.target.join(', ')}`);
        });
      });
    }

    // コントラスト比の違反がないことを確認
    expect(contrastViolations.length).toBe(0);
  });

  test('アクセシビリティ全般のチェック', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 食品を選択
    const firstCard = page.locator('button[class*="food-card"]').first();
    await firstCard.click();
    
    // シェアボタンをクリック
    const shareButton = page.locator('button').filter({ hasText: 'シェア' }).first();
    await shareButton.click();
    
    // モーダルが表示されるのを待つ
    const modal = page.locator('[data-testid="share-modal"]');
    await expect(modal).toBeVisible();

    // アクセシビリティテスト
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="share-modal"]')
      .withTags(['wcag2aa'])
      .analyze();

    // すべての違反を出力
    if (accessibilityScanResults.violations.length > 0) {
      console.log('アクセシビリティの違反:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`\n${violation.id}: ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`  - ${node.html}`);
        });
      });
    }

    // アクセシビリティ違反がないことを確認
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});