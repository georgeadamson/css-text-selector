# css-text-selector

Use CSS selectors to match DOM elements by their text content.

Browsers do not provide a native CSS `:contains()` selector (but see the solution further down to use that syntax). `css-text-selector`
fills that gap by copying each element's `textContent` into an attribute, then
keeping newly added text in sync with a `MutationObserver`.

```html
<button>Save draft</button>
```

becomes:

```html
<button data-contains="save draft">Save draft</button>
```

Now ordinary CSS attribute selectors can target the text:

```css
button[data-contains="save draft"] {
  font-weight: 700;
}

[data-contains*="error"] {
  outline: 2px solid crimson;
}

a[data-contains="click here"],
a[data-contains="show more"] {
  text-decoration-style: wavy;
}
```

By default text is lowercased, so write selector values in lowercase unless you
enable `strictCase`.

## When to use it

Use this when you need CSS-only styling hooks for text-driven UI states, quick
browser prototypes, CMS or admin screens where classes are hard to add, visual
testing helpers, or accessibility checks such as finding vague link text.

This is a browser helper for CSS matching. It uses `textContent`, not rendered
`innerText`, so hidden text and script-generated text can be included depending
on the element.

## Installation

```bash
npm install css-text-selector
```

You can also load a browser build from a CDN:

```html
<script src="https://unpkg.com/css-text-selector/dist/css-text-selector.min.js"></script>
```

```html
<script src="https://cdn.jsdelivr.net/npm/css-text-selector/dist/css-text-selector.min.js"></script>
```

## Usage

### ES modules

```js
import enableCssTextSelector from "css-text-selector";

const disableCssTextSelector = enableCssTextSelector({
  forceInit: true,
});
```

Call the returned function when you want to stop observing DOM changes:

```js
disableCssTextSelector();
```

### Browser script tag

```html
<script src="https://unpkg.com/css-text-selector/dist/css-text-selector.min.js"></script>
<script>
  enableCssTextSelector({ forceInit: true });
</script>
```

### Browser ES module

```html
<script type="module">
  import enableCssTextSelector from "https://unpkg.com/css-text-selector/dist/css-text-selector.module.min.js";

  enableCssTextSelector({ forceInit: true });
</script>
```

## API

```js
const disconnect = enableCssTextSelector(options);
```

`enableCssTextSelector()` starts a `MutationObserver` on the element matched by
`rootSelector` and returns a disconnect function. By default, `rootSelector` is
`"body"`; if no matching element exists, it falls back to
`document.documentElement`.

```js
enableCssTextSelector.forceInit();
```

After the helper has been enabled, `forceInit()` rescans the current root and
populates attributes on existing elements. This is useful after large
programmatic DOM updates.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `forceInit` | `false` | Populate matching existing DOM elements as soon as the DOM is ready. Set this to `true` for most immediate styling use cases. |
| `rootSelector` | `"body"` | CSS selector for the root element to scan and observe. Falls back to `document.documentElement` if no match is found. |
| `attrName` | `"data-contains"` | Attribute to write. If the name starts with `--`, it is written as an inline CSS custom property instead. |
| `strictCase` | `false` | When `false`, text is lowercased before it is written so CSS matching can be effectively case-insensitive. |
| `exclude` | built-in list | Selectors to skip. Defaults to document, media, metadata, script, style, SVG, and other non-content elements. |
| `include` | `[]` | Selectors to allow even if they appear in `exclude`, for example `["TITLE"]`. |
| `lfRegex` | `/(?:\r\n⏐\r⏐\n)\/g` | Regular expression used to replace line breaks with `&#10;` before writing text into the attribute. |

## Examples

Limit work to part of the page:

```js
enableCssTextSelector({
  rootSelector: "#app",
  forceInit: true,
});
```

Use a custom attribute:

```js
enableCssTextSelector({
  attrName: "data-css-text",
  forceInit: true,
});
```

```css
[data-css-text*="loading"] {
  opacity: 0.6;
}
```

Preserve case-sensitive text:

```js
enableCssTextSelector({
  strictCase: true,
  forceInit: true,
});
```

```css
[data-contains="SKU-123"] {
  font-family: monospace;
}
```

Write text into a CSS custom property instead of an attribute:

```js
enableCssTextSelector({
  attrName: "--text-content",
  forceInit: true,
});
```

```css
[style*="--text-content"]::after {
  content: " (" var(--text-content) ")";
}
```

## Optional `:contains()` Build Step

If you want to author CSS with a theoretical `:contains()` selector, you can
use [`postcss-replace`](https://www.npmjs.com/package/postcss-replace) to
rewrite that syntax at build time:

```bash
npm install --save-dev postcss postcss-replace
```

Add a PostCSS config:

```js
// postcss.config.cjs
module.exports = {
  plugins: [
    require("postcss-replace")({
      pattern: /:contains\(\s*(["']?)(.*?)\1\s*\)/g,
      data: {
        replaceAll: '[data-contains="$2"]',
      },
    }),
  ],
};
```

Then write CSS like this:

```css
button:contains(save draft) {
  font-weight: 700;
}

a:contains("show more") {
  text-decoration-style: wavy;
}
```

PostCSS outputs ordinary attribute selectors:

```css
button[data-contains="save draft"] {
  font-weight: 700;
}

a[data-contains="show more"] {
  text-decoration-style: wavy;
}
```

This is only a build-time transform; browsers still receive normal CSS. With
the default `strictCase: false`, write `:contains()` text in lowercase. Use
`strictCase: true` if you want the generated selector values to preserve and
match exact case.

## Notes

- Existing DOM elements are only populated automatically when `forceInit` is
  `true`.
- Newly added text nodes are observed after the helper starts.
- Directly changing an existing `Text` node's `nodeValue` may require
  `enableCssTextSelector.forceInit()` because the observer watches child list
  changes, not character data mutations.
- The default excluded selectors avoid writing text into document structure,
  script, style, media, and SVG elements.

## Builds

`npm run build` creates four files in `dist/`:

| File | Format | Minified |
| --- | --- | --- |
| `dist/css-text-selector.js` | UMD browser/global build | No |
| `dist/css-text-selector.min.js` | UMD browser/global build | Yes |
| `dist/css-text-selector.module.js` | ES module | No |
| `dist/css-text-selector.module.min.js` | ES module | Yes |

## Development

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3010`.

Test the source ES module in `index.html`:

```html
<script type="module">
  import enableCssTextSelector from "/src/main.js";

  enableCssTextSelector({ forceInit: true });
</script>
```

The Vite dev server can also serve the UMD build at
`/dist/css-text-selector.js`; it is built on first request if needed.

Run unit tests:

```bash
npm test
```
