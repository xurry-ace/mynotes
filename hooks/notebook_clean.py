"""清理 mkdocs-jupyter 生成的 Notebook 页面 HTML 与目录。

mkdocs-jupyter 结合 nbconvert 渲染 .ipynb 时存在几处缺陷：
1. 目录由 nb2md 单独提取，先删掉了行内反引号代码，且与 nbconvert 生成的标题 id 不一致，
   导致页内目录链接失效、含代码的标题缺词、横线前列表被误判为 '-' 标题。
2. custom_mathjax_url 为空时仍输出 <script src=""></script>，浏览器会重复请求当前页面。
3. 末尾额外拼接了一段 Python 列表字面量形式的 <style>['...']</style>。
4. use_directory_urls 开启时，Notebook 内的 ./ 相对图片路径未像普通 Markdown 一样改写为 ../。
"""

from html import unescape
import re
from markdown.extensions.toc import slugify, unique
from mkdocs.structure.toc import get_toc

_HEADING_RE = re.compile(
    r'<h([1-6])\s+id="[^"]*"([^>]*)>(.*?)<a class="anchor-link" href="#[^"]*">(.*?)</a></h\1>',
    re.DOTALL,
)
_TAG_RE = re.compile(r"<[^>]+>")
_EMPTY_SCRIPT_RE = re.compile(r'<script\s+src=""\s*>\s*</script>', re.IGNORECASE)
_LIST_STYLE_RE = re.compile(r"<style>\s*\[\s*'[\s\S]*?\]\s*</style>", re.IGNORECASE)
_REL_IMG_SRC_RE = re.compile(r'(<img\b[^>]*?\bsrc=")\./', re.IGNORECASE)
_DEFAULT_ALT = 'alt="No description has been provided for this image"'


def on_page_content(html, page, config, files):
    if not page.file.src_path.endswith(".ipynb"):
        return html

    html = _EMPTY_SCRIPT_RE.sub("", html)
    html = _LIST_STYLE_RE.sub("", html)
    html = html.replace(_DEFAULT_ALT, 'alt="代码运行输出图像"')

    if config.get("use_directory_urls", True):
        html = _REL_IMG_SRC_RE.sub(r"\1../", html)

    used_ids = set()
    toc_tokens = []

    def repl_heading(match):
        level = int(match.group(1))
        attrs = match.group(2)
        inner_html = match.group(3)
        anchor_text = match.group(4)

        text = unescape(_TAG_RE.sub("", inner_html)).strip()
        hid = unique(slugify(text, "-"), used_ids)

        if level == 2:
            toc_tokens.append(
                {"level": 2, "id": hid, "name": text, "children": []}
            )
        elif level == 3:
            if toc_tokens:
                toc_tokens[-1]["children"].append(
                    {"level": 3, "id": hid, "name": text, "children": []}
                )
            else:
                toc_tokens.append(
                    {"level": 3, "id": hid, "name": text, "children": []}
                )

        return (
            f'<h{level} id="{hid}"{attrs}>{inner_html}'
            f'<a class="anchor-link" href="#{hid}">{anchor_text}</a></h{level}>'
        )

    html = _HEADING_RE.sub(repl_heading, html)
    page.toc = get_toc(toc_tokens)
    return html
