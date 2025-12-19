# CSS Text Selector

Helper to empower CSS to find elements by text content.

After runnning the script you can use this CSS to find elements by their inner text.

Examples:

```css
p[data-textcontent*="banana"] {
  /* Style paragraphs that contain specific text */
}

a[data-textcontent="show more"],
a[data-textcontent="click here"] {
  /* Highlight inaccessible links */
}
```

## Development

```bash
npm install css-text-selector
npm run dev
```

This will start a dev server at `http://localhost:3010` with hot module replacement.

### Using Both Versions in Dev

In the dev environment, you can test both versions:

**ES Module Version (from source):**
```html
<script type="module">
  import enableCssTextSelector from '/src/main.js';
  enableCssTextSelector();
</script>
```

**Regular Script Version (UMD - auto-built on first request):**
```html
<script src="/dist/css-text-selector.js"></script>
<script>
  enableCssTextSelector();
</script>
```

The UMD version is automatically built and served when first requested in dev mode.

## Installation

### npm
```bash
npm install css-text-selector
```

### CDN (via unpkg)
```html
<!-- Minified -->
<script src="https://unpkg.com/css-text-selector/dist/css-text-selector.min.js"></script>

<!-- Unminified -->
<script src="https://unpkg.com/css-text-selector/dist/css-text-selector.js"></script>
```

### CDN (via jsDelivr)
```html
<!-- Minified -->
<script src="https://cdn.jsdelivr.net/npm/css-text-selector/dist/css-text-selector.min.js"></script>

<!-- Unminified -->
<script src="https://cdn.jsdelivr.net/npm/css-text-selector/dist/css-text-selector.js"></script>
```

## Usage

### npm / ES Modules

**ES Module import (recommended):**
```javascript
import enableCssTextSelector from 'css-text-selector';
enableCssTextSelector();
```

**CommonJS require:**
```javascript
const enableCssTextSelector = require('css-text-selector');
enableCssTextSelector();
```

**Direct import from dist:**
```javascript
// ES Module
import enableCssTextSelector from 'css-text-selector/dist/css-text-selector.module.js';

// Or minified
import enableCssTextSelector from 'css-text-selector/dist/css-text-selector.module.min.js';
```

### Browser Script Tag

**Via CDN (minified):**
```html
<script src="https://unpkg.com/css-text-selector/dist/css-text-selector.min.js"></script>
<script>
  enableCssTextSelector();
</script>
```

**Local file:**
```html
<script src="./node_modules/css-text-selector/dist/css-text-selector.min.js"></script>
<script>
  enableCssTextSelector();
</script>
```

### Browser ES Module

```html
<script type="module">
  import enableCssTextSelector from 'https://unpkg.com/css-text-selector/dist/css-text-selector.module.min.js';
  enableCssTextSelector();
</script>
```

## Build

```bash
npm run build
```

This will create four JS files in the `dist/` directory (both minified and unminified versions):

**UMD format (for script tags and CommonJS):**
- `css-text-selector.js` - Unminified version
- `css-text-selector.min.js` - Minified version

**ES module format:**
- `css-text-selector.module.js` - Unminified version
- `css-text-selector.module.min.js` - Minified version

## Preview Production Build

```bash
npm run preview
```

