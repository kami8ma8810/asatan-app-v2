import { chromium } from 'playwright';

// WCAGコントラスト比計算関数
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return null;
}

async function checkPageContrast() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // 要素のコントラスト比をチェック
  const contrastIssues = await page.evaluate(() => {
    const issues = [];
    const white = { r: 255, g: 255, b: 255 };
    const background = { r: 248, g: 249, b: 250 }; // --color-background
    
    // チェック対象の要素を取得
    const elements = [
      { selector: '.food-card__serving', name: 'サービング表記', minRatio: 4.5 },
      { selector: '.food-card__weight', name: '重量表記', minRatio: 4.5 },
      { selector: '[class*="remaining"]', name: '残りg表記', minRatio: 4.5 },
      { selector: '[class*="handleCount"]', name: 'カウント表記', minRatio: 4.5 },
      { selector: '[class*="emptyMessage"]', name: '空メッセージ', minRatio: 4.5 },
      { selector: '.app-subtitle', name: 'サブタイトル', minRatio: 4.5 },
      // 追加チェック
      { selector: '.food-card__protein', name: 'タンパク質量', minRatio: 3.0 }, // 大きいテキスト
      { selector: '.food-card__name', name: '食品名', minRatio: 4.5 },
      { selector: '[class*="sectionTitle"]', name: 'セクションタイトル', minRatio: 3.0 },
      { selector: '[class*="proteinValue"]', name: 'タンパク質値', minRatio: 3.0 },
      { selector: '[class*="itemProtein"]', name: '選択中食品のタンパク質', minRatio: 4.5 }
    ];
    
    elements.forEach(({ selector, name, minRatio }) => {
      const els = document.querySelectorAll(selector);
      els.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        issues.push({
          selector,
          name,
          color,
          backgroundColor: bgColor !== 'rgba(0, 0, 0, 0)' ? bgColor : 'rgb(248, 249, 250)',
          text: el.textContent?.trim()
        });
      });
    });
    
    return issues;
  });
  
  console.log('\n=== コントラスト比チェック結果 ===\n');
  
  const failedElements = [];
  
  contrastIssues.forEach(issue => {
    const fg = parseRgb(issue.color);
    const bg = parseRgb(issue.backgroundColor);
    
    if (fg && bg) {
      const ratio = getContrastRatio(fg, bg);
      // セレクターに応じて必要な比率を決定
      let requiredRatio = 4.5; // デフォルト
      if (issue.selector.includes('protein') || 
          issue.selector.includes('sectionTitle') ||
          issue.selector.includes('proteinValue')) {
        requiredRatio = 3.0; // 大きいテキスト
      }
      
      const passes = ratio >= requiredRatio;
      const status = passes ? '✅ PASS' : '❌ FAIL';
      
      if (!passes || ratio < 3.0) { // 3:1未満は常に表示
        console.log(`${status} ${issue.name} (${issue.selector})`);
        console.log(`  テキスト: "${issue.text?.substring(0, 20)}..."`);
        console.log(`  色: ${issue.color}`);
        console.log(`  背景: ${issue.backgroundColor}`);
        console.log(`  コントラスト比: ${ratio.toFixed(2)}:1 (必要: ${requiredRatio}:1)\n`);
      }
      
      if (!passes) {
        failedElements.push({
          name: issue.name,
          selector: issue.selector,
          ratio: ratio.toFixed(2),
          requiredRatio: requiredRatio,
          color: issue.color
        });
      }
    }
  });
  
  if (failedElements.length > 0) {
    console.log('\n⚠️  修正が必要な要素:');
    failedElements.forEach(el => {
      console.log(`  - ${el.name}: 現在 ${el.ratio}:1 (${el.color})`);
    });
    
    console.log('\n💡 推奨色:');
    console.log('  - 通常テキスト（4.5:1以上）: #595959 またはそれより濃い色');
    console.log('  - 大きいテキスト（3:1以上）: #707070 またはそれより濃い色');
  } else {
    console.log('✨ すべての要素がWCAG AA基準を満たしています！');
  }
  
  await browser.close();
}

checkPageContrast().catch(console.error);