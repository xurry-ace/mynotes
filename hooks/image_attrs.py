"""给正文图片补上原生懒加载与尺寸信息。

MkDocs 渲染出的 <img> 默认没有 loading 属性；图片较多的章节会一次性
加载整页资源。这里只处理页面正文里的 <img>，不改变页头 Logo 等主题图片。

- 本地图片读取真实宽高：没有 width/height 时补上像素尺寸；
  已有百分比 width 时补 aspect-ratio，避免懒加载造成的布局跳动。
- 外链图片无法在构建期可靠取得尺寸，只补 loading/decoding。
"""

import functools
import os
import re
import struct
from urllib.parse import unquote

_IMG_TAG = re.compile(r"<img\b([^>]*)>", re.IGNORECASE)
_SRC_ATTR = re.compile(r'\bsrc\s*=\s*"([^"]*)"', re.IGNORECASE)
_WIDTH_ATTR = re.compile(r"\bwidth\s*=", re.IGNORECASE)
_HEIGHT_ATTR = re.compile(r"\bheight\s*=", re.IGNORECASE)
_STYLE_ATTR = re.compile(r'\bstyle\s*=\s*"([^"]*)"', re.IGNORECASE)
_LOADING_ATTR = re.compile(r"\bloading\s*=", re.IGNORECASE)
_DECODING_ATTR = re.compile(r"\bdecoding\s*=", re.IGNORECASE)

_SOF_MARKERS = set(range(0xC0, 0xD0)) - {0xC4, 0xC8, 0xCC}
_SVG_VIEWBOX = re.compile(r'\bviewBox\s*=\s*"[\d.\s+-]*?([\d.]+)\s+([\d.]+)\s*"')


def _image_size(path):
    """读取 PNG/JPEG/GIF/SVG 的像素尺寸；其他格式返回 None。"""
    if path.lower().endswith(".svg"):
        try:
            with open(path, "r", encoding="utf-8") as f:
                head_text = f.read(1024)
            m = _SVG_VIEWBOX.search(head_text)
            if m:
                return int(float(m.group(1))), int(float(m.group(2)))
        except (OSError, ValueError):
            pass
        return None
    try:
        with open(path, "rb") as f:
            head = f.read(32)
            if head[:8] == b"\x89PNG\r\n\x1a\n":
                return struct.unpack(">II", head[16:24])
            if head[:6] in (b"GIF87a", b"GIF89a"):
                return struct.unpack("<HH", head[6:10])
            if head[:2] != b"\xff\xd8":
                return None
            f.seek(0)
            data = f.read()
    except OSError:
        return None

    i = 2
    while i + 9 < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        i += 2
        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
            continue
        if i + 2 > len(data):
            break
        length = int.from_bytes(data[i : i + 2], "big")
        if marker in _SOF_MARKERS and i + 7 <= len(data):
            height = int.from_bytes(data[i + 3 : i + 5], "big")
            width = int.from_bytes(data[i + 5 : i + 7], "big")
            return width, height
        if length < 2:
            break
        i += length
    return None


@functools.lru_cache(maxsize=None)
def _image_sizes(docs_dir):
    sizes = {}
    for root, _, filenames in os.walk(docs_dir):
        for name in filenames:
            if os.path.splitext(name)[1].lower() not in (".png", ".jpg", ".jpeg", ".gif", ".svg"):
                continue
            size = _image_size(os.path.join(root, name))
            if size:
                sizes[name] = size
    return sizes


def _add_attrs(attrs, docs_dir):
    match = _SRC_ATTR.search(attrs)
    if not match:
        return attrs

    src = unquote(match.group(1).split("?")[0])
    size = _image_sizes(docs_dir).get(os.path.basename(src))
    if not size:
        return attrs

    width, height = size
    has_width = bool(_WIDTH_ATTR.search(attrs))
    has_height = bool(_HEIGHT_ATTR.search(attrs))
    style_match = _STYLE_ATTR.search(attrs)

    # 百分比宽度：保留 width，用 aspect-ratio 预留高度。
    if has_width and not has_height:
        ratio = f"aspect-ratio: {width} / {height}"
        if style_match:
            existing_style = style_match.group(1).rstrip("; ")
            attrs = attrs.replace(
                style_match.group(0),
                f'style="{existing_style}; {ratio}"',
                1,
            )
        else:
            attrs = f'{attrs} style="{ratio}"'
    elif not has_width and not has_height:
        attrs = f'{attrs} width="{width}" height="{height}"'

    return attrs


def on_page_content(html, page, config, files):
    docs_dir = os.path.abspath(config["docs_dir"])

    def repl(match):
        attrs = match.group(1).strip()
        self_closing = attrs.endswith("/")
        if self_closing:
            attrs = attrs[:-1].rstrip()
        attrs = _add_attrs(attrs, docs_dir)
        prefix = []
        if not _LOADING_ATTR.search(attrs):
            prefix.append('loading="lazy"')
        if not _DECODING_ATTR.search(attrs):
            prefix.append('decoding="async"')
        attrs = " ".join(prefix + ([attrs] if attrs else []))
        return f"<img {attrs}{' /' if self_closing else ''}>"

    return _IMG_TAG.sub(repl, html)
