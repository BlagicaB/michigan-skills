/**
 * Michigan Skills: plan requests and partner inquiries -> Google Sheet + email.
 *
 * Setup (about 5 minutes):
 * 1. Create a Google Sheet named "Michigan Skills leads".
 * 2. Extensions > Apps Script. Paste this whole file. Save.
 * 3. Set OWNER_EMAIL below.
 * 4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 5. Copy the /exec URL into FORM_ENDPOINT at the top of assets/journey.js
 *    AND at the top of assets/partners.js (same URL for both).
 * 6. Optional: run installDailyDigest() once for a single morning summary of plan requests.
 * After editing this script later: Deploy > Manage deployments > Edit > New version.
 */
var OWNER_EMAIL = "";            // gets partner inquiries right away and the daily plan digest
var FROM_NAME = "Michigan Skills";

var PLAN_SHEET = "Plan requests";
var PLAN_COLUMNS = ["ts", "stage", "grade", "county", "isd", "interests", "traits", "question", "goal", "when", "role", "name", "email", "org", "consent", "page"];
var PARTNER_SHEET = "Partner inquiries";
var PARTNER_COLUMNS = ["ts", "name", "org", "partner_type", "email", "phone", "region", "interest", "message", "page"];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return ok_();                       // honeypot: bots fill hidden fields
  var hasEmail = !!p.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email);
  if (!hasEmail) { p.email = ""; p.name = ""; }        // anonymous plan: answers only, nothing personal
  if (p.type === "partner" && !hasEmail) return ok_();
  p.ts = p.ts || new Date().toISOString();

  if (p.type === "partner") {
    sheet_(PARTNER_SHEET, PARTNER_COLUMNS).appendRow(PARTNER_COLUMNS.map(function (c) { return p[c] || ""; }));
    if (OWNER_EMAIL) {
      MailApp.sendEmail({
        to: OWNER_EMAIL, replyTo: p.email, name: FROM_NAME,
        subject: "Partner inquiry: " + (p.org || p.name) + " (" + (p.partner_type || "unknown") + ")",
        body: PARTNER_COLUMNS.map(function (c) { return c + ": " + (p[c] || ""); }).join("\n")
      });
    }
    return ok_();
  }

  sheet_(PLAN_SHEET, PLAN_COLUMNS).appendRow(PLAN_COLUMNS.map(function (c) { return p[c] || ""; }));

  if (!hasEmail) return ok_();
  // One plan email per address per 6 hours, so the form can't be used to spam someone.
  var cache = CacheService.getScriptCache(), key = "sent:" + p.email.toLowerCase();
  if (p.consent === "yes" && !cache.get(key) && p.plan_text) {
    MailApp.sendEmail({
      to: p.email,
      name: FROM_NAME,
      subject: "Your Michigan Skills plan",
      body: "Hi " + (p.name || "there") + ",\n\nHere is the plan you built on Michigan Skills. Keep it handy for your next counselor, Michigan Works! or HR conversation.\n\n" +
            p.plan_text + "\n\nRules and dates change every year, so confirm with the official links above.\n\nMichigan Skills"
    });
    cache.put(key, "1", 21600);
  }
  return ok_();
}

function sheet_(name, columns) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) { sh.appendRow(columns); sh.setFrozenRows(1); }
  return sh;
}

function ok_() { return ContentService.createTextOutput("ok"); }

function dailyDigest() {
  if (!OWNER_EMAIL) return;
  var values = sheet_(PLAN_SHEET, PLAN_COLUMNS).getDataRange().getValues();
  var head = values[0], col = {};
  head.forEach(function (h, i) { col[h] = i; });
  var since = Date.now() - 24 * 3600 * 1000;
  var fresh = values.slice(1).filter(function (r) { return new Date(r[col.ts]).getTime() > since; });
  if (!fresh.length) return;
  var byStage = {};
  fresh.forEach(function (r) { byStage[r[col.stage]] = (byStage[r[col.stage]] || 0) + 1; });
  var anon = fresh.filter(function (r) { return !r[col.email]; }).length;
  var lines = fresh.map(function (r) {
    return "- " + (r[col.email] ? r[col.name] + " <" + r[col.email] + "> " : "(anonymous) ") + r[col.stage] + (r[col.grade] ? " grade " + r[col.grade] : "") +
      ", " + r[col.county] + " County" + (r[col.org] ? ", " + r[col.org] : "") + ", interests: " + r[col.interests] + (r[col.question] ? "\n    Asked: " + r[col.question] : "");
  });
  var asked = fresh.filter(function (r) { return r[col.question]; }).length;
  MailApp.sendEmail(OWNER_EMAIL, "Michigan Skills: " + fresh.length + " new plan requests" + (asked ? ", " + asked + " with questions" : ""),
    "With email: " + (fresh.length - anon) + ", anonymous: " + anon + "\nBy stage: " + JSON.stringify(byStage) + "\n\n" + lines.join("\n"));
}

function installDailyDigest() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "dailyDigest") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("dailyDigest").timeBased().everyDays(1).atHour(7).create();
}
