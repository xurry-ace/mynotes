/* 本站自拟教学示例；只增强带 data-study-viz 的容器，无外部依赖。 */
(() => {
  "use strict";
  let instance = 0;
  const NS = "http://www.w3.org/2000/svg";
  const values = [1, 3, 5, 7, 9, 11];
  const children = { A: ["B", "C"], B: ["D", "E"], C: ["F"], D: [], E: [], F: [] };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function svgEl(tag, attrs, text) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function binaryFrames(target) {
    let left = 0, right = values.length - 1;
    const frames = [{ left, right, mid: 2, found: -1, message: "初始区间 [0, 5]。下一步比较 mid = 2，a[2] = 5。" }];
    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2);
      if (values[mid] === target) {
        frames.push({ left, right, mid, found: mid, message: `a[${mid}] = ${target}，找到目标，返回下标 ${mid}。` });
        break;
      }
      const comparison = `a[${mid}] = ${values[mid]} ${values[mid] < target ? "<" : ">"} ${target}`;
      const update = values[mid] < target ? `left = ${mid} + 1 = ${mid + 1}` : `right = ${mid} − 1 = ${mid - 1}`;
      if (values[mid] < target) left = mid + 1;
      else right = mid - 1;
      const nextMid = left <= right ? left + Math.floor((right - left) / 2) : -1;
      const result = nextMid < 0 ? "left > right，区间为空，返回 -1。" : `保留 [${left}, ${right}]；下一步比较下标 ${nextMid}。`;
      frames.push({ left, right, mid: nextMid, found: -1, message: `${comparison}，令 ${update}。${result}` });
    }
    return frames;
  }

  function searchFrames(mode) {
    const frames = [];
    const visited = [], frontier = [], complete = [];
    const record = (active, message) => frames.push({
      active, message, visited: [...visited], frontier: [...frontier], complete: [...complete]
    });
    if (mode === "bfs") {
      frontier.push("A");
      record(null, "起点 A 入队并标记为已发现。下一步从队头取出 A。");
      while (frontier.length) {
        const current = frontier.shift();
        visited.push(current);
        frontier.push(...children[current]); // 示例是一棵树，每个孩子只会被发现一次。
        complete.push(current);
        const added = children[current].length ? `将 ${children[current].join("、")} 标记后依次入队。` : "没有新的孩子入队。";
        record(current, `${current} 出队。${added}${frontier.length ? `下一个队头是 ${frontier[0]}。` : "队列为空，遍历结束。"}`);
      }
    } else {
      record(null, "准备从 A 开始递归。每次进入节点时记录访问，孩子处理完后返回。");
      const visit = (current) => {
        frontier.push(current);
        visited.push(current);
        record(current, `进入 ${current}，加入当前调用链。${children[current].length ? `接着访问第一个孩子 ${children[current][0]}。` : "它是叶节点，下一步返回。"}`);
        children[current].forEach(visit);
        frontier.pop();
        complete.push(current);
        const parent = frontier[frontier.length - 1];
        record(null, `${current} 的孩子已全部处理，${parent ? `返回 ${parent}，继续检查它的下一个孩子。` : "从起点返回，遍历结束。"}`);
      };
      visit("A");
    }
    return frames;
  }

  function dijkstraFrames() {
    const edges = [[[1, 2], [2, 5]], [[2, 1]], []];
    const distance = [0, Infinity, Infinity], settled = [];
    const frames = [{ distance: [...distance], settled: [], active: -1, message: "初始：起点 1 的距离为 0，其余为 ∞。还没有确定任何节点。" }];
    while (settled.length < 3) {
      const candidates = [0, 1, 2].filter((v) => !settled.includes(v));
      const u = candidates.reduce((a, b) => distance[a] <= distance[b] ? a : b);
      settled.push(u);
      const updates = [];
      for (const [v, weight] of edges[u]) {
        const next = distance[u] + weight;
        if (next < distance[v]) {
          updates.push(`d[${v + 1}] 从 ${distance[v] === Infinity ? "∞" : distance[v]} 更新为 ${next}`);
          distance[v] = next;
        }
      }
      frames.push({ distance: [...distance], settled: [...settled], active: u,
        message: `确定节点 ${u + 1}（距离 ${distance[u]}）。${updates.length ? updates.join("；") + "。" : "没有可改进的出边，最终距离为 [0, 2, 3]。"}` });
    }
    return frames;
  }

  function graphShell(title, id) {
    const svg = svgEl("svg", { viewBox: "0 0 440 290", role: "img", "aria-labelledby": `${id}-graph-title`, class: "study-viz__graph" });
    svg.append(svgEl("title", { id: `${id}-graph-title` }, title));
    return svg;
  }

  function line(svg, start, end, className, marker) {
    const dx = end[0] - start[0], dy = end[1] - start[1];
    const length = Math.hypot(dx, dy);
    const attrs = {
      x1: start[0] + 25 * dx / length, y1: start[1] + 25 * dy / length,
      x2: end[0] - 29 * dx / length, y2: end[1] - 29 * dy / length,
      class: `study-viz__edge ${className || ""}`
    };
    if (marker) attrs["marker-end"] = `url(#${marker})`;
    svg.append(svgEl("line", attrs));
  }

  function graphNode(svg, point, label, state, detail) {
    const group = svgEl("g", { class: `study-viz__node ${state || ""}` });
    group.append(svgEl("circle", { cx: point[0], cy: point[1], r: 24 }));
    group.append(svgEl("text", { x: point[0], y: point[1] + 6, "text-anchor": "middle", class: "study-viz__node-name" }, label));
    if (detail) group.append(svgEl("text", { x: point[0], y: point[1] + 46, "text-anchor": "middle", class: "study-viz__node-detail" }, detail));
    svg.append(group);
  }

  function renderTree(frame, mode, id) {
    const svg = graphShell("示例树：A 的孩子为 B、C；B 的孩子为 D、E；C 的孩子为 F。孩子从左到右访问。", id);
    const points = { A: [220, 37], B: [125, 132], C: [335, 132], D: [55, 235], E: [195, 235], F: [335, 235] };
    Object.entries(children).forEach(([parent, kids]) => kids.forEach((child) => line(svg, points[parent], points[child])));
    Object.entries(points).forEach(([name, point]) => {
      const active = frame.active === name;
      const done = frame.complete.includes(name);
      const queued = frame.frontier.includes(name);
      const state = active ? "is-current" : done ? "is-complete" : queued ? "is-pending" : "";
      const detail = active ? "本步处理" : done ? (mode === "bfs" ? "已出队" : "已返回") : queued ? (mode === "bfs" ? "队中" : "调用链中") : "未发现";
      graphNode(svg, point, name, state, detail);
    });
    return svg;
  }

  function renderDijkstra(frame, id) {
    const svg = graphShell("有向图：1 到 2 权值 2；1 到 3 权值 5；2 到 3 权值 1。起点为 1。d 表示当前距离。", id);
    const defs = svgEl("defs", {});
    const marker = svgEl("marker", { id: `${id}-arrow`, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto-start-reverse" });
    marker.append(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "study-viz__arrow" }));
    defs.append(marker);
    svg.append(defs);
    const points = [[65, 52], [375, 52], [220, 225]];
    const edges = [[0, 1, 2, 220, 34], [0, 2, 5, 117, 151], [1, 2, 1, 323, 151]];
    edges.forEach(([u, v, weight, x, y]) => {
      line(svg, points[u], points[v], frame.active === u ? "is-current" : "", `${id}-arrow`);
      svg.append(svgEl("text", { x, y, "text-anchor": "middle", class: "study-viz__weight" }, String(weight)));
    });
    points.forEach((point, v) => graphNode(svg, point, String(v + 1), frame.active === v ? "is-current" : frame.settled.includes(v) ? "is-complete" : "", `d = ${frame.distance[v] === Infinity ? "∞" : frame.distance[v]}`));
    return svg;
  }

  function tokens(label, valuesToShow) {
    const row = el("div", "study-viz__tokens");
    row.append(el("span", "study-viz__tokens-label", label));
    if (!valuesToShow.length) row.append(el("span", "study-viz__empty", "空"));
    valuesToShow.forEach((value) => row.append(el("span", "study-viz__token", value)));
    return row;
  }

  function mount(root) {
    if (root.dataset.ready) return;
    const type = root.dataset.studyViz;
    if (!["binary", "search", "dijkstra"].includes(type)) return;
    const id = `study-viz-${++instance}`;
    let mode = root.dataset.mode || "bfs", target = 7, index = 0, frames;
    const header = el("div", "study-viz__header");
    const titles = { binary: "二分查找 · 把边界看清楚", search: "BFS / DFS · 同图对照", dijkstra: "Dijkstra · 从暂定到确定" };
    header.append(el("span", "study-viz__eyebrow", "一步一步看算法"), el("strong", "study-viz__title", titles[type]));
    const selectorRow = el("div", "study-viz__selector");
    const label = el("label", "", type === "binary" ? "目标值" : "搜索方式");
    label.htmlFor = `${id}-select`;
    const select = el("select");
    select.id = `${id}-select`;
    const options = type === "binary" ? [1, 3, 5, 7, 9, 11, 0, 8, 12].map((v) => [String(v), `${v}${values.includes(v) ? "" : "（不存在）"}`]) : [["bfs", "BFS · 队列"], ["dfs", "DFS · 递归"]];
    options.forEach(([value, text]) => {
      const option = el("option", "", text);
      option.value = value;
      select.append(option);
    });
    select.value = type === "binary" ? String(target) : mode;
    selectorRow.append(label, select);
    const stage = el("div", "study-viz__stage");
    const explanation = el("p", "study-viz__explanation");
    explanation.setAttribute("role", "status");
    explanation.setAttribute("aria-live", "polite");
    explanation.setAttribute("aria-atomic", "true");
    const controls = el("div", "study-viz__controls");
    const prev = el("button", "", "上一步");
    const next = el("button", "study-viz__next", "下一步");
    const reset = el("button", "", "重置");
    const progress = el("span", "study-viz__progress");
    [prev, next, reset].forEach((button) => { button.type = "button"; });
    controls.append(prev, next, reset, progress);
    const legend = el("p", "study-viz__legend");
    legend.textContent = type === "binary" ? "L / R 标出闭区间边界，mid 标出下一步要比较的中点；虚线格表示排除。" : type === "search" ? "节点下方标出状态；顺序条记录访问，队列 / 调用链记录待处理状态。" : "d 表示当前距离；已确定节点不会再被更短路径改进。";
    root.replaceChildren(header);
    if (type !== "dijkstra") root.append(selectorRow);
    root.append(stage, explanation, controls, legend);

    function render() {
      const frame = frames[index];
      stage.replaceChildren();
      if (type === "binary") {
        const cells = el("div", "study-viz__array");
        values.forEach((value, i) => {
          const excluded = i < frame.left || i > frame.right;
          const cell = el("div", `study-viz__cell${excluded ? " is-excluded" : ""}${frame.mid === i ? " is-current" : ""}${frame.found === i ? " is-found" : ""}`);
          const markers = [];
          if (i === frame.left) markers.push("L");
          if (i === frame.right) markers.push("R");
          cell.append(el("span", "study-viz__index", `[${i}]`), el("strong", "study-viz__value", String(value)), el("span", "study-viz__marker", markers.join(" / ") || "·"));
          cell.append(el("span", "study-viz__cell-state", frame.found === i ? "找到" : excluded ? "排除" : frame.mid === i ? "mid" : "候选"));
          cells.append(cell);
        });
        stage.append(cells);
        const empty = frame.left > frame.right;
        stage.append(tokens("候选闭区间", [`[${frame.left}, ${frame.right}]${empty ? "（空）" : ""}`]));
      } else if (type === "search") {
        stage.append(renderTree(frame, mode, id));
        stage.append(tokens(mode === "bfs" ? "已出队顺序" : "首次进入顺序", frame.visited));
        stage.append(tokens(mode === "bfs" ? "队头 → 队尾" : "调用链 · 右端为栈顶", frame.frontier));
      } else {
        stage.append(renderDijkstra(frame, id));
        stage.append(tokens("已确定顺序", frame.settled.map((v) => String(v + 1))));
        stage.append(tokens("距离 d[1..3]", frame.distance.map((v) => v === Infinity ? "∞" : String(v))));
      }
      const ended = index === frames.length - 1;
      explanation.textContent = `第 ${index} 步：${frame.message}`;
      progress.textContent = `${index} / ${frames.length - 1}${ended ? " · 完成" : ""}`;
      prev.disabled = index === 0;
      next.disabled = ended;
    }

    function rebuild() {
      frames = type === "binary" ? binaryFrames(target) : type === "search" ? searchFrames(mode) : dijkstraFrames();
      index = 0;
      render();
    }
    prev.addEventListener("click", () => { if (index > 0) { index--; render(); } });
    next.addEventListener("click", () => { if (index < frames.length - 1) { index++; render(); } });
    reset.addEventListener("click", rebuild);
    select.addEventListener("change", () => {
      if (type === "binary") target = Number(select.value);
      else mode = select.value;
      rebuild();
    });
    rebuild();
    root.dataset.ready = "true";
  }

  function mountAll() {
    document.querySelectorAll("[data-study-viz]").forEach(mount);
  }
  // Material 的即时导航也会发出 document$；当前未启用时走普通 DOM 生命周期。
  if (typeof document$ !== "undefined") document$.subscribe(mountAll);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll, { once: true });
  else mountAll();
})();
