const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clampProgress,
  getSegmentProgress,
  initAboutScroll
} = require("../visual/scripts/home-about-scroll.js");

test("clampProgress limits values to the zero-to-one range", () => {
  assert.equal(clampProgress(-0.4), 0);
  assert.equal(clampProgress(0.42), 0.42);
  assert.equal(clampProgress(1.8), 1);
});

test("getSegmentProgress reveals a scroll interval cumulatively", () => {
  assert.equal(getSegmentProgress(0.1, 0.2, 0.4), 0);
  assert.ok(Math.abs(getSegmentProgress(0.3, 0.2, 0.4) - 0.5) < Number.EPSILON);
  assert.equal(getSegmentProgress(0.7, 0.2, 0.4), 1);
});

test("initAboutScroll activates and updates the cumulative reveal state", () => {
  const sectionProperties = new Map();
  const itemProperties = new Map();
  const listeners = new Map();
  const revealItem = {
    dataset: { revealStart: "0.2", revealEnd: "0.6" },
    style: { setProperty: (name, value) => itemProperties.set(name, value) }
  };
  const aboutSection = {
    offsetHeight: 3000,
    classList: { add: (name) => sectionProperties.set("class", name) },
    getBoundingClientRect: () => ({ top: -1000 }),
    querySelectorAll: () => [revealItem],
    style: { setProperty: (name, value) => sectionProperties.set(name, value) }
  };
  const documentRef = { querySelector: () => aboutSection };
  const windowRef = {
    innerHeight: 1000,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (callback) => callback(),
    addEventListener: (name, callback) => listeners.set(name, callback)
  };

  initAboutScroll(documentRef, windowRef);

  assert.equal(sectionProperties.get("class"), "is-scroll-enhanced");
  assert.equal(sectionProperties.get("--about-progress"), "0.5000");
  assert.equal(itemProperties.get("--about-reveal-opacity"), "0.7500");
  assert.equal(itemProperties.get("--about-reveal-y"), "8.50px");
  assert.equal(itemProperties.get("--about-reveal-blur"), "2.50px");
  assert.equal(typeof listeners.get("scroll"), "function");
  assert.equal(typeof listeners.get("resize"), "function");
});
