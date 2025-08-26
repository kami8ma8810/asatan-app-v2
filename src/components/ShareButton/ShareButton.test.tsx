import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent, waitFor } from '@solidjs/testing-library';
import { ShareButton } from './ShareButton';
import type { Food } from '../../models/Food';

describe('ShareButton', () => {
  const mockFoods: Food[] = [
    {
      id: '1',
      name: 'ゆで卵',
      category: 'egg',
      protein: 7.5,
      image: '/images/eggs/boiled-egg.webp',
      servingSize: '1個',
    },
    {
      id: '2',
      name: 'ギリシャヨーグルト',
      category: 'dairy',
      protein: 10.0,
      image: '/images/dairy/greek-yogurt.webp',
      servingSize: '100g',
    },
  ];

  let originalOpen: typeof window.open;
  let originalNavigator: typeof window.navigator;

  beforeEach(() => {
    originalOpen = window.open;
    originalNavigator = window.navigator;
    window.open = vi.fn();
  });

  afterEach(() => {
    cleanup();
    window.open = originalOpen;
    window.navigator = originalNavigator;
    vi.clearAllMocks();
  });

  describe('基本的な表示', () => {
    it('シェアボタンが表示される', () => {
      const { getByRole } = render(() => <ShareButton selectedFoods={[]} />);
      const button = getByRole('button', { name: /シェア/i });
      expect(button).toBeInTheDocument();
    });

    it('食品が選択されていない場合はボタンが無効になる', () => {
      const { getByRole } = render(() => <ShareButton selectedFoods={[]} />);
      const button = getByRole('button', { name: /シェア/i });
      expect(button).toBeDisabled();
    });

    it('食品が選択されている場合はボタンが有効になる', () => {
      const { getByRole } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('シェアメニューの表示', () => {
    it('ボタンをクリックするとシェアメニューが表示される', async () => {
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(getByText('X（Twitter）')).toBeInTheDocument();
        expect(getByText('LINE')).toBeInTheDocument();
        expect(getByText('画像を保存')).toBeInTheDocument();
      });
    });

    it('メニュー外をクリックするとメニューが閉じる', async () => {
      const { getByRole, queryByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(queryByText('X（Twitter）')).toBeInTheDocument();
      });
      
      fireEvent.click(document.body);
      await waitFor(() => {
        expect(queryByText('X（Twitter）')).not.toBeInTheDocument();
      });
    });
  });

  describe('X（Twitter）シェア機能', () => {
    it('X（Twitter）ボタンをクリックするとTwitterシェアURLが開く', async () => {
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const xButton = getByText('X（Twitter）');
        fireEvent.click(xButton);
      });
      
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank'
      );
    });

    it('選択した食品情報が含まれたツイートテキストが生成される', async () => {
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const xButton = getByText('X（Twitter）');
        fireEvent.click(xButton);
      });
      
      const callArg = (window.open as any).mock.calls[0][0];
      expect(callArg).toContain(encodeURIComponent('ゆで卵'));
      expect(callArg).toContain(encodeURIComponent('ギリシャヨーグルト'));
      expect(callArg).toContain(encodeURIComponent('17.5g'));
    });
  });

  describe('LINEシェア機能', () => {
    it('LINEボタンをクリックするとLINEシェアURLが開く', async () => {
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const lineButton = getByText('LINE');
        fireEvent.click(lineButton);
      });
      
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://social-plugins.line.me/lineit/share'),
        '_blank'
      );
    });

    it('選択した食品情報が含まれたメッセージが生成される', async () => {
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const lineButton = getByText('LINE');
        fireEvent.click(lineButton);
      });
      
      const callArg = (window.open as any).mock.calls[0][0];
      expect(callArg).toContain(encodeURIComponent('ゆで卵'));
      expect(callArg).toContain(encodeURIComponent('ギリシャヨーグルト'));
      expect(callArg).toContain(encodeURIComponent('17.5g'));
    });
  });

  describe('画像生成・保存機能', () => {
    it('画像を保存ボタンをクリックすると画像が生成される', async () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = {
        fillStyle: '',
        fillRect: vi.fn(),
        font: '',
        textAlign: '',
        fillText: vi.fn(),
        drawImage: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 100 }),
      };
      
      mockCanvas.getContext = vi.fn().mockReturnValue(mockContext);
      document.createElement = vi.fn().mockReturnValue(mockCanvas);
      
      mockCanvas.toBlob = vi.fn().mockImplementation((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      });
      
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const saveButton = getByText('画像を保存');
        fireEvent.click(saveButton);
      });
      
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('生成された画像がダウンロードされる', async () => {
      const mockCanvas = document.createElement('canvas');
      const mockContext = {
        fillStyle: '',
        fillRect: vi.fn(),
        font: '',
        textAlign: '',
        fillText: vi.fn(),
        drawImage: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 100 }),
      };
      
      mockCanvas.getContext = vi.fn().mockReturnValue(mockContext);
      document.createElement = vi.fn().mockReturnValue(mockCanvas);
      
      const mockLink = document.createElement('a');
      mockLink.click = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement');
      createElementSpy.mockImplementation((tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        if (tag === 'a') return mockLink;
        return document.createElement(tag);
      });
      
      mockCanvas.toBlob = vi.fn().mockImplementation((callback) => {
        callback(new Blob(['test'], { type: 'image/png' }));
      });
      
      URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
      URL.revokeObjectURL = vi.fn();
      
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const saveButton = getByText('画像を保存');
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockLink.download).toContain('asatan');
        expect(mockLink.href).toBe('blob:test');
        expect(mockLink.click).toHaveBeenCalled();
      });
      
      createElementSpy.mockRestore();
    });
  });

  describe('Web Share API対応', () => {
    it('Web Share APIが使用可能な場合はネイティブシェアも表示される', async () => {
      Object.defineProperty(window.navigator, 'share', {
        value: vi.fn(),
        writable: true,
      });
      
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        expect(getByText('その他のアプリ')).toBeInTheDocument();
      });
    });

    it('ネイティブシェアボタンをクリックするとWeb Share APIが呼ばれる', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(window.navigator, 'share', {
        value: mockShare,
        writable: true,
      });
      
      const { getByRole, getByText } = render(() => <ShareButton selectedFoods={mockFoods} />);
      const button = getByRole('button', { name: /シェア/i });
      
      fireEvent.click(button);
      await waitFor(() => {
        const nativeButton = getByText('その他のアプリ');
        fireEvent.click(nativeButton);
      });
      
      expect(mockShare).toHaveBeenCalledWith({
        title: expect.stringContaining('朝たんアプリ'),
        text: expect.stringContaining('ゆで卵'),
        url: expect.any(String),
      });
    });
  });
});