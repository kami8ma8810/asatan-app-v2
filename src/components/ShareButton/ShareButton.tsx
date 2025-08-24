import { type Component, createSignal, Show, For } from 'solid-js';
import { Portal } from 'solid-js/web';
import type { Food } from '../../models/Food';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  selectedFoods: Food[];
  targetProtein?: number;
  useWebShareApi?: boolean;
  generateImage?: boolean;
}

export const ShareButton: Component<ShareButtonProps> = (props) => {
  const [showModal, setShowModal] = createSignal(false);
  const [imageDataUrl, setImageDataUrl] = createSignal<string | null>(null);

  const totalProtein = () => {
    return props.selectedFoods.reduce((sum, food) => sum + food.protein, 0);
  };

  const isTargetMet = () => {
    return props.targetProtein ? totalProtein() >= props.targetProtein : false;
  };

  const generateShareMessage = () => {
    const protein = totalProtein();
    const foods = props.selectedFoods.map(f => `・${f.name}`).join('\n');
    const achievement = isTargetMet() ? '【目標達成！】' : '';
    
    return `今日の朝たん計算 ${achievement}

選んだ食品：
${foods}

合計タンパク質: ${protein.toFixed(1)}g

#朝たん #タンパク質 #朝食 #健康
https://asatan-app.vercel.app`;
  };

  const shareToTwitter = () => {
    const message = encodeURIComponent(generateShareMessage());
    const url = `https://twitter.com/intent/tweet?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToLine = () => {
    const message = encodeURIComponent(generateShareMessage());
    const url = `https://social-plugins.line.me/lineit/share?url=https://asatan-app.vercel.app&text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  const shareToEmail = () => {
    const subject = encodeURIComponent('朝たん計算結果');
    const body = encodeURIComponent(generateShareMessage());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareNative = async () => {
    if (!navigator.share) return;
    
    try {
      await navigator.share({
        title: '朝たん計算結果',
        text: generateShareMessage(),
        url: 'https://asatan-app.vercel.app',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const generateImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定
    canvas.width = 1200;
    canvas.height = 630;

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ffcb05');
    gradient.addColorStop(1, '#ffd633');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // タイトル
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('朝たん計算結果', canvas.width / 2, 100);

    // 達成状態
    if (isTargetMet()) {
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('目標達成！', canvas.width / 2, 180);
    }

    // タンパク質量
    ctx.font = 'bold 120px sans-serif';
    ctx.fillStyle = '#2c5aa0';
    ctx.fillText(`${totalProtein().toFixed(1)}g`, canvas.width / 2, 350);

    // 食品リスト
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    const startY = 420;
    props.selectedFoods.slice(0, 5).forEach((food, index) => {
      ctx.fillText(`・${food.name} (${food.protein}g)`, 100, startY + index * 40);
    });

    // URL
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('asatan-app.vercel.app', canvas.width / 2, canvas.height - 40);

    // データURLに変換
    const dataUrl = canvas.toDataURL('image/png');
    setImageDataUrl(dataUrl);

    // ダウンロード
    const link = document.createElement('a');
    link.download = `asatan_${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const hasWebShareApi = () => {
    return props.useWebShareApi && typeof navigator.share === 'function';
  };

  return (
    <>
      <button
        class={styles.shareButton}
        onClick={() => setShowModal(true)}
        disabled={props.selectedFoods.length === 0}
        aria-haspopup="dialog"
        aria-expanded={showModal()}
        type="button"
      >
        シェア
      </button>

      <Show when={showModal()}>
        <Portal mount={document.body}>
          <div 
            class={styles.modalOverlay} 
            onClick={() => setShowModal(false)}
            role="presentation"
            aria-hidden="true"
          >
            <div 
              class={styles.modal} 
              onClick={(e) => e.stopPropagation()} 
              data-testid="share-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-modal-title"
            >
              <div class={styles.modalHeader}>
                <h3 id="share-modal-title">シェアする</h3>
                <button
                  class={styles.closeButton}
                  onClick={() => setShowModal(false)}
                  type="button"
                  title="閉じる"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="閉じる">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div class={styles.modalContent}>
              <div 
                class={styles.shareMessage} 
                data-testid="share-message"
              >
                <pre>{generateShareMessage()}</pre>
              </div>

              <div class={styles.shareButtons}>
                <button
                  class={`${styles.shareOption} ${styles.twitter}`}
                  onClick={shareToTwitter}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter)</span>
                </button>

                <button
                  class={`${styles.shareOption} ${styles.line}`}
                  onClick={shareToLine}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 5.28 2 9.25c0 3.45 3.4 6.34 7.97 7.05.31.07.73.21.84.48.1.25.06.64.03.9l-.13.79c-.04.23-.19 1.13.99.62 1.18-.51 6.37-3.75 8.7-6.42C21.95 10.85 22 9.31 22 9.25 22 5.28 17.52 2 12 2zm-4.51 10.5h-1.5c-.28 0-.5-.22-.5-.5v-3.5c0-.28.22-.5.5-.5s.5.22.5.5v3h1c.28 0 .5.22.5.5s-.22.5-.5.5zm2.5 0c-.28 0-.5-.22-.5-.5v-3.5c0-.28.22-.5.5-.5s.5.22.5.5v3.5c0 .28-.22.5-.5.5zm4.5 0c-.21 0-.4-.14-.47-.34l-1.03-2.76v2.6c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-3.5c0-.22.14-.41.34-.47.2-.07.42.02.53.21l1.13 3.02 1.13-3.02c.11-.19.33-.28.53-.21.2.06.34.25.34.47v3.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-2.6l-1.03 2.76c-.07.2-.26.34-.47.34zm3.5 0h-2c-.28 0-.5-.22-.5-.5v-3.5c0-.28.22-.5.5-.5h2c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5v.75h1.5c.28 0 .5.22.5.5s-.22.5-.5.5h-1.5v.75h1.5c.28 0 .5.22.5.5s-.22.5-.5.5z"/>
                  </svg>
                  <span>LINE</span>
                </button>

                <button
                  class={`${styles.shareOption} ${styles.email}`}
                  onClick={shareToEmail}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>メール</span>
                </button>

                <Show when={props.generateImage}>
                  <button
                    class={`${styles.shareOption} ${styles.image}`}
                    onClick={generateImage}
                    type="button"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    <span>画像で保存</span>
                  </button>
                </Show>

              </div>

              <Show when={imageDataUrl()}>
                <div class={styles.generatedImage}>
                  <img src={imageDataUrl()!} alt="朝たん計算結果のシェア画像" />
                </div>
              </Show>
            </div>
          </div>
        </div>
        </Portal>
      </Show>
    </>
  );
};