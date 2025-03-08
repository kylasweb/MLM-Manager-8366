import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [
    react(),
    commonjs({
      requireReturnsDefault: 'auto',
      include: [
        /node_modules/,
        /use-sync-external-store/,
        /zustand/
      ]
    }),
    nodeResolve({
      preferBuiltins: false,
      browser: true,
      mainFields: ['module', 'main', 'browser']
    })
  ],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'zustand': path.resolve(__dirname, 'node_modules/zustand'),
      'zustand/middleware': path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
      'use-sync-external-store/shim': path.resolve(__dirname, 'node_modules/use-sync-external-store/shim')
    }
  },
  optimizeDeps: {
    include: [
      'crypto-es',
      'jwt-decode',
      'axios',
      'antd',
      'react',
      'react-dom',
      'zustand',
      'zustand/middleware',
      'use-sync-external-store',
      'use-sync-external-store/shim',
      'use-sync-external-store/shim/with-selector'
    ],
    esbuildOptions: {
      target: 'es2020',
      mainFields: ['module', 'main', 'browser']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/, /use-sync-external-store/, /zustand/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        },
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('crypto-es')) return 'crypto';
            if (id.includes('antd')) return 'antd';
            if (id.includes('jwt-decode') || id.includes('axios')) return 'vendor';
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            if (id.includes('use-sync-external-store') || id.includes('zustand')) return 'store';
            return 'deps';
          }
        }
      }
    }
  },
});