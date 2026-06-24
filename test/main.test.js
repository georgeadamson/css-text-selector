import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import enableCssTextSelector from "../src/main.js";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const originalGlobals = {
  addEventListener: globalThis.addEventListener,
  document: globalThis.document,
  MutationObserver: globalThis.MutationObserver,
};

class MockStyle {
  constructor() {
    this.properties = new Map();
  }

  setProperty(name, value) {
    this.properties.set(name, value);
  }

  getPropertyValue(name) {
    return this.properties.get(name) ?? "";
  }
}

class MockTextNode {
  constructor(text) {
    this.nodeType = TEXT_NODE;
    this.parentNode = null;
    this.textContent = text;
  }
}

class MockElement {
  constructor(tagName, text = "") {
    this.nodeType = ELEMENT_NODE;
    this.tagName = tagName.toUpperCase();
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.style = new MockStyle();
    this.id = "";

    if (text) {
      this.append(new MockTextNode(text));
    }
  }

  append(...nodes) {
    for (const node of nodes) {
      node.parentNode = this;
      this.children.push(node);
    }
  }

  setAttribute(name, value) {
    this.attributes.set(name.toLowerCase(), String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name.toLowerCase()) ?? null;
  }

  get textContent() {
    return this.children.map((child) => child.textContent).join("");
  }

  matches(selectorList) {
    if (!selectorList) {
      return false;
    }

    return selectorList.split(",").some((selector) => this.matchesOne(selector));
  }

  matchesOne(selector) {
    const normalized = selector.trim();

    if (normalized === "*") {
      return true;
    }

    if (normalized.startsWith("#")) {
      return this.id === normalized.slice(1);
    }

    return this.tagName === normalized.toUpperCase();
  }

  querySelector(selector) {
    return this.descendantElements().find((node) => node.matchesOne(selector)) ?? null;
  }

  querySelectorAll(selector) {
    return this.descendantElements().filter((node) => node.matchesOne(selector));
  }

  descendantElements() {
    const elements = [];

    for (const child of this.children) {
      if (child.nodeType === ELEMENT_NODE) {
        elements.push(child, ...child.descendantElements());
      }
    }

    return elements;
  }
}

class MockDocument {
  constructor(readyState = "complete") {
    this.readyState = readyState;
    this.documentElement = new MockElement("html");
    this.body = new MockElement("body");
    this.documentElement.append(this.body);
  }

  querySelector(selector) {
    if (this.documentElement.matchesOne(selector)) {
      return this.documentElement;
    }

    return this.documentElement.querySelector(selector);
  }
}

class MockMutationObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.disconnectCalled = false;
    this.observed = [];
    MockMutationObserver.instances.push(this);
  }

  observe(target, options) {
    this.observed.push({ target, options });
  }

  disconnect() {
    this.disconnectCalled = true;
  }

  triggerAddedNodes(...addedNodes) {
    if (this.disconnectCalled) {
      return;
    }

    this.callback([{ addedNodes }]);
  }
}

function setupDom({ readyState = "complete" } = {}) {
  MockMutationObserver.instances = [];

  const listeners = new Map();
  const document = new MockDocument(readyState);

  globalThis.document = document;
  globalThis.MutationObserver = MockMutationObserver;
  globalThis.addEventListener = (eventName, callback) => {
    listeners.set(eventName, callback);
  };

  return {
    document,
    dispatch(eventName) {
      listeners.get(eventName)?.();
    },
    latestObserver() {
      return MockMutationObserver.instances.at(-1);
    },
  };
}

afterEach(() => {
  for (const [name, value] of Object.entries(originalGlobals)) {
    if (value === undefined) {
      delete globalThis[name];
    } else {
      globalThis[name] = value;
    }
  }
});

test("forceInit writes default data-contains attributes for existing elements", () => {
  const { document, latestObserver } = setupDom();
  const paragraph = new MockElement("p", "BaNaNa");
  document.body.append(paragraph);

  const disconnect = enableCssTextSelector({ forceInit: true });

  assert.equal(paragraph.getAttribute("data-contains"), "banana");
  assert.equal(latestObserver().observed[0].target, document.body);
  assert.deepEqual(latestObserver().observed[0].options, {
    subtree: true,
    childList: true,
    attributes: false,
  });

  disconnect();
  assert.equal(latestObserver().disconnectCalled, true);
});

