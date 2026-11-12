# Leads and the Journal: setup guide

Every form on the site (home enquiry, the enquiry drawer, Aveda Arenium, Contact, the five Connect forms and the newsletter) sends its details to one place: `/api/lead`. From there, each lead goes to whichever destinations you have switched on in **Vercel → Project → Settings → Environment Variables**. Nothing is switched on yet. Until it is, leads are still accepted, and each one is written to the Vercel runtime log (Project → Logs, search `LEAD`), so nothing is lost while you set this up.

After adding or changing a variable, redeploy (Deployments → ⋯ → Redeploy) so the site picks it up.

Never paste keys into chat or commit them to GitHub. They only go into Vercel.

## 1. Google Sheet (recommended first)

1. Create a Google Sheet called "DKG Leads".
2. Extensions → Apps Script, delete what is there, and paste:

```js
function doPost(e) {
  var lead = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tab = ss.getSheetByName(lead.type_label || 'Leads') || ss.insertSheet(lead.type_label || 'Leads');
  var keys = Object.keys(lead);
  if (tab.getLastRow() === 0) tab.appendRow(keys);
  var head = tab.getRange(1, 1, 1, tab.getLastColumn()).getValues()[0];
  keys.forEach(function (k) { if (head.indexOf(k) < 0) { head.push(k); tab.getRange(1, head.length).setValue(k); } });
  tab.appendRow(head.map(function (k) { var v = lead[k]; return v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : v); }));
  return ContentService.createTextOutput('ok');
}
```

3. Deploy → New deployment → type "Web app" → Execute as: Me, Who has access: Anyone → Deploy, and copy the web app URL.
4. In Vercel add `LEADS_SHEET_WEBHOOK` = that URL.

Each form type (Careers, Channel partner, Land / JV, Vendor, Investor, Aveda enquiry, Contact, Newsletter…) lands on its own tab, with columns added automatically.

## 2. Email alerts (Resend)

1. Create a free account at resend.com and verify the sending domain (dkglandcorp.com).
2. Add in Vercel:
   - `RESEND_API_KEY` = your Resend key
   - `LEADS_EMAIL_TO` = who receives alerts (comma-separate several)
   - `LEADS_EMAIL_FROM` = e.g. `DKG Website <leads@dkglandcorp.com>`

## 3. CRM (to be decided with the client)

Any CRM that accepts a webhook works (LeadSquared, Zoho, HubSpot, Salesforce, Sell.Do and so on). Add `LEADS_CRM_WEBHOOK` = the CRM's lead-capture URL, and `LEADS_CRM_TOKEN` if it needs a bearer token. If the CRM needs specific field names, send me its API docs and I will map them.

## 4. WhatsApp alerts

Works with any WhatsApp Business API provider that accepts a webhook (Interakt, AiSensy, Wati, Gupshup, or Meta Cloud API through a small relay). Add `WHATSAPP_WEBHOOK` and, if required, `WHATSAPP_TOKEN`.

## What each lead contains

Name, phone, email, form type, project, the page it came from, every form field, and where the visitor came from: first and last visit source, medium and campaign (UTM tags), Google/Meta click IDs, and referrer. That is what lets you see which ads and pages bring in real buyers.

## Contact details shown on the site

Edit `assets/config.js`: phone, WhatsApp number, email, office hours, social links and the Aveda RERA number. Anything left empty stays hidden on the site, so there are no blank labels. The WhatsApp button and "Call" in the phone action bar appear as soon as their numbers are filled in.

## The Journal (Sanity CMS)

Until Sanity is connected, the Journal shows three starter articles.

1. Create a free project at sanity.io/manage (dataset `production`), and copy the Project ID.
2. In Vercel add `SANITY_PROJECT_ID` = that ID (and `SANITY_DATASET` = `production` if you used another name).
3. In sanity.io/manage → API → CORS origins, add the live site URL.
4. Deploy the editing studio once, from this repo:

```
cd studio
npm install
SANITY_STUDIO_PROJECT_ID=<id> npx sanity deploy
```

The client then writes posts at `https://dkg-journal.sanity.studio`. A new post appears on the site within about five minutes. Each post chooses its call to action (Aveda Arenium, general enquiry, careers or channel partner), so every article also generates leads.
