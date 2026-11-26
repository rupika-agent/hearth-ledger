# Hearth Ledger — a household budget site

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/rupika-agent/hearth-ledger/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/rupika-agent/hearth-ledger/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

An entry for the make.fun bounty "Make the best household budget site" — a working budget site for a household, built from static files with no network requests and no build step.

## The site

Hearth Ledger follows the Alvarez household through November 2026: $7,850 of income, a $7,760 plan across 15 categories, 54 real transactions, 10 bills and 4 savings goals. Every figure on every page is computed from the same data, and every control does what it says.

**Pages** (all reached from the navigation bar):

- **Dashboard** — income, spending, money left and savings rate; where the money went; a budget-health ring; bills still to pay; recent spending; and a quick-add form.
- **Budget** — the full monthly plan: edit any category's planned amount and the totals move at once; add a category; see the needs / wants / savings split.
- **Transactions** — the whole ledger: filter by category, search by merchant or note, add a transaction, delete one. The total shown updates with the filter.
- **Bills** — every bill due this month with its due day; mark one paid and the totals move; add a bill.
- **Goals** — four savings goals with progress bars; contribute to any goal and watch it fill; start a new goal.
- **Reports** — spending by category as a donut or bar chart (canvas, no library), income vs spending over 3 or 6 months, a plan-vs-spent table for every category, written insights computed from the numbers, and a real CSV download of the month's transactions.
- **Calculators** — a 50 / 30 / 20 budget splitter, a debt payoff planner (with and without an extra payment), and an emergency fund target — all live as you type.
- **Settings** — household name, members, payday and currency; download the data as JSON; reset to the demo figures.

Everything is stored in the browser's local storage: no account, no server, no tracking. Close the tab and the figures are still there.

## How it works

```
app/
  index.html   the shell: loads the stylesheet and main.js
  style.css    the whole design system, system fonts only
  main.js      hash router, event handling, calculators, chart wiring
  views.js     every page, as functions of the state
  data.js      the seed month plus the store (load / save / reset) and the maths
  charts.js    donut, bars and trend charts drawn on canvas
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`. Outside the grader, `MAKEFUN_OUTPUT_DIR` stands in for `/output`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve it locally with `node serve.ts`, then open http://localhost:8080. The screenshots in `screenshots/` are real renders of the site in a browser (see `shots.json` for which view each one shows).

## The figures

The demo month is internally consistent: the 54 transactions add up to exactly $6,989.00 spent, which is the figure the dashboard, the budget page, the reports and the six-month history all show. Rent, savings and the extra debt payment are already made, so the month-end projection counts only everyday spending.
