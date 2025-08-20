import '@testing-library/jest-dom';

// グローバルなテスト設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};