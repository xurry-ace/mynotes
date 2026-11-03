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

正文图片由 `hooks/image_attrs.py` 在构建时统一补上 `loading="lazy"`、`decoding="async"` 以及宽高（百分比宽度图片改用 `aspect-ratio`）。新增本地图片不需要手工写这些属性；外链图片只补懒加载。

正文字体 Noto Serif SC 与代码字体 Fira Code 使用 `docs/assets/fonts/` 下的本地 woff2 子集，不再请求 Google Fonts；新增大量生僻字后需要用 `pyftsubset` 重新生成。字体来源与 OFL 许可证见同目录 `NOTICE.txt` 和 `OFL-*.txt`。

## 附件

体积较大的 PDF 已迁移到 GitHub Releases 的 [`pdf-assets`](https://github.com/xurry-ace/mynotes/releases/tag/pdf-assets) release，正文通过 release 下载链接引用。仓库中的 `docs/` 不再保存这些 PDF；新增或替换附件时，先上传 release，再同步 Markdown 链接。
