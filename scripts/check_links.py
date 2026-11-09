#!/usr/bin/env python3
"""检查构建产物中的站内链接和锚点。

用法：
    python scripts/check_links.py site

只检查本地相对链接、绝对站内路径和 #fragment；外链由人工或外部工具检查。
"""

import os
import re
import sys
from functools import lru_cache
from html import unescape
from urllib.parse import unquote, urlparse

ATTR_RE = re.compile(r'(?:href|src)="([^"]*)"', re.IGNORECASE)
ID_RE = re.compile(r'id="([^"]+)"', re.IGNORECASE)


@lru_cache(maxsize=None)
def _ids(path):
    with open(path, encoding="utf-8", errors="ignore") as handle:
        return set(ID_RE.findall(handle.read()))


def _target(site_dir, html_path, path):
    if path.startswith("/"):
        return os.path.join(site_dir, path.lstrip("/"))
    return os.path.normpath(os.path.join(os.path.dirname(html_path), path))


def main(site_dir):
    site_dir = os.path.abspath(site_dir)
    missing = []
    checked = 0

    for root, _, files in os.walk(site_dir):
        for name in files:
            if not name.endswith(".html"):
                continue
            html_path = os.path.join(root, name)
            with open(html_path, encoding="utf-8", errors="ignore") as handle:
                content = handle.read()

            for raw_url in ATTR_RE.findall(content):
                url = unescape(raw_url).strip()
                if url == "":
                    checked += 1
                    missing.append((html_path, "(empty href/src)"))
                    continue
                if url.startswith("#"):
                    if url == "#":
                        continue
                    checked += 1
                    fragment = unquote(url[1:])
                    if fragment not in _ids(html_path):
                        missing.append((html_path, url + " (missing anchor)"))
                    continue

                parsed = urlparse(url)
                if parsed.scheme or parsed.netloc or url.startswith("//"):
                    continue
                if parsed.path == "":
                    continue

                path = unquote(parsed.path)
                target = _target(site_dir, html_path, path)
                if os.path.isdir(target):
                    target = os.path.join(target, "index.html")
                checked += 1
                if not os.path.exists(target):
                    missing.append((html_path, url))
                    continue

                fragment = unquote(parsed.fragment)
                if fragment and target.endswith(".html"):
                    if fragment not in _ids(target):
                        missing.append((html_path, url + " (missing anchor)"))

    if missing:
        print(f"checked {checked} links, {len(missing)} missing")
        for html_path, url in missing[:30]:
            print(f"  {os.path.relpath(html_path, site_dir)} -> {url}")
        return 1

    print(f"checked {checked} links, 0 missing")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python scripts/check_links.py <site-dir>", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
