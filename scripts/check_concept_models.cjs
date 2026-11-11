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

// 穷举短数组，分别核对分区不变量、元素多重集与完整递归后的排序结果。
let partitionCases = 0, rangeCases = 0;
function allArrays(n, visit, prefix = []) {
  if (!n) { visit(prefix); return; }
  for (const value of [-1, 0, 1]) allArrays(n - 1, visit, [...prefix, value]);
}
function recursivelySort(input) {
  if (input.length < 2) return input;
  const f = M.partitionFrames(input).at(-1);
  const left = f.values.slice(0, f.j + 1), middle = f.values.slice(f.j + 1, f.i), right = f.values.slice(f.i);
  assert.ok(left.length < input.length && right.length < input.length);
  return [...recursivelySort(left), ...middle, ...recursivelySort(right)];
}
for (let n = 1; n <= 7; n++) allArrays(n, input => {
  const original = [...input], frames = M.partitionFrames(input), f = frames.at(-1);
  assert.deepEqual(input, original);
  assert.deepEqual(frames[0].values, input);
  assert.deepEqual([...f.values].sort((a, b) => a - b), [...input].sort((a, b) => a - b));
  assert.ok(f.i > f.j);
  assert.ok(f.values.slice(0, f.j + 1).every(v => v <= f.pivot));
  assert.ok(f.values.slice(f.i).every(v => v >= f.pivot));
  assert.ok(f.values.slice(f.j + 1, f.i).every(v => v === f.pivot));
  assert.deepEqual(recursivelySort(input), [...input].sort((a, b) => a - b));
  partitionCases++;
});
for (let n = 1; n <= 5; n++) allArrays(n, input => {
  for (let l = 1; l <= n; l++) for (let r = l; r <= n; r++) {
    assert.equal(M.prefixQuery(input, l, r).sum, input.slice(l - 1, r).reduce((a, b) => a + b, 0));
    rangeCases++;
  }
});
assert.throws(() => M.prefixQuery([1, 2], 2, 1), RangeError);
assert.throws(() => M.prefixQuery([1, 2], 0, 1), RangeError);
assert.throws(() => M.prefixQuery([1, 2], 1, 3), RangeError);

// 与不剪枝的完整排列枚举交叉验证皇后解，不复用被测的冲突标记算法。
function bruteQueens(n) {
  const results = [];
  function enumerate(path) {
    if (path.length === n) {
      const valid = path.every((c, r) => path.every((d, s) => r === s || (c !== d && Math.abs(r - s) !== Math.abs(c - d))));
      if (valid) results.push(path);
      return;
    }
    for (let c = 0; c < n; c++) enumerate([...path, c]);
  }
  enumerate([]); return results;
}
for (let n = 1; n <= 5; n++) {
  const frames = M.queensFrames(n), solutions = frames.filter(f => f.phase === "solution");
  assert.deepEqual(solutions.map(f => f.positions), bruteQueens(n));
  assert.deepEqual(frames.at(-1).positions, []);
  assert.equal(frames.at(-1).solutions, solutions.length);
  for (const f of frames) {
    assert.ok(f.positions.every((c, r) => f.positions.every((d, s) => r === s || (c !== d && Math.abs(r - s) !== Math.abs(c - d)))));
    if (f.phase === "reject") assert.ok(f.conflicts.length > 0 && f.positions.length === f.row);
  }
}
assert.deepEqual(M.queensFrames().filter(f => f.phase === "solution").map(f => f.positions), [[1, 3, 0, 2], [2, 0, 3, 1]]);

// 独立用有序多重集核对 push/pop 的元素结果，并检查最终父子关系。
let seed = 11;
for (let t = 0; t < 200; t++) {
  seed = (seed * 48271) % 2147483647;
  const input = Array.from({ length: t % 8 + 1 }, (_, i) => (seed + i * 7) % 17 - 8).sort((a, b) => b - a);
  for (const operation of ["push", "pop"]) {
    const expected = operation === "push" ? [...input, 10] : input.slice(1);
    const frames = M.heapFrames(input, operation), actual = frames.at(-1).values;
    assert.deepEqual([...actual].sort((a, b) => a - b), expected.sort((a, b) => a - b));
    assert.ok(actual.every((v, i) => i === 0 || actual[Math.floor((i - 1) / 2)] >= v));
    assert.deepEqual(frames[0].values, input);
  }
}
console.log("PASS: existing arithmetic, cache, pipeline, metrics and reference checks.");
console.log(`PASS: ${partitionCases} partition arrays; ${rangeCases} range sums; queens 1..5 vs exhaustive search; 400 heap operations.`);
