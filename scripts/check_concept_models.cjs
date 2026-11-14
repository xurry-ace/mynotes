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
// 地址空间逐字节遍历；用位运算和独立映射核对商余数转换。
const expectedFrames = [5, 2, null, null, 1, 6, 0, 3];
for (let address = 0; address < 8192; address++) {
  const r = M.pagingLookup(address), page = address >> 10, offset = address & 1023;
  assert.equal(r.page, page); assert.equal(r.offset, offset);
  assert.equal(r.status, page === 2 ? "fault" : page === 3 ? "invalid" : [0, 4].includes(page) ? "tlb-hit" : "table-hit");
  assert.equal(r.physical, expectedFrames[page] === null ? null : (expectedFrames[page] << 10) | offset);
  if (r.physical !== null) assert.equal(r.physical & 1023, offset);
  assert.equal(parseInt(r.bits, 2), address);
}
for (const invalid of [-1, 8192, .5, NaN, Infinity]) assert.throws(() => M.pagingLookup(invalid), RangeError);

// 参考实现不维护页框位置：FIFO 记装入时间；LRU 回查原始序列的最后使用位置。
function referenceFaults(trace, capacity, policy) {
  const resident = new Set(), loaded = new Map(); let faults = 0;
  trace.forEach((page, index) => {
    if (resident.has(page)) return;
    faults++;
    if (resident.size === capacity) {
      const rank = p => policy === "FIFO" ? loaded.get(p) : trace.slice(0, index).lastIndexOf(p);
      const victim = [...resident].sort((a, b) => rank(a) - rank(b))[0];
      resident.delete(victim);
    }
    resident.add(page); loaded.set(page, index);
  });
  return faults;
}
let replacementCases = 0;
for (let n = 1; n <= 7; n++) allArrays(n, values => {
  const trace = values.map(v => v + 1); let lastLRU = Infinity;
  for (let capacity = 1; capacity <= 4; capacity++) for (const policy of ["FIFO", "LRU"]) {
    const frames = M.replacementFrames(trace, capacity, policy), final = frames.at(-1);
    assert.equal(final.faults, referenceFaults(trace, capacity, policy));
    assert.equal(final.replacements, Math.max(0, final.faults - capacity));
    for (const [i, f] of frames.entries()) {
      const occupied = f.slots.filter(p => p !== null);
      assert.equal(new Set(occupied).size, occupied.length);
      assert.deepEqual([...f.order].sort(), [...occupied].sort());
      if (i) assert.ok(occupied.includes(trace[i - 1]));
    }
    if (policy === "LRU") { assert.ok(final.faults <= lastLRU); lastLRU = final.faults; }
    replacementCases++;
  }
});
const anomaly = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
assert.deepEqual([3, 4].map(c => M.replacementFrames(anomaly, c, "FIFO").at(-1).faults), [9, 10]);
assert.deepEqual([3, 4].map(c => M.replacementFrames(anomaly, c, "LRU").at(-1).faults), [10, 8]);

