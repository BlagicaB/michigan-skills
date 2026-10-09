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

LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="160 320 690 690" aria-hidden="true" class="brand-mark"><path d="M741.9 986.6 C736.2 988.2 642.6 990.1 631.1 990.0 C619.7 989.9 473.5 984.1 467.4 983.1 C461.3 982.2 484.2 968.8 485.3 967.1 C486.5 965.4 493.9 944.6 495.1 942.0 C496.3 939.3 512.9 907.4 513.8 904.2 C514.8 901.1 517.1 869.3 517.1 866.5 C517.1 863.6 513.5 837.7 513.0 835.6 C512.6 833.4 506.3 817.4 505.7 815.0 C505.1 812.6 498.1 781.1 497.6 778.4 C497.0 775.7 491.8 752.0 491.9 749.8 C491.9 747.6 497.8 726.8 498.4 724.6 C498.9 722.5 505.1 700.7 505.7 698.3 C506.3 695.9 512.9 670.0 513.8 667.4 C514.8 664.9 527.7 639.5 528.5 637.7 C529.4 635.9 533.4 625.2 534.2 624.0 C535.1 622.8 547.6 610.5 548.9 609.1 C550.2 607.7 564.2 589.7 565.2 589.7 C566.1 589.7 570.9 607.1 570.9 609.1 C570.9 611.1 565.0 637.5 565.2 637.7 C565.3 637.9 574.3 614.7 574.9 614.8 C575.5 615.0 579.2 641.0 579.8 641.1 C580.4 641.3 589.0 620.5 589.6 618.2 C590.2 616.0 593.6 589.4 594.5 587.4 C595.4 585.4 610.5 571.2 611.6 570.2 C612.6 569.3 619.8 565.3 619.7 564.5 C619.6 563.6 609.6 551.2 609.1 549.6 C608.6 548.0 606.3 526.7 607.5 525.6 C608.7 524.5 635.5 522.8 637.6 523.3 C639.8 523.8 657.0 537.4 658.8 538.2 C660.6 538.9 678.6 540.4 680.8 541.6 C683.0 542.8 709.1 564.8 711.8 566.8 C714.4 568.8 742.2 588.0 743.5 589.7 C744.8 591.3 743.1 604.1 743.5 605.7 C744.0 607.2 753.7 624.7 754.1 627.4 C754.5 630.1 752.6 667.0 752.5 669.7 C752.3 672.4 750.7 691.4 750.0 692.6 C749.4 693.8 737.4 697.5 736.2 698.3 C735.0 699.2 722.8 710.2 721.5 713.2 C720.2 716.2 705.2 768.1 705.2 770.4 C705.2 772.6 720.1 767.8 721.5 766.9 C723.0 766.1 739.1 751.2 740.3 749.8 C741.5 748.4 748.4 733.9 750.0 732.6 C751.6 731.3 776.2 718.4 778.5 718.9 C780.9 719.4 805.5 741.8 807.0 744.1 C808.6 746.3 816.0 768.6 816.8 772.7 C817.6 776.7 825.7 836.6 825.8 841.3 C825.9 846.0 820.7 882.9 819.3 884.8 C817.8 886.7 792.0 885.9 790.8 887.1 C789.5 888.2 789.2 910.6 788.3 912.2 C787.5 913.8 771.2 923.2 770.4 924.8 C769.5 926.4 769.1 947.4 768.0 950.0 C766.8 952.5 747.6 984.9 741.9 986.6Z" fill="var(--logo-land, #0A3A44)"/><path d="M174.2 432.9 C176.0 430.6 237.4 405.8 241.0 404.4 C244.6 402.9 257.8 400.8 261.4 398.6 C264.9 396.4 322.6 354.4 326.5 351.7 C330.4 349.1 352.7 336.6 355.0 335.7 C357.4 334.8 383.5 329.0 383.5 330.0 C383.5 331.0 357.2 357.6 355.0 360.9 C352.9 364.2 331.4 407.5 332.2 408.9 C333.1 410.4 371.7 394.1 375.4 395.2 C379.1 396.3 418.1 434.5 421.0 436.4 C423.9 438.3 442.1 440.4 444.6 441.0 C447.1 441.5 477.9 450.9 481.3 450.1 C484.7 449.3 523.3 423.9 526.1 422.7 C528.8 421.4 544.2 420.7 546.4 420.4 C548.6 420.0 576.0 415.1 579.0 414.6 C582.0 414.2 616.4 408.9 618.9 410.1 C621.5 411.3 638.2 442.0 640.1 443.2 C642.0 444.5 662.5 439.9 664.5 441.0 C666.6 442.0 687.3 467.1 689.0 469.5 C690.6 472.0 706.2 499.2 705.2 500.4 C704.3 501.7 669.7 498.8 667.0 499.3 C664.2 499.8 642.1 513.5 638.5 513.0 C634.8 512.5 584.2 487.1 579.0 486.7 C573.8 486.3 517.6 501.4 513.8 503.9 C510.1 506.3 491.8 545.6 489.4 546.2 C487.0 546.8 458.5 519.4 456.8 518.7 C455.1 518.1 450.9 526.7 448.7 530.2 C446.5 533.6 406.6 599.3 403.9 601.1 C401.2 602.9 385.2 575.8 383.5 572.5 C381.8 569.2 367.4 524.6 363.2 521.0 C358.9 517.4 288.6 489.2 281.7 486.7 C274.9 484.2 203.1 462.6 198.7 460.4 C194.2 458.2 172.5 435.3 174.2 432.9Z" fill="var(--logo-land, #0A3A44)"/><path d="M650 475 L628 585" fill="none" stroke="#F6F2E9" stroke-width="7" stroke-dasharray="4 11" stroke-linecap="round"/><path d="M628 585 L628 761 L770 903" fill="none" stroke="#5FB3BF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M525 850 L680 850 L752 922" fill="none" stroke="#E3AE45" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M505 935 L735 935" fill="none" stroke="#F07A45" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M245 455 L465 455 L485 475 L650 475" fill="none" stroke="#C98BBF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><circle cx="628" cy="585" r="13" fill="#F6F2E9" stroke="#5FB3BF" stroke-width="8"/><circle cx="628" cy="680" r="13" fill="#F6F2E9" stroke="#5FB3BF" stroke-width="8"/><circle cx="525" cy="850" r="13" fill="#F6F2E9" stroke="#E3AE45" stroke-width="8"/><circle cx="630" cy="850" r="13" fill="#F6F2E9" stroke="#E3AE45" stroke-width="8"/><circle cx="505" cy="935" r="13" fill="#F6F2E9" stroke="#F07A45" stroke-width="8"/><circle cx="620" cy="935" r="13" fill="#F6F2E9" stroke="#F07A45" stroke-width="8"/><circle cx="245" cy="455" r="13" fill="#F6F2E9" stroke="#C98BBF" stroke-width="8"/><circle cx="400" cy="455" r="13" fill="#F6F2E9" stroke="#C98BBF" stroke-width="8"/><circle cx="650" cy="475" r="13" fill="#F6F2E9" stroke="#C98BBF" stroke-width="8"/><circle cx="762" cy="930" r="30" fill="#F6F2E9"/><circle cx="762" cy="930" r="14" fill="#D9561F"/></svg>'

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
<link rel="apple-touch-icon" href="{base}apple-touch-icon.png">
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
