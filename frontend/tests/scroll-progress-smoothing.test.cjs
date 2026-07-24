const test = require("node:test");
const assert = require("node:assert/strict");
const {
  clampProgress,
  interpolateProgress,
  createProgressSmoother
} = require("../visual/scripts/scroll-progress-smoothing.js");

function createFrameWindow() {
  let nextId = 1;
  const frames = new Map();

  return {
    requestAnimationFrame(callback) {
      const id = nextId++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
    runFrame(timestamp) {
      const pending = Array.from(frames.values());
      frames.clear();
      pending.forEach((callback) => callback(timestamp));
    },
    pendingFrames() {
      return frames.size;
    }
  };
}

test("clampProgress limits progress to the closed zero-to-one range", () => {
  assert.equal(clampProgress(-0.25), 0);
  assert.equal(clampProgress(0.4), 0.4);
  assert.equal(clampProgress(1.25), 1);
});

test("interpolateProgress converges monotonically without overshoot", () => {
  const forward = interpolateProgress(0.2, 1, 16);
  const backward = interpolateProgress(0.8, 0, 16);
  assert.ok(forward > 0.2 && forward < 1);
  assert.ok(backward < 0.8 && backward > 0);
});

test("elapsed-time interpolation is comparable across refresh rates", () => {
  let at60Hz = 0;
  let at120Hz = 0;

  for (let elapsed = 0; elapsed < 1000; elapsed += 1000 / 60) {
    at60Hz = interpolateProgress(at60Hz, 1, 1000 / 60);
  }

  for (let elapsed = 0; elapsed < 1000; elapsed += 1000 / 120) {
    at120Hz = interpolateProgress(at120Hz, 1, 1000 / 120);
  }

  assert.ok(Math.abs(at60Hz - at120Hz) < 0.002);
});

test("default smoothing softens a wheel step without leaving a visible delay", () => {
  let progress = 0;

  for (let frame = 0; frame < 4; frame += 1) {
    progress = interpolateProgress(progress, 1, 16);
  }

  assert.ok(progress > 0.97, `expected a fast response, received ${progress}`);

  for (let frame = 4; frame < 8; frame += 1) {
    progress = interpolateProgress(progress, 1, 16);
  }

  assert.equal(progress, 1);
});

test("createProgressSmoother renders immediately when requested and then settles", () => {
  const windowRef = createFrameWindow();
  const rendered = [];
  const smoother = createProgressSmoother(windowRef, (value) => rendered.push(value));

  smoother.setTarget(0.25, { immediate: true });
  assert.deepEqual(rendered, [0.25]);

  smoother.setTarget(1);
  for (let frame = 1; frame <= 60 && windowRef.pendingFrames(); frame += 1) {
    windowRef.runFrame(frame * (1000 / 60));
  }

  assert.equal(smoother.getValue(), 1);
  assert.equal(rendered.at(-1), 1);
  assert.equal(windowRef.pendingFrames(), 0);
});

test("retargeting reverses from the rendered value and destroy cancels work", () => {
  const windowRef = createFrameWindow();
  const rendered = [];
  const smoother = createProgressSmoother(windowRef, (value) => rendered.push(value));

  smoother.setTarget(1);
  windowRef.runFrame(16);
  const forwardValue = smoother.getValue();
  smoother.setTarget(0);
  windowRef.runFrame(32);

  assert.ok(smoother.getValue() < forwardValue);
  smoother.setTarget(1);
  smoother.destroy();
  assert.equal(windowRef.pendingFrames(), 0);
});
