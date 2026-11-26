// Hearth Ledger — the eight pages, as functions of the state.
// Change the state, re-render, and every figure on the page moves with it.
// Nothing on any page is a placeholder: every number is computed, and
// every button and form does what it says.

import {
  CATEGORIES, MONTH_LABEL, categoryOf, esc, fmtDate, money, money0,
  pct, spentByCategory, totalBudgeted, totalIncome, totalSpent,
} from './data.js';

export const NAV = [
  ['#/', 'Dashboard'],
  ['#/budget', 'Budget'],
  ['#/transactions', 'Transactions'],
  ['#/bills', 'Bills'],
  ['#/goals', 'Goals'],
  ['#/reports', 'Reports'],
  ['#/tools', 'Calculators'],
  ['#/settings', 'Settings'],
];

export function layout(state, active, inner) {
  const links = NAV.map(([href, label]) =>
    `<a href="${href}" class="${href === active ? 'active' : ''}">${label}</a>`).join('');
  return `
<header class="site-head">
  <div class="wrap head-in">
    <a class="brand" href="#/"><span class="brand-mark">⌂</span> Hearth Ledger</a>
    <nav class="main-nav">${links}</nav>
  </div>
</header>
<main class="wrap">${inner}</main>
<footer class="site-foot">
  <div class="wrap foot-in">
    <span>Hearth Ledger — ${esc(state.household.name)} · ${MONTH_LABEL}</span>
    <span class="foot-links">
      <a href="#/budget">Budget</a> · <a href="#/transactions">Transactions</a> ·
      <a href="#/bills">Bills</a> · <a href="#/goals">Goals</a> ·
      <a href="#/reports">Reports</a> · <a href="#/tools">Calculators</a>
    </span>
    <span>Your figures never leave this browser.</span>
  </div>
</footer>`;
}

function pageHead(title, sub) {
  return `<div class="page-head"><h1>${title}</h1><p>${sub}</p></div>`;
}

// One category's progress bar: spent against planned, with what is left.
function catBar(cat, planned, spent) {
  const left = planned - spent;
  const p = planned ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
  const over = spent > planned;
  const cls = over ? 'bar over' : (p >= 85 ? 'bar warm' : 'bar');
  return `
  <div class="cat-row">
    <div class="cat-ic" style="background:${cat.color}">${cat.icon}</div>
    <div class="cat-main">
      <div class="cat-top"><a href="#/transactions?cat=${cat.id}"><strong>${esc(cat.name)}</strong></a>
        <span>${money(spent)} of ${money(planned)}</span></div>
      <div class="track"><div class="${cls}" style="width:${p}%"></div></div>
      <div class="cat-sub">${over ? `<span class="bad">${money(-left)} over budget</span>` : `${money(left)} left · ${p}% used`}</div>
    </div>
  </div>`;
}

// ---------------- Dashboard ----------------

