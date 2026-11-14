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
  function partitionFrames(input) {
    if (!input.length || !input.every(Number.isFinite)) throw new RangeError("数组应包含有限数值");
    const values = [...input], origin = Math.floor((values.length - 1) / 2), pivot = values[origin];
    let i = 0, j = values.length - 1;
    const frames = [];
    const record = (phase, message, changed = []) => frames.push({ values: [...values], i, j, pivot, origin, phase, message, changed: [...changed] });
    record("start", `从初始下标 ${origin} 取出 pivot = ${pivot}；本轮始终使用这个值。`);
    while (i <= j) {
      while (values[i] < pivot) {
        const old = i++;
        record("scan", `a[${old}] = ${values[old]} < ${pivot}，i 右移到 ${i}。`);
      }
      while (values[j] > pivot) {
        const old = j--;
        record("scan", `a[${old}] = ${values[old]} > ${pivot}，j 左移到 ${j}。`);
      }
      if (i <= j) {
        const a = values[i], b = values[j];
        [values[i], values[j]] = [values[j], values[i]];
        record("swap", `交换下标 ${i}、${j} 的值 ${a}、${b}。相等时也允许交换；接着两端都要前进一步。`, [i, j]);
        i++; j--;
        record("advance", `i 右移、j 左移，变为 i=${i}，j=${j}。${i > j ? "指针已交错。" : "继续扫描尚未处理的区间。"}`);
      }
    }
    record("done", `本轮结束。下一步分别处理 [0, ${j}] 与 [${i}, ${values.length - 1}] 中长度超过 1 的区间；分区不保证两边内部有序。`);
    return frames;
  }

  function prefixQuery(values, left, right) {
    if (!values.length || !values.every(Number.isFinite)) throw new RangeError("数组应包含有限数值");
    if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > values.length || left > right) throw new RangeError(`请输入 1 ≤ L ≤ R ≤ ${values.length} 的整数`);
    const prefix = [0];
    values.forEach(value => prefix.push(prefix[prefix.length - 1] + value));
    return { prefix, left, right, whole: prefix[right], removed: prefix[left - 1], sum: prefix[right] - prefix[left - 1] };
  }

  function queensFrames(n = 4) {
    if (!Number.isInteger(n) || n < 1 || n > 5) throw new RangeError("教学棋盘应为 1～5 行");
    const positions = [], frames = [];
    let solutions = 0, attempts = 0;
    const record = (phase, row, col, message, conflicts = []) => frames.push({ n, positions: [...positions], phase, row, col, message, solutions, attempts, conflicts });
    record("start", 0, null, "从第 1 行开始，每行按从左到右的顺序尝试。先判断列和对角线，再决定是否放置。");
    function visit(row) {
      if (row === n) {
        solutions++;
        record("solution", null, null, `找到第 ${solutions} 个解：[${positions.map(c => c + 1).join(", ")}]。继续枚举时仍需返回并撤销选择。`);
        return;
      }
      for (let col = 0; col < n; col++) {
        attempts++;
        const conflicts = [];
        positions.forEach((c, r) => {
          const kind = c === col ? "同列" : r - c === row - col ? "同一条 \\ 对角线" : r + c === row + col ? "同一条 / 对角线" : "";
          if (kind) conflicts.push({ row: r, col: c, kind });
        });
        if (conflicts.length) record("reject", row, col, `拒绝 (${row + 1}, ${col + 1})：${conflicts.map(c => `与第 ${c.row + 1} 行皇后${c.kind}`).join("；")}。棋盘不变，不进入下一层。`, conflicts);
        else {
          positions.push(col);
          record("place", row, col, `在 (${row + 1}, ${col + 1}) 放置皇后，进入下一行。`);
          visit(row + 1);
          positions.pop();
          record("remove", row, col, `撤销 (${row + 1}, ${col + 1}) 的皇后，回到这一层继续检查其他选择。`);
        }
      }
    }
    visit(0);
    record("done", null, null, `全部分支枚举完毕，共 ${solutions} 个解。最后的棋盘为空，是因为每次放置都已对应撤销。`);
    return frames;
  }

  function heapFrames(input, operation, value = 10) {
    if (!input.every(Number.isFinite) || !Number.isFinite(value)) throw new RangeError("堆元素必须是有限数值");
    if (input.some((x, i) => i > 0 && input[Math.floor((i - 1) / 2)] < x)) throw new RangeError("初始数组必须满足大根堆序");
    if (!["push", "pop"].includes(operation) || (operation === "pop" && !input.length)) throw new RangeError("操作不合法或堆为空");
    const values = [...input], frames = [];
    const removed = operation === "pop" ? values[0] : null;
    const record = (phase, message, active = []) => frames.push({ values: [...values], phase, message, active: [...active], removed });
    record("start", operation === "push" ? `准备插入 ${value}。先放到末尾，再沿父节点方向恢复堆序。` : `准备弹出堆顶 ${removed}。图中的树与数组是同一组元素的两种表示。`);
    if (operation === "push") {
      values.push(value);
      let child = values.length - 1;
      record("repair", `${value} 加到数组末尾，下标为 ${child}。`, [child]);
      while (child > 0) {
        const parent = Math.floor((child - 1) / 2);
        if (values[parent] >= values[child]) break;
        [values[parent], values[child]] = [values[child], values[parent]];
        record("repair", `孩子比父节点大，交换下标 ${child} 与 ${parent}，向上维护。`, [child, parent]);
        child = parent;
      }
    } else {
      const last = values.pop();
      if (values.length) {
        values[0] = last;
        record("repair", `移除堆顶后，把原末尾的 ${last} 移到根位置，接着向下维护。`, [0]);
        let parent = 0;
        while (2 * parent + 1 < values.length) {
          let child = 2 * parent + 1;
          if (child + 1 < values.length && values[child + 1] > values[child]) child++;
          if (values[parent] >= values[child]) break;
          [values[parent], values[child]] = [values[child], values[parent]];
          record("repair", `在现有孩子中选择较大的一个，交换下标 ${parent} 与 ${child}，向下维护。`, [parent, child]);
          parent = child;
        }
      }
    }
    record("done", values.length ? `堆序恢复，当前堆顶为 ${values[0]}。数组只满足父节点不小于孩子，不要求从左到右整体有序。` : "堆已为空，不能再读取 top()。");
    return frames;
  }

  // 页表与 TLB 是固定的教学快照；一次查询不会改变下一次查询的初始状态。
  const pagingTable = Object.freeze([
    { frame: 5 }, { frame: 2 }, { absent: true }, { unmapped: true },
    { frame: 1 }, { frame: 6 }, { frame: 0 }, { frame: 3 }
  ].map(Object.freeze));
  const teachingTLB = Object.freeze([0, 4]);
  function pagingLookup(address) {
    if (!Number.isInteger(address) || address < 0 || address >= 8192) throw new RangeError("请输入 0～8191 的整数地址（单位：B）");
    const pageSize = 1024, page = Math.floor(address / pageSize), offset = address % pageSize;
    const entry = pagingTable[page], tlbHit = teachingTLB.includes(page);
    const status = entry.unmapped ? "invalid" : entry.absent ? "fault" : tlbHit ? "tlb-hit" : "table-hit";
    return { address, pageSize, page, offset, tlbHit, status, frame: entry.frame ?? null,
      physical: entry.frame === undefined ? null : entry.frame * pageSize + offset,
      bits: address.toString(2).padStart(13, "0") };
  }

  function replacementFrames(trace, capacity, policy) {
    if (!trace.every(p => Number.isInteger(p) && p >= 0) || !Number.isInteger(capacity) || capacity < 1 || capacity > 8 || !["FIFO", "LRU"].includes(policy)) throw new RangeError("页面序列、页框数或置换策略不合法");
    const slots = Array(capacity).fill(null), order = [], frames = [];
    let faults = 0, replacements = 0;
    const record = (page, hit, slot, evicted) => frames.push({ slots: [...slots], order: [...order], faults, replacements, page, hit, slot, evicted });
    record(null, null, -1, null);
    trace.forEach(page => {
      let slot = slots.indexOf(page), evicted = null;
      const hit = slot >= 0;
      if (!hit) {
        faults++;
        slot = slots.indexOf(null);
        if (slot < 0) {
          evicted = order.shift(); slot = slots.indexOf(evicted); replacements++;
        }
        slots[slot] = page; order.push(page);
      } else if (policy === "LRU") {
        order.splice(order.indexOf(page), 1); order.push(page);
      }
      record(page, hit, slot, evicted);
    });
    return frames;
  }

  function scheduleFrames(input, policy, quantum = 2) {
    if (!input.length || input.length > 8 || new Set(input.map(j => j.id)).size !== input.length || input.some(j => typeof j.id !== "string" || !j.id || !Number.isInteger(j.arrival) || j.arrival < 0 || !Number.isInteger(j.burst) || j.burst < 1 || j.burst > 20) || !["FCFS", "RR"].includes(policy) || !Number.isInteger(quantum) || quantum < 1) throw new RangeError("进程参数、调度算法或时间片不合法");
    const jobs = input.map((j, index) => ({ ...j, index, remaining: j.burst, first: null, finish: null }));
    const arrivals = [...jobs].sort((a, b) => a.arrival - b.arrival || a.index - b.index);
    const ready = [], segments = [], frames = [];
    let clock = 0, cursor = 0, completed = 0;
    const admit = () => { while (cursor < arrivals.length && arrivals[cursor].arrival <= clock) ready.push(arrivals[cursor++]); };
    const record = message => frames.push({ clock, ready: ready.map(j => j.id), segments: segments.map(s => ({ ...s })), completed,
      jobs: jobs.map(j => ({ id: j.id, arrival: j.arrival, burst: j.burst, remaining: j.remaining, first: j.first, finish: j.finish,
        response: j.first === null ? null : j.first - j.arrival,
        turnaround: j.finish === null ? null : j.finish - j.arrival,
        waiting: j.finish === null ? null : j.finish - j.arrival - j.burst })), message });
    admit(); record("从 t=0 开始。每次前进一步，展示一个执行区间结束后的就绪队列与累计指标。");
    while (completed < jobs.length) {
      if (!ready.length) {
        const start = clock; clock = arrivals[cursor].arrival;
        segments.push({ id: null, start, end: clock }); admit();
        record(`t=${start}～${clock}：没有就绪进程，CPU 空闲；到达的新进程进入队列。`);
        continue;
      }
      const job = ready.shift(), start = clock;
      if (job.first === null) job.first = clock;
      clock += policy === "FCFS" ? job.remaining : Math.min(quantum, job.remaining);
      job.remaining -= clock - start; segments.push({ id: job.id, start, end: clock });
      // 到达事件（包括时间片结束这一刻）先入队，未完成的当前进程随后回到队尾。
      admit();
      if (!job.remaining) { job.finish = clock; completed++; }
      else ready.push(job);
      record(`t=${start}～${clock}：${job.id} 运行 ${clock - start} 个时间单位，${job.remaining ? `还剩 ${job.remaining}，回到队尾。` : "已完成。"}${policy === "RR" ? "到达的新进程先入队，再将未完成的当前进程放到队尾。" : "FCFS 不因新进程到达而抢占。"}`);
    }
    return frames;
  }

  return { signedAdd, cacheFrames, pipeline, classification, references, vector, samples, stages,
    partitionFrames, prefixQuery, queensFrames, heapFrames, pagingTable, teachingTLB, pagingLookup,
    replacementFrames, scheduleFrames };
});
