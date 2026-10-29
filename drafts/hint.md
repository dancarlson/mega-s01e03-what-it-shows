# booking-v3 date hint conflicts with tenant parsing order

Reports covered: **33** unique reports merged into source ticket #4471.

booking-v3 displays MM/DD/YYYY but the form reads input in the day-first tenant order. This is a separate defect from the shared parser. Affected tenants: alder.physio, copper.studio, pale.harbour, through the form channel. Examples: R-41230 and R-41241. Align the hint and parser, then verify actual form submission.

Method: deduplicate export rows by id (last occurrence wins), filter mergedInto === 4471, run causeOf with tenant locale/form and channel. Do not group by intakeTag, browser locale, subject, or body alone.

First received: 2026-04-17; last received: 2026-09-22; tenants: 3. Intake tags: {"parser":15,"hint":18}.

Scope: supplied export through 2026-10-04; the desk continues working. Refresh counts for later data. Engineering update on the course page: parser fixed on 5 October (fix(dates): parse dd/mm for eu locales); hint will not be fixed because booking-v3 was retired. These are reported outcomes, not independent production verification.

Evidence: src/lib/kb/causes.ts, src/lib/kb/locales.ts, src/lib/data/reports-4471.json, tenant directory; signed decision source and rendered HTML in this repo.

Report IDs:

R-41230, R-41241, R-41251, R-41259, R-41262, R-41275, R-41294, R-41305, R-41308, R-41366, R-41372, R-41384, R-41387, R-41396, R-41400, R-41406, R-41415, R-41416, R-41418, R-41428, R-41439, R-41441, R-41449, R-41453, R-41456, R-41460, R-41472, R-41485, R-41493, R-41539, R-41572, R-41582, R-41584
