import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),

    // Gzip compression (fallback)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),

    // Bundle analyzer
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // Silences deprecation warnings from node_modules (Bootstrap)
        quietDeps: true,
        // Specifically silence newer Dart Sass deprecations that clutter the console
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function', 'mixed-decls'],
      },
    },
  },

  build: {
    // Target modern browsers for smaller bundles
    target: 'es2015',

    // Optimize chunk size
    chunkSizeWarningLimit: 500, // Reduced from 1000 for mobile

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // Increased from 2 for better compression
        ecma: 2015,
        // Mobile-specific optimizations
        unsafe_math: true,
        unsafe_methods: true,
      },
      format: {
        comments: false,
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
      },
    },

    // Rollup options for advanced chunking
    rollupOptions: {
      output: {
        // Manual chunk splitting strategy - OPTIMIZED FOR MOBILE
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            // Separate large libraries into their own chunks
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'chart-vendor'; // Lazy load this
            }
            if (id.includes('bootstrap')) {
              return 'bootstrap-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor'; // Lazy load this
            }
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            if (id.includes('qrcode')) {
              return 'qrcode-vendor'; // Lazy load this
            }
            // All other node_modules
            return 'vendor';
          }

          // Split routes into separate chunks
          if (id.includes('/routes/')) {
            if (id.includes('ClientApp')) {
              return 'client-route';
            }
            if (id.includes('AdminApp')) {
              return 'admin-route';
            }
            if (id.includes('Login') || id.includes('Signup')) {
              return 'auth-route';
            }
          }
        },

        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },

        // Smaller initial chunks for mobile
        experimentalMinChunkSize: 20000, // 20KB minimum
      },
    },

    // Source maps only for debugging (disable in production)
    sourcemap: false,

    // Report compressed size
    reportCompressedSize: true,

    // Optimize CSS
    cssMinify: 'lightningcss',
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['chart.js', 'qrcode.react'], // Don't pre-bundle heavy deps
  },

  // Mobile-specific optimizations
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
});
