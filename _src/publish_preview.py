"""Make a copy of the site for a private Claude Artifact preview link.

The real site (GitHub Pages) needs none of this. Artifact links differ in three ways:
- folder links like "students/" must point at "students/index.html"
- the query string never reaches the page, so ?here=hs becomes #here-hs
- the main page is wrapped in a skeleton, so its own <html>/<head>/<body> tags come off
Usage: python3 _src/publish_preview.py OUT_DIR
"""
import os, re, shutil, sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]

def fix_href(m):
    attr, url = m.group(1), m.group(2)
    if re.match(r"^(https?:|mailto:|tel:|#|data:)", url):
        return m.group(0)
    path, _, frag = url.partition("#")
    path, _, query = path.partition("?")
    if path == "" or path.endswith("/"):
        path = path + "index.html"
    q = dict(p.split("=", 1) for p in query.split("&") if "=" in p)
    if "here" in q and not frag:
        frag = "here-" + q["here"]
    if "demo" in q and not frag:
        frag = "demo-" + q["demo"]
    return f'{attr}="{path}' + (f"#{frag}" if frag else "") + '"'

if os.path.exists(OUT):
    shutil.rmtree(OUT)
shutil.copytree(SITE, OUT, ignore=shutil.ignore_patterns("_src", ".*"))

for dirpath, _, files in os.walk(OUT):
    for fn in files:
        if not fn.endswith(".html"):
            continue
        p = os.path.join(dirpath, fn)
        s = open(p).read()
        s = re.sub(r'(href)="([^"]*)"', fix_href, s)
        # window.print() is inert in the viewer, so hide the print link there
        s = s.replace('<link rel="stylesheet"', '<style>#print-plan{display:none!important}</style>\n<link rel="stylesheet"', 1)
        if os.path.relpath(p, OUT) == "index.html":
            head = re.search(r"<head>(.*?)</head>", s, re.S).group(1)
            head = re.sub(r'<meta charset[^>]*>\s*|<meta name="viewport"[^>]*>\s*', "", head)
            body = re.search(r"<body[^>]*>(.*)</body>", s, re.S).group(1)
            s = head.strip() + "\n" + body.strip() + "\n"
        open(p, "w").write(s)
# Links built in scripts ("students/#virtual", "trades/") get the same treatment
for rel in ("assets/data/programs.js", "assets/journey.js"):
    p = os.path.join(OUT, rel)
    s = open(p).read()
    s = re.sub(r'"([a-z]+(?:-[a-z]+)*)/(#[\w-]+)?"', lambda m: '"' + m.group(1) + "/index.html" + (m.group(2) or "") + '"', s)
    open(p, "w").write(s)
print("ready:", OUT)
