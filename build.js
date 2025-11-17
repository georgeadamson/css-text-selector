import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';
import { readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build configuration
const baseConfig = {
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'enableCssTextSelector',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        compact: true
      }
    }
  }
};

// Build minified versions
console.log('Building minified versions...');
await build({
  ...baseConfig,
  build: {
    ...baseConfig.build,
    lib: {
      ...baseConfig.build.lib,
      fileName: (format) => {
        if (format === 'es') {
          return 'css-text-selector.module.min.js';
        }
        return 'css-text-selector.min.js';
      }
    },
    minify: 'terser',
    outDir: 'dist',
    rollupOptions: {
      ...baseConfig.build.rollupOptions,
      plugins: []
    }
  },
  esbuild: {
    legalComments: 'none'
  }
});

// Post-process with terser to remove comments
const moduleMinPath = resolve(__dirname, 'dist/css-text-selector.module.min.js');
const umdMinPath = resolve(__dirname, 'dist/css-text-selector.min.js');

// Re-minify ES module with comment removal
const moduleCode = readFileSync(moduleMinPath, 'utf-8');
const moduleMinified = await minify(moduleCode, {
  format: {
    comments: false
  }
});
writeFileSync(moduleMinPath, moduleMinified.code);

// Re-minify UMD with comment removal  
const umdCode = readFileSync(umdMinPath, 'utf-8');
const umdMinified = await minify(umdCode, {
  format: {
    comments: false
  }
});
writeFileSync(umdMinPath, umdMinified.code);

// Build unminified versions
console.log('Building unminified versions...');
await build({
  ...baseConfig,
  build: {
    ...baseConfig.build,
    lib: {
      ...baseConfig.build.lib,
      fileName: (format) => {
        if (format === 'es') {
          return 'css-text-selector.module.js';
        }
        return 'css-text-selector.js';
      }
    },
    minify: false,
    outDir: 'dist',
    emptyOutDir: false // Don't clear directory so minified files are preserved
  }
});

console.log('Build complete!');

