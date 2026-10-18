import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite設定ファイル（GitHub Pagesサブパス＆Cloudflare Pages＆モバイル実機すべてで動作するよう base: './' を設定）
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5188
  }
});
