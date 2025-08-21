/**
 * バックエンドAPIサーバーのエントリーポイント
 * 
 * このファイルは、Bun + Honoを使用したRESTful APIサーバーのメインファイルです。
 * 朝たん計算アプリのバックエンド機能を提供します。
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// APIルーターのインポート
import { foodsRouter } from './api/foods';
import { mealsRouter } from './api/meals';
import { adminRouter } from './api/admin';

// データベース接続の初期化
import { initializeDatabase } from './db/database';

/**
 * Honoアプリケーションのインスタンス作成
 * Honoは軽量で高速なWebフレームワークです
 */
const app = new Hono();

/**
 * ミドルウェアの設定
 */

// CORS設定：フロントエンドからのアクセスを許可
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // 開発環境のフロントエンドURL
  credentials: true, // クッキーの送信を許可
}));

// リクエストログの出力
app.use('*', logger());

/**
 * ルートエンドポイント
 * APIの稼働状態を確認するためのヘルスチェックエンドポイント
 */
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: '朝たん計算アプリ API v1.0',
    endpoints: {
      foods: '/api/foods',
      meals: '/api/meals',
      admin: '/api/admin'
    }
  });
});

/**
 * APIルーターの登録
 * 各機能ごとにルーターを分割して管理
 */
app.route('/api/foods', foodsRouter);  // 食品関連のAPI
app.route('/api/meals', mealsRouter);  // 献立関連のAPI
app.route('/api/admin', adminRouter);  // 管理者用のAPI

/**
 * エラーハンドリング
 * 予期しないエラーが発生した場合の処理
 */
app.onError((err, c) => {
  console.error(`Error: ${err}`);
  return c.json(
    { 
      error: 'Internal Server Error',
      message: err.message 
    },
    500
  );
});

/**
 * 404ハンドラー
 * 存在しないエンドポイントへのアクセス時の処理
 */
app.notFound((c) => {
  return c.json(
    { 
      error: 'Not Found',
      message: `エンドポイント ${c.req.url} は存在しません` 
    },
    404
  );
});

/**
 * サーバーの起動
 */
const port = process.env.PORT || 3001;

// データベースの初期化
await initializeDatabase();

console.log(`🚀 朝たん API サーバーが起動しました`);
console.log(`📡 http://localhost:${port} でリクエストを待機中...`);

/**
 * Bunのサーバー設定
 * Bunの組み込みHTTPサーバーを使用
 */
export default {
  port: port,
  fetch: app.fetch, // HonoアプリケーションをBunのfetchハンドラーに接続
};