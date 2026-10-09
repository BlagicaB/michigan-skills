/* Michigan Skills: nav, theme, path finder and program directory. Plain JS, no dependencies. */
(function () {
  var root = document.documentElement;

  // Theme: remember a manual choice per viewer, otherwise follow the system.
  try { var saved = localStorage.getItem("msm-theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  document.addEventListener("click", function (e) {
    var t = e.target.closest(".theme-toggle");
    if (!t) return;
    var dark = root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("msm-theme", next); } catch (e2) {}
  });

  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    var setOpen = function (open) { nav.classList.toggle("open", open); toggle.setAttribute("aria-expanded", open ? "true" : "false"); };
    toggle.addEventListener("click", function (e) { e.stopPropagation(); setOpen(!nav.classList.contains("open")); });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  // Mark the current page in the nav
  var here = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".site-nav a, .who-bar a").forEach(function (a) {
    var p = a.getAttribute("href").replace(/index\.html$/, "");
    var abs = new URL(p, location.href).pathname;
    if (abs === here) a.setAttribute("aria-current", "page");
  });

  var P = window.PROGRAMS || [];
  var LINE = { school: "var(--lake)", college: "var(--gold)", apprentice: "var(--orange)", adult: "var(--plum)", employer: "var(--steel)", guide: "var(--green)" };
  var base = document.body.getAttribute("data-base") || "";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function card(p) {
    var costClass = p.cost === "Free" ? "free" : (p.cost === "You get paid" ? "paid" : "");
    return '<article class="result" style="--c:' + (LINE[p.line] || LINE.school) + '">' +
      '<span class="tag ' + costClass + '">' + esc(p.cost) + '</span>' +
      (p.ages ? '<span class="tag">' + esc(p.ages) + '</span>' : "") +
      '<h3>' + esc(p.name) + '</h3>' +
      '<p>' + esc(p.what) + '</p>' +
      (p.how ? '<p class="meta"><strong>Start here:</strong> ' + esc(p.how) + '</p>' : "") +
      '<p class="meta">' +
        (p.page ? '<a href="' + base + p.page + '">Read the plain-English guide</a> · ' : "") +
        '<a href="' + esc(p.url) + '" rel="noopener" target="_blank">Official site</a></p>' +
      '</article>';
  }

  // Path finder (home page)
  var finder = document.getElementById("finder");
  if (finder) {
    var state = { who: null, goal: null };
    var out = document.getElementById("finder-results");
    var count = document.getElementById("finder-count");
    function render() {
      if (!state.who) { out.innerHTML = ""; count.textContent = "Pick who is looking to see your options."; return; }
      var list = P.filter(function (p) { return p.who.indexOf(state.who) > -1; });
      if (state.goal) {
        var hits = list.filter(function (p) { return p.goals.indexOf(state.goal) > -1; });
        list = hits;
      }
      list.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
      count.textContent = list.length
        ? list.length + (list.length === 1 ? " option fits." : " options fit.") + " Start with the first few."
        : "Nothing matches that exact combination. Try a different goal.";
      out.innerHTML = list.map(card).join("");
    }
    finder.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      var key = b.parentNode.getAttribute("data-q");
      var val = b.getAttribute("data-v");
      state[key] = state[key] === val ? null : val;
      b.parentNode.querySelectorAll(".chip").forEach(function (c) {
        c.setAttribute("aria-pressed", c.getAttribute("data-v") === state[key] ? "true" : "false");
      });
      render();
    });
    render();
  }

  // Program directory (programs page)
  var dir = document.getElementById("directory");
  if (dir) {
    var q = document.getElementById("dir-search");
    var dirOut = document.getElementById("dir-results");
    var dirCount = document.getElementById("dir-count");
    var dstate = { who: null, line: null };
    var params = new URLSearchParams(location.search);
    if (params.get("who")) dstate.who = params.get("who");
    function drender() {
      var term = (q.value || "").toLowerCase().trim();
      var list = P.filter(function (p) {
        if (dstate.who && p.who.indexOf(dstate.who) === -1) return false;
        if (dstate.line && p.line !== dstate.line) return false;
        if (!term) return true;
        return (p.name + " " + p.what + " " + (p.keywords || "")).toLowerCase().indexOf(term) > -1;
      });
      list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      dirCount.textContent = list.length + " of " + P.length + " programs";
      dirOut.innerHTML = list.map(card).join("");
      dir.querySelectorAll(".chips").forEach(function (g) {
        var k = g.getAttribute("data-q");
        g.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-v") === dstate[k] ? "true" : "false"); });
      });
    }
    dir.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      var key = b.parentNode.getAttribute("data-q");
      var val = b.getAttribute("data-v");
      dstate[key] = dstate[key] === val ? null : val;
      drender();
    });
    q.addEventListener("input", drender);
    drender();
  }

  // ISD finder (districts page)
  var isd = document.getElementById("isd-finder");
  if (isd && window.ISDS) {
    var iq = document.getElementById("isd-search");
    var tbody = document.getElementById("isd-rows");
    var icount = document.getElementById("isd-count");
    function irender() {
      var term = (iq.value || "").toLowerCase().trim();
      var list = window.ISDS.filter(function (r) {
        return !term || (r.name + " " + r.short + " " + r.counties + " " + (r.cte_center || "")).toLowerCase().indexOf(term) > -1;
      });
      icount.textContent = list.length + " of " + window.ISDS.length + " intermediate school districts";
      tbody.innerHTML = list.map(function (r) {
        return "<tr><td><a href='" + esc(r.url) + "' target='_blank' rel='noopener'>" + esc(r.name) + "</a></td>" +
          "<td>" + esc(r.counties) + "</td>" +
          "<td>" + (r.cte_url ? "<a href='" + esc(r.cte_url) + "' target='_blank' rel='noopener'>" + esc(r.cte_center) + "</a>" : esc(r.cte_center || "Ask the ISD")) + "</td>" +
          "<td>" + (r.emc ? "<a href='" + esc(r.emc) + "' target='_blank' rel='noopener'>Yes, see program</a>" : "<span class='muted'>Ask</span>") + "</td></tr>";
      }).join("");
    }
    iq.addEventListener("input", irender);
    irender();
  }

  // Featured partner strip (trades and employer pages). Labeled, separate from the neutral lists.
  document.querySelectorAll("[data-featured]").forEach(function (el) {
    var want = el.getAttribute("data-featured").split(",");
    var S = (window.SPONSORS || []).filter(function (s) {
      return s.type !== "community" && (!s.interests || s.interests.some(function (i) { return want.indexOf(i) > -1; }) || (s.stages && want.indexOf("employer") > -1 && s.stages.indexOf("employer") > -1));
    }).slice(0, 3);
    if (!S.length) return;
    el.innerHTML = '<p class="sponsor-label" style="margin:0 0 .5rem">Featured partners</p><div class="sponsor-row">' + S.map(function (s) {
      return '<a class="sponsor" href="' + esc(s.url) + '" target="_blank" rel="noopener sponsored"><strong>' + esc(s.name) + '</strong><span>' + esc(s.message) + '</span>' + (s.banner ? '<em>' + esc(s.banner) + '</em>' : "") + '</a>';
    }).join("") + '</div>';
    el.hidden = false;
  });

  // Rotating stats (home hero). Pauses on hover or focus, and never auto-rotates for reduced-motion users.
  var sc = document.getElementById("stat-card");
  if (sc && window.STATS && window.STATS.length) {
    var ST = window.STATS, si = 0, timer = null, paused = false;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dots = document.getElementById("stat-dots");
    dots.innerHTML = ST.map(function () { return "<i></i>"; }).join("");
    var show = function (i) {
      si = (i + ST.length) % ST.length; var x = ST[si];
      sc.classList.remove("in"); void sc.offsetWidth; sc.classList.add("in");
      document.getElementById("stat-big").textContent = x.big;
      document.getElementById("stat-unit").textContent = x.unit;
      document.getElementById("stat-text").textContent = x.text;
      var a = document.getElementById("stat-src"); a.textContent = x.src; a.href = x.url;
      [].forEach.call(dots.children, function (d, k) { d.className = k === si ? "on" : ""; });
    };
    var start = function () { if (!reduce && !paused && !timer) timer = setInterval(function () { show(si + 1); }, 6000); };
    var stop = function () { clearInterval(timer); timer = null; };
    document.getElementById("stat-next").addEventListener("click", function () { show(si + 1); });
    document.getElementById("stat-prev").addEventListener("click", function () { show(si - 1); });
    var pb = document.getElementById("stat-pause");
    pb.addEventListener("click", function () { paused = !paused; pb.textContent = paused ? "Play" : "Pause"; pb.setAttribute("aria-pressed", paused ? "true" : "false"); paused ? stop() : start(); });
    if (reduce) { paused = true; pb.hidden = true; }
    sc.addEventListener("mouseenter", stop); sc.addEventListener("mouseleave", start);
    sc.addEventListener("focusin", stop); sc.addEventListener("focusout", start);
    sc.hidden = false; show(0); start();
  }

  // Community colleges: table on the districts page, cards on the colleges page
  var CC = window.COLLEGES || [];
  var cr = document.getElementById("college-rows");
  if (cr && CC.length) {
    cr.innerHTML = CC.map(function (c) {
      return "<tr><td><a href='" + esc(c.url) + "' target='_blank' rel='noopener'>" + esc(c.name) + "</a></td><td>" + esc(c.city) + "</td></tr>";
    }).join("");
  }
  var cc = document.getElementById("college-cards");
  if (cc && CC.length) {
    var cq = document.getElementById("college-search"), ccount = document.getElementById("college-count");
    var link = function (u, label) { return u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + label + '</a>' : ""; };
    var crender = function () {
      var term = (cq.value || "").toLowerCase().trim();
      var list = CC.filter(function (c) { return !term || (c.name + " " + c.city + " " + c.programs).toLowerCase().indexOf(term) > -1; });
      ccount.textContent = list.length + " of " + CC.length + " colleges";
      cc.innerHTML = list.map(function (c) {
        var links = [link(c.dual, "High school students"), link(c.reconnect, "Reconnect and free tuition"), link(c.trades, "Trades and technical programs")].filter(Boolean);
        if (!links.length) links = [link(c.url, "College website")];
        return '<article class="result" style="--c:var(--gold)">' + (c.tribal ? '<span class="tag">Tribal college</span>' : "") + '<span class="tag">' + esc(c.city) + '</span>' +
          '<h3><a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.name.replace(" (tribal)", "")) + '</a></h3>' +
          (c.programs ? '<p><strong>Hands-on programs include:</strong> ' + esc(c.programs) + '</p>' : "") +
          '<p class="meta">' + links.join(" · ") + '</p></article>';
      }).join("");
    };
    cq.addEventListener("input", crender);
    crender();
  }
})();
