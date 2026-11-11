// 运行：node scripts/check_concept_models.cjs，无测试框架依赖。
const assert = require("node:assert/strict");
const M = require("../docs/javascripts/concept-models.js");

// 穷举 8 位有符号加法，用独立的符号规则交叉验证溢出判定。
for (let a = -128; a <= 127; a++) for (let b = -128; b <= 127; b++) {
  const r = M.signedAdd(a, b);
  const bySigns = (a >= 0 && b >= 0 && r.decoded < 0) || (a < 0 && b < 0 && r.decoded >= 0);
  assert.equal(r.overflow, bySigns);
  assert.ok((r.decoded - a - b) % 256 === 0);
  assert.equal(r.resultBits.length, 8);
}
assert.equal(M.signedAdd(-1, -1).carry, true);
assert.equal(M.signedAdd(-1, -1).overflow, false);
assert.equal(M.signedAdd(100, 60).carry, false);
assert.equal(M.signedAdd(100, 60).overflow, true);
assert.throws(() => M.signedAdd(128, 0), RangeError);
assert.throws(() => M.signedAdd(1.5, 0), RangeError);

const trace = [0, 4, 0, 4, 1, 5, 1, 5];
assert.equal(M.cacheFrames(trace, 1).at(-1).hits, 0);
assert.equal(M.cacheFrames(trace, 2).at(-1).hits, 4);
const lru = M.cacheFrames([0, 4, 0, 8], 2);
assert.equal(lru.at(-1).evicted, 4); // 命中 0 后，4 才是最近最少使用者。
assert.deepEqual(lru[0].sets, [[null, null], [null, null]]); // 旧帧不受后来访问污染。
assert.equal(M.cacheFrames([0, 4, 8, 0, 4, 8], 2).at(-1).hits, 0);

for (let n = 1; n <= 12; n++) {
  const schedule = M.pipeline(n);
  assert.equal(schedule.rows[0][4].cycle, 5);
  assert.equal(schedule.rows.at(-1)[4].cycle, n + 4);
  assert.equal(schedule.serial, 5 * n);
  for (let t = 1; t <= schedule.total; t++) {
    const active = schedule.rows.flat().filter(s => s.cycle === t).map(s => s.stage);
    assert.equal(active.length, new Set(active).size); // 每段每周期至多处理一条指令。
  }
}

const half = M.classification(.5), low = M.classification(.35), high = M.classification(1);
assert.deepEqual([half.tp, half.fp, half.tn, half.fn], [1, 0, 2, 1]);
assert.equal(half.precision, 1); assert.equal(half.recall, .5); assert.equal(half.accuracy, .75);
assert.deepEqual([low.tp, low.fp, low.tn, low.fn], [2, 1, 1, 0]);
assert.equal(high.precision, null);
let previous = M.classification(0);
for (let i = 1; i <= 100; i++) {
  const r = M.classification(i / 100);
  assert.equal(r.tp + r.fp + r.tn + r.fn, 4);
  assert.ok(r.tp <= previous.tp && r.fp <= previous.fp);
  previous = r;
}
const positives = M.samples.filter(s => s.truth), negatives = M.samples.filter(s => !s.truth);
const pairWins = positives.reduce((sum, p) => sum + negatives.filter(n => p.score > n.score).length, 0);
assert.equal(pairWins / (positives.length * negatives.length), .75); // 排序法独立核对 AUC。

const refs = M.references();
assert.deepEqual(refs[4].outputs, { a: "[1,[2,3],4]", b: "[1,[2,3],4]", c: "[1,[2,3]]" });
assert.deepEqual(refs[0].inner, [2]);
assert.equal(M.vector()[1].moved, false);
assert.equal(M.vector()[2].moved, true);
console.log("PASS: 65,536 signed additions; cache conflict and LRU; 12 pipeline schedules; classification thresholds and AUC; reference snapshots; vector states.");