// 独立按单位时间模拟 CPU；被测模型按事件跳时，分别比较每个时间单位与最终指标。
function tickSchedule(input, policy, quantum) {
  const jobs = input.map(j => ({ ...j, remaining: j.burst, first: null, finish: null }));
  const ready = [], ticks = []; let current = null, slice = 0, done = 0;
  for (let t = 0; ; t++) {
    jobs.forEach(j => { if (j.arrival === t) ready.push(j); });
    if (current && current.remaining === 0) { current.finish = t; current = null; done++; }
    else if (current && policy === "RR" && slice === quantum) { ready.push(current); current = null; }
    if (done === jobs.length) break;
    if (!current && ready.length) { current = ready.shift(); slice = 0; if (current.first === null) current.first = t; }
    ticks.push(current ? current.id : null);
    if (current) { current.remaining--; slice++; }
    assert.ok(t < 100, "reference simulation should finish");
  }
  return { ticks, jobs: jobs.map(j => ({ ...j, response: j.first - j.arrival, turnaround: j.finish - j.arrival, waiting: j.finish - j.arrival - j.burst })) };
}
let schedulingCases = 0;
for (let encoded = 0; encoded < 1728; encoded++) {
  let code = encoded;
  const input = ["A", "B", "C"].map(id => { const arrival = code % 4; code = Math.floor(code / 4); const burst = code % 3 + 1; code = Math.floor(code / 3); return { id, arrival, burst }; });
  for (const [policy, quantum] of [["FCFS", 2], ["RR", 1], ["RR", 2], ["RR", 3]]) {
    const frames = M.scheduleFrames(input, policy, quantum), final = frames.at(-1), oracle = tickSchedule(input, policy, quantum);
    assert.deepEqual(final.jobs, oracle.jobs);
    assert.deepEqual(final.segments.flatMap(s => Array(s.end - s.start).fill(s.id)), oracle.ticks);
    assert.ok(final.jobs.every(j => j.first >= j.arrival && j.waiting >= 0));
    assert.equal(final.completed, input.length);
    assert.ok(frames.every(f => new Set(f.ready).size === f.ready.length));
    assert.deepEqual(frames[0].segments, []);
    schedulingCases++;
  }
}
const boundary = M.scheduleFrames([{ id: "A", arrival: 0, burst: 5 }, { id: "B", arrival: 1, burst: 3 }, { id: "C", arrival: 4, burst: 1 }], "RR", 2);
assert.deepEqual(boundary.find(f => f.clock === 4).ready, ["A", "C", "B"]);
assert.throws(() => M.scheduleFrames([{ id: "A", arrival: 0, burst: 0 }], "RR"), RangeError);

// 穷举两进程各自程序的合法交错执行；独立对等待边做 DFS 环检测。
function graphHasCycle(edges) {
  const visit = (node, path) => {
    if (path.includes(node)) return true;
    return edges.filter(e => e.from === node).some(e => visit(e.to, [...path, node]));
  };
  return ["A", "B"].some(p => visit(p, []));
}
let lockPaths = 0, deadlockPaths = 0;
for (const opposite of [false, true]) {
  const program = p => {
    const order = opposite && p === "B" ? ["L2", "L1"] : ["L1", "L2"];
    return [...order.map(lock => ({ process: p, lock, op: "acquire" })), ...[...order].reverse().map(lock => ({ process: p, lock, op: "release" }))];
  };
  const programs = { A: program("A"), B: program("B") }; let cyclic = 0, complete = 0;
  function interleave(events, counters) {
    const history = M.resourceTrace(events), f = history.at(-1);
    assert.deepEqual(history[0].owners, { L1: null, L2: null });
    assert.equal(f.deadlocked, graphHasCycle(f.edges));
    for (const [p, lock] of Object.entries(f.waiting)) if (lock !== null) assert.ok(f.owners[lock] !== null && f.owners[lock] !== p);
    const runnable = ["A", "B"].filter(p => counters[p] < 4 && f.waiting[p] === null);
    if (!runnable.length) {
      lockPaths++;
      if (counters.A === 4 && counters.B === 4) { complete++; assert.deepEqual(f.owners, { L1: null, L2: null }); assert.equal(f.deadlocked, false); }
      else { cyclic++; deadlockPaths++; assert.equal(f.deadlocked, true); }
      return;
    }
    for (const p of runnable) interleave([...events, programs[p][counters[p]]], { ...counters, [p]: counters[p] + 1 });
  }
  interleave([], { A: 0, B: 0 });
  assert.ok(complete > 0);
  if (opposite) assert.ok(cyclic > 0); else assert.equal(cyclic, 0);
}
assert.throws(() => M.resourceTrace([{ process: "A", lock: "L1", op: "release" }]), RangeError);
assert.throws(() => M.resourceTrace([{ process: "A", lock: "L1", op: "acquire" }, { process: "A", lock: "L1", op: "acquire" }]), RangeError);

