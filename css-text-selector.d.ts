export interface CssTextSelectorOptions {
  /**
   * Force initial population of the attribute when the DOM is ready
   * @default false
   */
  forceInit?: boolean;
  /**
   * Selectors to include. Overrides exclude.
   * @default []
   */
  include?: string[];
  /**
   * Selectors to exclude from text content processing
   * @default ["APPLET","AREA","BODY","CANVAS","FRAME","HEAD","HTML","IFRAME","LINK","MAP","META","NOSCRIPT","SCRIPT","STYLE","SVG","TITLE"]
   */
  exclude?: string[];
  /**
   * Regular expression for line feed replacement
   * @default /(?:\r\n|\r|\n)/g
   */
  lfRegex?: RegExp;
  /**
   * Root selector to observe
   * @default 'body'
   */
  rootSelector?: string;
  /**
   * Attribute name or CSS custom property (must start with '--' for CSS custom property)
   * @default 'data-textcontent'
   */
  attrName?: string;
  /**
   * When false (default) all text will be converted to lowercase so that CSS selectors can be case-insensitive
   * @default false
   */
  strictCase?: boolean;
}

/**
 * Enables CSS text selector functionality by adding text content to elements as attributes
 * @param options Configuration options
 * @returns A function to disconnect the observer and stop processing
 */
declare function enableCssTextSelector(options?: CssTextSelectorOptions): () => void;

declare namespace enableCssTextSelector {
  /**
   * Default options
   */
  const defaults: Required<CssTextSelectorOptions>;
  /**
   * Force initial population of attributes for existing DOM elements
   */
  function forceInit(): void;
}

export default enableCssTextSelector;

