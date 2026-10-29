# xurry 的代码空间

个人笔记网站，使用 MkDocs + Material for MkDocs。文章源文件位于 `docs/`，导航和扩展配置位于 `mkdocs.yml`。

## 本地预览与构建

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m mkdocs serve
```

需要单独生成静态站点时，运行 `.venv/bin/python -m mkdocs build --clean`。输出目录 `site/`、虚拟环境 `.venv/` 和缓存 `.cache/` 均可重建，已加入 `.gitignore`。

向 GitHub 仓库的 `main` 分支推送源文件后，`.github/workflows/deploy.yml` 会构建网站并发布到 `gh-pages` 分支；线上地址为 <https://www.xurry.xyz/>。
