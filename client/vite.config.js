import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Dev proxy: forwards /api/* → http://localhost:5000/api/*
    // VITE_API_URL is intentionally empty in .env.development so all
    // requests go through this proxy during local development.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Raise the warning threshold — MUI bundles are inherently large.
    // The single-chunk build is intentional for this application size.
    chunkSizeWarningLimit: 1000,
  },
});
