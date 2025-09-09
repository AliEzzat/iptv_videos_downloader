import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['Chrome >= 60', 'Safari >= 11', 'iOS >= 11', 'Firefox >= 60'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      additionalLegacyPolyfills: ['whatwg-fetch'],
    }),
  ],
  base: './',
  build: {
    target: 'es2015',
    modulePreload: false,
  },
})