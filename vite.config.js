import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': 'import.meta.env',
    'process.browser': true,
    'process.version': '"v16.0.0"',
  },  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-icons/md',
      'react-icons/bs',
      'react-icons/fa',
      'react-icons/ai'
    ],
    force: true
  },
  resolve: {
    alias: {
      // Force use of the browser field for packages
      'process': 'process/browser',
    }
  },  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: ['..'],
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
