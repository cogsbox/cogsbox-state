import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: '/chris/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'cogsbox-state': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['cogsbox-state'],
  },
});