// 独立展开“文件中每个字节到设备字节”的固定映射，不复用被测查询的索引分支。
const fileByteMap = [12, 7, 25, 9, 31, 18, 44, 21, 52, 16].flatMap(block => Array.from({ length: 1024 }, (_, i) => block * 1024 + i)).slice(0, 9500);
fileByteMap.forEach((deviceOffset, offset) => {
  const r = M.fileLookup(offset);
  assert.equal(r.deviceOffset, deviceOffset);
  assert.equal(r.diskBlock, Math.floor(deviceOffset / 1024));
  assert.equal(r.within, offset & 1023);
  assert.equal(r.indirect, offset >= 4096);
  assert.equal(r.entry, Math.floor(offset / 1024) - (offset < 4096 ? 0 : 4));
});
assert.equal(M.fileLookup(9500).status, "eof"); assert.equal(M.fileLookup(9500).deviceOffset, null);
for (const invalid of [-1, 9501, .5, NaN]) assert.throws(() => M.fileLookup(invalid), RangeError);

// 参考 SCAN / LOOK 每次只移动一个磁道；与事件跳转实现比较总距离和服务次序。
function walkDisk(requests, head, policy, direction, maxTrack) {
  let position = head, total = 0;
  const pending = requests.map((track, id) => ({ track, id })), served = [];
  const take = index => { const [r] = pending.splice(index, 1); total += Math.abs(r.track - position); position = r.track; served.push(r.id); };
  if (policy === "FCFS") while (pending.length) take(0);
  else if (policy === "SSTF") while (pending.length) {
    let best = 0;
    pending.forEach((r, i) => { const a = Math.abs(r.track - position), b = Math.abs(pending[best].track - position); if (a < b || (a === b && r.track < pending[best].track)) best = i; });
    take(best);
  } else while (pending.length) {
    for (let i = 0; i < pending.length;) { if (pending[i].track === position) take(i); else i++; }
    if (!pending.length) break;
    if (policy === "LOOK" && !pending.some(r => (r.track - position) * direction > 0)) direction *= -1;
    if (policy === "SCAN" && (position === 0 && direction < 0 || position === maxTrack && direction > 0)) direction *= -1;
    position += direction; total++;
    assert.ok(position >= 0 && position <= maxTrack);
  }
  return { position, total, served };
}
let diskCases = 0;
for (let n = 0; n <= 5; n++) allArrays(n, values => {
  const requests = values.map(v => v + 2), original = [...requests];
  for (let head = 0; head <= 4; head++) for (const direction of [-1, 1]) for (const policy of ["FCFS", "SSTF", "SCAN", "LOOK"]) {
    const frames = M.diskFrames(requests, head, policy, direction, 4), f = frames.at(-1), oracle = walkDisk(requests, head, policy, direction, 4);
    assert.deepEqual({ position: f.position, total: f.total, served: f.served }, oracle);
    assert.equal(f.total, f.path.slice(1).reduce((sum, p, i) => sum + Math.abs(p.track - f.path[i].track), 0));
    assert.deepEqual([...f.served].sort((a, b) => a - b), requests.map((_, i) => i));
    frames.forEach((state, i) => { if (state.kind === "turn") { assert.equal(state.requestId, null); assert.ok([0, 4].includes(state.position)); assert.equal(state.served.length, frames[i - 1].served.length); } });
    assert.deepEqual(requests, original); diskCases++;
  }
});
const diskExample = [98, 183, 37, 122, 14, 124, 65, 67];
assert.deepEqual(["FCFS", "SSTF", "SCAN", "LOOK"].map(p => M.diskFrames(diskExample, 53, p).at(-1).total), [640, 236, 331, 299]);
assert.deepEqual(["SCAN", "LOOK"].map(p => M.diskFrames(diskExample, 53, p, -1).at(-1).total), [236, 208]);

console.log(`PASS: ${lockPaths} legal lock schedules (${deadlockPaths} deadlocked); 9500 file bytes; ${diskCases} disk schedules vs track-by-track walk.`);
console.log(`PASS: 8192 addresses; ${replacementCases} replacement cases; ${schedulingCases} schedules vs unit-time simulation.`);
console.log("PASS: existing arithmetic, cache, pipeline, metrics and reference checks.");
console.log(`PASS: ${partitionCases} partition arrays; ${rangeCases} range sums; queens 1..5 vs exhaustive search; 400 heap operations.`);
