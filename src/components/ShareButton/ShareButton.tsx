import { type Component, createSignal, Show, onCleanup } from 'solid-js';
import type { Food } from '../../models/Food';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  selectedFoods: Food[];
}

export const ShareButton: Component<ShareButtonProps> = (props) => {
  const [showMenu, setShowMenu] = createSignal(false);

  const totalProtein = () => {
    return props.selectedFoods.reduce((sum, food) => sum + food.protein, 0);
  };

  const isDisabled = () => props.selectedFoods.length === 0;

  const generateShareText = () => {
    if (props.selectedFoods.length === 0) return '';
    
    const foods = props.selectedFoods.map(food => `・${food.name}（${food.protein}g）`).join('\n');
    const total = totalProtein().toFixed(1);
    const achievement = totalProtein() >= 20 ? '🎯 目標達成！' : '';
    
    return `今日の朝たん！タンパク質 ${total}g摂取しました！${achievement}

${foods}

#朝たん #タンパク質 #健康習慣`;
  };

  const shareToTwitter = () => {
    const text = generateShareText();
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    setShowMenu(false);
  };

  const shareToLine = () => {
    const text = generateShareText();
    const url = window.location.href;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
    setShowMenu(false);
  };


  const shareWithWebShareApi = async () => {
    if (!navigator.share) return;
    
    try {
      await navigator.share({
        title: '朝たんアプリ - 今日のタンパク質',
        text: generateShareText(),
        url: window.location.href,
      });
    } catch (err) {
      console.log('Share failed:', err);
    }
    setShowMenu(false);
  };

  const generateImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定（Instagram用正方形）
    canvas.width = 1080;
    canvas.height = 1080;

    // 背景色
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // タイトル
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('今日の朝たん！', canvas.width / 2, 120);

    // タンパク質合計
    ctx.font = 'bold 80px sans-serif';
    ctx.fillStyle = '#FF6B6B';
    ctx.fillText(`タンパク質 ${totalProtein().toFixed(1)}g`, canvas.width / 2, 240);

    // 達成状態
    if (totalProtein() >= 20) {
      ctx.font = '50px sans-serif';
      ctx.fillStyle = '#4CAF50';
      ctx.fillText('🎯 目標達成！', canvas.width / 2, 320);
    }

    // 食品リスト
    let yPosition = 420;
    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    
    props.selectedFoods.forEach(food => {
      const text = `• ${food.name} (${food.protein}g)`;
      ctx.fillText(text, 100, yPosition);
      yPosition += 60;
    });

    // フッター
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('#朝たん #タンパク質 #健康習慣', canvas.width / 2, canvas.height - 60);

    // 画像をダウンロード
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `asatan_${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
    
    setShowMenu(false);
  };

  // メニュー外クリックで閉じる
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(`.${styles.shareContainer}`)) {
      setShowMenu(false);
    }
  };

  // メニューが開いているときだけイベントリスナーを追加
  const handleMenuToggle = () => {
    const newState = !showMenu();
    setShowMenu(newState);
    
    if (newState) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
  };

  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  return (
    <div class={styles.shareContainer}>
      <button
        class={styles.shareButton}
        onClick={handleMenuToggle}
        disabled={isDisabled()}
        aria-label="シェア"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        シェア
      </button>

      <Show when={showMenu()}>
        <div class={styles.shareMenu}>
          <button
            class={styles.shareMenuItem}
            onClick={shareToTwitter}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X（Twitter）
          </button>

          <button
            class={styles.shareMenuItem}
            onClick={shareToLine}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#00B900">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.404-.105-.51-.29l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
            LINE
          </button>

          <button
            class={styles.shareMenuItem}
            onClick={generateImage}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            画像を保存
          </button>

          <Show when={navigator.share}>
            <button
              class={styles.shareMenuItem}
              onClick={shareWithWebShareApi}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              その他のアプリ
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};