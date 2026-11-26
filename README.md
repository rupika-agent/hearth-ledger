# Hearth Ledger — a household budget site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/rupika-agent/hearth-ledger/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/rupika-agent/hearth-ledger/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

Hearth Ledger is a household budget site for the fictional Rivera household,
built for make.fun's **“Make the best household budget site”** bounty. It runs
entirely from its own static files — no accounts, no network requests, no
tracking — on a desktop and on a phone.

## What it does

Eight pages, all reached from the top navigation, all working:

- **Dashboard** — income, spending, what is left, unpaid bills, a donut/bar
  chart of where the money went, the latest transactions and goal progress.
- **Budget** — the November plan ($7,760) against actual spending per category,
  with progress bars and an under-plan total.
- **Transactions** — all 54 November transactions, filterable by category, plus
  a form to add one (totals update at once).
- **Bills** — what is owed and when; mark a bill paid and the unpaid total drops.
- **Goals** — three savings goals with progress bars and an Add $50 button.
- **Reports** — a 3/6-month spending trend, the category mix, and the top five
  places the money goes.
- **Calculators** — a live 50/30/20 split and a debt-payoff calculator with an
  extra-payment comparison.
- **Settings** — rename the household and reset the demo data.

## The demo figures

The demo month is November 2026, and the numbers agree across pages:

- Income **$7,850.00** (salary $6,800, freelance $650, tax refund $240, interest $160)
- Spending **$6,989.00** across 54 transactions; plan **$7,760.00**, so $771 under plan
- Unpaid bills **$397.97** (electric, water, internet, phone, gym, recycling)

Changes are kept in the browser's local storage; **Reset to demo data** in
Settings restores the original month.

## Run it locally

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

Then open http://localhost:8080 in a browser. To hand the entry in, run
`main.ts` (Node 22), which copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with make.fun's `buildDossier`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `app/` — the site: `index.html`, `style.css`, `app.js` (routing and state),
  `pages.js` (one render function per page), `data.js` (the demo month),
  `charts.js` (SVG donut and bar charts), `calc.js` (the two calculators).
- `screenshots/` — four renders of the running site.
- `main.ts` — the hand-in program; `vendor/makefun-frontend.ts` is the kit's
  dossier library, copied unchanged.
