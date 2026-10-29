import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // three.js changes rarely, so keep it in its own cacheable file.
        manualChunks: { three: ['three', '@react-three/fiber'] },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
