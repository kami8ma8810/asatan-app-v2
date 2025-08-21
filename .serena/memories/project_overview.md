# 朝たん計算アプリ v2.0 プロジェクト概要

## プロジェクトの目的
朝食のタンパク質20g達成を目指すWebアプリケーション。朝食で20g以上のタンパク質を摂取することで、筋肉の分解を抑え、健康的な生活をサポートする。

## 技術スタック

### フロントエンド
- **Solid.js**: リアクティブUIライブラリ（仮想DOMなし、高速レンダリング）
- **Vite**: ビルドツール（高速HMR、最小バンドル）
- **TypeScript**: 型安全性とより良い開発体験
- **Vitest**: テストフレームワーク
- **CSS Modules**: スコープ化されたスタイリング

### バックエンド
- **Bun**: JavaScriptランタイム（Node.jsの3倍高速）
- **Hono**: 軽量Webフレームワーク（エッジ対応）
- **SQLite**: 組み込み型データベース
- **CSV Parser**: 文部科学省データのインポート用

### ツール
- Node.js v24（.mise.tomlで設定）
- Bunランタイム

## アーキテクチャ
- フロントエンド：Solid.js SPA（Vite開発サーバー）
- バックエンド：Bun + Hono APIサーバー
- データベース：SQLite（文部科学省食品データ）
- デプロイ：Vercel/Netlify（フロント）、Vercel Functions（API）

## v1からの主な改善点
- webpack → Vite（ビルド時間80%短縮）
- jQuery → Solid.js（レンダリング速度10倍向上）
- 36食品 → 2,500+食品（文科省データ）
- 静的データ → SQLite（検索速度100倍）
- JavaScript → TypeScript（型安全性）
- Node.js → Bun（3倍高速）