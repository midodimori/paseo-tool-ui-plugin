import assert from "node:assert/strict";
import { autoExpandEdits } from "../client/auto-expand.js";

// Mobile/native has no DOM: no renderer registration or UI action.
assert.equal(typeof autoExpandEdits(), "function");
const badge = (label, expanded = "false", visible = true, exposesExpandedState = false) => {
  const header = {
    label, expanded, clicks: 0,
    querySelector(selector) {
      assert.equal(selector, '[dir="auto"]');
      return { textContent: this.label };
    },
    getAttribute(name) { assert.equal(name, "aria-expanded"); return exposesExpandedState ? this.expanded : null; },
    click() { this.clicks++; this.expanded = "true"; },
  };
  return {
    header, visible,
    get children() { return header.expanded === "true" ? [header, {}] : [header]; },
    getClientRects() { return this.visible ? [{}] : []; },
    querySelector(selector) {
      assert.equal(selector, ':scope > [role="button"]');
      return this.header;
    },
  };
};
const cards = [badge("Edit"), badge("Write"), badge("Read"), badge("Shell"), badge("Search"), badge("Edit", "true"), badge("Edit", "false", true, true)];
let observer;
let resize;
const media = {
  matches: true,
  addEventListener(event, callback) { assert.equal(event, "change"); resize = callback; },
  removeEventListener(event, callback) { assert.equal(event, "change"); assert.equal(callback, resize); resize = null; },
};
globalThis.document = {
  body: {},
  querySelectorAll(selector) { assert.equal(selector, '[data-testid="tool-call-badge"]'); return cards; },
};
globalThis.matchMedia = query => { assert.equal(query, "(min-width: 720px)"); return media; };
globalThis.MutationObserver = class {
  constructor(callback) { this.callback = callback; observer = this; }
  observe(target, options) { assert.equal(target, document.body); assert.equal(options.subtree, true); }
  disconnect() { this.disconnected = true; }
};
try {
  const cleanup = autoExpandEdits();
  assert.deepEqual(cards.map(card => card.header.clicks), [1, 1, 0, 0, 0, 0, 1]);
  cards[0].header.expanded = "false"; // User collapses a card.
  observer.callback();
  assert.equal(cards[0].header.clicks, 1);
  cards[5].header.expanded = "false";
  observer.callback();
  assert.equal(cards[5].header.clicks, 0);
  const incoming = badge("Write");
  cards.push(incoming);
  observer.callback();
  assert.equal(incoming.header.clicks, 1);
  const hidden = badge("Edit", "false", false);
  cards.push(hidden);
  observer.callback();
  assert.equal(hidden.header.clicks, 0);
  hidden.visible = true;
  observer.callback();
  assert.equal(hidden.header.clicks, 1);
  media.matches = false;
  const compact = badge("Edit");
  cards.push(compact);
  observer.callback();
  assert.equal(compact.header.clicks, 0); // Never auto-open a tool sheet.
  media.matches = true;
  resize();
  assert.equal(compact.header.clicks, 1);
  assert.equal(cards.length, 10);
  cleanup();
  assert.equal(observer.disconnected, true);
  assert.equal(resize, null);
} finally {
  delete globalThis.document;
  delete globalThis.matchMedia;
  delete globalThis.MutationObserver;
}
console.log("Native Edit/Write controls open once; other tools, manual collapse and compact layouts are preserved.");
