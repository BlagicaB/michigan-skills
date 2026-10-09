"""Stamp shared head/header/footer around page bodies. One-time scaffold; output is plain static HTML."""
import os, re, sys, json, shutil

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAQS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "faqs.json")
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pages")
UPDATED = "October 2026"
DOMAIN = os.environ.get("MSM_DOMAIN", "michiganskills.com")
EMAIL = "hello@michiganskills.com"

AUDIENCE = [
    ("students/#parents", "Parents"),
    ("students/", "Students"),
    ("adults/", "Adults"),
    ("employers/", "Employers"),
    ("educators/", "Educators"),
]

NAV = [
    ("", "Start: You are here"),
    ("students/", "Students and parents"),
    ("adults/", "Adults and recent grads"),
    ("trades/", "Trades and unions"),
    ("colleges/", "Community colleges"),
    ("employers/", "Employers"),
    ("educators/", "Educators and counselors"),
    ("funding/", "The money"),
    ("districts/", "Find your district"),
    ("programs/", "All programs"),
    ("dual-enrollment/", "Guide: Dual enrollment"),
    ("early-middle-college/", "Guide: Early Middle College"),
    ("community-college-guarantee/", "Guide: Community College Guarantee"),
    ("michigan-reconnect/", "Guide: Michigan Reconnect"),
    ("michigan-achievement-scholarship/", "Guide: Achievement Scholarship"),
    ("newsletter/", "Newsletter"),
    ("partners/", "Partner with us"),
    ("faq/", "Questions and answers"),
    ("about/", "About"),
]

LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#0A3A44"/><path d="M5 9h8l6 7h8" fill="none" stroke="#D9561F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16h22" fill="none" stroke="#5FB3BF" stroke-width="3" stroke-linecap="round"/><path d="M5 23h8l6-7" fill="none" stroke="#E3AE45" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="16" r="3.2" fill="#F6F2E9"/></svg>'

def faq_html(items, heading="Common questions"):
    out = [f'<section class="section faq" id="faq"><div class="wrap narrow"><h2>{heading}</h2>']
    for q, a, url, src in items:
        out.append(f'<div class="faq-item"><h3 class="faq-q">{q}</h3>\n<p>{a}</p>\n<p class="sources">Source: <a href="{url}" target="_blank" rel="noopener">{src}</a></p></div>')
    out.append("</div></section>")
    return "\n".join(out)

def faq_ld(items):
    data = {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a, _, _ in items]}
    return '<script type="application/ld+json">' + json.dumps(data) + "</script>"

def site_ld():
    data = [{"@context": "https://schema.org", "@type": "Organization", "name": "Michigan Skills", "url": f"https://{DOMAIN}/",
             "email": EMAIL, "logo": f"https://{DOMAIN}/favicon.svg", "areaServed": "Michigan",
             "description": "A free, independent guide to every public path into skilled work in Michigan."},
            {"@context": "https://schema.org", "@type": "WebSite", "name": "Michigan Skills", "url": f"https://{DOMAIN}/"}]
    return '<script type="application/ld+json">' + json.dumps(data) + "</script>"

def page(slug, title, desc, body, scripts, js=(), ld=""):
    depth = slug.count("/")
    base = "../" * depth
    nav = "".join(f'<li><a href="{base}{href}">{label}</a></li>' for href, label in NAV)
    aud = "".join(f'<a href="{base}{href}">{label}</a>' for href, label in AUDIENCE)
    canon = f'<link rel="canonical" href="https://{DOMAIN}/{slug}">' if DOMAIN else ""
    data = "".join(f'<script src="{base}assets/data/{s}.js"></script>' for s in scripts)
    data += f'<script src="{base}assets/data/sponsors.js"></script><script src="{base}assets/data/demo-sponsors.js"></script>' if "sponsors" not in scripts else f'<script src="{base}assets/data/demo-sponsors.js"></script>'
    extra = "".join(f'<script src="{base}assets/{s}.js"></script>' for s in js)
    full_title = "Michigan Skills: Free Training, College Credit and Trades" if not slug else f"{title} | Michigan Skills"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
{canon}
<meta property="og:title" content="{full_title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Michigan Skills">
<meta property="og:image" content="https://{DOMAIN}/assets/share.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://{DOMAIN}/assets/share.png">
<meta property="og:url" content="https://{DOMAIN}/{slug}">
<link rel="icon" href="{base}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Source+Sans+3:ital,wght@0,400..700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{base}assets/styles.css">
{ld}
</head>
<body data-base="{base}">
<a class="skip" href="#main">Skip to content</a>
<div class="routes" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
<nav class="who-bar" aria-label="Guides by reader"><div class="wrap who-bar-row"><span class="who-label">I'm a</span>{aud}</div></nav>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="{base}">{LOGO}<span>Michigan Skills</span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" aria-label="Main"><ul>{nav}</ul></nav>
  </div>
