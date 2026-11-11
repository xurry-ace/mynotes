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
    return newLength => { count = newLength; index = 0; update(); };
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

  const renderers = { cache, pipeline, references, vector, signed, metrics };
  const mount = () => document.querySelectorAll("[data-concept-viz]").forEach(root => {
    if (root.dataset.ready || !renderers[root.dataset.conceptViz]) return;
    renderers[root.dataset.conceptViz](root); root.dataset.ready = "true";
  });
  if (typeof document$ !== "undefined") document$.subscribe(mount);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
