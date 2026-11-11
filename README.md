# xurry 的代码空间

个人笔记网站，使用 MkDocs + Material for MkDocs。文章源文件位于 `docs/`，导航和扩展配置位于 `mkdocs.yml`。

## 本地预览与构建

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m mkdocs serve
```

需要单独生成静态站点时，运行 `.venv/bin/python -m mkdocs build --clean`。输出目录 `site/`、虚拟环境 `.venv/` 和缓存 `.cache/` 均可重建，已加入 `.gitignore`。构建后可用 `python scripts/check_links.py site` 检查站内链接与锚点；CI 也会在部署前运行这一步。

向 GitHub 仓库的 `main` 分支推送源文件后，`.github/workflows/deploy.yml` 会构建网站并发布到 `gh-pages` 分支；线上地址为 <https://www.xurry.xyz/>。

算法逐步演示由 `docs/javascripts/study-viz.js` 实现，只增强页面中带 `data-study-viz` 的容器，样式限定在 `.study-viz` 内，不依赖外部可视化库。示例包括二分查找、BFS/DFS 对照与 Dijkstra；容器内保留静态过程说明，在 JavaScript 不可用时仍可阅读。

机制实验由 `concept-models.js` 计算、`concept-lab.js` 绘制，通过 `data-concept-viz` 显式启用；包括补码、Cache、流水线、vector、Python 引用与分类阈值。运行 `node scripts/check_concept_models.cjs` 可核对计算模型。导航与实验样式在 `docs/stylesheets/learning.css`，主要限定到显式组件；手机端的回到顶部按钮放在右下角，避免遮挡锚点标题。新实验应保留静态过程说明，并说明简化条件。

首页使用内置 imagegen 生成的知识花园插画，发布版 WebP 约 108 KiB；最终提示词保存在 `diagram-sources/站点首页/knowledge-garden.prompt.md`。PCA/Fisher 图的自拟数据、独立数值核对和 Matplotlib 导出代码在 `diagram-sources/模式识别/projection_comparison.py`；绘图依赖仅用于重生成图片，不是构建与网页运行依赖。

正文图片由 `hooks/image_attrs.py` 在构建时统一补上 `loading="lazy"`、`decoding="async"` 以及宽高（百分比宽度图片改用 `aspect-ratio`）。新增本地图片不需要手工写这些属性；外链图片只补懒加载。Jupyter Notebook 页面由 `hooks/notebook_clean.py` 同步标题锚点与右侧目录、改写 `./` 相对图片路径，并清理 `nbconvert` 生成的空脚本和重复样式标签。

正文字体 Noto Serif SC 与代码字体 Fira Code 使用 `docs/assets/fonts/` 下的本地 woff2 子集，不再请求 Google Fonts；新增大量生僻字后需要用 `pyftsubset` 重新生成。字体来源与 OFL 许可证见同目录 `NOTICE.txt` 和 `OFL-*.txt`。

## 附件

体积较大的 PDF 已迁移到 GitHub Releases 的 [`pdf-assets`](https://github.com/xurry-ace/mynotes/releases/tag/pdf-assets) release，正文通过 release 下载链接引用。仓库中的 `docs/` 不再保存这些 PDF；新增或替换附件时，先上传 release，再同步 Markdown 链接。

## 共享题面

同一道题在不同章节重复出现时，题面放在 `snippets/` 下，通过 `--8<--` 引入；修改题面只需改共享文件，章节页保留各自的解法与上下文。
