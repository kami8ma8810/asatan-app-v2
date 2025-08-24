import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('アクセシビリティテスト', () => {
  test('ホームページがWCAG基準を満たす', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('コントラスト比がWCAG AA基準を満たす', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('食品選択後もアクセシビリティ基準を満たす', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // いくつか食品を選択
    const cards = page.locator('.food-card');
    await cards.nth(0).click();
    await cards.nth(2).click();
    await cards.nth(5).click();
    await page.waitForTimeout(500);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('20g達成時もアクセシビリティ基準を満たす', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 20g以上になるまで多くの食品を選択
    const cards = page.locator('.food-card');
    
    // とにかく多くの食品を選択して20gを超える
    for (let i = 0; i < 10; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(500);

    // アクセシビリティチェック（達成状態の要素があるかはチェックしない）
    // 重要なのはコントラスト比などのアクセシビリティ基準を満たすこと
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('モバイルビューでもアクセシビリティ基準を満たす', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('キーボードナビゲーションが適切に機能する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // キーボードアクセシビリティに関連するルールを確認
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules([
        'button-name',
        'link-name',
        'focus-order-semantics',
        'tabindex'
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('ARIA属性が適切に使用されている', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules([
        'aria-allowed-attr',
        'aria-required-attr',
        'aria-valid-attr-value',
        'aria-valid-attr',
        'aria-roles'
      ])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('画像に適切な代替テキストがある', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('見出しの階層が適切である', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('フォームラベルが適切に関連付けられている', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('言語属性が設定されている', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['html-has-lang', 'html-lang-valid'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('モバイルビューで20g達成時もアクセシビリティ基準を満たす', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 20g以上になるまで食品を選択
    const cards = page.locator('.food-card');
    await cards.nth(0).click();
    await cards.nth(1).click();
    await cards.nth(2).click();
    await cards.nth(3).click();
    await page.waitForTimeout(500);

    // アクセシビリティチェック
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('全画面要素のコントラスト比が基準を満たす', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 様々な状態を作る
    const cards = page.locator('.food-card');
    
    // 通常状態
    const normalResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(normalResults.violations).toEqual([]);

    // 選択状態
    await cards.nth(0).click();
    await cards.nth(1).click();
    await page.waitForTimeout(300);
    
    const selectedResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(selectedResults.violations).toEqual([]);

    // 達成状態
    await cards.nth(2).click();
    await cards.nth(3).click();
    await cards.nth(4).click();
    await page.waitForTimeout(300);
    
    const achievedResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(achievedResults.violations).toEqual([]);
  });
});

// 詳細レポート生成用のテスト
test.describe('アクセシビリティ詳細レポート', () => {
  test('違反がある場合の詳細レポート', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // 違反があれば詳細を出力
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n=== アクセシビリティ違反の詳細 ===\n');
      
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.description}`);
        console.log(`   影響度: ${violation.impact}`);
        console.log(`   ヘルプ: ${violation.helpUrl}`);
        console.log(`   影響を受ける要素数: ${violation.nodes.length}`);
        
        violation.nodes.forEach((node, nodeIndex) => {
          console.log(`     ${nodeIndex + 1}) ${node.target.join(' ')}`);
          console.log(`        ${node.failureSummary}`);
        });
        console.log('');
      });
    }

    // パス数と違反数のサマリー
    console.log('\n=== サマリー ===');
    console.log(`✅ パス: ${accessibilityScanResults.passes.length} 項目`);
    console.log(`❌ 違反: ${accessibilityScanResults.violations.length} 項目`);
    console.log(`⚠️  不完全: ${accessibilityScanResults.incomplete.length} 項目`);
    console.log(`ℹ️  該当なし: ${accessibilityScanResults.inapplicable.length} 項目`);

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});