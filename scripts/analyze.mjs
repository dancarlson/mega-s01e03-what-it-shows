import fs from 'node:fs';
import { uniqueById, groupByCause, readAs } from '../src/lib/kb/causes.ts';
const reports = JSON.parse(fs.readFileSync('src/lib/data/reports-4471.json'));
const tenants = fs.readdirSync('src/lib/data/tenants').map(n => JSON.parse(fs.readFileSync('src/lib/data/tenants/'+n)));
const notes = JSON.parse(fs.readFileSync('src/lib/data/desk-notes.json'));
const unique = uniqueById(reports).filter(r => r.mergedInto === 4471);
const groups = groupByCause(unique, r => tenants.find(t => t.handle === r.tenant));
fs.mkdirSync('drafts', {recursive:true});
fs.writeFileSync('drafts/analysis.json', JSON.stringify({rows:reports.length,unique:unique.length,groups:groups.map(g=>({...g,reports:g.reports.map(r=>r.id),oneDayMove:readAs(g,notes.oneDayMove)}))},null,2)+'\n');
for (const g of groups) {
 const explanation = g.cause === 'parser'
 ? 'The shared parser reads month first for day-first tenants. Example: R-41200 (Harbour Dental, en-GB, app) says 7 April became 4 July. Parse using the tenant date order and verify both ambiguous and invalid dates. App/email reports from booking-v3 tenants still classify as parser.'
 : 'booking-v3 displays MM/DD/YYYY but the form reads input in the day-first tenant order. This is a separate defect from the shared parser. Affected tenants: alder.physio, copper.studio, pale.harbour, through the form channel. Examples: R-41230 and R-41241. Align the hint and parser, then verify actual form submission.';
 const anomaly = g.cause === 'parser' ? '\nFive reports in this count are marked oneDayMove in desk-notes.json: '+notes.oneDayMove.join(', ')+'. Their wording warrants investigation, not a confirmed third cause. They are already included in 379, not additional reports.\n' : '';
 fs.writeFileSync(`drafts/${g.cause}.md`, `# ${g.cause === 'parser' ? 'Shared parser misreads day-first tenant dates' : 'booking-v3 date hint conflicts with tenant parsing order'}\n\nReports covered: **${g.reports.length}** unique reports merged into source ticket #4471.\n\n${explanation}\n\nMethod: deduplicate export rows by id (last occurrence wins), filter mergedInto === 4471, run causeOf with tenant locale/form and channel. Do not group by intakeTag, browser locale, subject, or body alone.\n\nFirst received: ${g.firstSeen}; last received: ${g.lastSeen}; tenants: ${g.tenants}. Intake tags: ${JSON.stringify(g.taggedAs)}.\n${anomaly}\nScope: supplied export through 2026-10-04; the desk continues working. Refresh counts for later data. Engineering update on the course page: parser fixed on 5 October (fix(dates): parse dd/mm for eu locales); hint will not be fixed because booking-v3 was retired. These are reported outcomes, not independent production verification.\n\nEvidence: src/lib/kb/causes.ts, src/lib/kb/locales.ts, src/lib/data/reports-4471.json, tenant directory; signed decision source and rendered HTML in this repo.\n\nReport IDs:\n\n${g.reports.map(r=>r.id).join(', ')}\n`);
}
console.log(groups.map(g=>`${g.cause}: ${g.reports.length}`).join('\n'));
