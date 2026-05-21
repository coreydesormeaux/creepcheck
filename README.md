# CreepCheck

CreepCheck is a Next.js MVP for finding subscription price creep from bank or credit card CSV exports.

## What It Does

- Shows a polished CreepCheck landing page.
- Lets users upload a CSV locally in the browser.
- Detects repeated merchants as likely recurring subscriptions.
- Flags monthly spend, annual spend, and likely price increases.
- Captures early-access emails in local storage for MVP validation.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy To Vercel

1. Push this repo to GitHub.
2. Import the GitHub repo in Vercel.
3. Use the default Next.js settings:
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: leave blank
4. Deploy.

No environment variables are required for the current browser-only MVP.

## First Business Offer

Start simple:

- Free scan: show the first subscription report.
- Paid report: charge a small one-time fee for a full subscription audit and cancellation checklist.
- Later upgrade: add user accounts, saved scans, Stripe, and recurring monitoring.
