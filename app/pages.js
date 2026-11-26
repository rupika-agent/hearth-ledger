// Hearth Ledger — one render function per page. Each takes the live state
// (household name, transactions, bills, goals, chart and trend choices)
// and returns an HTML string for <main>. No page fetches anything; every
// figure comes from the state passed in.

import { PLAN, INCOME_TOTAL, MONTHS } from "./data.js";
import { donutChart, barsChart, meter } from "./charts.js";
import { money, money0, split503020, payoffSchedule } from "./calc.js";

export const CATEGORY_COLORS = {
  Housing: "#2e6b4f",
  Groceries: "#d9a441",
  Dining: "#c05b2e",
  Transport: "#4a7fa5",
  Utilities: "#7a6aa8",
  Health: "#c97b9a",
  Fun: "#e07856",
  Clothing: "#8a9a5b",
  Home: "#a9805b",
  Subscriptions: "#5b8a8a",
  Savings: "#3f8f6b",
  Misc: "#9a8f7a",
};

export function spentByCategory(transactions) {
  const totals = {};
  for (const t of transactions) totals[t.category] = (totals[t.category] || 0) + t.amount;
  return totals;
}

export function totalSpent(transactions) {
  return transactions.reduce((s, t) => s + t.amount, 0);
}

export function unpaidTotal(bills) {
  return bills.filter((b) => !b.paid).reduce((s, b) => s + b.amount, 0);
}

function statCard(label, value, sub) {
  return `<div class="stat"><span class="stat-label">${label}</span><strong class="stat-value">${value}</strong><span class="stat-sub">${sub}</span></div>`;
}

function pageHead(title, intro) {
  return `<header class="page-head"><h1>${title}</h1><p>${intro}</p></header>`;
}

export function renderDashboard(state) {
  const spent = totalSpent(state.transactions);
  const left = INCOME_TOTAL - spent;
  const byCat = spentByCategory(state.transactions);
  const parts = PLAN.map((p) => ({
    label: p.category,
    value: byCat[p.category] || 0,
    color: CATEGORY_COLORS[p.category] || "#999",
  })).filter((p) => p.value > 0);
  const chart =
    state.chartMode === "bars"
      ? barsChart(parts)
      : donutChart(parts);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
  const upcoming = state.bills.filter((b) => !b.paid).slice(0, 4);
  const toggle = `<div class="toggle" role="group" aria-label="Chart style">
      <button id="chart-toggle-donut" data-chart="donut" class="${state.chartMode === "donut" ? "active" : ""}">Donut</button>
      <button id="chart-toggle-bars" data-chart="bars" class="${state.chartMode === "bars" ? "active" : ""}">Bars</button>
    </div>`;
  return `
  ${pageHead(`Good evening, ${state.householdName}`, "November 2026 at a glance — what came in, what went out, and what is left.")}
  <section class="stats">
    ${statCard("Income", money(INCOME_TOTAL), "4 paycheques and payments in")}
    ${statCard("Spent", money(spent), `${state.transactions.length} transactions`)}
    ${statCard("Left over", money(left), "income minus spending")}
    ${statCard("Unpaid bills", money(unpaidTotal(state.bills)), `${state.bills.filter((b) => !b.paid).length} bills still open`)}
  </section>
  <section class="grid-two">
    <article class="card">
      <div class="card-head"><h2>Where the money went</h2>${toggle}</div>
      <div id="spending-chart">${chart}</div>
      <p class="card-note">Housing is the biggest slice at ${money(byCat.Housing || 0)}; groceries follow at ${money(byCat.Groceries || 0)}. Switch to Bars to compare categories side by side.</p>
    </article>
    <article class="card">
      <h2>Coming up</h2>
      <ul class="bill-mini">
        ${upcoming.map((b) => `<li><span>${b.name} — ${b.payee}</span><span>${money(b.amount)} · due ${b.due.slice(5)}</span></li>`).join("")}
      </ul>
      <p><a class="link" href="#/bills">See all bills →</a></p>
      <h2 class="spaced">Goals on track</h2>
      ${state.goals.map((g) => `<div class="goal-mini"><span>${g.name} — ${money(g.saved)} of ${money(g.target)}</span>${meter(g.saved / g.target)}</div>`).join("")}
      <p><a class="link" href="#/goals">See all goals →</a></p>
    </article>
  </section>
  <section class="card">
    <div class="card-head"><h2>Latest spending</h2><a class="link" href="#/transactions">All transactions →</a></div>
    <table class="table"><thead><tr><th>Date</th><th>Where</th><th>Category</th><th class="num">Amount</th></tr></thead>
    <tbody id="recent-list">
      ${recent.map((t) => `<tr><td>${t.date.slice(5)}</td><td>${t.merchant}</td><td><span class="tag" style="--tag:${CATEGORY_COLORS[t.category]}">${t.category}</span></td><td class="num">${money(t.amount)}</td></tr>`).join("")}
    </tbody></table>
  </section>
  <section class="tip"><strong>Household tip:</strong> November is $771 under the $7,760 plan. Moving the leftover to the emergency fund would take it to ${money(2400 + 771)} of its $5,000 target.</section>`;
}