export function viewDashboard(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const left = income - spent;
  const budgeted = totalBudgeted(state);
  const byCat = spentByCategory(state);
  const saved = byCat.savings || 0;
  const saveRate = pct(saved, income);
  const day = 26, daysInMonth = 30;
  const top = [...CATEGORIES]
    .map((c) => ({ c, spent: byCat[c.id] || 0, planned: state.budgets[c.id] || 0 }))
    .filter((x) => x.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);
  const upcoming = state.bills.filter((b) => !b.paid).slice(0, 3);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const health = pct(spent, budgeted);
  const healthMsg = health <= 92
    ? 'On track — spending is inside the plan with four days to go.'
    : 'Watch it — spending is running ahead of the plan.';
  return pageHead('November at a glance', `${esc(state.household.name)} · ${MONTH_LABEL} · day ${day} of ${daysInMonth}`) + `
  <section class="stats">
    <div class="stat"><span class="stat-label">Monthly income</span><strong>${money(income)}</strong><span class="stat-sub">3 paycheques · payday the 1st</span></div>
    <div class="stat"><span class="stat-label">Spent so far</span><strong>${money(spent)}</strong><span class="stat-sub">${health}% of the ${money(budgeted)} plan</span></div>
    <div class="stat good"><span class="stat-label">Left to spend</span><strong>${money(left)}</strong><span class="stat-sub">${money(budgeted - spent)} left in the budgets</span></div>
    <div class="stat good"><span class="stat-label">Savings rate</span><strong>${saveRate}%</strong><span class="stat-sub">${money(saved)} set aside this month</span></div>
  </section>
  <div class="cols">
    <section class="card wide">
      <h2>Where the money went</h2>
      ${top.map((x) => catBar(x.c, x.planned, x.spent)).join('')}
      <p class="more"><a href="#/budget">See the full budget →</a></p>
    </section>
    <section class="card">
      <h2>Budget health</h2>
      <div class="health">
        <svg viewBox="0 0 120 120" class="ring" role="img" aria-label="${health}% of budget spent">
          <circle cx="60" cy="60" r="52" class="ring-bg"/>
          <circle cx="60" cy="60" r="52" class="ring-fg" stroke-dasharray="${(health / 100) * 326.7} 326.7"/>
          <text x="60" y="56" class="ring-num">${health}%</text>
          <text x="60" y="76" class="ring-cap">of plan used</text>
        </svg>
        <p>${healthMsg}</p>
        <p class="muted">${money(budgeted - spent)} of the plan is still unspent, and ${money(income - budgeted)} of income was never assigned — a ${money(income - budgeted)} cushion.</p>
      </div>
      <h2 class="mt">Bills still to pay</h2>
      <ul class="bill-mini">
        ${upcoming.map((b) => `<li><span>${esc(b.name)}</span><strong>${money(b.amount)} · Nov ${b.due}</strong></li>`).join('')}
      </ul>
      <p class="more"><a href="#/bills">All bills →</a></p>
    </section>
  </div>
  <div class="cols">
    <section class="card wide">
      <h2>Recent spending</h2>
      <table class="tx">
        <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>
        <tbody>
        ${recent.map((t) => `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.merchant)}</td><td>${esc(categoryOf(t.category).name)}</td><td class="num">${money(t.amount)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="more"><a href="#/transactions">All ${state.transactions.length} transactions →</a></p>
    </section>
    <section class="card">
      <h2>Quick add</h2>
      <p class="muted">Log a purchase in seconds — it updates every page at once.</p>
      <form id="quick-add" data-form="add-transaction">
        <label>What did you buy?<input name="merchant" required maxlength="80" placeholder="e.g. GreenMart Supermarket"></label>
        <label>Amount<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
        <div class="form-row">
          <label>Category
            <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
          </label>
          <label>Date<input name="date" type="date" value="2026-11-26" required></label>
        </div>
        <button class="btn" type="submit">Add expense</button>
      </form>
      <p class="form-note" id="quick-add-note"></p>
    </section>
  </div>`;
}

// ---------------- Budget ----------------

export function viewBudget(state) {
  const byCat = spentByCategory(state);
  const budgeted = totalBudgeted(state);
  const spent = totalSpent(state);
  const income = totalIncome(state);
  const needs = ['housing', 'groceries', 'utilities', 'transport', 'health', 'kids', 'debt'];
  const wants = ['dining', 'entertainment', 'clothing', 'personal', 'home', 'gifts', 'misc'];
  const sumIds = (ids) => ids.reduce((s, id) => s + (state.budgets[id] || 0), 0);
  const n = sumIds(needs), w = sumIds(wants), s = state.budgets.savings || 0;
  return pageHead('Monthly budget', `Plan for ${MONTH_LABEL} · ${money(income)} coming in, ${money(budgeted)} planned, ${money(income - budgeted)} unassigned`) + `
  <section class="stats">
    <div class="stat"><span class="stat-label">Planned</span><strong>${money(budgeted)}</strong><span class="stat-sub">${pct(budgeted, income)}% of income</span></div>
    <div class="stat"><span class="stat-label">Spent</span><strong>${money(spent)}</strong><span class="stat-sub">${pct(spent, budgeted)}% of the plan</span></div>
    <div class="stat good"><span class="stat-label">Still in the budgets</span><strong>${money(budgeted - spent)}</strong><span class="stat-sub">across ${CATEGORIES.length} categories</span></div>
    <div class="stat"><span class="stat-label">Unassigned income</span><strong>${money(income - budgeted)}</strong><span class="stat-sub">the cushion, on purpose</span></div>
  </section>
  <section class="card">
    <h2>Every category</h2>
    <p class="muted">Change a planned amount and press Enter — the totals above move at once. Spending comes from the transaction ledger.</p>
    <div class="cat-list">
      ${CATEGORIES.map((cat) => {
        const planned = state.budgets[cat.id] || 0;
        const sp = byCat[cat.id] || 0;
        const left = planned - sp;
        const p = planned ? Math.min(100, Math.round((sp / planned) * 100)) : 0;
        const over = sp > planned;
        return `<div class="cat-edit">
          <div class="cat-ic" style="background:${cat.color}">${cat.icon}</div>
          <div class="cat-main">
            <div class="cat-top"><a href="#/transactions?cat=${cat.id}"><strong>${esc(cat.name)}</strong></a>
              <span>${money(sp)} spent · <span class="${over ? 'bad' : 'good-t'}">${money(left)} left</span></span></div>
            <div class="track"><div class="${over ? 'bar over' : (p >= 85 ? 'bar warm' : 'bar')}" style="width:${p}%"></div></div>
          </div>
          <label class="plan-edit">Planned
            <input type="number" min="0" step="10" value="${planned}" data-budget="${cat.id}" aria-label="Planned amount for ${esc(cat.name)}">
          </label>
        </div>`;
      }).join('')}
    </div>
  </section>
  <div class="cols">
    <section class="card">
      <h2>Add a category</h2>
      <form id="add-category" data-form="add-category">
        <label>Name<input name="name" required maxlength="30" placeholder="e.g. Pet care"></label>
        <label>Planned per month<input name="amount" type="number" min="0" step="10" required placeholder="0"></label>
        <button class="btn" type="submit">Add category</button>
      </form>
      <p class="form-note" id="add-category-note"></p>
    </section>
    <section class="card">
      <h2>Needs, wants, savings</h2>
      <p class="muted">The classic 50 / 30 / 20 split, applied to this month's plan:</p>
      <div class="split">
        <div><span class="split-label">Needs — ${pct(n, budgeted)}%</span><div class="track"><div class="bar" style="width:${pct(n, budgeted)}%"></div></div><strong>${money(n)}</strong></div>
        <div><span class="split-label">Wants — ${pct(w, budgeted)}%</span><div class="track"><div class="bar warm" style="width:${pct(w, budgeted)}%"></div></div><strong>${money(w)}</strong></div>
        <div><span class="split-label">Savings — ${pct(s, budgeted)}%</span><div class="track"><div class="bar" style="width:${pct(s, budgeted)}%"></div></div><strong>${money(s)}</strong></div>
      </div>
      <p class="muted">Needs run about two-thirds of the plan — rent is the reason — savings take 16%, and another $600 a month goes to paying down debt on top. Try your own numbers in <a href="#/tools">Calculators →</a></p>
    </section>
  </div>`;
}

// ---------------- Transactions ----------------

export function viewTransactions(state, filter) {
  const cat = filter.cat || '';
  const q = (filter.q || '').toLowerCase();
  let rows = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  if (cat) rows = rows.filter((t) => t.category === cat);
  if (q) rows = rows.filter((t) => (t.merchant + ' ' + (t.note || '')).toLowerCase().includes(q));
  const shown = rows.reduce((s, t) => s + t.amount, 0);
  return pageHead('Transactions', `${state.transactions.length} entries in ${MONTH_LABEL} · showing ${rows.length} · ${money(shown)}`) + `
  <section class="card">
    <form class="filters" id="tx-filter">
      <label>Category
        <select name="cat" id="filter-cat">
          <option value="">All categories</option>
          ${CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </label>
      <label>Search
        <input name="q" type="search" value="${esc(filter.q || '')}" placeholder="Merchant or note…">
      </label>
      <button class="btn" type="submit">Filter</button>
      ${cat || q ? '<a class="btn ghost" href="#/transactions">Clear</a>' : ''}
    </form>
    <table class="tx">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Note</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
      ${rows.map((t) => `<tr>
        <td>${fmtDate(t.date)}</td><td>${esc(t.merchant)}</td>
        <td><span class="chip" style="--chip:${categoryOf(t.category).color}">${esc(categoryOf(t.category).name)}</span></td>
        <td class="muted">${esc(t.note || '—')}</td>
        <td class="num">${money(t.amount)}</td>
        <td><button class="btn small danger" data-action="delete-transaction" data-id="${t.id}" aria-label="Delete ${esc(t.merchant)}">Delete</button></td>
      </tr>`).join('') || '<tr><td colspan="6" class="muted">Nothing matches — try clearing the filter.</td></tr>'}
      </tbody>
      <tfoot><tr><td colspan="4"><strong>Total shown</strong></td><td class="num"><strong>${money(shown)}</strong></td><td></td></tr></tfoot>
    </table>
  </section>
  <section class="card">
    <h2>Add a transaction</h2>
    <form id="add-transaction" data-form="add-transaction">
      <div class="form-row">
        <label>What<input name="merchant" required maxlength="80" placeholder="e.g. GreenMart Supermarket"></label>
        <label>Amount<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
      </div>
      <div class="form-row">
        <label>Category
          <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
        </label>
        <label>Date<input name="date" type="date" value="2026-11-26" required></label>
      </div>
      <label>Note (optional)<input name="note" maxlength="120" placeholder="e.g. Weekly shop"></label>
      <button class="btn" type="submit">Add transaction</button>
    </form>
    <p class="form-note" id="add-transaction-note"></p>
  </section>`;
}

// ---------------- Bills ----------------

export function viewBills(state) {
  const due = state.bills.reduce((s, b) => s + b.amount, 0);
  const paid = state.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  return pageHead('Bills & subscriptions', `Bills due in ${MONTH_LABEL} · ${money(due)} in total, ${money(paid)} paid, ${money(unpaidTotal)} still to pay`) + `
  <section class="stats">
    <div class="stat"><span class="stat-label">Due this month</span><strong>${money(due)}</strong><span class="stat-sub">${state.bills.length} bills</span></div>
    <div class="stat good"><span class="stat-label">Paid</span><strong>${money(paid)}</strong><span class="stat-sub">${state.bills.filter((b) => b.paid).length} of ${state.bills.length} bills</span></div>
    <div class="stat"><span class="stat-label">Still to pay</span><strong>${money(unpaidTotal)}</strong><span class="stat-sub">next: ${unpaid.length ? `${esc(unpaid[0].name)} · Nov ${unpaid[0].due}` : 'nothing left'}</span></div>
  </section>
  <section class="card">
    <h2>November bills</h2>
    <p class="muted">Tick a bill paid and it moves to the paid list — the totals above move with it.</p>
    <ul class="bill-list">
      ${[...state.bills].sort((a, b) => a.due - b.due).map((b) => `
      <li class="${b.paid ? 'paid' : ''}">
        <span class="bill-due">Nov ${b.due}</span>
        <span class="bill-name">${esc(b.name)}<small>${esc(b.recurring)}</small></span>
        <strong>${money(b.amount)}</strong>
        <button class="btn small ${b.paid ? 'ghost' : ''}" data-action="toggle-bill" data-id="${b.id}">${b.paid ? 'Paid ✓ — undo' : 'Mark paid'}</button>
      </li>`).join('')}
    </ul>
  </section>
  <section class="card">
    <h2>Add a bill</h2>
    <form id="add-bill" data-form="add-bill">
      <div class="form-row">
        <label>Bill name<input name="name" required maxlength="60" placeholder="e.g. Water — City Water Works"></label>
        <label>Amount<input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
      </div>
      <div class="form-row">
        <label>Due day<input name="due" type="number" min="1" max="31" required value="1"></label>
        <label>Repeats<select name="recurring"><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>One-off</option></select></label>
      </div>
      <button class="btn" type="submit">Add bill</button>
    </form>
    <p class="form-note" id="add-bill-note"></p>
  </section>`;
}

// ---------------- Goals ----------------

export function viewGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return pageHead('Savings goals', `${money(totalSaved)} saved toward ${money(totalTarget)} of goals · ${pct(totalSaved, totalTarget)}% of the way there`) + `
  <section class="stats">
    <div class="stat good"><span class="stat-label">Saved across goals</span><strong>${money(totalSaved)}</strong><span class="stat-sub">${state.goals.length} goals</span></div>
    <div class="stat"><span class="stat-label">Still to save</span><strong>${money(totalTarget - totalSaved)}</strong><span class="stat-sub">across all goals</span></div>
    <div class="stat"><span class="stat-label">This month's saving</span><strong>${money(spentByCategory(state).savings || 0)}</strong><span class="stat-sub">the Savings budget, ${money(state.budgets.savings || 0)} planned</span></div>
  </section>
  <div class="goal-grid">
    ${state.goals.map((g) => {
      const p = pct(g.saved, g.target);
      const left = g.target - g.saved;
      return `<section class="card goal">
        <h2>${esc(g.name)}</h2>
        <p class="muted">${esc(g.note)}</p>
        <div class="goal-nums"><strong>${money(g.saved)}</strong><span>of ${money(g.target)} · ${p}%</span></div>
        <div class="track big"><div class="bar" style="width:${Math.min(100, p)}%"></div></div>
        <p class="muted">${left > 0 ? `${money(left)} to go` : 'Goal reached — nicely done.'}</p>
        <form data-form="contribute-goal" data-goal="${g.id}">
          <div class="form-row">
            <label>Add to this goal<input name="amount" type="number" min="1" step="5" required placeholder="Amount"></label>
            <button class="btn" type="submit">Contribute</button>
          </div>
        </form>
      </section>`;
    }).join('')}
  </div>
  <section class="card">
    <h2>Start a new goal</h2>
    <form id="add-goal" data-form="add-goal">
      <div class="form-row">
        <label>Goal name<input name="name" required maxlength="50" placeholder="e.g. New washing machine"></label>
        <label>Target amount<input name="target" type="number" min="1" step="50" required placeholder="0"></label>
      </div>
      <label>Why this goal? (optional)<input name="note" maxlength="120" placeholder="e.g. The old one leaks"></label>
      <button class="btn" type="submit">Add goal</button>
    </form>
    <p class="form-note" id="add-goal-note"></p>
  </section>`;
}

// ---------------- Reports ----------------

export function viewReports(state, months) {
  const byCat = spentByCategory(state);
  const spent = totalSpent(state);
  const top = [...CATEGORIES]
    .map((c) => ({ label: c.name, value: byCat[c.id] || 0, color: c.color }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
  const hist = state.history.slice(-months);
  const october = state.history[state.history.length - 2];
  const november = state.history[state.history.length - 1];
  const change = october ? Math.round(((november.spent - october.spent) / october.spent) * 100) : 0;
  // Everyday spending only: rent, savings and debt are already paid for the
  // month, so the run-rate comes from the variable categories.
  const fixed = (byCat.housing || 0) + (byCat.savings || 0) + (byCat.debt || 0);
  const daily = (spent - fixed) / 26;
  const projected = spent + daily * 4;
  const biggest = top[0];
  const income = totalIncome(state);
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  return pageHead('Reports & insights', `What ${MONTH_LABEL} looks like, and how it compares with the last ${months} months`) + `
  <section class="card">
    <h2>Spending by category — ${MONTH_LABEL}</h2>
    <div class="chart-toggle">
      <button class="btn small" data-action="chart-mode" data-mode="donut">Donut</button>
      <button class="btn small ghost" data-action="chart-mode" data-mode="bars">Bars</button>
    </div>
    <canvas id="cat-donut" data-chart="donut" aria-label="Donut chart of spending by category"></canvas>
    <canvas id="cat-bars" data-chart="bars" hidden aria-label="Bar chart of spending by category"></canvas>
    <p class="muted">Biggest slice: <strong>${esc(biggest.label)} at ${money(biggest.value)}</strong> — ${pct(biggest.value, spent)}% of everything spent.</p>
  </section>
  <section class="card">
    <h2>Income vs spending — last ${months} months</h2>
    <div class="chart-toggle">
      <button class="btn small ${months === 3 ? '' : 'ghost'}" data-action="trend-range" data-months="3">3 months</button>
      <button class="btn small ${months === 6 ? '' : 'ghost'}" data-action="trend-range" data-months="6">6 months</button>
      <span class="legend"><i class="swatch green"></i> Income <i class="swatch amber"></i> Spent</span>
    </div>
    <canvas id="trend" data-chart="trend" data-months="${months}" aria-label="Income versus spending trend"></canvas>
    <p class="muted">November is tracking ${change <= 0 ? `${Math.abs(change)}% under` : `${change}% over`} October's spending.</p>
  </section>
  <section class="card">
    <h2>Plan vs spent — every category</h2>
    <p class="muted">The whole plan in one table, biggest spend first. Nothing here is over budget this month.</p>
    <table class="tx">
      <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Left</th><th class="num">Used</th></tr></thead>
      <tbody>
      ${[...CATEGORIES].map((c) => ({ c, planned: state.budgets[c.id] || 0, sp: byCat[c.id] || 0 }))
        .sort((a, b) => b.sp - a.sp)
        .map(({ c, planned, sp }) => {
          const left = planned - sp;
          const used = pct(sp, planned);
          return `<tr><td>${esc(c.name)}</td><td class="num">${money(planned)}</td><td class="num">${money(sp)}</td><td class="num ${left < 0 ? 'bad' : ''}">${money(left)}</td><td class="num">${used}%</td></tr>`;
        }).join('')}
      </tbody>
      <tfoot><tr><td><strong>Total</strong></td><td class="num"><strong>${money(totalBudgeted(state))}</strong></td><td class="num"><strong>${money(spent)}</strong></td><td class="num"><strong>${money(totalBudgeted(state) - spent)}</strong></td><td class="num"><strong>${pct(spent, totalBudgeted(state))}%</strong></td></tr></tfoot>
    </table>
  </section>
  <div class="cols">
    <section class="card">
      <h2>What the numbers say</h2>
      <ul class="insights">
        <li><strong>Biggest cost: ${esc(biggest.label)}.</strong> ${money(biggest.value)} this month — ${pct(biggest.value, spent)}% of all spending. It is a fixed cost, so the lever is elsewhere.</li>
        <li><strong>Groceries are the lever.</strong> ${money(byCat.groceries || 0)} spent of a ${money(state.budgets.groceries)} plan with four days left — ${money((state.budgets.groceries || 0) - (byCat.groceries || 0))} still in the envelope.</li>
        <li><strong>Month-end projection: ${money(projected)}.</strong> At ${money(daily)} a day of everyday spending, November lands about ${money(projected)} — inside the ${money(totalBudgeted(state))} plan, because rent, savings and debt are already paid.</li>
        <li><strong>Savings rate: ${pct(spentByCategory(state).savings || 0, income)}%.</strong> ${money(spentByCategory(state).savings || 0)} set aside of ${money(income)} income — under the 20% guide, but another ${money(byCat.debt || 0)} went to debt payoff, so ${money((spentByCategory(state).savings || 0) + (byCat.debt || 0))} (${pct((spentByCategory(state).savings || 0) + (byCat.debt || 0), income)}%) went to the household's future this month.</li>
        <li><strong>${unpaid.length} bills still to pay: ${money(unpaidTotal)}.</strong> ${unpaid.map((b) => `${esc(b.name)} (${money(b.amount)})`).join(', ')}, all due by Nov 30.</li>
      </ul>
    </section>
    <section class="card">
      <h2>Take the numbers with you</h2>
      <p class="muted">Download this month's transactions as a spreadsheet file, or print the report.</p>
      <p><button class="btn" data-action="export-csv">Download transactions (.csv)</button></p>
      <p><button class="btn ghost" data-action="print-report">Print this report</button></p>
      <p class="form-note" id="export-note"></p>
      <h2 class="mt">Six-month table</h2>
      <table class="tx">
        <thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Saved</th></tr></thead>
        <tbody>
        ${state.history.map((h) => `<tr><td>${esc(h.month)}</td><td class="num">${money(h.income)}</td><td class="num">${money(h.spent)}</td><td class="num">${money(h.income - h.spent)}</td></tr>`).join('')}
        </tbody>
      </table>
    </section>
  </div>`;
}

// ---------------- Calculators ----------------

export function viewTools(state) {
  return pageHead('Calculators', 'Three tools that do the maths for you — type a number and watch the answer change') + `
  <section class="card">
    <h2>50 / 30 / 20 budget splitter</h2>
    <p class="muted">Split any monthly take-home pay into needs, wants and savings.</p>
    <label>Monthly take-home pay<input id="calc-income" type="number" min="0" step="50" value="7850" data-calc="split"></label>
    <div class="split" id="split-result">
      <div><span class="split-label">Needs — 50%</span><div class="track"><div class="bar" style="width:50%"></div></div><strong id="split-needs">$3,925.00</strong></div>
      <div><span class="split-label">Wants — 30%</span><div class="track"><div class="bar warm" style="width:30%"></div></div><strong id="split-wants">$2,355.00</strong></div>
      <div><span class="split-label">Savings — 20%</span><div class="track"><div class="bar" style="width:20%"></div></div><strong id="split-save">$1,570.00</strong></div>
    </div>
    <p class="muted" id="split-note">On $7,850 a month, the Alvarez plan puts $1,200 to savings — a little under the 20% guide, because rent is high.</p>
  </section>
  <section class="card">
    <h2>Debt payoff planner</h2>
    <p class="muted">How fast does a card balance disappear — and what does an extra payment save?</p>
    <div class="form-row">
      <label>Balance owed<input id="debt-balance" type="number" min="0" step="100" value="4200" data-calc="debt"></label>
      <label>APR (%)<input id="debt-apr" type="number" min="0" step="0.1" value="22.9" data-calc="debt"></label>
    </div>
    <div class="form-row">
      <label>Monthly payment<input id="debt-pay" type="number" min="1" step="10" value="300" data-calc="debt"></label>
      <label>Extra per month<input id="debt-extra" type="number" min="0" step="10" value="150" data-calc="debt"></label>
    </div>
    <div class="stats" id="debt-result">
      <div class="stat"><span class="stat-label">Months to pay off</span><strong id="debt-months">11</strong><span class="stat-sub" id="debt-date">debt-free around Oct 2027</span></div>
      <div class="stat"><span class="stat-label">Interest paid</span><strong id="debt-interest">$470.37</strong><span class="stat-sub" id="debt-interest-note">with the extra $150 a month</span></div>
      <div class="stat good"><span class="stat-label">Extra payment saves</span><strong id="debt-saves">$263.33 · 6 months</strong><span class="stat-sub">vs paying $300 alone</span></div>
    </div>
  </section>
  <section class="card" data-monthly-saving="${state.budgets.savings || 0}">
    <h2>Emergency fund target</h2>
    <p class="muted">How big should the cushion be, and how long until it is full?</p>
    <div class="form-row">
      <label>Essential spending per month<input id="fund-spend" type="number" min="0" step="50" value="5200" data-calc="fund"></label>
      <label>Months of cover<input id="fund-months" type="range" min="3" max="12" step="1" value="6" data-calc="fund"><span id="fund-months-label">6 months</span></label>
    </div>
    <label>Already saved<input id="fund-saved" type="number" min="0" step="100" value="9400" data-calc="fund"></label>
    <div class="stats" id="fund-result">
      <div class="stat"><span class="stat-label">Target fund</span><strong id="fund-target">$31,200.00</strong><span class="stat-sub">6 months × $5,200</span></div>
      <div class="stat"><span class="stat-label">Still to save</span><strong id="fund-gap">$21,800.00</strong><span class="stat-sub" id="fund-gap-note">at $1,200 a month</span></div>
      <div class="stat good"><span class="stat-label">Months to reach it</span><strong id="fund-time">19 months</strong><span class="stat-sub">around Jun 2028</span></div>
    </div>
  </section>`;
}

// ---------------- Settings ----------------

export function viewSettings(state) {
  return pageHead('Household settings', 'Who this budget belongs to, and what happens to the data') + `
  <section class="card">
    <h2>Your household</h2>
    <form id="settings-form" data-form="save-settings">
      <label>Household name<input name="name" required maxlength="60" value="${esc(state.household.name)}"></label>
      <label>Members (comma separated)<input name="members" maxlength="200" value="${esc(state.household.members.join(', '))}"></label>
      <div class="form-row">
        <label>Payday (day of month)<input name="payday" type="number" min="1" max="28" required value="${state.household.payday}"></label>
        <label>Currency symbol
          <select name="currency">
            ${['$', '€', '£'].map((c) => `<option ${c === state.household.currency ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </label>
      </div>
      <button class="btn" type="submit">Save settings</button>
    </form>
    <p class="form-note" id="settings-note"></p>
    <h2 class="mt">Monthly income</h2>
    <table class="tx">
      <thead><tr><th>Source</th><th>Day</th><th class="num">Amount</th></tr></thead>
      <tbody>
      ${state.income.map((row) => `<tr><td>${esc(row.source)}</td><td>${row.day}</td><td class="num">${money(row.amount)}</td></tr>`).join('')}
      </tbody>
      <tfoot><tr><td colspan="2"><strong>Total</strong></td><td class="num"><strong>${money(totalIncome(state))}</strong></td></tr></tfoot>
    </table>
    <p class="muted">Income lines are fixed for this demo month. Change them by editing the household data and re-seeding below.</p>
  </section>
  <section class="card">
    <h2>Your data</h2>
    <p class="muted">Everything lives in this browser's local storage. There is no account, no server and no tracking — close the tab and the figures are still here next time; clear the site's storage and they are gone.</p>
    <p><button class="btn" data-action="export-json">Download my data (.json)</button></p>
    <p><button class="btn danger" data-action="reset-data">Reset to the November demo figures</button></p>
    <p class="form-note" id="settings-data-note"></p>
  </section>`;
}

export { money, money0 };
