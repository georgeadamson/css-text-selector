function enableCssTextSelector(options = {}) {

  const defaults = {
    forceInit: false,
    include: [], // selectors to include. Overrides exclude.
    exclude: "APPLET,AREA,BODY,CANVAS,FRAME,HEAD,HTML,IFRAME,LINK,MAP,META,NOSCRIPT,SCRIPT,STYLE,SVG,TITLE".split(','),
    lfRegex: /(?:\r\n|\r|\n)/g, // Will tidy up text by replacing line feeds with &#10;
    rootSelector: 'body',
    attrName: 'data-textcontent', // Can be a custom HTML attribute or a CSS custom --property
    strictCase: false, // When false (default) all text will be converted to lowercase so that CSS selectors can be case-insensitive
  }

  // Merge defaults with options and derive the final list of selectors to exclude:
  const { include, exclude, attrName, strictCase, lfRegex, rootSelector, forceInit } = { ...defaults, ...options };
  const includes = include.map(s => s.toUpperCase());
  const excludes = exclude.map(s => s.toUpperCase()).filter(s => !includes.includes(s));
  const excludeSelectors = excludes.join(',');
  const attrNameIsCssCustomProperty = attrName.startsWith('--');

  // Set up the observer to watch for changes to text nodes in the DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 3) { // 3 === Node.TEXT_NODE
          onTextChanged(node);
        }
      }
    }
  });

  // Function to run on each element that has text changed
  const onTextChanged = (node) => {
    const el = node.nodeType === 1 ? node : node.parentNode; // 1 === Node.ELEMENT_NODE

    if (!el.matches(excludeSelectors)) {
      const caseAdjustedText = strictCase ? el.textContent : el.textContent.toLowerCase();
      const updatedText = caseAdjustedText.replace(lfRegex, '&#10;');

      // Allow for CSS custom --property OR HTML attribute usage:
      if (attrNameIsCssCustomProperty) {
        el.style.setProperty(attrName, updatedText);
      } else {
        el.setAttribute(attrName, updatedText);
      }
    }
  };

  // Helper to run a callback immediately or as soon as possible, i.e. if the DOM is ready:
  const runAsap = (callback) => {
    if (document.readyState === "loading") {
      addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  // Helper to ensure we find a valid root element:
  const getRoot = () =>
    document.querySelector(rootSelector) || document.documentElement;

  // Helper to force initial population of the data-innertext attribute immediately:
  const initExistingDomElements = () => {
    getRoot().querySelectorAll('*').forEach(onTextChanged);
  };

  // Start watching the DOM for text changes:
  runAsap(() => {
    // If forceInit is true, force initial population of the data-innertext attribute when the DOM is ready:
    if (forceInit) {
      initExistingDomElements();
    }

    observer.observe(getRoot(), {
      subtree: true,
      childList: true,
      attributes: false, // So we don't trigger runaway observers when we update our data-attribute
    });
  });

  // Expose options and helper functions
  enableCssTextSelector.defaults = defaults;
  enableCssTextSelector.forceInit = initExistingDomElements;

  // Return a helper to switch this thing off:
  return () => observer.disconnect();
}

// Export for ES module usage
export default enableCssTextSelector;
