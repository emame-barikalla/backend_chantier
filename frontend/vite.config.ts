import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      // Add alias for sockjs-client if needed
      'sockjs-client': resolve(__dirname, 'node_modules/sockjs-client/dist/sockjs.min.js'),
    },
  },
  define: {
    global: 'window', // Polyfill for global
    'process.env': {}, // Polyfill for process.env
  },
});