test("existing elements are not populated until forceInit runs", () => {
  const { document } = setupDom();
  const heading = new MockElement("h1", "Deferred");
  document.body.append(heading);

  enableCssTextSelector();

  assert.equal(heading.getAttribute("data-contains"), null);

  enableCssTextSelector.forceInit();

  assert.equal(heading.getAttribute("data-contains"), "deferred");
});

test("strictCase preserves case and line feeds are escaped", () => {
  const { document } = setupDom();
  const paragraph = new MockElement("p", "Line One\nLine Two");
  document.body.append(paragraph);

  enableCssTextSelector({ forceInit: true, strictCase: true });

  assert.equal(paragraph.getAttribute("data-contains"), "Line One&#10;Line Two");
});

test("attrName can target a custom attribute", () => {
  const { document } = setupDom();
  const paragraph = new MockElement("p", "Loading");
  document.body.append(paragraph);

  enableCssTextSelector({
    attrName: "data-css-text",
    forceInit: true,
  });

  assert.equal(paragraph.getAttribute("data-css-text"), "loading");
  assert.equal(paragraph.getAttribute("data-contains"), null);
});

test("attrName can target a CSS custom property", () => {
  const { document } = setupDom();
  const paragraph = new MockElement("p", "Hello");
  document.body.append(paragraph);

  enableCssTextSelector({
    attrName: "--contains",
    forceInit: true,
  });

  assert.equal(paragraph.style.getPropertyValue("--contains"), "hello");
  assert.equal(paragraph.getAttribute("--contains"), null);
});

test("exclude skips elements and include overrides exclude", () => {
  const skippedDom = setupDom();
  const skippedParagraph = new MockElement("p", "Skip");
  skippedDom.document.body.append(skippedParagraph);

  enableCssTextSelector({
    exclude: ["P"],
    forceInit: true,
  });

  assert.equal(skippedParagraph.getAttribute("data-contains"), null);

  const includedDom = setupDom();
  const includedParagraph = new MockElement("p", "Include");
  includedDom.document.body.append(includedParagraph);

  enableCssTextSelector({
    exclude: ["P"],
    include: ["p"],
    forceInit: true,
  });

  assert.equal(includedParagraph.getAttribute("data-contains"), "include");
});

test("newly added text nodes update their parent element", () => {
  const { document, latestObserver } = setupDom();
  const span = new MockElement("span");
  const text = new MockTextNode("Later");
  span.append(text);
  document.body.append(span);

  const disconnect = enableCssTextSelector();
  latestObserver().triggerAddedNodes(text);

  assert.equal(span.getAttribute("data-contains"), "later");

  disconnect();
  latestObserver().triggerAddedNodes(new MockTextNode("Ignored"));

  assert.equal(latestObserver().disconnectCalled, true);
});

test("startup is deferred until DOMContentLoaded while the document is loading", () => {
  const { document, dispatch, latestObserver } = setupDom({
    readyState: "loading",
  });
  const paragraph = new MockElement("p", "Ready");
  document.body.append(paragraph);

  enableCssTextSelector({ forceInit: true });

  assert.equal(paragraph.getAttribute("data-contains"), null);
  assert.equal(latestObserver().observed.length, 0);

  dispatch("DOMContentLoaded");

  assert.equal(paragraph.getAttribute("data-contains"), "ready");
  assert.equal(latestObserver().observed[0].target, document.body);
});

test("missing rootSelector falls back to documentElement", () => {
  const { document, latestObserver } = setupDom();
  const paragraph = new MockElement("p", "Fallback");
  document.body.append(paragraph);

  enableCssTextSelector({
    forceInit: true,
    rootSelector: "#missing",
  });

  assert.equal(paragraph.getAttribute("data-contains"), "fallback");
  assert.equal(latestObserver().observed[0].target, document.documentElement);
});
