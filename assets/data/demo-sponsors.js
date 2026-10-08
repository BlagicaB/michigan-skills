/* Demo mode for partner pitches. Open any page with ?demo=partners (and ?demo=off to leave).
   Every name here is a made-up sample. Never put a real organization in demo data. */
(function () {
  var on = false;
  try {
    var q = new URLSearchParams(location.search).get("demo");
    var h = location.hash || "";
    if (q === "partners" || h === "#demo-partners") sessionStorage.setItem("msm-demo", "1");
    if (q === "off" || h === "#demo-off") sessionStorage.removeItem("msm-demo");
    on = sessionStorage.getItem("msm-demo") === "1";
  } catch (e) { on = /demo=partners/.test(location.search) || location.hash === "#demo-partners"; }
  if (!on) return;
  window.MSM_DEMO = true;

  window.SPONSORS = (window.SPONSORS || []).concat([
    { name: "Sample Electrical Training Center", type: "featured", url: "#sample", message: "Paid 5-year electrical apprenticeship. Wages, health care and pension from day one.",
      banner: "Applications open now through Jan. 31 (sample)", regions: ["Detroit metro", "Mid-Michigan"], stages: ["hs", "grad", "adult"], interests: ["electrical", "construction"] },
    { name: "Sample Precision Manufacturing Co.", type: "featured", url: "#sample", message: "Hiring apprentice machinists and maintenance techs. We pay for your community college classes.",
      banner: "Now hiring apprentices (sample)", regions: ["West Michigan", "Detroit metro"], stages: ["hs", "grad", "adult"], interests: ["manufacturing", "mechanical", "auto"] },
    { name: "Sample Regional Health System", type: "featured", url: "#sample", message: "Paid CNA training for high school seniors and adults, then tuition help toward nursing.",
      regions: ["Detroit metro", "West Michigan", "Mid-Michigan", "Southwest"], stages: ["hs", "grad", "adult"], interests: ["health"] },
    { name: "Sample Community College", type: "featured", url: "#sample", message: "Dual enrollment, Early Middle College and Reconnect-eligible certificates, with a counselor who will call you back.",
      regions: ["Detroit metro"], stages: ["ms", "hs", "grad", "adult", "nodiploma"] },
    { name: "Sample Employer Hiring Network", type: "featured", url: "#sample", message: "Join 40 local employers sharing apprentices and on-the-job training reimbursement.",
      regions: ["Statewide"], stages: ["employer"] },
    { name: "Sample Community Foundation", type: "community", url: "#sample", message: "This map is free for every Michigan family thanks to the Sample Community Foundation.", regions: ["Statewide"] }
  ]);

  // County edition sample: what an ISD that partners would add to every plan in its county.
  window.COUNTY_EDITIONS = {
    "Oakland Schools": { open_house: "Tech campus open houses: Jan. 14 and Feb. 11 (sample)", emc_deadline: "Early college applications due March 1 for current 10th graders (sample)", contact: "Countywide CTE counselor line: (555) 010-0100 (sample)" },
    "Kent ISD": { open_house: "Tech center family night: Feb. 4 (sample)", emc_deadline: "Early college info night: Nov. 18 (sample)", contact: "Career pathways team: (555) 010-0200 (sample)" }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.createElement("div");
    bar.className = "demo-bar";
    bar.innerHTML = "<strong>Demo view.</strong> Sample partners shown to illustrate placements. Not real organizations. <button type='button' class='demo-exit'>Exit demo</button>";
    bar.querySelector(".demo-exit").addEventListener("click", function () {
      try { sessionStorage.removeItem("msm-demo"); } catch (e) {}
      location.href = location.pathname;
    });
    document.body.insertBefore(bar, document.body.firstChild);
  });
})();