export function renderBudget(state) {
  const byCat = spentByCategory(state.transactions);
  const spent = totalSpent(state.transactions);
  const rows = PLAN.map((p) => {
    const used = byCat[p.category] || 0;
    const left = p.planned - used;
    const tone = left < 0 ? "over" : used / p.planned > 0.9 ? "near" : "ok";
    const verdict = left < 0 ? `${money(-left)} over` : `${money(left)} left`;
    return `<tr><td><span class="dot" style="background:${CATEGORY_COLORS[p.category]}"></span>${p.category}</td>
      <td class="num">${money(p.planned)}</td><td class="num">${money(used)}</td>
      <td>${meter(used / p.planned, tone)}</td><td class="num ${tone}">${verdict}</td></tr>`;
  }).join("");
  return `
  ${pageHead("Budget", "The November plan against what actually left the account. Every category is inside its plan this month.")}
  <section class="stats">
    ${statCard("Planned", money(7760), "the November plan")}
    ${statCard("Spent", money(spent), "so far this month")}
    ${statCard("Under plan", money(7760 - spent), "headroom left in November")}
  </section>
  <section class="card">
    <table class="table"><thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th>Progress</th><th class="num">Status</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td>Total</td><td class="num">${money(7760)}</td><td class="num">${money(spent)}</td><td>${meter(spent / 7760, "ok")}</td><td class="num">${money(7760 - spent)} left</td></tr></tfoot></table>
    <p class="card-note">Savings is the furthest from its plan — $795.50 of the $1,200 target moved so far. Top it up from the $771 of headroom to finish the month on plan.</p>
  </section>`;
}

export function renderTransactions(state) {
  const cats = PLAN.map((p) => p.category);
  const filter = state.txnFilter || "All";
  const list = [...state.transactions]
    .filter((t) => filter === "All" || t.category === filter)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const spent = totalSpent(state.transactions);
  return `
  ${pageHead("Transactions", "Every dollar out the door in November. Add one below and the totals update at once.")}
  <section class="stats">
    ${statCard("Transactions", String(state.transactions.length), "this month")}
    ${statCard("Total spent", money(spent), "across all categories")}
    ${statCard("Biggest single", money(Math.max(...state.transactions.map((t) => t.amount))), "the November rent")}
  </section>
  <section class="card">
    <form id="txn-form" class="form-row">
      <label>Date <input id="f-date" type="date" value="2026-11-28" required></label>
      <label>Where <input id="f-merchant" type="text" placeholder="e.g. GreenMart" required></label>
      <label>Category <select id="f-category">${cats.map((c) => `<option>${c}</option>`).join("")}</select></label>
      <label>Amount ($) <input id="f-amount" type="number" min="0.01" step="0.01" placeholder="12.50" required></label>
      <button type="submit" class="btn">Add transaction</button>
    </form>
    <p id="txn-added" class="form-msg" aria-live="polite"></p>
  </section>
  <section class="card">
    <div class="card-head"><h2>All transactions</h2>
      <label class="filter">Show <select id="txn-filter">${["All", ...cats].map((c) => `<option ${c === filter ? "selected" : ""}>${c}</option>`).join("")}</select></label>
    </div>
    <table class="table"><thead><tr><th>Date</th><th>Where</th><th>Category</th><th class="num">Amount</th></tr></thead>
    <tbody id="txn-rows">
      ${list.map((t) => `<tr><td>${t.date}</td><td>${t.merchant}</td><td><span class="tag" style="--tag:${CATEGORY_COLORS[t.category]}">${t.category}</span></td><td class="num">${money(t.amount)}</td></tr>`).join("")}
    </tbody></table>
    <p class="card-note"><span id="txn-count">${list.length}</span> shown · <span id="txn-total">${money(spent)}</span> spent in total.</p>
  </section>`;
}

