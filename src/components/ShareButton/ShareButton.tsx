import { type Component, createSignal, Show, For } from 'solid-js';
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
    window.open(url, '_blank');
  };

  const shareToLine = () => {
    const message = encodeURIComponent(generateShareMessage());
    const url = `https://social-plugins.line.me/lineit/share?url=https://asatan-app.vercel.app&text=${message}`;
    window.open(url, '_blank');
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
        role="button"
        aria-label="シェア"
      >
        シェア
      </button>

      <Show when={showModal()}>
        <div class={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div class={styles.modal} onClick={(e) => e.stopPropagation()} data-testid="share-modal">
            <div class={styles.modalHeader}>
              <h3>シェアする</h3>
              <button
                class={styles.closeButton}
                onClick={() => setShowModal(false)}
                role="button"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            <div class={styles.modalContent}>
              <div class={styles.shareMessage} data-testid="share-message">
                <pre>{generateShareMessage()}</pre>
              </div>

              <div class={styles.shareButtons}>
                <button
                  class={`${styles.shareOption} ${styles.twitter}`}
                  onClick={shareToTwitter}
                  role="button"
                  aria-label="Twitter"
                >
                  X (Twitter)
                </button>

                <button
                  class={`${styles.shareOption} ${styles.line}`}
                  onClick={shareToLine}
                  role="button"
                  aria-label="LINE"
                >
                  LINE
                </button>

                <Show when={props.generateImage}>
                  <button
                    class={`${styles.shareOption} ${styles.image}`}
                    onClick={generateImage}
                    role="button"
                    aria-label="画像"
                  >
                    画像で保存
                  </button>
                </Show>

                <Show when={hasWebShareApi()}>
                  <button
                    class={`${styles.shareOption} ${styles.native}`}
                    onClick={shareNative}
                    role="button"
                    aria-label="その他"
                  >
                    その他のアプリ
                  </button>
                </Show>
              </div>

              <Show when={imageDataUrl()}>
                <div class={styles.generatedImage}>
                  <img src={imageDataUrl()!} alt="シェア画像" />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
};