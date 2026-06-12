import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

// Плагин Vite для работы с файлом цен prices.csv
// 1. В режиме разработки перехватывает запросы к /prices.csv и отдает файл прямо из корня проекта.
// 2. В режиме сборки (production) копирует prices.csv в выходную папку dist/, чтобы на хостинге он лежал рядом с index.html.
function servePricesCsvPlugin() {
  return {
    name: 'serve-prices-csv',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url === '/prices.csv') {
          try {
            const csvPath = path.resolve(__dirname, 'prices.csv');
            if (fs.existsSync(csvPath)) {
              res.setHeader('Content-Type', 'text/csv; charset=utf-8');
              res.end(fs.readFileSync(csvPath));
              return;
            }
          } catch (e) {
            console.error('Ошибка отдачи prices.csv в dev-режиме:', e);
          }
        }
        next();
      });
    },
    generateBundle() {
      try {
        const srcPath = path.resolve(__dirname, 'prices.csv');
        if (fs.existsSync(srcPath)) {
          this.emitFile({
            type: 'asset',
            fileName: 'prices.csv',
            source: fs.readFileSync(srcPath)
          });
        }
      } catch (e) {
        console.error('Ошибка копирования prices.csv при сборке:', e);
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), servePricesCsvPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