export function renderBills(state) {
  const unpaid = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);
  const row = (b) => `<tr><td>${b.name}</td><td>${b.payee}</td><td class="num">${money(b.amount)}</td><td>${b.due}</td>
    <td>${b.paid ? '<span class="pill paid">Paid</span>' : `<button class="btn small" data-pay-bill="${b.id}">Mark paid</button>`}</td></tr>`;
  return `
  ${pageHead("Bills", "What the household owes, when it is due, and what is already settled.")}
  <section class="stats">
    ${statCard("Unpaid", money(unpaidTotal(state.bills)), `${unpaid.length} bills open`)}
    ${statCard("Paid", money(paid.reduce((s, b) => s + b.amount, 0)), `${paid.length} bills settled`)}
    ${statCard("Next due", unpaid.length ? money(unpaid[0].amount) : "$0.00", unpaid.length ? `${unpaid[0].name} · due ${unpaid[0].due}` : "nothing outstanding")}
  </section>
  <section class="card">
    <h2>Still to pay — <span id="unpaid-total">${money(unpaidTotal(state.bills))}</span></h2>
    <table class="table"><thead><tr><th>Bill</th><th>Payee</th><th class="num">Amount</th><th>Due</th><th></th></tr></thead>
    <tbody>${unpaid.map(row).join("") || '<tr><td colspan="5">Nothing outstanding — every bill is paid.</td></tr>'}</tbody></table>
  </section>
  <section class="card">
    <h2>Already paid</h2>
    <table class="table"><thead><tr><th>Bill</th><th>Payee</th><th class="num">Amount</th><th>Due</th><th></th></tr></thead>
    <tbody>${paid.map(row).join("")}</tbody></table>
    <p class="card-note">Marking a bill paid here only updates this household's own list — it does not pay anyone. The gym bill ($32.98) is the smallest one still open.</p>
  </section>`;
}

export function renderGoals(state) {
  return `
  ${pageHead("Goals", "Three things the household is saving for, and how far along each one is.")}
  <section class="goals-grid">
    ${state.goals.map((g) => {
      const pct = Math.round((g.saved / g.target) * 100);
      const left = g.target - g.saved;
      return `<article class="card goal-card">
        <h2>${g.name}</h2>
        <p class="goal-amount"><strong>${money(g.saved)}</strong> of ${money(g.target)} <span class="pct">${pct}%</span></p>
        ${meter(g.saved / g.target)}
        <p class="card-note">${g.note}</p>
        <p>${money(left)} to go.</p>
        <button class="btn small" data-add-goal="${g.id}">Add $50</button>
      </article>`;
    }).join("")}
  </section>
  <section class="tip"><strong>How goals work:</strong> Add $50 moves money toward a goal on paper, so the household can see progress before the transfer clears. The emergency fund is the priority — it covers about one month of rent if income stops.</section>`;
}

export function renderReports(state) {
  const months = state.trendMonths === 3 ? MONTHS.slice(-3) : MONTHS;
  const byCat = spentByCategory(state.transactions);
  const parts = PLAN.map((p) => ({
    label: p.category,
    value: byCat[p.category] || 0,
    color: CATEGORY_COLORS[p.category] || "#999",
  })).filter((p) => p.value > 0);
  const topMerchants = {};
  for (const t of state.transactions) topMerchants[t.merchant] = (topMerchants[t.merchant] || 0) + t.amount;
  const top = Object.entries(topMerchants).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const avg = months.reduce((s, m) => s + m.spent, 0) / months.length;
  return `
  ${pageHead("Reports", "Six months of spending, the category mix, and where the money actually goes.")}
  <section class="stats">
    ${statCard("November", money(6989), "the highest month since June")}
    ${statCard(`${months.length}-month average`, money(avg), months.map((m) => m.label).join(", "))}
    ${statCard("Income vs spending", money(INCOME_TOTAL - totalSpent(state.transactions)), "kept this month")}
  </section>
  <section class="card">
    <div class="card-head"><h2>Spending trend</h2>
      <div class="toggle" role="group" aria-label="Trend range">
        <button id="trend-toggle-3" data-trend="3" class="${state.trendMonths === 3 ? "active" : ""}">3 months</button>
        <button id="trend-toggle-6" data-trend="6" class="${state.trendMonths === 6 ? "active" : ""}">6 months</button>
      </div>
    </div>
    <div id="trend-chart">${barsChart(months.map((m) => ({ label: m.label, value: m.spent, color: m.label === "Nov" ? "#c05b2e" : "#2e6b4f" })))}</div>
    <p class="card-note">Spending has stayed between ${money0(Math.min(...MONTHS.map((m) => m.spent)))} and ${money0(Math.max(...MONTHS.map((m) => m.spent)))} a month since June. November is the top of the range, driven by the winter jacket and the concert tickets.</p>
  </section>
  <section class="grid-two">
    <article class="card">
      <h2>Top places the money goes</h2>
      <ol class="ranked">
        ${top.map(([name, v]) => `<li><span>${name}</span><b>${money(v)}</b></li>`).join("")}
      </ol>
      <p class="card-note">Rent is excluded — it is a bill, not a shop. GreenMart leads the day-to-day spending at ${money(topMerchants["GreenMart"] || 0)} across four visits.</p>
    </article>
    <article class="card">
      <h2>Category mix</h2>
      ${barsChart(parts)}
    </article>
  </section>`;
}

