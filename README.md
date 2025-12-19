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
npm install
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

## Build

```bash
npm run build
```

This will create four JS files in the `dist/` directory (both minified and unminified versions):

**Regular script (UMD format):**
- `css-text-selector.js` - Unminified version
- `css-text-selector.min.js` - Minified version

**ES module format:**
- `css-text-selector.module.js` - Unminified version
- `css-text-selector.module.min.js` - Minified version

### Usage

**As a regular script (minified):**
```html
<script src="dist/css-text-selector.min.js"></script>
<script>
  enableCssTextSelector();
</script>
```

**As a regular script (unminified):**
```html
<script src="dist/css-text-selector.js"></script>
<script>
  enableCssTextSelector();
</script>
```

**As an ES module (minified):**
```javascript
import enableCssTextSelector from './dist/css-text-selector.module.min.js';
enableCssTextSelector();
```

**As an ES module (unminified):**
```javascript
import enableCssTextSelector from './dist/css-text-selector.module.js';
enableCssTextSelector();
```

## Preview Production Build

```bash
npm run preview
```

