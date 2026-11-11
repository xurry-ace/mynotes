/* 教学模型：计算逻辑与页面绘制分开，便于独立核对。 */
(function (root, factory) {
  const models = factory();
  if (typeof module === "object" && module.exports) module.exports = models;
  else root.NoteConceptModels = models;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const stages = ["IF", "ID", "EX", "MEM", "WB"];
  const samples = [{ id: 1, score: 0.1, truth: 0 }, { id: 2, score: 0.35, truth: 1 }, { id: 3, score: 0.4, truth: 0 }, { id: 4, score: 0.8, truth: 1 }];

  function signedAdd(a, b) {
    if (![a, b].every(v => Number.isInteger(v) && v >= -128 && v <= 127)) throw new RangeError("请输入 -128～127 的整数");
    const ua = (a + 256) % 256, ub = (b + 256) % 256;
    const encoded = (ua + ub) % 256;
    const decoded = encoded < 128 ? encoded : encoded - 256;
    const bits = n => n.toString(2).padStart(8, "0");
    return { a, b, aBits: bits(ua), bBits: bits(ub), resultBits: bits(encoded), encoded, decoded,
      exact: a + b, carry: ua + ub >= 256, overflow: a + b < -128 || a + b > 127 };
  }

  function cacheFrames(trace, ways, capacity = 4) {
    if (!Number.isInteger(ways) || ways < 1 || capacity % ways !== 0) throw new RangeError("组数必须为正整数");
    const count = capacity / ways;
    const sets = Array.from({ length: count }, () => Array(ways).fill(null));
    const age = Array.from({ length: count }, () => Array(ways).fill(-1));
    let hits = 0, misses = 0;
    const snapshot = (details) => ({ sets: sets.map(s => [...s]), hits, misses, ...details });
    const frames = [snapshot({ block: null, set: -1, way: -1, hit: null, evicted: null })];
    trace.forEach((block, clock) => {
      const set = block % count;
      let way = sets[set].indexOf(block);
      const hit = way >= 0;
      let evicted = null;
      if (hit) hits++;
      else {
        misses++;
        way = sets[set].indexOf(null);
        if (way < 0) way = age[set].indexOf(Math.min(...age[set]));
        evicted = sets[set][way];
        sets[set][way] = block;
      }
      age[set][way] = clock;
      frames.push(snapshot({ block, set, way, hit, evicted }));
    });
    return frames;
  }

  function pipeline(n) {
    if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError("指令条数应在 1～12 之间");
    return { total: n + 4, serial: n * 5, speedup: n * 5 / (n + 4), efficiency: n / (n + 4),
      rows: Array.from({ length: n }, (_, i) => stages.map((stage, j) => ({ stage, cycle: i + j + 1 }))) };
  }

  function classification(threshold) {
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) throw new RangeError("阈值应在 0～1 之间");
    const counts = { tp: 0, fp: 0, tn: 0, fn: 0 };
    const predictions = samples.map(s => {
      const positive = s.score >= threshold;
      const bucket = s.truth ? (positive ? "tp" : "fn") : (positive ? "fp" : "tn");
      counts[bucket]++;
      return { ...s, positive, bucket };
    });
    const { tp, fp, tn, fn } = counts;
    return { ...counts, predictions, precision: tp + fp ? tp / (tp + fp) : null,
      recall: tp / (tp + fn), fpr: fp / (fp + tn), accuracy: (tp + tn) / samples.length,
      f1: (2 * tp) / (2 * tp + fp + fn) };
  }

  function references() {
    const inner = [2], a = [1, inner];
    let b, c;
    const frames = [];
    const snapshot = (code, message) => frames.push({ code, message, names: b ? ["a", "b"] : ["a"], hasCopy: !!c,
      outer: a.map(v => Array.isArray(v) ? "→ L1" : String(v)),
      copy: c ? c.map(v => Array.isArray(v) ? "→ L1" : String(v)) : [], inner: [...inner],
      outputs: { a: JSON.stringify(a), ...(b ? { b: JSON.stringify(b) } : {}), ...(c ? { c: JSON.stringify(c) } : {}) } });
    snapshot("a = [1, [2]]", "a 绑定到外层列表 A。A 的第二个元素引用内层列表 L1。");
    b = a;
    snapshot("b = a", "赋值没有复制列表。a、b 绑定到同一个外层列表 A。");
    c = [...a];
    snapshot("c = a.copy()", "浅拷贝新建外层列表 C；其中的元素引用被复制，内层 L1 仍然共享。");
    inner.push(3);
    snapshot("a[1].append(3)", "改的是共享的内层 L1，所以 a、b、c 中看到的内层内容都变为 [2, 3]。");
    b.push(4);
    snapshot("b.append(4)", "改的是外层列表 A。a、b 同时多出 4，独立的外层列表 C 不增加元素。");
    return frames;
  }

  function vector() {
    return [
      { values: [10, 20, 30], capacity: 4, area: "A", code: "初始 size = 3，capacity = 4", moved: false,
        message: "有 3 个元素，还有 1 个预留位置。预留空间不属于现有元素，不能用 v[3] 访问。" },
      { values: [10, 20, 30, 40], capacity: 4, area: "A", code: "v.push_back(40)", moved: false,
        message: "容量足够，本次尾部插入不重新分配。指向原有元素的指针和引用仍有效，但旧的 end() 迭代器失效。" },
      { values: [10, 20, 30, 40, 50], capacity: 8, area: "B", code: "v.push_back(50)", moved: true,
        message: "新 size 超过旧 capacity，发生重新分配。本例假设新容量为 8；原有元素的指针、引用与迭代器全部失效。" }
    ];
  }
  return { signedAdd, cacheFrames, pipeline, classification, references, vector, samples, stages };
});
