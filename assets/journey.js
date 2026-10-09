/* "You are here": map highlight, teaser, questionnaire and personalized plan. Plain JS. */
(function () {
  // Paste the Google Apps Script web app /exec URL here (see _src/setup/plan-requests.gs).
  // While it's empty the plan still unlocks; submissions just aren't saved.
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzq5gkO8UU0ePcdWeSmS_mid3TBkcmm-31mrGnkDl3UDK62h9v5uc_9TkwZpfif0kz8/exec";

  var root = document.getElementById("here");
  if (!root || !window.PROGRAMS) return;
  var P = window.PROGRAMS, ISDS = window.ISDS || [];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  var LINE = { school: "var(--lake)", college: "var(--gold)", apprentice: "var(--orange)", adult: "var(--plum)", employer: "var(--steel)", guide: "var(--green)" };

  var STAGES = {
    ms: { label: "Middle school", pin: [100, 70], lines: ["school", "credit", "trades"],
      stops: ["explore", "ap", "dual", "cte", "emc", "grad", "uni", "ccg", "youth", "app"],
      money: "Starting now: up to <strong>two free online courses every academic term</strong> (the district pays up to about $687 each). From grade 9: up to <strong>10 free college courses</strong>, at least $837.50 each, so about $8,375 in college credit before graduation.",
      goals: [["explore", "Figure out what fits"], ["credit", "Get ahead on college"], ["trade", "Hands-on skills"]] },
    hs: { label: "High school", pin: [300, 150], lines: ["school", "credit", "trades"],
      stops: ["ap", "dual", "cte", "emc", "youth", "grad", "uni", "ccg", "app"],
      money: "Up to <strong>10 college courses your district pays for</strong> (about $8,375 or more), a possible <strong>free 13th year</strong> that ends in an associate degree, then <strong>free community college for 3 years</strong> or up to <strong>$27,500</strong> in state scholarship money for a university.",
      goals: [["credit", "Free college credit"], ["trade", "Learn a trade"], ["paid", "Get paid while learning"], ["explore", "Figure out what fits"]] },
    grad: { label: "Just graduated", pin: [520, 70], lines: ["school", "credit", "trades"],
      stops: ["grad", "uni", "ccg", "youth", "app"],
      money: "<strong>Free community college for up to 3 years</strong>, or up to <strong>$5,500 a year</strong> at a university, or up to <strong>$2,000 a year</strong> for short career training. Or skip tuition entirely and <strong>get paid from day one</strong> in an apprenticeship.",
      goals: [["credit", "College, for free"], ["trade", "Learn a trade"], ["paid", "Earn while I learn"], ["explore", "Not sure yet"]] },
    adult: { label: "Adult with a diploma", pin: [740, 310], lines: ["adult", "trades"],
      stops: ["reconnect", "app"],
      money: "<strong>Free community college tuition</strong> through Michigan Reconnect if you're 21 or older without a degree, <strong>paid training</strong> through Michigan Works! if you qualify, and apprenticeships whose graduates earn a median of almost <strong>$90,000</strong> a year after finishing.",
      goals: [["switch", "Change careers"], ["trade", "Learn a trade"], ["paid", "Keep earning while I train"], ["credit", "Finish a degree or certificate"]] },
    nodiploma: { label: "Adult without a diploma", pin: [520, 310], lines: ["adult", "trades"],
      stops: ["adulted", "reconnect", "app"],
      money: "A <strong>free path to a high school diploma or GED</strong>, help with test fees, then <strong>free community college</strong> through Reconnect at 21+, or a paid apprenticeship.",
      goals: [["diploma", "Finish my diploma or GED"], ["trade", "Learn a trade"], ["paid", "Earn while I learn"]] },
    employer: { label: "Employer", pin: [300, 390], lines: ["employer", "trades"],
      stops: ["intern", "sponsor", "reimb", "cte", "app"],
      money: "Reimbursement of typically <strong>up to 50% of a trainee's wages</strong> during on-the-job training, state training grants that have <strong>averaged about $41,000</strong> per award and <strong>new-hire training at no upfront cost</strong> through community colleges.",
      goals: [["hire", "Hire new workers"], ["train", "Upskill current staff"], ["apprentice", "Start an apprenticeship"], ["schools", "Build a pipeline from schools"]] },
    educator: { label: "Educator or counselor", pin: null, lines: ["school", "credit", "trades", "adult", "employer"],
      stops: ["explore", "ap", "grad", "uni", "dual", "emc", "ccg", "cte", "youth", "app", "adulted", "reconnect", "intern", "sponsor", "reimb"],
      money: "You guide people on <strong>every line</strong>. Your plan includes the talking points, tools, rule changes and funding facts for the people you serve.",
      goals: [["students", "Help students and families"], ["jobseekers", "Help adult job seekers"], ["teach", "Teach or run CTE"], ["funding", "Understand the funding"]] }
  };

  var INTERESTS = [
    ["construction", "Building and construction"], ["electrical", "Electrical and energy"], ["mechanical", "Plumbing, HVAC and pipefitting"],
    ["manufacturing", "Manufacturing and robotics"], ["auto", "Automotive and trucking"], ["health", "Health care"],
    ["it", "IT and cybersecurity"], ["business", "Business and finance"], ["education", "Teaching and childcare"],
    ["ag", "Agriculture and natural resources"], ["culinary", "Culinary and hospitality"], ["safety", "Public safety"], ["unsure", "Not sure yet"]
  ];
  // "What do they love doing?" for people who don't know yet. Each trait points to career
  // areas (for the plan) and explore tags (for camps, clubs and programs).
  var TRAITS = [
    ["tinker", "Take things apart and build things", ["manufacturing", "mechanical", "electrical", "construction"], ["tinkering", "engineering", "robotics", "trades", "manufacturing"]],
    ["fix", "Fix bikes, cars or engines", ["auto", "mechanical"], ["automotive", "tinkering", "trades"]],
    ["code", "Games, computers or coding", ["it"], ["coding", "robotics"]],
    ["how", "Figure out how things work", ["it", "health", "manufacturing"], ["science", "engineering"]],
    ["help", "Help or take care of people", ["health", "education"], ["health"]],
    ["outdoors", "Be outdoors or around animals", ["ag", "construction"], ["outdoors", "science"]],
    ["design", "Draw, design or make videos", ["business"], ["art-design"]],
    ["cook", "Cook or bake", ["culinary"], ["culinary"]],
    ["lead", "Lead, sell or start things", ["business"], ["business", "leadership"]],
    ["protect", "Protect people or handle emergencies", ["safety"], ["leadership"]],
    ["fly", "Planes, drones or rockets", ["manufacturing"], ["aviation", "engineering"]]
  ];
  var TRAIT_BY = {}; TRAITS.forEach(function (t) { TRAIT_BY[t[0]] = t; });

  // Plain keyword matching on the open question. Deterministic on purpose: no AI, instant, private.
  var KEYWORDS = [
    [/tinker|build|lego|take (things )?apart|hands.?on|maker|invent/i, ["tinkering", "engineering"], ["manufacturing"]],
    [/robot/i, ["robotics", "engineering"], ["manufacturing"]],
    [/code|coding|computer|program|video ?game|minecraft|roblox|cyber/i, ["coding"], ["it"]],
    [/weld|electric|plumb|carpent|construct|trade|hvac|pipe/i, ["trades"], ["construction", "electrical"]],
    [/car|engine|motor|auto|mechanic|truck/i, ["automotive"], ["auto"]],
    [/nurs|doctor|medic|hospital|\bvet|health|dental/i, ["health"], ["health"]],
    [/cook|bak|chef|culinary/i, ["culinary"], ["culinary"]],
    [/draw|art|design|video|film|music/i, ["art-design"], []],
    [/plane|aviation|pilot|drone|rocket|space/i, ["aviation", "engineering"], []],
    [/farm|animal|outdoor|nature|hunt|fish/i, ["outdoors"], ["ag"]],
    [/business|money|sell|entrepreneur|start a/i, ["business"], ["business"]]
  ];
  var CAMP_WORDS = /camp|summer|try (it|out)|explore|not sure|don.?t know|undecided|no idea/i;

  var INTEREST_INFO = {
    construction: { jobs: "Construction laborers: 3,110 openings a year in Michigan, $22-$30 an hour.", link: ["trades/#union", "Carpenters, laborers and ironworker apprenticeships"] },
    electrical: { jobs: "Electricians: 2,450 openings a year, $24-$44 an hour. Power-line installers: $41-$60 an hour.", link: ["trades/#union", "IBEW electrical apprenticeships by region"] },
    mechanical: { jobs: "HVAC mechanics: 1,360 openings a year, $23-$37 an hour. Plumbers and pipefitters: $28-$46 an hour.", link: ["trades/#union", "UA plumber and pipefitter training centers"] },
    manufacturing: { jobs: "Industrial machinery mechanics: 1,900 openings a year, growing 13%, $28-$37 an hour.", link: ["trades/#open-shop", "Manufacturing apprenticeships and where to find them"] },
    auto: { jobs: "Truck drivers: 6,650 openings a year, $23-$30 an hour. Auto service technicians: 2,090 a year, $21-$32 an hour.", link: ["districts/#state-tools", "Find automotive CTE programs near you"] },
    health: { jobs: "Registered nurses have among the most openings in Michigan (about 6,500 a year). LPNs, radiologic technologists and respiratory therapists are also on the state's Hot 50.", link: ["districts/#state-tools", "Find health science programs near you"] },
    it: { jobs: "Michigan Virtual offers Cisco networking, cybersecurity and Linux certification prep courses high schoolers can take free through Section 21f.", link: ["students/#virtual", "How free virtual courses work"] },
    business: { jobs: "Business, marketing and finance CTE programs often include college credit and certifications.", link: ["districts/#state-tools", "Find business CTE programs near you"] },
    education: { jobs: "Michigan pays future teachers: a $10,000 a year fellowship, $9,600 per student-teaching semester and free tuition through Talent Together.", link: ["educators/#counselors", "Programs for future teachers"] },
    ag: { jobs: "Agriscience CTE counts toward the third science credit and Michigan Virtual offers an agriscience certification course.", link: ["districts/#state-tools", "Find agriscience programs near you"] },
    culinary: { jobs: "Culinary and hospitality CTE programs run at many tech centers, and the state added hospitality CTE grants for 2026-27.", link: ["districts/#state-tools", "Find culinary programs near you"] },
    safety: { jobs: "Public safety, criminal justice and fire science programs run at many ISD tech centers.", link: ["districts/#state-tools", "Find public safety programs near you"] },
    unsure: { jobs: "Pathfinder shows real Michigan wages and openings for hundreds of careers. Twenty minutes there is the best first step.", link: ["https://pathfinder.mitalent.org", "Open Pathfinder"] }
  };

  var STEPS = {
    ms: ["Ask the counselor to start or show you the Educational Development Plan (required from grade 7).", "Request up to two free virtual courses for next semester. Ask the term before.", "Take the free PSAT 8/9 seriously: a qualifying score opens dual enrollment in grade 9.", "Go to your ISD tech center's open house together, even this early.", "Spend 20 minutes on Pathfinder together."],
    hs: ["Ask for the dual enrollment deadline for next semester and which colleges your school partners with.", "Ask whether your district or ISD runs an Early Middle College. You must be enrolled by the fall of junior year, and many take applications in grade 10.", "Check the tech center's application window. Popular programs fill before junior year.", "Request free virtual courses the term before you want them.", "Senior year: file the FAFSA in the fall to unlock the Community College Guarantee or the Achievement Scholarship."],
    grad: ["File the FAFSA now if you haven't. It unlocks the Guarantee and the university award.", "You have 15 months from graduation to enroll and keep the Achievement Scholarship.", "Short training instead? Apply for the Skills Scholarship ($2,000 a year) in the MiSSG Student Portal.", "Want a paycheck instead of tuition? Check apprenticeship application windows in your trade now."],
    adult: ["If you're 21+ without a degree, fill out the Reconnect application (about 5 minutes).", "File the FAFSA. Reconnect requires it.", "Call Michigan Works! at 1-800-285-9675 and ask if WIOA can pay for training.", "Check apprenticeship application windows in your trade."],
    nodiploma: ["Find a free adult education program near you, or call 517-335-5858.", "Ask about the HSE-to-School program to cover GED or HiSET test fees.", "When you finish, apply for Reconnect if you're 21 or older.", "Ask Michigan Works! about training you can do alongside your classes."],
    employer: ["Call your Michigan Works! business services team about on-the-job training reimbursement.", "Prepare for the Going PRO Talent Fund round opening in early 2027.", "Fill out LEO's apprenticeship Employer Interest Form or join a group sponsor.", "Join an advisory committee at your ISD tech center. Every approved CTE program needs industry members.", "Hiring under-18s? Register on LEO's Youth Employment Permit Portal (required since Oct. 2, 2026)."],
    educator: ["Share the five talking points with every family you meet.", "Bookmark MI School Data's CTE search and the Early Middle College map.", "Youth work permits now come only from LEO's portal, not schools.", "Mark the Michigan Career Education Conference, Jan. 24-26, 2027, in Grand Rapids."]
  };

  // Grade-by-grade checklists for students and parents. {you}/{your}/{You}/{Your} become
  // "your child"/"your child's" for parents and "you"/"your" for students.
  var GRADE_STEPS = {
    6: ["Free virtual courses start now: {you} can take up to two online classes each academic term (semester or trimester), paid for by the district. Ask the counselor the term before.",
        "{Your} Educational Development Plan (EDP) starts in grade 7. Ask which tool the school uses so it isn't a surprise.",
        "Spend 20 minutes on Pathfinder looking at careers and real Michigan wages.",
        "Go to your ISD tech center's open house. It's never too early to see the labs."],
    7: ["This is the year {your} Educational Development Plan (EDP) starts. Ask the counselor to see it.",
        "Free virtual courses: up to two online classes each academic term (semester or trimester), paid for by the district. Ask the term before.",
        "Spend 20 minutes on Pathfinder looking at careers and real Michigan wages.",
        "Go to your ISD tech center's open house together."],
    8: ["This fall: ask the counselor for {your} EDP review. Michigan requires it in grade 8, before high school.",
        "By March 1: the school has to tell families about dual enrollment. If you haven't heard, ask.",
        "Winter and spring: 9th grade course selection. Ask which classes keep AP, dual enrollment and CTE doors open.",
        "Spring: the free PSAT 8/9 matters. A qualifying score lets {you} start college classes the district pays for in grade 9.",
        "Spring: visit the ISD tech center and ask whether your district has an Early Middle College. Most families decide by grade 10.",
        "Before summer: request a free virtual course for fall if the high school doesn't offer a class that fits."],
    9: ["Dual enrollment is open now: up to two college courses this year, paid for by the district. Ask for next semester's deadline.",
        "Review {your} EDP with the counselor. It's required every year of high school.",
        "Start looking at Early Middle College options. Many take applications in grade 10.",
        "Visit the tech center and list two or three programs {you} might want junior year.",
        "Request free virtual courses the term before."],
    10: ["Early Middle College decision year: {you} must be enrolled by the fall of junior year, and many programs take applications now.",
         "Apply to the ISD tech center for junior year. Popular programs fill.",
         "Keep taking dual enrollment courses. The yearly limit rises in later grades.",
         "The free PSAT 10 is practice for next year's SAT and can qualify more dual enrollment subjects."],
    11: ["If enrolled in an Early Middle College, confirm it's official this fall.",
         "Dual enrollment rises to as many as six courses a year.",
         "Spring: the Michigan Merit Exam includes the SAT and a work readiness test. A strong score earns a National Work Readiness Credential.",
         "At 16, a paid youth registered apprenticeship is possible. Ask the CTE teacher or Michigan Works!.",
         "Look for a MiCareerQuest career expo in your region."],
    12: ["This fall: file the FAFSA. It unlocks free community college or up to $5,500 a year at a university.",
         "Graduates have 15 months to enroll and keep the Achievement Scholarship.",
         "Want a paycheck instead of tuition? Check apprenticeship application windows now. Many take 18 year olds with a diploma.",
         "Review {your} EDP and talent portfolio with the counselor one last time."]
  };
  function voice(t) {
    var parent = state.role === "parent";
    return t.replace(/\{You\}/g, parent ? "Your child" : "You").replace(/\{Your\}/g, parent ? "Your child's" : "Your")
            .replace(/\{you\}/g, parent ? "your child" : "you").replace(/\{your\}/g, parent ? "your child's" : "your");
  }
  function stepsFor() {
    if ((state.stage === "ms" || state.stage === "hs") && GRADE_STEPS[state.grade]) return GRADE_STEPS[state.grade].map(voice);
    return STEPS[state.stage];
  }

  var COUNTY_TO_ISD = {};
  ISDS.forEach(function (r) { r.counties.split(",").forEach(function (c) { COUNTY_TO_ISD[c.trim()] = r; }); });

  var state = { stage: null, step: 1, county: "", interests: [], traits: [], goal: "", when: "", role: "", grade: "", question: "" };
  var svg = document.getElementById("transit"), pin = document.getElementById("pin");
  var teaser = document.getElementById("teaser"), quiz = document.getElementById("quiz"), plan = document.getElementById("plan");

  function programsFor(stage, goal) {
    var list = P.filter(function (p) { return p.who.indexOf(stage) > -1; });
    list.sort(function (a, b) {
      var ga = goal && a.goals.indexOf(goal) > -1 ? 1 : 0, gb = goal && b.goals.indexOf(goal) > -1 ? 1 : 0;
      return gb - ga || (b.priority || 0) - (a.priority || 0);
    });
    return list;
  }

  function card(p) {
    var cls = p.cost === "Free" ? "free" : (p.cost === "You get paid" ? "paid" : "");
    return '<article class="result" style="--c:' + (LINE[p.line] || LINE.school) + '"><span class="tag ' + cls + '">' + esc(p.cost) + '</span>' +
      (p.ages ? '<span class="tag">' + esc(p.ages) + '</span>' : "") + '<h3>' + esc(p.name) + '</h3><p>' + esc(p.what) + '</p>' +
      (p.how ? '<p class="meta"><strong>Start here:</strong> ' + esc(p.how) + '</p>' : "") +
      '<p class="meta">' + (p.page ? '<a href="' + p.page + '">Plain-English guide</a> · ' : "") + '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">Official site</a></p></article>';
  }

  // Map focus
  function focusMap(stage) {
    var s = STAGES[stage];
    svg.classList.add("focus");
    svg.querySelectorAll(".ln").forEach(function (l) { l.classList.toggle("on", s.lines.indexOf(l.getAttribute("data-line")) > -1); });
    svg.querySelectorAll(".stop").forEach(function (g) { g.classList.toggle("on", s.stops.indexOf(g.getAttribute("data-stop")) > -1); });
    if (s.pin) { pin.setAttribute("transform", "translate(" + s.pin[0] + " " + s.pin[1] + ")"); pin.style.opacity = 1; }
    else pin.style.opacity = 0;
    // On narrow screens the map scrolls sideways: bring the pin into view.
    var wrap = svg.parentNode;
    if (s.pin && wrap.scrollWidth > wrap.clientWidth) {
      var scale = svg.getBoundingClientRect().width / 1000;
      wrap.scrollTo({ left: Math.max(0, s.pin[0] * scale - wrap.clientWidth / 3), behavior: "smooth" });
    }
  }

  function communityLine() {
    var c = (window.SPONSORS || []).filter(function (s) { return s.type === "community"; })[0];
    return c ? '<p class="small muted community-line">' + esc(c.message) + '</p>' : "";
  }

  function renderTeaser() {
    var s = STAGES[state.stage], list = programsFor(state.stage);
    var open = list.slice(0, 3), locked = list.slice(3);
    teaser.innerHTML =
      '<div class="teaser-head"><p class="eyebrow" style="margin:0 0 .4rem">You are here: ' + esc(s.label) + '</p>' +
      '<h3>From here you can reach ' + s.stops.length + ' stops and ' + list.length + ' programs.</h3>' +
      '<p class="money">' + s.money + '</p></div>' +
      '<div class="results">' + open.map(card).join("") + '</div>' +
      (locked.length ? '<div class="locked"><p class="locked-title">' + locked.length + ' more options in your full plan</p><ul>' +
        locked.map(function (p) { return '<li><span class="lock" aria-hidden="true"></span>' + esc(p.name) + '</li>'; }).join("") + '</ul></div>' : "") +
      communityLine() +
      '<div class="unlock"><div><strong>Your full plan adds:</strong> every option in order for your goal, your ISD\'s tech center and Early Middle College, career matches with Michigan wages and a step-by-step checklist with deadlines.</div>' +
      '<button class="btn" type="button" id="start-quiz">Get my full plan, 4 quick questions</button></div>';
    teaser.hidden = false;
    document.getElementById("start-quiz").addEventListener("click", openQuiz);
  }

  root.querySelectorAll("#stage-chips .chip").forEach(function (b) {
    b.addEventListener("click", function () {
      state.stage = b.getAttribute("data-stage");
      root.querySelectorAll("#stage-chips .chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
      focusMap(state.stage); renderTeaser(); quiz.hidden = true; plan.hidden = true;
    });
  });

  // Questionnaire
  var countySel = document.getElementById("q-county");
  Object.keys(COUNTY_TO_ISD).sort().forEach(function (c) { var o = document.createElement("option"); o.value = c; o.textContent = c + " County"; countySel.appendChild(o); });

  function chipGroup(el, items, multi, key) {
    el.innerHTML = items.map(function (it) { return '<button type="button" class="chip" aria-pressed="false" data-v="' + it[0] + '">' + esc(it[1]) + '</button>'; }).join("");
    el.onclick = function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      var v = b.getAttribute("data-v");
      if (multi) { var i = state[key].indexOf(v); if (i > -1) state[key].splice(i, 1); else state[key].push(v); }
      else state[key] = state[key] === v ? "" : v;
      el.querySelectorAll(".chip").forEach(function (c) {
        var on = multi ? state[key].indexOf(c.getAttribute("data-v")) > -1 : state[key] === c.getAttribute("data-v");
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    };
  }
  document.getElementById("q-when").onclick = function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.when = b.getAttribute("data-v");
    this.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
  };
  document.getElementById("q-role").onclick = function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.role = b.getAttribute("data-v");
    this.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
  };

  function openQuiz() {
    var st = state.stage;
    state.step = 1; state.interests = []; state.traits = []; state.goal = "";
    var people = st !== "employer" && st !== "educator";
    document.getElementById("q-traits-block").hidden = !people;
    if (people) chipGroup(document.getElementById("q-traits"), TRAITS, true, "traits");
    chipGroup(document.getElementById("q-interests"), INTERESTS.filter(function (i) { return !(st === "employer" && i[0] === "unsure"); }), true, "interests");
    chipGroup(document.getElementById("q-goal"), STAGES[st].goals, false, "goal");
    var legend2 = document.getElementById("q-interests-legend");
    legend2.innerHTML = st === "employer" ? 'Which roles do you need to fill? <span class="muted small">Pick any.</span>' :
      st === "educator" ? 'Which career areas do you work with? <span class="muted small">Pick any.</span>' : 'Any career areas already on the radar? <span class="muted small">Optional.</span>';
    document.getElementById("q-question-label").firstChild.textContent = people ? "Anything on your mind? Ask in your own words. " : "Anything you want help with? Ask in your own words. ";
    var young = st === "ms" || st === "hs";
    document.getElementById("q-school-rows").hidden = !young;
    state.role = st === "ms" ? "parent" : ""; state.grade = "";
    document.getElementById("q-role").querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-v") === state.role ? "true" : "false"); });
    var grades = st === "ms" ? ["6", "7", "8"] : ["9", "10", "11", "12"];
    var gEl = document.getElementById("q-grade");
    gEl.innerHTML = grades.map(function (g) { return '<button type="button" class="chip" aria-pressed="false" data-v="' + g + '">Grade ' + g + '</button>'; }).join("");
    gEl.onclick = function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      state.grade = b.getAttribute("data-v");
      gEl.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", c === b ? "true" : "false"); });
    };
    document.getElementById("q-email-label").textContent = st === "ms" ? "Parent or guardian email" : "Email";
    document.getElementById("q-role").addEventListener("click", function () {
      document.getElementById("q-email-label").textContent = (state.stage === "ms" || state.role === "parent") ? "Parent or guardian email" : "Email";
    });
    document.getElementById("q-org-field").hidden = !(st === "employer" || st === "educator");
    quiz.hidden = false; showStep();
    quiz.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showStep() {
    var tl = document.getElementById("q-traits-legend");
    if (tl) tl.firstChild.textContent = (state.role === "parent" ? "What does your child love doing? " : (state.stage === "ms" || state.stage === "hs") ? "What do you love doing? " : "What do you enjoy doing? ");
    quiz.querySelectorAll(".qstep").forEach(function (f) { f.hidden = +f.getAttribute("data-step") !== state.step; });
    document.getElementById("quiz-bar").style.width = (state.step / 4 * 100) + "%";
    document.getElementById("quiz-step-label").textContent = "Stop " + state.step + " of 4";
    document.getElementById("quiz-back").style.visibility = state.step === 1 ? "hidden" : "visible";
    document.getElementById("quiz-next").textContent = state.step === 4 ? "Show my plan" : "Next";
    document.getElementById("quiz-error").textContent = "";
  }

  function validate() {
    var err = "";
    if (state.step === 1 && (state.stage === "ms" || state.stage === "hs") && !state.role) err = "Tell us who's filling this out.";
    else if (state.step === 1 && (state.stage === "ms" || state.stage === "hs") && !state.grade) err = "Pick the student's grade.";
    else if (state.step === 1 && !countySel.value) err = "Pick a county so we can find your ISD.";
    if (state.step === 2 && !state.interests.length && !state.traits.length) err = (state.stage === "employer" || state.stage === "educator") ? "Pick at least one area." : "Pick at least one thing they enjoy, or a career area.";
    if (state.step === 3 && !state.goal) err = "Pick what matters most.";
    if (state.step === 4) {
      var email = document.getElementById("q-email").value.trim();
      if (!document.getElementById("q-name").value.trim()) err = "Add a first name.";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) err = "That email doesn't look right.";
      else if (!document.getElementById("q-consent").checked) err = "Check the box so we can send your plan.";
    }
    document.getElementById("quiz-error").textContent = err;
    return !err;
  }

  document.getElementById("quiz-back").addEventListener("click", function () { if (state.step > 1) { state.step--; showStep(); } });
  document.getElementById("quiz-next").addEventListener("click", function () {
    if (!validate()) return;
    if (state.step < 4) { state.step++; showStep(); return; }
    finish();
  });

  function matchQuestion(q) {
    var tags = [], ints = [];
    KEYWORDS.forEach(function (k) { if (k[0].test(q)) { tags = tags.concat(k[1]); ints = ints.concat(k[2]); } });
    return { tags: tags, interests: ints, camps: CAMP_WORDS.test(q) };
  }
  function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }
  function profile() {
    var q = matchQuestion(state.question || "");
    var ints = state.interests.slice(), tags = [];
    state.traits.forEach(function (t) { var d = TRAIT_BY[t]; if (d) { ints = ints.concat(d[2]); tags = tags.concat(d[3]); } });
    state.interests.forEach(function (i) { tags.push({ construction: "trades", electrical: "trades", mechanical: "trades", manufacturing: "manufacturing", auto: "automotive", health: "health", it: "coding", business: "business", ag: "outdoors", culinary: "culinary", safety: "leadership", education: "leadership" }[i]); });
    ints = uniq(ints.concat(q.interests)).filter(function (i) { return i !== "unsure"; });
    return { interests: ints.length ? ints : ["unsure"], tags: uniq(tags.concat(q.tags)), camps: q.camps };
  }

  function planText(isd, list) {
    var lines = ["Your Michigan Skills plan", "Where you are: " + STAGES[state.stage].label + (state.grade ? ", grade " + state.grade : ""), "County: " + state.county + " (" + (isd ? isd.name : "") + ")", ""];
    if (isd) { lines.push("Your ISD: " + isd.name + " " + isd.url); if (isd.cte_center) lines.push("Career and technical education: " + isd.cte_center + (isd.cte_url ? " " + isd.cte_url : "")); if (isd.emc) lines.push("Early Middle College: " + isd.emc); lines.push(""); }
    lines.push("Next steps:"); stepsFor().forEach(function (s, i) { lines.push((i + 1) + ". " + s); });
    lines.push("", "Your options:"); list.forEach(function (p) { lines.push("- " + p.name + ": " + p.url); });
    return lines.join("\n");
  }

  function finish() {
    state.county = countySel.value;
    state.question = document.getElementById("q-question").value.trim();
    var isd = COUNTY_TO_ISD[state.county];
    var list = programsFor(state.stage, state.goal);
    var data = {
      ts: new Date().toISOString(), stage: state.stage, county: state.county, isd: isd ? isd.name : "",
      interests: profile().interests.join(", "), traits: state.traits.join(", "), question: state.question, goal: state.goal, when: state.when, role: state.role, grade: state.grade,
      name: document.getElementById("q-name").value.trim(), email: document.getElementById("q-email").value.trim(),
      org: document.getElementById("q-org").value.trim(), consent: "yes", page: location.href,
      plan_text: planText(isd, list)
    };
    var bot = document.getElementById("q-hp").value;
    if (FORM_ENDPOINT && !bot) {
      try { fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() }); } catch (e) {}
    }
    store("msm-plan", { stage: state.stage, grade: state.grade, county: state.county, interests: state.interests, traits: state.traits, goal: state.goal, name: data.name });
    renderPlan(data.name, isd, list);
  }

  function renderPlan(name, isd, list) {
    var s = STAGES[state.stage];
    var prof = profile();
    var interestHtml = prof.interests.map(function (k) {
      var info = INTEREST_INFO[k]; if (!info) return "";
      var label = (INTERESTS.filter(function (i) { return i[0] === k; })[0] || [k, k])[1];
      return '<li><strong>' + esc(label) + ':</strong> ' + esc(info.jobs) + ' <a href="' + info.link[0] + '"' + (info.link[0].indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "") + '>' + esc(info.link[1]) + '</a></li>';
    }).join("");
    var isdHtml = isd ? '<div class="card isd-card"><p class="eyebrow" style="margin:0 0 .3rem">Your area · ' + esc(state.county) + ' County</p><h3><a href="' + esc(isd.url) + '" target="_blank" rel="noopener">' + esc(isd.name) + '</a></h3>' +
      '<dl class="facts"><dt>Career tech</dt><dd>' + (isd.cte_url ? '<a href="' + esc(isd.cte_url) + '" target="_blank" rel="noopener">' + esc(isd.cte_center) + '</a>' : esc(isd.cte_center || "Ask the ISD")) + '</dd>' +
      '<dt>Early Middle College</dt><dd>' + (isd.emc ? '<a href="' + esc(isd.emc) + '" target="_blank" rel="noopener">See the program</a>' : 'Not listed by the ISD. Ask your high school, many run their own.') + '</dd>' +
      countyEdition(isd) +
      '<dt>Every program</dt><dd><a href="https://www.mischooldata.org/cte-programs-offered/" target="_blank" rel="noopener">Search "' + esc(isd.name) + '" on MI School Data</a></dd></dl></div>' : "";
    plan.innerHTML =
      '<div class="plan-head"><p class="eyebrow" style="margin:0">Step 3 · your plan</p><h2>' + esc(name) + (state.role === "parent" ? ", here is your child\'s route." : ", here is your route.") + '</h2><p class="money">' + s.money + '</p>' +
      '<p class="small muted">' + (FORM_ENDPOINT ? "A copy is on its way to your inbox. " : "") + '<button class="linkish" type="button" id="print-plan">Print or save as PDF</button></p></div>' +
      '<div class="grid two plan-top">' + isdHtml +
      '<div class="card"><h3>' + (state.grade === "8" ? "Before high school: your checklist" : state.grade ? "Grade " + state.grade + " checklist" : "Your next steps") + '</h3><ol class="steps">' + stepsFor().map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ol></div></div>' +
      (interestHtml ? '<div class="card" style="margin-top:1rem"><h3>Careers that match what you picked</h3><ul>' + interestHtml + '</ul><p class="sources">Wages and openings: <a href="https://www.michigan.gov/mcda/reports/michigan-hot-50" target="_blank" rel="noopener">Michigan Hot 50, 2026</a></p></div>' : "") +
      sponsorHtml(isd, prof) + exploreHtml(prof) + questionHtml(prof) +
      '<h3 style="margin-top:2rem">All ' + list.length + ' options, best fit first</h3><div class="results">' + list.map(card).join("") + '</div>';
    quiz.hidden = true; teaser.hidden = true; plan.hidden = false;
    document.getElementById("print-plan").addEventListener("click", function () { document.body.classList.add("printing-plan"); window.print(); setTimeout(function () { document.body.classList.remove("printing-plan"); }, 500); });
    plan.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Region for "near you" matching
  var REGION = {};
  [["Detroit metro", "Wayne|Oakland|Macomb|Washtenaw|Livingston|Monroe|St. Clair"],
   ["West Michigan", "Kent|Ottawa|Muskegon|Allegan|Ionia|Montcalm|Newaygo|Barry|Oceana|Mason|Lake|Mecosta|Osceola"],
   ["Mid-Michigan", "Ingham|Eaton|Clinton|Shiawassee|Genesee|Lapeer|Saginaw|Bay|Midland|Gratiot|Isabella|Clare|Gladwin|Arenac|Jackson|Hillsdale|Lenawee"],
   ["Thumb", "Huron|Tuscola|Sanilac"],
   ["Southwest", "Kalamazoo|Calhoun|Berrien|Cass|St. Joseph|Van Buren|Branch"],
   ["Northern Lower", "Grand Traverse|Leelanau|Benzie|Antrim|Kalkaska|Wexford|Missaukee|Manistee|Roscommon|Crawford|Oscoda|Ogemaw|Iosco|Alcona|Alpena|Montmorency|Otsego|Cheboygan|Presque Isle|Charlevoix|Emmet"],
   ["Upper Peninsula", "Alger|Baraga|Chippewa|Delta|Dickinson|Gogebic|Houghton|Iron|Keweenaw|Luce|Mackinac|Marquette|Menominee|Ontonagon|Schoolcraft"]
  ].forEach(function (r) { r[1].split("|").forEach(function (c) { REGION[c] = r[0]; }); });

  // Try-it-first: camps, clubs, competitions and museum programs (assets/data/explore.js)
  function exploreHtml(prof) {
    var E = window.EXPLORE || [];
    var st = state.stage, g = +state.grade || (st === "grad" ? 13 : 0);
    if (!E.length || st === "employer" || st === "educator" || st === "adult" || st === "nodiploma") return "";
    var region = REGION[state.county];
    var q = (state.question || "").toLowerCase();
    var scored = E.filter(function (x) { return !g || (g >= x.gmin && g <= x.gmax); }).map(function (x) {
      var hit = x.tags.filter(function (t) { return prof.tags.indexOf(t) > -1; }).length;
      var near = x.region === region ? 2 : (x.region === "Statewide" ? 1 : 0);
      var named = q && (x.aliases || []).some(function (a) { return q.indexOf(a) > -1; }) ? 1 : 0;
      return { x: x, score: named * 20 + hit * 3 + near, hit: hit, near: near, named: named };
    }).filter(function (r) { return r.named || r.hit > 0 || (!prof.tags.length && r.near > 0); });
    scored.sort(function (a, b) { return b.score - a.score; });
    var top = scored.slice(0, 6);
    if (!top.length) return "";
    var who = state.role === "parent" ? "your child" : "you";
    return '<div class="card explore" style="margin-top:1rem"><p class="eyebrow" style="margin:0 0 .3rem">Try it before choosing</p>' +
      '<h3>Camps, clubs and programs that fit what ' + who + ' enjoy' + (state.role === "parent" ? "s" : "") + '</h3>' +
      '<p class="small muted">Not knowing yet is normal. A summer camp or a robotics team is the cheapest way to find out. Near ' + esc(state.county) + ' County first, then statewide.</p>' +
      '<div class="results">' + top.map(function (r) {
        var x = r.x;
        return '<article class="result" style="--c:var(--green)"><span class="tag">' + esc(x.type) + '</span><span class="tag">' + esc(x.where) + '</span>' +
          (x.cost ? '<span class="tag ' + (/free/i.test(x.cost) ? "free" : "") + '">' + esc(x.cost) + '</span>' : "") +
          '<h3>' + esc(x.name) + '</h3><p>' + esc(x.what) + '</p><p class="meta"><a href="' + esc(x.url) + '" target="_blank" rel="noopener">See dates and details</a></p></article>';
      }).join("") + '</div></div>';
  }

  function questionHtml(prof) {
    if (!state.question) return "";
    var tips = [];
    var E = window.EXPLORE || [], ql = state.question.toLowerCase();
    var named = E.filter(function (x) { return (x.aliases || []).some(function (a) { return ql.indexOf(a) > -1; }); });
    var orgs = named.map(function (x) { return x.org; }).filter(function (o, i, arr) { return arr.indexOf(o) === i; });
    if (orgs.length) tips.push("You mentioned " + (orgs.length > 1 ? orgs.slice(0, -1).join(", ") + " and " + orgs[orgs.length - 1] : orgs[0]) + ". We put their programs for your grade at the top of the list above, with links to dates and costs.");
    if (prof.camps) tips.push("Summer camps and teams are the low-risk way to test an interest. The ones above match what you told us.");
    if (prof.tags.indexOf("tinkering") > -1 || prof.tags.indexOf("robotics") > -1) tips.push("Kids who like to tinker often find their thing in a FIRST robotics team, a tech center visit or a manufacturing or electrical camp. All three show real careers, not just hobbies.");
    if (state.stage === "ms" && state.grade === "8") tips.push("For an 8th grader, the most useful next step is the tech center open house this spring. Seeing the welding booths, robots and auto shop in person often settles it.");
    if (!tips.length) tips.push("Start with the next steps and options in this plan, and Pathfinder for real Michigan wages and openings.");
    return '<div class="card" style="margin-top:1rem;border-left:5px solid var(--orange)"><p class="eyebrow" style="margin:0 0 .3rem">You asked</p>' +
      '<p style="font-style:italic">"' + esc(state.question) + '"</p><ul>' + tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul>' +
      '<p class="small muted" style="margin:0">A real person reads every question. If there\'s something better to suggest, we\'ll email you.</p></div>';
  }

  function countyEdition(isd) {
    var ce = (window.COUNTY_EDITIONS || {})[isd.name];
    if (!ce) return "";
    return (ce.open_house ? '<dt>Open house</dt><dd>' + esc(ce.open_house) + '</dd>' : "") +
      (ce.emc_deadline ? '<dt>Deadline</dt><dd>' + esc(ce.emc_deadline) + '</dd>' : "") +
      (ce.contact ? '<dt>Talk to a person</dt><dd>' + esc(ce.contact) + '</dd>' : "");
  }

  // Featured partners (assets/data/sponsors.js). Always labeled. Never changes the order of the options.
  function sponsorHtml(isd, prof) {
    var S = window.SPONSORS || [];
    var region = REGION[state.county];
    var hits = S.filter(function (sp) {
      if (sp.type === "community") return false;
      var place = !sp.regions || sp.regions.indexOf("Statewide") > -1 || sp.regions.indexOf(region) > -1;
      var who = !sp.stages || sp.stages.indexOf(state.stage) > -1;
      var fit = !sp.interests || sp.interests.some(function (i) { return prof.interests.indexOf(i) > -1; });
      return place && who && fit;
    }).slice(0, 2);
    if (!hits.length) return "";
    return '<div class="sponsor-row">' + hits.map(function (sp) {
      return '<a class="sponsor" href="' + esc(sp.url) + '" target="_blank" rel="noopener sponsored"><span class="sponsor-label">Featured partner</span>' +
        '<strong>' + esc(sp.name) + '</strong><span>' + esc(sp.message) + '</span>' + (sp.banner ? '<em>' + esc(sp.banner) + '</em>' : "") + '</a>';
    }).join("") + '</div>';
  }

  // Deep link: /?here=hs preselects a stage (handy for QR codes and counselor links)
  var pre = new URLSearchParams(location.search).get("here");
  var hm = /^#here-([a-z]+)$/.exec(location.hash || "");
  if (!pre && hm) pre = hm[1];
  if (pre && STAGES[pre]) { var b = root.querySelector('#stage-chips [data-stage="' + pre + '"]'); if (b) b.click(); }
})();
