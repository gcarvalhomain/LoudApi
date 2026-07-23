const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  getTeamsIntroVisualState,
  initTeamsIntroTransition
} = require("../visual/scripts/teams-intro-transition.js");

const frontendRoot = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(frontendRoot, "teams.html"), "utf8");
const css = fs.readFileSync(
  path.join(frontendRoot, "visual", "styles", "velotv-events.css"),
  "utf8",
);

test("isolates the hero transition before TOP RANKING", () => {
  const transitionStart = html.indexOf('<div class="teams-intro-transition">');
  const hero = html.indexOf('<section class="page-hero teams-hero">');
  const overview = html.indexOf('<section class="surface teams-overview brand-content-block">');
  const transitionEnd = html.indexOf("<!-- /teams-intro-transition -->");
  const ranking = html.indexOf('<section class="surface player-ranking-section brand-content-block"');

  assert.ok(transitionStart >= 0, "transition container should exist");
  assert.ok(transitionStart < hero, "transition should start before the hero");
  assert.ok(hero < overview, "overview should follow the hero");
  assert.ok(overview < transitionEnd, "overview should remain inside transition");
  assert.ok(transitionEnd < ranking, "TOP RANKING should remain outside transition");
});

test("defines sticky crossfade styles and a reduced-motion fallback", () => {
  assert.match(css, /\.teams-intro-transition\s*\{[^}]*--hero-transition-progress:/s);
  assert.match(css, /\.teams-intro-stage\s*\{[^}]*position:\s*sticky/s);
  assert.match(css, /\.teams-overview\s*\{[^}]*translateY\(var\(--teams-overview-shift\)\)/s);
  assert.match(css, /\.teams-hero\s*\{[^}]*opacity:\s*calc\(/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.teams-intro-transition/s);
});

test("loads the shared smoother before the Teams transition module", () => {
  const smootherScript = html.indexOf("/visual/scripts/scroll-progress-smoothing.js");
  const teamsScript = html.indexOf("/visual/scripts/teams-intro-transition.js");

  assert.ok(smootherScript >= 0);
  assert.ok(smootherScript < teamsScript);
});

test("maps the existing Teams visual states without changing endpoints", () => {
  assert.deepEqual(getTeamsIntroVisualState(0), {
    progress: 0,
    opacity: 1,
    scale: 1,
    blur: 0,
    brightness: 1,
    overviewShift: 10,
    overviewFeather: 30
  });
  assert.deepEqual(getTeamsIntroVisualState(1), {
    progress: 1,
    opacity: 0,
    scale: 1.025,
    blur: 16,
    brightness: 0.58,
    overviewShift: 0,
    overviewFeather: 0
  });
});

test("initializes Teams immediately and smooths later scroll targets", () => {
  const values = new Map();
  const listeners = new Map();
  const frames = [];
  const transition = {
    classList: { add: (name) => values.set("class", name) },
    getBoundingClientRect: () => ({ top: -500 }),
    style: { setProperty: (name, value) => values.set(name, value) }
  };
  const documentRef = { querySelector: () => transition };
  const windowRef = {
    innerHeight: 1000,
    scrollY: 0,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame(callback) {
      frames.push(callback);
      return frames.length;
    },
    cancelAnimationFrame: () => {},
    addEventListener: (name, callback) => listeners.set(name, callback)
  };

  assert.equal(initTeamsIntroTransition(documentRef, windowRef), true);
  assert.equal(values.get("--hero-transition-progress"), "0.5000");

  windowRef.scrollY = 1000;
  listeners.get("scroll")();
  frames.shift()(16);
  assert.ok(Number(values.get("--hero-transition-progress")) > 0.5);
});

test("dissolves the incoming edge while the hero blurs and darkens", () => {
  assert.match(css, /--hero-transition-blur:\s*0px/);
  assert.match(css, /--hero-transition-brightness:\s*1/);
  assert.match(css, /--teams-overview-feather:\s*0/);
  assert.match(css, /filter:\s*blur\(var\(--hero-transition-blur\)\)\s*brightness\(var\(--hero-transition-brightness\)\)/);
  assert.match(css, /-webkit-mask-image:\s*linear-gradient\([\s\S]*var\(--teams-overview-feather\)/);
  assert.match(css, /mask-image:\s*linear-gradient\([\s\S]*var\(--teams-overview-feather\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*filter:\s*none[\s\S]*mask-image:\s*none/);

});
