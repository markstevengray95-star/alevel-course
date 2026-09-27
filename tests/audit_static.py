#!/usr/bin/env python3
from __future__ import annotations
import json, re, subprocess, sys, tempfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
errors: list[str] = []
warnings: list[str] = []

EXTERNAL_SCHEMES = {"http", "https", "data", "blob", "mailto", "tel", "javascript"}
RESOURCE_ATTRS = {"src", "href", "poster", "action"}

class AuditHTML(HTMLParser):
    def __init__(self, path: Path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids: dict[str,int] = {}
        self.refs: list[tuple[str,str,str]] = []
    def handle_starttag(self, tag, attrs):
        amap = dict(attrs)
        if "id" in amap and amap["id"]:
            self.ids[amap["id"]] = self.ids.get(amap["id"], 0) + 1
        for key in RESOURCE_ATTRS:
            val = amap.get(key)
            if val:
                self.refs.append((tag,key,val))
        if amap.get("srcset"):
            for item in amap["srcset"].split(","):
                url = item.strip().split()[0] if item.strip() else ""
                if url:
                    self.refs.append((tag,"srcset",url))

def resolve_local(base: Path, raw: str) -> Path | None:
    raw = raw.strip()
    if not raw or raw.startswith("#") or raw.startswith("//"):
        return None
    p = urlsplit(raw)
    if p.scheme.lower() in EXTERNAL_SCHEMES:
        return None
    path = unquote(p.path)
    if not path or path == "/":
        return None
    target = (ROOT / path.lstrip("/")) if path.startswith("/") else (base.parent / path)
    return target.resolve()

def check_target(source: Path, tag: str, attr: str, raw: str):
    target = resolve_local(source, raw)
    if target is None:
        return
    try:
        target.relative_to(ROOT)
    except ValueError:
        errors.append(f"{source.relative_to(ROOT)}: {attr} escapes deploy root: {raw}")
        return
    if target.is_dir():
        target = target / "index.html"
    if not target.exists():
        errors.append(f"{source.relative_to(ROOT)}: missing {tag}[{attr}] resource: {raw}")

def check_html(path: Path):
    text = path.read_text("utf-8", errors="replace")
    parser = AuditHTML(path)
    try:
        parser.feed(text)
    except Exception as e:
        errors.append(f"{path.relative_to(ROOT)}: HTML parse failure: {e}")
        return
    for ident,count in parser.ids.items():
        if count > 1:
            errors.append(f"{path.relative_to(ROOT)}: duplicate id '{ident}' appears {count} times")
    for tag,attr,raw in parser.refs:
        # Stylesheet anchors and normal page links are also checked when local.
        check_target(path, tag, attr, raw)

CSS_URL = re.compile(r"url\(([^)]+)\)", re.I)
CSS_IMPORT = re.compile(r"@import\s+(?:url\()?['\"]?([^'\"\s);]+)", re.I)

def check_css(path: Path):
    text = path.read_text("utf-8", errors="replace")
    cleaned = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    # Lightweight structural check outside comments.
    if cleaned.count("{") != cleaned.count("}"):
        errors.append(f"{path.relative_to(ROOT)}: unbalanced CSS braces")
    refs = []
    refs.extend(m.group(1).strip().strip("'\"") for m in CSS_URL.finditer(text))
    refs.extend(m.group(1).strip() for m in CSS_IMPORT.finditer(text))
    for raw in refs:
        if raw.startswith("#"):
            continue
        check_target(path, "css", "url", raw)

def check_json(path: Path):
    try:
        json.loads(path.read_text("utf-8"))
    except Exception as e:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {e}")

def check_js(path: Path):
    cmd = ["node", "--check", str(path)]
    p = subprocess.run(cmd, text=True, capture_output=True)
    if p.returncode == 0:
        return
    # ESM source can fail under CJS interpretation; retry as module through stdin.
    p2 = subprocess.run(["node","--input-type=module","--check"], input=path.read_text("utf-8", errors="replace"), text=True, capture_output=True)
    if p2.returncode != 0:
        msg = (p2.stderr or p.stderr).strip().splitlines()[-1] if (p2.stderr or p.stderr).strip() else "unknown syntax error"
        errors.append(f"{path.relative_to(ROOT)}: JavaScript syntax failure: {msg}")

if not ROOT.exists():
    raise SystemExit(f"Audit root not found: {ROOT}")

files = [p for p in ROOT.rglob("*") if p.is_file()]
for p in files:
    suffix = p.suffix.lower()
    if suffix in {".html", ".htm"}: check_html(p)
    elif suffix == ".css": check_css(p)
    elif suffix == ".js": check_js(p)
    elif suffix in {".json", ".webmanifest"}: check_json(p)

required = [
    "index.html",
    "topics/01-measurements/index.html",
    "topics/02-particles-radiation/index.html",
    "topics/03-waves/index.html",
    "topics/04-mechanics-materials/mechanics/index.html",
    "topics/04-mechanics-materials/materials/index.html",
    "topics/05-electricity/index.html",
    "topics/06-further-mechanics-thermal/index.html",
    "topics/07-fields/index.html",
    "topics/08-nuclear/index.html",
]
for rel in required:
    if not (ROOT / rel).exists():
        errors.append(f"Required entry page missing: {rel}")

print(f"Audited {len(files)} deployed files under {ROOT}")
if warnings:
    print("\nWARNINGS:")
    for w in warnings: print(" -", w)
if errors:
    print(f"\nFAILED with {len(errors)} issue(s):")
    for e in errors: print(" -", e)
    raise SystemExit(1)
print("PASS: static resource, syntax, manifest and DOM-ID checks found no blocking issues.")
