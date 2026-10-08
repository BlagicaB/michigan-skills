# Michigan Skills: page sources

The live site is plain static HTML in the folders one level up. These files are the
page bodies; `build.py` wraps each one in the shared header, nav and footer.

Edit a page:  change the file in `pages/`, then run  `python3 _src/build.py`  from the site root.
Edit programs or districts:  `assets/data/programs.js` and `assets/data/isds.js` (no rebuild needed).

The build refuses to run if a page contains an em or en dash (house style).
Folders starting with `_` are ignored by GitHub Pages, so this folder never ships.

## "You are here" leads
`assets/journey.js` runs the map, teaser, questionnaire and plan. Submissions post to the Google
Apps Script in `setup/plan-requests.gs` (saves to a Sheet, emails the person their plan, optional
daily digest). Paste the script's /exec URL into `FORM_ENDPOINT` at the top of journey.js.
Deep links preselect a stop, e.g. `/?here=hs`, `/?here=adult`, `/?here=employer` (good for QR codes).
