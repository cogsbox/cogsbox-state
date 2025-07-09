import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('dirname', __dirname);
export default defineConfig({
  base: '/chris/',
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, '../../src'),
    },
  },
});