export function renderCalculators(state) {
  const split = split503020(state.calcIncome ?? INCOME_TOTAL);
  const debt = payoffSchedule(
    state.debtBalance ?? 4200,
    state.debtApr ?? 22.9,
    state.debtPayment ?? 300,
    state.debtExtra ?? 150,
  );
  const base = payoffSchedule(state.debtBalance ?? 4200, state.debtApr ?? 22.9, state.debtPayment ?? 300, 0);
  const debtLine = debt.affordable
    ? `<p class="result">Debt-free in <strong>${debt.months} months</strong> — ${money(debt.totalInterest)} of interest, ${money(debt.totalPaid)} paid in all.</p>
       <p class="card-note">With the base payment alone it would take ${base.months} months and ${money(base.totalInterest)} of interest. The extra ${money(state.debtExtra ?? 150)} a month saves ${money(base.totalInterest - debt.totalInterest)} and ${base.months - debt.months} months.</p>`
    : `<p class="result">That payment does not cover a month of interest — the balance would grow. Raise the payment above ${money(((state.debtBalance ?? 4200) * (state.debtApr ?? 22.9)) / 100 / 12)} a month.</p>`;
  return `
  ${pageHead("Calculators", "Two quick tools: split a paycheque 50/30/20, and see what extra payments do to a debt.")}
  <section class="grid-two">
    <article class="card">
      <h2>50 / 30 / 20 split</h2>
      <label class="field">Monthly take-home pay ($)
        <input id="income-input" type="number" min="0" step="50" value="${state.calcIncome ?? INCOME_TOTAL}">
      </label>
      <dl class="split">
        <div><dt>Needs · 50%</dt><dd id="out-needs">${money(split.needs)}</dd></div>
        <div><dt>Wants · 30%</dt><dd id="out-wants">${money(split.wants)}</dd></div>
        <div><dt>Savings · 20%</dt><dd id="out-savings">${money(split.savings)}</dd></div>
      </dl>
      <p class="card-note">On the household's ${money(INCOME_TOTAL)} income that is ${money(3925)} for needs, ${money(2355)} for wants and ${money(1570)} for savings. Rent alone takes ${money(2280)} of the needs bucket.</p>
    </article>
    <article class="card">
      <h2>Debt payoff</h2>
      <div class="form-grid">
        <label class="field">Balance ($) <input id="debt-balance" type="number" min="0" step="50" value="${state.debtBalance ?? 4200}"></label>
        <label class="field">APR (%) <input id="debt-apr" type="number" min="0" step="0.1" value="${state.debtApr ?? 22.9}"></label>
        <label class="field">Monthly payment ($) <input id="debt-payment" type="number" min="0" step="10" value="${state.debtPayment ?? 300}"></label>
        <label class="field">Extra per month ($) <input id="debt-extra" type="number" min="0" step="10" value="${state.debtExtra ?? 150}"></label>
      </div>
      <div id="debt-result">${debtLine}</div>
      <p class="card-note">Defaults match the household's card: $4,200 at 22.9% APR, $300 a month plus $150 extra.</p>
    </article>
  </section>
  <section class="tip"><strong>Reading the split:</strong> if needs run over 50%, the fix is usually a smaller wants bucket first — cancelling one subscription rarely moves the needle, but a cheaper weekly shop does.</section>`;
}

export function renderSettings(state) {
  return `
  ${pageHead("Settings", "Household details and the demo data. Everything here lives in this browser only.")}
  <section class="grid-two">
    <article class="card">
      <h2>Household</h2>
      <label class="field">Household name
        <input id="household-name-input" type="text" value="${state.householdName}">
      </label>
      <p><button id="save-name" class="btn">Save name</button> <span id="name-saved" class="form-msg" aria-live="polite"></span></p>
      <p class="card-note">The name shows on the dashboard greeting. Members: ${["Mara Rivera", "Jon Rivera", "Theo Rivera"].join(", ")}.</p>
      <h2 class="spaced">Month</h2>
      <p>Tracking <strong>November 2026</strong>. The demo month is fixed so the figures on every page agree with each other.</p>
    </article>
    <article class="card">
      <h2>Demo data</h2>
      <p>Every change you make — a new transaction, a paid bill, a renamed household — is stored in this browser's local storage, so it survives a reload.</p>
      <p><button id="reset-demo" class="btn danger">Reset to demo data</button></p>
      <p id="reset-msg" class="form-msg" aria-live="polite"></p>
      <h2 class="spaced">About Hearth Ledger</h2>
      <p class="card-note">A household budget site that runs entirely from its own files — no accounts, no network, no tracking. Built for the make.fun “best household budget site” bounty. All figures are the demo household's own.</p>
    </article>
  </section>`;
}