</header>
<main id="main">
{body}
</main>
<footer class="site-foot">
  <div class="wrap foot-grid">
    <div>
      <p><strong>Michigan Skills</strong> is an independent, plain-English guide to every public path into skilled work in Michigan. It is not a state agency and does not run any of these programs. Rules and dollar amounts change every year, so always confirm with the official source linked on each page.</p>
      <p class="muted">Last checked: {UPDATED}. Spot something out of date? <a href="{base}partners/#inquire">Tell us</a> and we will fix it.</p>
      <p>Questions or ideas: <strong>{EMAIL}</strong></p>
      <p><a class="btn ghost" href="{base}newsletter/">Get the newsletter</a></p>
      <button class="theme-toggle" type="button">Light / dark</button>
    </div>
    <div>
      <h2 class="foot-h">Find your path</h2>
      <ul>
        <li><a href="{base}students/">Students &amp; parents</a></li>
        <li><a href="{base}adults/">Adults &amp; recent grads</a></li>
        <li><a href="{base}trades/">Trades &amp; unions</a></li>
        <li><a href="{base}colleges/">Community colleges</a></li>
        <li><a href="{base}dual-enrollment/">Dual enrollment</a></li>
        <li><a href="{base}early-middle-college/">Early Middle College</a></li>
        <li><a href="{base}community-college-guarantee/">Community College Guarantee</a></li>
        <li><a href="{base}michigan-reconnect/">Michigan Reconnect</a></li>
        <li><a href="{base}michigan-achievement-scholarship/">Achievement Scholarship</a></li>
        <li><a href="{base}programs/">All programs</a></li>
      </ul>
    </div>
    <div>
      <h2 class="foot-h">For the people who help</h2>
      <ul>
        <li><a href="{base}employers/">Employers &amp; apprenticeship sponsors</a></li>
        <li><a href="{base}educators/">Teachers, counselors &amp; job centers</a></li>
        <li><a href="{base}funding/">How the money works</a></li>
        <li><a href="{base}faq/">Questions and answers</a></li>
        <li><a href="{base}glossary/">Glossary</a></li>
        <li><a href="{base}partners/">Partner with us</a></li>
        <li><a href="{base}about/">About</a></li>
        <li><a href="{base}privacy/">Privacy</a></li>
      </ul>
    </div>
  </div>
</footer>
{data}<script src="{base}assets/site.js"></script>{extra}
</body>
</html>
"""

def main():
    urls = []
    global FAQS
    FAQS = json.load(open(FAQS_PATH))
    for fn in sorted(os.listdir(SRC)):
        if not fn.endswith(".html"):
            continue
        raw = open(os.path.join(SRC, fn)).read()
        meta = json.loads(re.search(r"<!--meta(.*?)-->", raw, re.S).group(1))
        body = re.sub(r"<!--meta.*?-->\s*", "", raw, flags=re.S)
        for bad in ("—", "–"):
            if bad in body or bad in meta["desc"]:
                sys.exit(f"long dash found in {fn}")
        slug = meta["slug"]
        out_dir = os.path.join(SITE, slug)
        os.makedirs(out_dir, exist_ok=True)
        ld = site_ld() if slug == "" else ""
        if slug == "" and "home" in FAQS:
            body = body.replace("<!--HOME_FAQ-->", faq_html(FAQS["home"]["items"], "Quick answers"))
            ld += faq_ld(FAQS["home"]["items"])
        if slug in FAQS:
            body = body + "\n" + faq_html(FAQS[slug]["items"])
            ld += faq_ld(FAQS[slug]["items"])
        if slug == "faq/":
            hub = []
            for k, g in FAQS.items():
                if k == "home":
                    continue
                hub.append(f'<section class="section"><div class="wrap narrow"><p class="eyebrow"><a href="../{k}">{g["group"]}</a></p>')
                hub.append(faq_html(g["items"], g["group"]).replace('<section class="section faq" id="faq"><div class="wrap narrow">', "").replace("</div></section>", ""))
                hub.append("</div></section>")
            body = body + "\n".join(hub)
            ld += faq_ld([i for k, g in FAQS.items() if k != "home" for i in g["items"]])
        html = page(slug, meta["title"], meta["desc"], body, meta.get("scripts", []), meta.get("js", []), ld)
        open(os.path.join(out_dir, "index.html"), "w").write(html)
        print("wrote", slug or "/")
        urls.append(slug)
    if DOMAIN:
        sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
        sm += [f"  <url><loc>https://{DOMAIN}/{u}</loc></url>" for u in sorted(urls) if u != "404/"]
        sm.append("</urlset>")
        open(os.path.join(SITE, "sitemap.xml"), "w").write("\n".join(sm) + "\n")
        open(os.path.join(SITE, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\nSitemap: https://{DOMAIN}/sitemap.xml\n")
        open(os.path.join(SITE, "CNAME"), "w").write(DOMAIN + "\n")
    nf = os.path.join(SITE, "404", "index.html")
    if os.path.exists(nf):
        open(os.path.join(SITE, "404.html"), "w").write(open(nf).read().replace('href="../', 'href="/').replace('src="../', 'src="/'))
        shutil.rmtree(os.path.dirname(nf))

if __name__ == "__main__":
    main()
