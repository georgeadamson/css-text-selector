import { defineConfig } from 'vite';
import { build } from 'vite';
import { resolve, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to serve UMD version in dev
function serveUmdInDev() {
  let umdBuilt = false;
  return {
    name: 'serve-umd-in-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Serve UMD version from dist
        if (req.url === '/dist/css-text-selector.js') {
          // Build UMD version if not exists or source changed
          if (!umdBuilt || !existsSync(resolve(__dirname, 'dist/css-text-selector.js'))) {
            try {
              await build({
                build: {
                  lib: {
                    entry: resolve(__dirname, 'src/main.js'),
                    name: 'enableCssTextSelector',
                    fileName: () => 'css-text-selector.js',
                    formats: ['umd']
                  },
                  outDir: 'dist',
                  minify: false,
                  write: true
                }
              });
              umdBuilt = true;
            } catch (e) {
              // Ignore build errors
            }
          }

          // Serve the file
          const filePath = resolve(__dirname, 'dist/css-text-selector.js');
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/javascript');
            res.end(readFileSync(filePath));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [serveUmdInDev()],
  // Build config is handled by build.js script
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'enableCssTextSelector',
      fileName: (format) => {
        if (format === 'es') {
          return 'css-text-selector.module.js';
        }
        return 'css-text-selector.js';
      },
      formats: ['es', 'umd']
    },
    minify: false,
    rollupOptions: {
      output: {
        compact: true
      }
    }
  },
  server: {
    port: 3010,
    open: true
  }
});

