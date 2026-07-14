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
    matchMedia: () => ({ matches: false }),
    requestAnimationFrame: (callback) => { callback(); return 1; },
    addEventListener: () => {}
  };

  assert.equal(initInnerPageIntroTransitions(documentRef, windowRef), 2);
  assert.equal(market.values['--inner-intro-progress'], '0.5000');
  assert.equal(tournament.values['--inner-intro-progress'], '1.0000');
  assert.equal(market.values.className, 'is-scroll-enhanced');
});

test('reduced motion keeps normal document flow', () => {
  const documentRef = { querySelectorAll: () => [{ classList: { add: () => assert.fail() } }] };
  const windowRef = { matchMedia: () => ({ matches: true }) };
  assert.equal(initInnerPageIntroTransitions(documentRef, windowRef), 0);
});
