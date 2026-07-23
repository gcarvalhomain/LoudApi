const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getInnerIntroVisualState,
  initInnerPageIntroTransitions
} = require('../visual/scripts/inner-page-intro-transition.js');

test('getInnerIntroVisualState clamps and maps the transition', () => {
  assert.deepEqual(getInnerIntroVisualState(-1), {
    progress: 0, opacity: 1, scale: 1, blur: 0,
    brightness: 1, contentShift: 10, feather: 30
  });
  assert.deepEqual(getInnerIntroVisualState(1), {
    progress: 1, opacity: 0, scale: 1.025, blur: 16,
    brightness: 0.58, contentShift: 0, feather: 0
  });
});

test('initInnerPageIntroTransitions updates every wrapper independently', () => {
  const frames = [];
  const listeners = new Map();
  const listenerCounts = new Map();

  function wrapper(top) {
    const values = {};
    return {
      values,
      getBoundingClientRect: () => ({ top }),
      classList: { add: (name) => { values.className = name; } },
      style: { setProperty: (name, value) => { values[name] = value; } }
    };
  }

  const market = wrapper(-500);
  const tournament = wrapper(-1000);
  const documentRef = { querySelectorAll: () => [market, tournament] };
  const windowRef = {
    innerHeight: 1000,
    scrollY: 0,
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (callback) => {
      frames.push(callback);
      return frames.length;
    },
    cancelAnimationFrame: () => {},
    addEventListener: (name, callback) => {
      listeners.set(name, callback);
      listenerCounts.set(name, (listenerCounts.get(name) || 0) + 1);
    }
  };

  assert.equal(initInnerPageIntroTransitions(documentRef, windowRef), 2);
  assert.equal(market.values['--inner-intro-progress'], '0.5000');
  assert.equal(tournament.values['--inner-intro-progress'], '1.0000');
  assert.equal(market.values.className, 'is-scroll-enhanced');

  windowRef.scrollY = 1000;
  listeners.get('scroll')();
  assert.equal(market.values['--inner-intro-progress'], '0.5000');
  frames.shift()(16);
  assert.ok(Number(market.values['--inner-intro-progress']) > 0.5);
  assert.equal(listenerCounts.get('scroll'), 1);
  assert.equal(listenerCounts.get('resize'), 1);
});

test('reduced motion keeps normal document flow', () => {
  const documentRef = { querySelectorAll: () => [{ classList: { add: () => assert.fail() } }] };
  const windowRef = { matchMedia: () => ({ matches: true }) };
  assert.equal(initInnerPageIntroTransitions(documentRef, windowRef), 0);
});
