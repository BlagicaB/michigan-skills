/* Partner inquiry form. Posts to the same Apps Script as the plan form (type=partner). */
(function () {
  // Same /exec URL as FORM_ENDPOINT in journey.js (see _src/setup/plan-requests.gs).
  var FORM_ENDPOINT = "";

  var form = document.getElementById("partner-form");
  if (!form) return;
  var picked = [];
  var chips = document.getElementById("partner-interest");
  chips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    var v = b.getAttribute("data-v"), i = picked.indexOf(v);
    if (i > -1) picked.splice(i, 1); else picked.push(v);
    b.setAttribute("aria-pressed", i > -1 ? "false" : "true");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements, err = "";
    if (!f.name.value.trim()) err = "Add your name.";
    else if (!f.org.value.trim()) err = "Add your organization.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) err = "That email doesn't look right.";
    else if (!f.partner_type.value) err = "Tell us what kind of organization you are.";
    document.getElementById("partner-error").textContent = err;
    if (err) return;

    var data = {
      type: "partner", ts: new Date().toISOString(), name: f.name.value.trim(), org: f.org.value.trim(),
      email: f.email.value.trim(), phone: f.phone.value.trim(), partner_type: f.partner_type.value,
      region: f.region.value.trim(), interest: picked.join(", "), message: f.message.value.trim(), page: location.href
    };
    var done = document.getElementById("partner-done");
    if (f.website.value) { form.hidden = true; done.hidden = false; done.innerHTML = "<p><strong>Thanks.</strong> We'll be in touch.</p>"; return; }
    if (!FORM_ENDPOINT) {
      document.getElementById("partner-error").textContent = "This form isn't connected yet. Please check back soon.";
      return;
    }
    fetch(FORM_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() })
      .catch(function () {})
      .then(function () {
        form.hidden = true; done.hidden = false;
        done.innerHTML = "<p><strong>Thanks, " + data.name.replace(/[<>&]/g, "") + ".</strong> We'll reply with the overview and a time for a quick walkthrough.</p>";
        done.scrollIntoView({ behavior: "smooth", block: "center" });
      });
  });
})();
