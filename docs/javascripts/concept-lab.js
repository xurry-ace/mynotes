/* 只增强 data-concept-viz 标记的教学组件；静态文字是无脚本回退。 */
(() => {
  "use strict";
  const M = window.NoteConceptModels;
  if (!M) return;
  let serial = 0;
  const e = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const svg = (tag, attrs, text) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const fmt = value => value === null ? "未定义" : Number(value.toFixed(3)).toString();

  function shell(root, title) {
    const id = `concept-${++serial}`;
    const header = e("div", "study-viz__header");
    const heading = e("strong", "study-viz__title", title);
    heading.id = `${id}-title`;
    header.append(e("span", "study-viz__eyebrow", "观察 · 预测 · 验证"), heading);
    const settings = e("div", "concept-settings");
    const stage = e("div", "study-viz__stage");
    const status = e("p", "study-viz__explanation");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    root.setAttribute("role", "group");
    root.setAttribute("aria-labelledby", heading.id);
    root.replaceChildren(header, settings, stage, status);
    return { root, id, settings, stage, status };
  }

  function select(ui, title, options, value) {
    const label = e("label", "concept-field");
    label.append(e("span", "", title));
    const control = e("select");
    options.forEach(([value, title]) => {
      const option = e("option", "", title);
      option.value = value;
      control.append(option);
    });
    control.value = value;
    label.append(control);
    ui.settings.append(label);
    return control;
  }

  function stats(items) {
    const grid = e("div", "concept-stats");
    items.forEach(([label, value]) => {
      const item = e("div", "concept-stat");
      item.append(e("span", "", label), e("strong", "", value));
      grid.append(item);
    });
    return grid;
  }

  function steps(ui, length, render) {
    let index = 0, count = length;
    const bar = e("div", "study-viz__controls");
    const previous = e("button", "", "上一步"), next = e("button", "study-viz__next", "下一步"), reset = e("button", "", "重置");
    const progress = e("span", "study-viz__progress");
    [previous, next, reset].forEach(b => { b.type = "button"; });
    bar.append(previous, next, reset, progress);
    ui.root.append(bar);
    const update = () => {
      render(index);
      previous.disabled = index === 0;
      next.disabled = index === count - 1;
      progress.textContent = `${index} / ${count - 1}${index === count - 1 ? " · 完成" : ""}`;
    };
    previous.addEventListener("click", () => { if (index > 0) { index--; update(); } });
    next.addEventListener("click", () => { if (index < count - 1) { index++; update(); } });
    reset.addEventListener("click", () => { index = 0; update(); });
    update();
    const rebuild = newLength => { count = newLength; index = 0; update(); };
    rebuild.position = () => index;
    rebuild.jumpTo = target => { index = Math.max(0, Math.min(count - 1, target)); update(); };
    return rebuild;
  }

  function cache(root) {
    const ui = shell(root, "Cache · 同样 4 行，冲突为什么不同？");
    const traces = [[0, 4, 0, 4, 1, 5, 1, 5], [0, 4, 8, 0, 4, 8]];
    const choice = select(ui, "访问序列（主存块号）", [["0", "两个块反复冲突"], ["1", "同组放入三个块"]], "0");
    let trace = traces[0], direct = M.cacheFrames(trace, 1), associative = M.cacheFrames(trace, 2);
    const render = index => {
      const sequence = e("div", "concept-sequence");
      trace.forEach((v, i) => sequence.append(e("span", i === index - 1 ? "is-active" : i < index ? "is-past" : "", String(v))));
      const layouts = e("div", "concept-compare");
      [direct[index], associative[index]].forEach((frame, type) => {
        const panel = e("section", "concept-panel");
        panel.append(e("h4", "", type ? "2 路组相联 · 2 组 × 2 路" : "直接映射 · 4 组 × 1 路"));
        panel.append(e("p", "concept-caption", `组号 = 块号 mod ${frame.sets.length}`));
        frame.sets.forEach((set, s) => {
          const row = e("div", "cache-set");
          row.append(e("span", "cache-set__label", `组 ${s}`));
          set.forEach((block, w) => {
            const cell = e("div", `cache-line${frame.set === s && frame.way === w ? " is-active" : ""}`);
            cell.append(e("strong", "", block === null ? "空行" : `块 ${block}`));
            cell.append(e("span", "", block === null ? "V = 0" : `V = 1 · Tag ${Math.floor(block / frame.sets.length)}`));
            row.append(cell);
          });
          panel.append(row);
        });
        panel.append(stats([["命中 / 访问", `${frame.hits} / ${index}`], ["未命中", String(frame.misses)]]));
        const result = index ? `${frame.hit ? "命中" : "未命中"}：访问组 ${frame.set}${frame.evicted === null ? "" : `，替换块 ${frame.evicted}`}。` : "初始：所有行无效。";
        panel.append(e("p", `concept-result ${frame.hit ? "is-hit" : ""}`, result));
        layouts.append(panel);
      });
      ui.stage.replaceChildren(sequence, layouts);
      ui.status.textContent = index ? `第 ${index} 次访问：块 ${trace[index - 1]}。两种组织容量相同，均为 4 行；2 路组内按 LRU 选择被替换的行。` : "初始 Cache 为空。先预测块 0 和块 4 会映射到哪里，再点下一步。";
    };
    const rebuild = steps(ui, trace.length + 1, render);
    choice.addEventListener("change", () => {
      trace = traces[Number(choice.value)]; direct = M.cacheFrames(trace, 1); associative = M.cacheFrames(trace, 2); rebuild(trace.length + 1);
    });
  }

  function pipeline(root) {
    const ui = shell(root, "五级流水线 · 一条没变快，多条能重叠");
    const choice = select(ui, "连续指令条数", [["3", "3 条"], ["5", "5 条"], ["8", "8 条"]], "3");
    let n = 3, model = M.pipeline(n);
    const render = tick => {
      const scroll = e("div", "concept-table-scroll");
      scroll.tabIndex = 0;
      scroll.setAttribute("role", "region");
      scroll.setAttribute("aria-label", "流水线时空表，可横向滚动");
      const table = e("table", "pipeline-table");
      const caption = e("caption", "", "行是指令，列是周期；当前周期加框，未来阶段淡显。");
      const thead = e("thead"), head = e("tr");
      const corner = e("th", "", "指令"); corner.scope = "col"; head.append(corner);
      for (let t = 1; t <= model.total; t++) { const th = e("th", t === tick ? "is-now" : "", `T${t}`); th.scope = "col"; head.append(th); }
      thead.append(head);
      const body = e("tbody");
      model.rows.forEach((row, i) => {
        const tr = e("tr"), th = e("th", "", `I${i + 1}`); th.scope = "row"; tr.append(th);
        for (let t = 1; t <= model.total; t++) {
          const phase = row.find(s => s.cycle === t);
          tr.append(e("td", `${phase ? `phase-${phase.stage.toLowerCase()}` : ""}${t === tick ? " is-now" : ""}${t > tick ? " is-future" : ""}`, phase ? phase.stage : "·"));
        }
        body.append(tr);
      });
      table.append(caption, thead, body); scroll.append(table);
      const complete = Math.max(0, Math.min(n, tick - 4));
      ui.stage.replaceChildren(scroll, stats([["流水总周期", String(model.total)], ["串行总周期", String(model.serial)], ["理想加速比", `${model.speedup.toFixed(2)} 倍`], ["已完成指令", `${complete} / ${n}`]]));
      ui.status.textContent = tick === 0 ? "从空流水线开始。每个阶段占 1 个周期，每周期最多进入 1 条新指令；忽略寄存器开销和所有冒险。" : `第 ${tick} 周期结束，已有 ${complete} 条指令完成 WB。${tick < 5 ? "第一条指令尚未完成。" : tick === model.total ? `全部完成：5 + ${n} − 1 = ${model.total} 个周期。` : "后续每周期再完成一条。"}`;
    };
    const rebuild = steps(ui, model.total + 1, render);
    choice.addEventListener("change", () => { n = Number(choice.value); model = M.pipeline(n); rebuild(model.total + 1); });
  }

  function references(root) {
    const ui = shell(root, "Python 引用 · 赋值、浅拷贝与嵌套修改");
    const frames = M.references();
    steps(ui, frames.length, index => {
      const f = frames[index], diagram = e("div", "object-map");
      const objectRow = (names, name, values) => {
        const row = e("div", "object-row");
        row.append(e("strong", "object-binding", `${names.join("、")} →`));
        const object = e("div", "object-box");
        object.append(e("span", "concept-caption", name));
        const cells = e("div", "object-elements");
        values.forEach(v => cells.append(e("span", v.includes("L1") ? "is-shared" : "", v)));
        object.append(cells); row.append(object); diagram.append(row);
      };
      objectRow(f.names, "外层列表 A", f.outer);
      if (f.hasCopy) objectRow(["c"], "外层列表 C（新对象）", f.copy);
      const inner = e("div", "object-shared");
      inner.append(e("strong", "", `共同引用的内层 L1 = [${f.inner.join(", ")}]`), e("span", "concept-caption", "箭头表示引用；对象代号仅用于图解。"));
      diagram.append(inner);
      const code = e("pre", "concept-code"); code.append(e("code", "", f.code));
      const outputs = e("pre", "concept-output"); outputs.textContent = Object.entries(f.outputs).map(([name, value]) => `${name} → ${value}`).join("\n");
      ui.stage.replaceChildren(code, diagram, outputs);
      ui.status.textContent = f.message;
    });
  }

  function vector(root) {
    const ui = shell(root, "vector · size 是元素数，capacity 是空间上限");
    const frames = M.vector();
    steps(ui, frames.length, index => {
      const frame = frames[index], slots = e("div", "memory-slots");
      for (let i = 0; i < frame.capacity; i++) {
        const used = i < frame.values.length;
        const slot = e("div", `memory-slot${used ? "" : " is-reserved"}`);
        slot.append(e("span", "", `[${i}]`), e("strong", "", used ? String(frame.values[i]) : "预留"));
        slots.append(slot);
      }
      const code = e("pre", "concept-code"); code.append(e("code", "", frame.code));
      const region = e("p", "concept-caption", `当前存储区 ${frame.area}（示意代号，不是内存地址）`);
      ui.stage.replaceChildren(code, region, slots, stats([["size()", String(frame.values.length)], ["capacity()", String(frame.capacity)]]));
      if (frame.moved) ui.stage.append(e("p", "memory-released", "原存储区 A 已释放 · 旧指针 / 引用 / 迭代器不可再用于访问元素"));
      ui.status.textContent = frame.message;
    });
  }

  function signed(root) {
    const ui = shell(root, "8 位补码 · 进位与溢出是两件事");
    const inputs = [100, 60].map((value, i) => {
      const label = e("label", "concept-field"); label.append(e("span", "", i ? "加数 Y" : "加数 X"));
      const input = e("input"); input.type = "number"; input.min = "-128"; input.max = "127"; input.step = "1"; input.value = String(value);
      label.append(input); ui.settings.append(label); return input;
    });
    const render = () => {
      let result;
      try { result = M.signedAdd(...inputs.map(input => input.value === "" ? NaN : Number(input.value))); }
      catch (error) { ui.stage.replaceChildren(e("p", "concept-error", error.message)); ui.status.textContent = "输入范围：-128～127 的整数。"; return; }
      const rows = e("div", "bit-calculation");
      [["X", result.aBits], ["Y", result.bBits], ["低 8 位", result.resultBits]].forEach(([label, bits]) => {
        const row = e("div", "bit-row"); row.append(e("span", "", label));
        const cells = e("div", "bit-strip"); [...bits].forEach((bit, i) => cells.append(e("strong", i === 0 ? "is-sign" : "", bit)));
        row.append(cells); rows.append(row);
      });
      ui.stage.replaceChildren(rows, stats([["数学真值 X + Y", String(result.exact)], ["按补码解释低 8 位", String(result.decoded)], ["最高位进位 C", result.carry ? "1" : "0"], ["有符号溢出 V", result.overflow ? "1 · 溢出" : "0 · 未溢出"]]));
      ui.status.textContent = result.overflow ? `真值 ${result.exact} 超出 [-128, 127]。低 8 位虽然能解码为 ${result.decoded}，却不是本次有符号运算的正确数学结果。` : `真值 ${result.exact} 位于 [-128, 127]，与低 8 位的补码解码结果相同。最高位进位为 ${result.carry ? 1 : 0}，不能单独用它判断有符号溢出。`;
    };
    inputs.forEach(input => input.addEventListener("input", render));
    [["正溢出", 100, 60], ["有进位但不溢出", -1, -1], ["负溢出", -100, -60]].forEach(([name, a, b]) => {
      const button = e("button", "", name); button.type = "button";
      button.addEventListener("click", () => { inputs[0].value = a; inputs[1].value = b; render(); }); ui.settings.append(button);
    });
    render();
  }

  function rocPlot(result, threshold, id) {
    const plot = svg("svg", { viewBox: "0 0 410 310", class: "concept-roc", role: "img", "aria-labelledby": `${id}-roc` });
    plot.append(svg("title", { id: `${id}-roc` }, `ROC 曲线，AUC 为 0.75；当前 FPR 为 ${fmt(result.fpr)}，TPR 为 ${fmt(result.recall)}。`));
    [0, 0.5, 1].forEach(v => {
      const x = 55 + 300 * v, y = 255 - 210 * v;
      plot.append(svg("line", { x1: x, y1: 45, x2: x, y2: 255, class: "roc-grid" }), svg("line", { x1: 55, y1: y, x2: 355, y2: y, class: "roc-grid" }));
      plot.append(svg("text", { x, y: 278, "text-anchor": "middle" }, String(v)), svg("text", { x: 45, y: y + 5, "text-anchor": "end" }, String(v)));
    });
    plot.append(svg("line", { x1: 55, y1: 255, x2: 355, y2: 45, class: "roc-baseline" }));
    plot.append(svg("polyline", { points: "55,255 55,150 205,150 205,45 355,45", class: "roc-curve" }));
    plot.append(svg("circle", { cx: 55 + 300 * result.fpr, cy: 255 - 210 * result.recall, r: 7, class: "roc-point" }));
    plot.append(svg("text", { x: 55, y: 24 }, `τ = ${threshold.toFixed(2)} · AUC = 0.75`));
    plot.append(svg("text", { x: 205, y: 305, "text-anchor": "middle" }, "FPR（假正例率）"), svg("text", { x: 4, y: 20 }, "TPR"));
    return plot;
  }

  function metrics(root) {
    const ui = shell(root, "分类阈值 · 预测、混淆矩阵与 ROC 联动");
    const label = e("label", "concept-range");
    const text = e("span"), input = e("input");
    input.type = "range"; input.min = "0"; input.max = "100"; input.step = "5"; input.value = "50";
    label.append(text, input); ui.settings.append(label);
    const render = () => {
      const threshold = Number(input.value) / 100, result = M.classification(threshold);
      text.textContent = `分类阈值 τ = ${threshold.toFixed(2)}（评分 ≥ τ 判正）`;
      const layout = e("div", "concept-compare");
      const left = e("div"), right = e("div");
      const table = e("table", "confusion-matrix");
      const caption = e("caption", "", "先看真实类别，再看预测结果");
      const head = e("thead"), headRow = e("tr");
      ["真实 ↓ / 预测 →", "正类", "负类"].forEach(name => { const th = e("th", "", name); th.scope = "col"; headRow.append(th); }); head.append(headRow);
      const body = e("tbody");
      [["正类", "tp", "fn"], ["负类", "fp", "tn"]].forEach(([name, first, second]) => {
        const row = e("tr"), th = e("th", "", name); th.scope = "row"; row.append(th);
        [first, second].forEach(key => row.append(e("td", `matrix-${key}`, `${key.toUpperCase()} = ${result[key]}`))); body.append(row);
      });
      table.append(caption, head, body);
      left.append(table, stats([["Accuracy 准确率", fmt(result.accuracy)], ["Precision 查准率", fmt(result.precision)], ["Recall 查全率", fmt(result.recall)], ["F1", fmt(result.f1)]]));
      right.append(rocPlot(result, threshold, ui.id));
      const predictions = e("div", "score-samples");
      result.predictions.forEach(sample => predictions.append(e("div", `score-sample matrix-${sample.bucket}`, `#${sample.id} · 评分 ${sample.score} · 真实${sample.truth ? "正" : "负"} → 判${sample.positive ? "正" : "负"}`)));
      right.append(predictions); layout.append(left, right); ui.stage.replaceChildren(layout);
      ui.status.textContent = `阈值 ${threshold.toFixed(2)}：TP=${result.tp}，FP=${result.fp}，TN=${result.tn}，FN=${result.fn}。${result.precision === null ? "当前没有预测正类，查准率分母为 0，显示为未定义。" : ""}移动阈值改变 ROC 工作点，不改变这组固定评分的整条 ROC 曲线与 AUC。`;
    };
    input.addEventListener("input", render); render();
  }

  function arrayRow(values, describe) {
    const row = e("div", "algo-array");
    row.style.gridTemplateColumns = `repeat(${Math.max(1, values.length)}, minmax(0, 1fr))`;
    values.forEach((value, i) => {
      const hint = describe(i), cell = e("div", `algo-cell ${hint.className || ""}`);
      cell.append(e("span", "algo-index", hint.label || `[${i}]`), e("strong", "", value === null ? "—" : String(value)));
      if (hint.marker !== undefined) cell.append(e("span", "algo-marker", hint.marker || "·"));
      row.append(cell);
    });
    return row;
  }

  function partition(root) {
    const ui = shell(root, "快速排序 · 一轮分区怎样结束？");
    const examples = [[4, 2, 4, 5, 1], [4, 4, 4, 4, 4], [6, 5, 4, 3, 2, 1]];
    const choice = select(ui, "输入数组", [["0", "本页样例 · 含重复值"], ["1", "全部相等"], ["2", "逆序数组"]], "0");
    let frames = M.partitionFrames(examples[0]);
    const render = index => {
      const f = frames[index];
      const cells = arrayRow(f.values, i => ({
        className: f.changed.includes(i) ? "is-current" : f.phase === "done" && i <= f.j ? "is-selected" : f.phase === "done" && i >= f.i ? "is-right" : "",
        marker: [f.i === i ? "i" : "", f.j === i ? "j" : ""].filter(Boolean).join(" / ")
      }));
      ui.stage.replaceChildren(e("p", "concept-caption", `pivot 固定为 ${f.pivot}（从初始下标 ${f.origin} 取值）`), cells,
        stats([["左指针 i", String(f.i)], ["右指针 j", String(f.j)]]));
      if (f.phase === "done") ui.stage.append(e("p", "concept-caption", `左子区间 [0, ${f.j}]：值 ≤ ${f.pivot}；右子区间 [${f.i}, ${f.values.length - 1}]：值 ≥ ${f.pivot}。`));
      ui.status.textContent = f.message;
    };
    const rebuild = steps(ui, frames.length, render);
    choice.addEventListener("change", () => { frames = M.partitionFrames(examples[Number(choice.value)]); rebuild(frames.length); });
  }

  function prefix(root) {
    const ui = shell(root, "前缀和 · 大区间减去不需要的前半段");
    const examples = [[2, 4, 1, 6, 3], [3, -1, 4, 2, -2, 5]];
    const choice = select(ui, "数组示例", [["0", "本页示例 · 全为正数"], ["1", "含负数的示例"]], "0");
    let values = examples[0];
    const bounds = [2, 4].map((value, i) => {
      const label = e("label", "concept-field"); label.append(e("span", "", i ? "右端 R" : "左端 L"));
      const input = e("input"); input.type = "number"; input.min = "1"; input.max = String(values.length); input.step = "1"; input.value = String(value);
      label.append(input); ui.settings.append(label); return input;
    });
    const render = () => {
      let result;
      try { result = M.prefixQuery(values, ...bounds.map(x => x.value === "" ? NaN : Number(x.value))); }
      catch (error) { ui.stage.replaceChildren(e("p", "concept-error", error.message)); ui.status.textContent = "本演示采用从 1 开始的下标，要求非空区间 L ≤ R。"; return; }
      const { left, right, prefix, sum, whole, removed } = result;
      const original = arrayRow([null, ...values], i => ({ label: `a[${i}]`, className: i >= left && i <= right ? "is-selected" : i > 0 && i < left ? "is-removed" : "" }));
      const sums = arrayRow(prefix, i => ({ label: `S[${i}]`, className: i === right ? "is-selected" : i === left - 1 ? "is-current" : "" }));
      const number = n => n < 0 ? `(${n})` : String(n);
      ui.stage.replaceChildren(e("p", "concept-caption", "原数组：着色区间是本次要保留的元素，a[0] 不使用。"), original,
        e("p", "concept-caption", "累计到每个位置的前缀和，S[0] = 0 表示空前缀。"), sums,
        e("p", "range-equation", `S[${right}] − S[${left - 1}] = ${number(whole)} − ${number(removed)} = ${sum}`));
      ui.status.textContent = `前 ${right} 项的和减去前 ${left - 1} 项的和，留下第 ${left}～${right} 项。直接相加核对：${values.slice(left - 1, right).map(number).join(" + ")} = ${sum}。`;
    };
    bounds.forEach(input => input.addEventListener("input", render));
    choice.addEventListener("change", () => { values = examples[Number(choice.value)]; bounds.forEach((x, i) => { x.max = String(values.length); x.value = i ? "4" : "2"; }); render(); });
    render();
  }

  function queens(root) {
    const ui = shell(root, "四皇后 · 尝试、剪枝与撤销");
    const frames = M.queensFrames(4), jump = e("button", "", "跳到下一个解"); jump.type = "button"; ui.settings.append(jump);
    const navigator = steps(ui, frames.length, index => {
      const f = frames[index], board = e("table", "queen-board");
      board.append(e("caption", "", "Q 已放置 · × 本步被拒绝 · ↶ 本步撤销 · 点号表示已受攻击的空格"));
      const head = e("thead"), row = e("tr");
      for (let c = 0; c <= f.n; c++) { const th = e("th", "", c ? String(c) : "行 / 列"); th.scope = "col"; row.append(th); } head.append(row);
      const body = e("tbody");
      for (let r = 0; r < f.n; r++) {
        const tr = e("tr"), label = e("th", "", String(r + 1)); label.scope = "row"; tr.append(label);
        for (let c = 0; c < f.n; c++) {
          const occupied = f.positions[r] === c, current = f.row === r && f.col === c;
          const attacked = f.positions.some((q, qr) => qr === r || q === c || Math.abs(qr - r) === Math.abs(q - c));
          const symbol = occupied ? "Q" : current && f.phase === "reject" ? "×" : current && f.phase === "remove" ? "↶" : attacked ? "·" : "";
          const cell = e("td", `${(r + c) % 2 ? "is-dark " : ""}${occupied ? "has-queen" : attacked ? "is-attacked" : ""}${current ? " is-current" : ""}`);
          const square = e("div", "queen-square", symbol); square.setAttribute("aria-hidden", "true"); cell.append(square);
          cell.setAttribute("aria-label", `第 ${r + 1} 行第 ${c + 1} 列：${occupied ? "有皇后" : current && f.phase === "reject" ? "本步拒绝" : "空格"}`);
          tr.append(cell);
        }
        body.append(tr);
      }
      board.append(head, body);
      ui.stage.replaceChildren(board, e("p", "queen-path", `已放置行的列号：[${f.positions.map(c => c + 1).join(", ")}]`), stats([["本轨迹已尝试位置", String(f.attempts)], ["本轨迹已找到解", String(f.solutions)]]));
      ui.status.textContent = f.message;
      jump.disabled = !frames.some((x, i) => i > index && x.phase === "solution");
    });
    jump.addEventListener("click", () => navigator.jumpTo(frames.findIndex((f, i) => i > navigator.position() && f.phase === "solution")));
  }

  function heap(root) {
    const ui = shell(root, "大根堆 · 树与数组同步看维护过程");
    const choice = select(ui, "执行的操作", [["pop", "弹出最大值：下沉"], ["push", "插入 10：上浮"], ["small", "插入 1：无需上浮"]], "pop");
    let frames = M.heapFrames([9, 7, 8, 2, 5, 1, 4], "pop");
    const render = index => {
      const f = frames[index], plot = svg("svg", { viewBox: "0 0 500 315", role: "img", "aria-label": `二叉堆的层序数组为 ${f.values.join(", ")}`, class: "heap-tree" });
      const points = f.values.map((_, i) => { const d = Math.floor(Math.log2(i + 1)); return [10 + (i - (2 ** d - 1) + .5) * 480 / (2 ** d), 35 + d * 76]; });
      f.values.forEach((value, i) => {
        if (i) { const p = Math.floor((i - 1) / 2); plot.append(svg("line", { x1: points[p][0], y1: points[p][1], x2: points[i][0], y2: points[i][1], class: `heap-edge${f.values[p] < value ? " is-violation" : ""}` })); }
      });
      f.values.forEach((value, i) => {
        const [x, y] = points[i], group = svg("g", { class: `heap-node${f.active.includes(i) ? " is-current" : ""}` });
        group.append(svg("circle", { cx: x, cy: y, r: 26 }), svg("text", { x, y: y + 10, "text-anchor": "middle", class: "heap-value" }, value), svg("text", { x, y: y + 46, "text-anchor": "middle", class: "heap-index" }, `[${i}]`)); plot.append(group);
      });
      ui.stage.replaceChildren(plot, e("p", "concept-caption", "相同下标连接树与数组；橙色标出本步维护的位置。"), arrayRow(f.values, i => ({ className: f.active.includes(i) ? "is-current" : "" })),
        stats([["元素数", String(f.values.length)], ["维护状态", f.phase === "done" ? "完成" : f.phase === "start" ? "尚未操作" : "维护中"]]));
      ui.status.textContent = f.message;
    };
    const rebuild = steps(ui, frames.length, render);
    choice.addEventListener("change", () => { frames = M.heapFrames([9, 7, 8, 2, 5, 1, 4], choice.value === "pop" ? "pop" : "push", choice.value === "small" ? 1 : 10); rebuild(frames.length); });
  }

  function osTable(headers, rows, caption) {
    const table = e("table", "os-table"), head = e("tr"), body = e("tbody");
    if (caption) table.append(e("caption", "", caption));
    headers.forEach(title => { const th = e("th", "", title); th.scope = "col"; head.append(th); });
    const thead = e("thead"); thead.append(head); table.append(thead);
    rows.forEach(row => {
      const tr = e("tr");
      row.forEach((value, i) => { const cell = e(i ? "td" : "th", "", String(value)); if (!i) cell.scope = "row"; tr.append(cell); });
      body.append(tr);
    });
    table.append(body); return table;
  }

  function paging(root) {
    const ui = shell(root, "分页地址转换 · 页号换了，偏移不变");
    const preset = select(ui, "预设场景", [["1300", "TLB 未命中，页已在内存"], ["276", "TLB 命中"], ["2300", "合法页不在内存"], ["3300", "访问未映射页"], ["8191", "最后一个合法地址"], ["custom", "自行输入地址"]], "1300");
    const field = e("label", "concept-field"); field.append(e("span", "", "虚拟地址（十进制 B）"));
    const input = e("input"); input.type = "number"; input.min = "0"; input.max = "8191"; input.step = "1"; input.value = "1300"; field.append(input); ui.settings.append(field);
    const render = () => {
      let r;
      try { r = M.pagingLookup(input.value === "" ? NaN : Number(input.value)); }
      catch (error) { ui.stage.replaceChildren(e("p", "concept-error", error.message)); ui.status.textContent = "13 位虚拟地址的范围为 0～8191 B，不能把越界值当作有效页号。"; return; }
      const split = e("div", "address-split");
      [["高 3 位 · 页号", r.bits.slice(0, 3), `VPN = ${r.page}`], ["低 10 位 · 页内偏移", r.bits.slice(3), `${r.offset} B`]].forEach(([label, bits, value]) => {
        const group = e("div", "address-part"); group.append(e("span", "", label), e("strong", "", bits), e("span", "", value)); split.append(group);
      });
      const layout = e("div", "concept-compare"), path = e("section", "concept-panel"), mapping = e("section", "concept-panel");
      path.append(e("h4", "", "本次访问路径"), e("p", "concept-caption", "固定 TLB 快照：页 0 → 框 5；页 4 → 框 1。每次查询独立，不累计缓存。"));
      const route = e("ol", "address-route");
      const labels = [`拆分：${r.address} = ${r.page} × 1024 + ${r.offset}`, r.tlbHit ? "TLB 命中，取得页框号" : "TLB 未命中，查询页表"];
      if (r.status === "fault") labels.push("合法页当前不在内存：产生缺页异常", "本次演示停在异常处，不生成物理地址");
      else if (r.status === "invalid") labels.push("页未映射：本次访问不合法", "不能按普通调页继续完成这次访问");
      else labels.push(r.tlbHit ? "用缓存的映射继续转换" : `页表表明该页驻留于页框 ${r.frame}`, `PA = ${r.frame} × 1024 + ${r.offset} = ${r.physical} B`);
      labels.forEach((text, i) => route.append(e("li", i === labels.length - 1 ? "is-result" : "", text))); path.append(route);
      mapping.append(e("h4", "", "固定页表快照"));
      const table = osTable(["页号", "状态", "页框"], M.pagingTable.map((entry, i) => [i, entry.unmapped ? "未映射" : entry.absent ? "不在内存" : "驻留", entry.frame ?? "—"]));
      table.querySelectorAll("tbody tr")[r.page].classList.add("is-selected"); mapping.append(table);
      layout.append(path, mapping);
      ui.stage.replaceChildren(split, layout, stats([["页内偏移（保持不变）", `${r.offset} B`], ["物理地址", r.physical === null ? "未生成" : `${r.physical} B`]]));
      ui.status.textContent = r.status === "fault" ? "缺页与置换是两件事：若有空闲页框，可直接调入；没有可用空闲页框时才需要选择被换出的页。" : r.status === "invalid" ? "本快照将第 3 页明确标为未映射，用它区分非法访问与合法页暂不驻留。这里不模拟真实操作系统的按需分配等其他情况。" : `${r.tlbHit ? "TLB 命中" : "TLB 未命中，页表给出驻留映射"}，取得页框 ${r.frame}。TLB 未命中本身不等于缺页。图中省略权限检查、多级页表与数据 Cache。`;
    };
    input.addEventListener("input", () => { preset.value = "custom"; render(); });
    preset.addEventListener("change", () => { if (preset.value !== "custom") input.value = preset.value; render(); }); render();
  }

  function replacement(root) {
    const ui = shell(root, "页面置换 · 同一序列，对照 FIFO 与 LRU");
    const traces = [[1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], [1, 2, 3, 1, 4, 1, 2, 5, 1, 2, 3, 4], [1, 1, 1, 1]];
    const choice = select(ui, "页面引用序列", [["0", "Belady 反例"], ["1", "重复访问与局部性"], ["2", "反复访问同一页"]], "0");
    const size = select(ui, "分配的页框数", [["3", "3 个页框"], ["4", "4 个页框"]], "3");
    let trace = traces[0], frames;
    const calculate = () => { frames = ["FIFO", "LRU"].map(policy => M.replacementFrames(trace, Number(size.value), policy)); };
    calculate();
    const render = index => {
      const sequence = e("div", "os-reference-trace");
      trace.forEach((page, i) => { const cell = e("span", i === index - 1 ? "is-active" : ""); cell.append(e("small", "", `第 ${i + 1} 次`), e("strong", "", String(page))); sequence.append(cell); });
      const panels = e("div", "concept-compare");
      frames.forEach((history, p) => {
        const f = history[index], panel = e("section", "concept-panel"), memory = e("div", "os-page-frames");
        panel.append(e("h4", "", p ? "LRU · 最近最久未使用" : "FIFO · 最早装入先换出"));
        memory.style.gridTemplateColumns = `repeat(${f.slots.length}, minmax(0, 1fr))`;
        f.slots.forEach((page, i) => { const cell = e("div", `os-page-frame${i === f.slot ? f.hit ? " is-hit" : " is-fault" : ""}`); cell.append(e("small", "", `框 ${i}`), e("strong", "", page === null ? "空" : String(page))); memory.append(cell); });
        panel.append(memory, e("p", "os-policy-order", `候选顺序（${p ? "最久未用 → 最近使用" : "最早装入 → 最晚装入"}）：${f.order.length ? f.order.join(" → ") : "空"}`), stats([["累计缺页", String(f.faults)], ["其中发生置换", String(f.replacements)]]));
        panel.append(e("p", `concept-result${f.hit ? " is-hit" : ""}`, !index ? "初始：页框全空。" : f.hit ? `页 ${f.page} 命中。${p ? "更新最近使用次序。" : "装入次序不变。"}` : `页 ${f.page} 缺页；${f.evicted === null ? "装入空闲页框，无需换出。" : `换出页 ${f.evicted}。`}`));
        panels.append(panel);
      });
      ui.stage.replaceChildren(e("p", "concept-caption", "按页面号引用；不是字节地址。每一步是一次引用，页框保持固定位置。"), sequence, panels);
      ui.status.textContent = !index ? "先预测下一次引用是否命中。缺页包括首次装入空闲页框的情况，不能只数换出次数。" : index === trace.length ? "本序列已处理完。切换 3 / 4 个页框可重新比较；FIFO 可能出现页框更多、缺页反而更多的 Belady 异常。" : `已处理 ${index} / ${trace.length} 次引用。两种算法仅在淘汰规则与命中后的次序更新上不同。`;
    };
    const rebuild = steps(ui, trace.length + 1, render);
    const reset = () => { trace = traces[Number(choice.value)]; calculate(); rebuild(trace.length + 1); };
    choice.addEventListener("change", reset); size.addEventListener("change", reset);
  }

  function scheduling(root) {
    const ui = shell(root, "CPU 调度 · 先画时间轴，再算指标");
    const profiles = [
      [{ id: "A", arrival: 0, burst: 5 }, { id: "B", arrival: 0, burst: 3 }, { id: "C", arrival: 0, burst: 1 }],
      [{ id: "A", arrival: 0, burst: 5 }, { id: "B", arrival: 1, burst: 3 }, { id: "C", arrival: 4, burst: 1 }],
      [{ id: "A", arrival: 2, burst: 2 }, { id: "B", arrival: 6, burst: 1 }, { id: "C", arrival: 6, burst: 2 }]
    ];
    const profile = select(ui, "自拟进程组（详见下表）", [["0", "同时到达，服务时间不同"], ["1", "先后到达，含边界到达"], ["2", "存在 CPU 空闲区间"]], "0");
    const policy = select(ui, "调度算法", [["RR", "RR · 轮转"], ["FCFS", "FCFS"]], "RR");
    const quantum = select(ui, "RR 时间片", [["1", "q = 1"], ["2", "q = 2"], ["3", "q = 3"]], "2");
    const finish = e("button", "", "查看完整结果"); finish.type = "button"; ui.settings.append(finish);
    let frames = M.scheduleFrames(profiles[0], "RR", 2);
    const dash = x => x === null ? "—" : String(x), mean = (jobs, key) => fmt(jobs.reduce((sum, j) => sum + j[key], 0) / jobs.length);
    const render = index => {
      const f = frames[index], timeline = e("div", "os-gantt-scroll"); timeline.tabIndex = 0; timeline.setAttribute("aria-label", "已执行的 CPU 时间轴，窄屏可横向滚动");
      const track = e("div", "os-gantt");
      f.segments.forEach((segment, i) => {
        const block = e("div", `os-gantt-block os-process-${segment.id || "idle"}${i === f.segments.length - 1 ? " is-current" : ""}`);
        block.style.width = `${(segment.end - segment.start) * 2.8}rem`;
        block.append(e("strong", "", segment.id || "空闲"), e("small", "", `${segment.start}–${segment.end}`)); track.append(block);
      });
      if (!f.segments.length) track.append(e("p", "concept-caption", "尚未执行；点击“下一步”观察第一个区间。"));
      timeline.append(track);
      const queue = e("div", "os-ready-queue"); queue.append(e("strong", "", `t=${f.clock} 的就绪队列（队首 → 队尾）`));
      f.ready.forEach(id => queue.append(e("span", `os-process-${id}`, `${id} · 剩余 ${f.jobs.find(j => j.id === id).remaining}`)));
      if (!f.ready.length) queue.append(e("span", "", f.completed === f.jobs.length ? "全部完成" : "空"));
      const data = e("div", "concept-table-scroll"); data.tabIndex = 0; data.setAttribute("aria-label", "进程计算表，窄屏可横向滚动");
      data.append(osTable(["进程", "到达", "服务", "首次执行", "完成", "响应", "周转", "等待"], f.jobs.map(j => [j.id, j.arrival, j.burst, dash(j.first), dash(j.finish), dash(j.response), dash(j.turnaround), dash(j.waiting)]), "时间均以同一抽象单位计；未产生的指标用 — 表示。窄屏可横向滚动。"));
      ui.stage.replaceChildren(e("p", "concept-caption", "区间为左闭右开；每个时间单位等宽。时间轴较长时可横向滚动。"), timeline, queue, data);
      if (f.completed === f.jobs.length) {
        const finals = ["FCFS", "RR"].map(p => M.scheduleFrames(profiles[Number(profile.value)], p, Number(quantum.value)).at(-1).jobs);
        ui.stage.append(osTable(["同一输入的最终对照", "平均响应", "平均周转", "平均等待"], finals.map((jobs, i) => [i ? `RR（q=${quantum.value}）` : "FCFS", mean(jobs, "response"), mean(jobs, "turnaround"), mean(jobs, "waiting")])));
      }
      ui.status.textContent = f.message;
      finish.disabled = index === frames.length - 1;
    };
    const navigator = steps(ui, frames.length, render);
    finish.addEventListener("click", () => navigator.jumpTo(frames.length - 1));
    const reset = () => { quantum.disabled = policy.value === "FCFS"; frames = M.scheduleFrames(profiles[Number(profile.value)], policy.value, Number(quantum.value)); navigator(frames.length); };
    [profile, policy, quantum].forEach(control => control.addEventListener("change", reset));
  }

  function directory(root) {
    if (root.dataset.labReady) return;
    const sections = [...root.querySelectorAll(".lab-section")];
    const groups = sections.map(section => ({ section, category: section.dataset.category, cards: [...section.querySelectorAll(".lab-catalog > ul > li")] }));
    const all = groups.flatMap(g => g.cards), normalize = s => s.normalize("NFKC").toLowerCase();
    const text = new Map(all.map(card => [card, normalize(`${card.closest("section").querySelector("h2").textContent} ${card.textContent}`)]));
    const toolbar = e("div", "lab-toolbar"), filters = e("div", "lab-filters"), field = e("label", "lab-search");
    field.append(e("span", "", "搜索图解主题"));
    const input = e("input"); input.type = "search"; input.placeholder = "例如：快排、对象、Cache"; field.append(input);
    const status = e("p", "lab-filter-status"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    const empty = e("p", "lab-empty", "没有匹配的主题。试试其他关键词，或清除筛选。"); empty.hidden = true;
    let category = "all";
    const buttons = [];
    [["all", "全部", all.length], ...groups.map(g => [g.category, g.section.dataset.label, g.cards.length])].forEach(([key, title, count]) => {
      const button = e("button", "", `${title}（${count}）`); button.type = "button";
      button.addEventListener("click", () => { category = key; render(); }); filters.append(button); buttons.push([key, button]);
    });
    const reset = e("button", "lab-filter-reset", "清除筛选"); reset.type = "button";
    reset.addEventListener("click", () => { category = "all"; input.value = ""; render(); });
    toolbar.append(filters, field, reset, status); root.prepend(toolbar, empty);
    function render() {
      const words = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
      let count = 0;
      groups.forEach(g => {
        let shown = 0;
        g.cards.forEach(card => { const visible = (category === "all" || category === g.category) && words.every(word => text.get(card).includes(word)); card.hidden = !visible; if (visible) shown++; });
        g.section.hidden = shown === 0; count += shown;
      });
      buttons.forEach(([key, button]) => { button.setAttribute("aria-pressed", String(key === category)); });
      status.textContent = `显示 ${count} / ${all.length} 个主题`;
      empty.hidden = count > 0;
    }
    input.addEventListener("input", render); render(); root.dataset.labReady = "true";
  }

  const renderers = { cache, pipeline, references, vector, signed, metrics, partition, prefix, queens, heap, paging, replacement, scheduling };
  const mount = () => {
    document.querySelectorAll("[data-concept-viz]").forEach(root => {
      if (root.dataset.ready || !renderers[root.dataset.conceptViz]) return;
      renderers[root.dataset.conceptViz](root); root.dataset.ready = "true";
    });
    document.querySelectorAll("[data-lab-directory]").forEach(directory);
  };
  if (typeof document$ !== "undefined") document$.subscribe(mount);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
