import { defineConfig, loadEnv } from 'vite'; 
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // 確保環境變數讀取路徑正確
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      // 🌟 [核心修正]：從 './' 改為 '/'
      // 這是解決「Failed to fetch dynamically imported module」最關鍵的一步
      base: '/', 
      
      plugins: [react(), tailwindcss()],
      
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          // 因為你的 index.tsx 在根目錄，所以 @ 指向根目錄
          '@': path.resolve(__dirname, '.'),
        }
      },
      
      build: {
        // 確保打包後的資源路徑結構清晰
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
          output: {
            // 讓打包後的檔名更有規律，減少載入快取問題
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        }
      }
    };
});