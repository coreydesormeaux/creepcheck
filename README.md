# CreepCheck

CreepCheck helps people find subscription price creep from bank or credit card CSV exports.

## What It Does

- Shows a polished CreepCheck landing page.
- Lets users upload a CSV export and see a quick scan.
- Detects repeated merchants as likely recurring subscriptions.
- Flags monthly spend, annual spend, and likely price increases.
- Captures interested customers for the subscription-saving checklist through a lead webhook.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Lead Capture

The checklist form posts to `/api/leads`, which forwards leads to a webhook.

Set this environment variable in Vercel:

```bash
LEADS_WEBHOOK_URL=https://your-form-or-automation-webhook-url
```

Good simple options:

- Formspree form endpoint
- Zapier catch hook
- Make webhook
- Basin or Tally form endpoint

Each lead includes the email address, source, scan totals, and top subscriptions to review.

## Deploy To Vercel

1. Push this repo to GitHub.
2. Import the GitHub repo in Vercel.
3. Use the default Next.js settings:
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: leave blank
4. Add `LEADS_WEBHOOK_URL` in the Vercel project settings.
5. Deploy.

## First Business Offer

Start simple:

- Free scan: show the first subscription report.
- Paid report: charge a small one-time fee for a full subscription audit and cancellation checklist.
- Later upgrade: add saved scans, Stripe, and recurring monitoring.
