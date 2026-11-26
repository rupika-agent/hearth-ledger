// Hearth Ledger — the router and the wiring for every control.
// Forms, buttons, sliders and charts are all handled here and drawn after
// each render. window.__shotReady is false while a page is rendering and
// true once it is on screen, so a screenshot knows when to fire.

import {
  CATEGORIES, loadState, saveState, resetState, uid, money, spentByCategory,
  totalSpent, totalBudgeted, totalIncome,
} from './data.js';
import { drawDonut, drawBars, drawTrend } from './charts.js';
import {
  layout, viewDashboard, viewBudget, viewTransactions, viewBills,
  viewGoals, viewReports, viewTools, viewSettings,
} from './views.js';

const app = document.getElementById('app');
let state = loadState();
let trendMonths = 6;
let chartMode = 'donut';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Pay a balance down month by month: interest accrues first, then the
// payment lands. Returns the months it takes and the interest it costs.
function payoffMonths(balance, apr, payment) {
  const r = apr / 100 / 12;
  if (balance <= 0) return { months: 0, interest: 0 };
  if (payment <= balance * r) return { months: Infinity, interest: Infinity };
  let bal = balance;
  let interest = 0;
  let months = 0;
  while (bal > 0 && months < 1200) {
    const i = bal * r;
    interest += i;
    const pay = Math.min(payment, bal + i);
    bal = bal + i - pay;
    months += 1;
  }
  return { months, interest };
}

// A month name a given number of months after November 2026.
function monthName(offset) {
  const base = 2026 * 12 + 10 + offset;
  return `${MONTHS[base % 12]} ${Math.floor(base / 12)}`;
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  const [pathPart, queryPart] = hash.replace(/^#/, '').split('?');
  const query = new URLSearchParams(queryPart || '');
  let html;
  let active = '#/';
  if (pathPart === '/' || pathPart === '') {
    html = viewDashboard(state);
  } else if (pathPart === '/budget') {
    active = '#/budget'; html = viewBudget(state);
  } else if (pathPart === '/transactions') {
    active = '#/transactions';
    html = viewTransactions(state, { cat: query.get('cat') || '', q: query.get('q') || '' });
  } else if (pathPart === '/bills') {
    active = '#/bills'; html = viewBills(state);
  } else if (pathPart === '/goals') {
    active = '#/goals'; html = viewGoals(state);
  } else if (pathPart === '/reports') {
    active = '#/reports'; html = viewReports(state, trendMonths);
  } else if (pathPart === '/tools') {
    active = '#/tools'; html = viewTools(state);
  } else if (pathPart === '/settings') {
    active = '#/settings'; html = viewSettings(state);
  } else {
    html = `<div class="page-head"><h1>Page not found</h1><p>That page is not part of this household's budget. <a href="#/">Back to the dashboard →</a></p></div>`;
  }
  app.innerHTML = layout(state, active, html);
  document.title = pageTitle(pathPart);
  drawCharts();
  runCalculators();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function pageTitle(path) {
  const names = {
    '/': 'Hearth Ledger — Household Budget',
    '/budget': 'Budget | Hearth Ledger',
    '/transactions': 'Transactions | Hearth Ledger',
    '/bills': 'Bills | Hearth Ledger',
    '/goals': 'Savings Goals | Hearth Ledger',
    '/reports': 'Reports | Hearth Ledger',
    '/tools': 'Calculators | Hearth Ledger',
    '/settings': 'Settings | Hearth Ledger',
  };
  return names[path] || 'Hearth Ledger — Household Budget';
}

function drawCharts() {
  const donut = document.getElementById('cat-donut');
  const bars = document.getElementById('cat-bars');
  if (donut || bars) {
    const byCat = spentByCategory(state);
    const slices = CATEGORIES
      .map((c) => ({ label: c.name, value: byCat[c.id] || 0, color: c.color }))
      .filter((s) => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const total = totalSpent(state);
    if (donut) {
      donut.hidden = chartMode !== 'donut';
      if (chartMode === 'donut') drawDonut(donut, slices, 'Spent', money(total));
    }
    if (bars) {
      bars.hidden = chartMode !== 'bars';
      if (chartMode === 'bars') drawBars(bars, slices, money);
    }
  }
  const trend = document.getElementById('trend');
  if (trend) {
    const hist = state.history.slice(-Number(trend.dataset.months || trendMonths));
    drawTrend(
      trend,
      hist.map((h) => h.month.replace(' 2026', '')),
      hist.map((h) => h.income),
      hist.map((h) => h.spent),
      money,
    );
  }
}

// The calculator cards only exist on the tools page; run whichever is there.
function runCalculators() {
  if (document.getElementById('calc-income')) updateSplit();
  if (document.getElementById('debt-balance')) updateDebt();
  if (document.getElementById('fund-spend')) updateFund();
}

function updateSplit() {
  const income = Number(document.getElementById('calc-income').value) || 0;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = money(v); };
  set('split-needs', income * 0.5);
  set('split-wants', income * 0.3);
  set('split-save', income * 0.2);
  const note = document.getElementById('split-note');
  if (note) note.textContent = `On ${money(income)} a month, the 50 / 30 / 20 guide gives ${money(income * 0.5)} for needs, ${money(income * 0.3)} for wants and ${money(income * 0.2)} for savings.`;
}

function updateDebt() {
  const balance = Number(document.getElementById('debt-balance').value) || 0;
  const apr = Number(document.getElementById('debt-apr').value) || 0;
  const pay = Number(document.getElementById('debt-pay').value) || 0;
  const extra = Number(document.getElementById('debt-extra').value) || 0;
  const withExtra = payoffMonths(balance, apr, pay + extra);
  const without = payoffMonths(balance, apr, pay);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  if (!Number.isFinite(withExtra.months)) {
    set('debt-months', 'Never');
    set('debt-date', 'the payment does not cover the interest');
    set('debt-interest', '—');
    set('debt-interest-note', 'raise the monthly payment above the interest');
    set('debt-saves', '—');
    return;
  }
  set('debt-months', String(withExtra.months));
  set('debt-date', `debt-free around ${monthName(withExtra.months)}`);
  set('debt-interest', money(withExtra.interest));
  set('debt-interest-note', `with the extra ${money(extra)} a month`);
  if (Number.isFinite(without.months) && without.months > withExtra.months) {
    set('debt-saves', `${money(without.interest - withExtra.interest)} · ${without.months - withExtra.months} months`);
  } else {
    set('debt-saves', 'No extra payment set');
  }
}

function updateFund() {
  const spend = Number(document.getElementById('fund-spend').value) || 0;
  const months = Number(document.getElementById('fund-months').value) || 6;
  const saved = Number(document.getElementById('fund-saved').value) || 0;
  const card = document.querySelector('[data-monthly-saving]');
  const monthlySaving = card ? Number(card.dataset.monthlySaving) || 0 : 0;
  const target = spend * months;
  const gap = Math.max(0, target - saved);
  const monthsTo = monthlySaving > 0 && gap > 0 ? Math.ceil(gap / monthlySaving) : 0;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('fund-target', money(target));
  document.querySelector('#fund-result .stat .stat-sub').textContent = `${months} months × ${money(spend)}`;
  set('fund-gap', money(gap));
  set('fund-gap-note', gap > 0 ? `at ${money(monthlySaving)} a month` : 'already covered');
  set('fund-time', gap > 0 ? `${monthsTo} months` : '0 months — covered');
  const timeSub = document.querySelectorAll('#fund-result .stat-sub')[2];
  if (timeSub) timeSub.textContent = gap > 0 ? `around ${monthName(monthsTo)}` : 'the fund is full';
  const label = document.getElementById('fund-months-label');
  if (label) label.textContent = `${months} months`;
}

// ---- forms ----

function formData(form) {
  const data = {};
  new FormData(form).forEach((v, k) => { data[k] = String(v).trim(); });
  return data;
}

function note(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.id === 'tx-filter') {
    event.preventDefault();
    const d = formData(form);
    const params = new URLSearchParams();
    if (d.cat) params.set('cat', d.cat);
    if (d.q) params.set('q', d.q);
    const qs = params.toString();
    location.hash = '#/transactions' + (qs ? '?' + qs : '');
    return;
  }
  const kind = form.dataset.form;
  if (!kind) return;
  event.preventDefault();
  const d = formData(form);
  if (kind === 'add-transaction') {
    const amount = Number(d.amount);
    if (!d.merchant || !(amount > 0) || !d.date) return;
    state.transactions.push({
      id: uid('t'), date: d.date, merchant: d.merchant,
      category: d.category || 'misc', amount, note: d.note || '',
    });
    saveState(state);
    render();
    note('add-transaction-note', `Added ${money(amount)} — ${d.merchant}. The dashboard, budget and reports already include it.`);
    note('quick-add-note', `Added ${money(amount)} — ${d.merchant}.`);
  } else if (kind === 'add-category') {
    const amount = Number(d.amount);
    if (!d.name || !(amount >= 0)) return;
    const id = 'custom-' + d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    state.budgets[id] = amount;
    saveState(state);
    render();
    note('add-category-note', `Added “${d.name}” with a ${money(amount)} monthly plan.`);
  } else if (kind === 'add-bill') {
    const amount = Number(d.amount);
    const due = Number(d.due);
    if (!d.name || !(amount > 0) || !(due >= 1 && due <= 31)) return;
    state.bills.push({ id: uid('b'), name: d.name, amount, due, paid: false, recurring: d.recurring || 'Monthly' });
    saveState(state);
    render();
    note('add-bill-note', `Added “${d.name}” — ${money(amount)} due Nov ${due}.`);
  } else if (kind === 'contribute-goal') {
    const amount = Number(d.amount);
    const goal = state.goals.find((g) => g.id === form.dataset.goal);
    if (!goal || !(amount > 0)) return;
    goal.saved += amount;
    saveState(state);
    render();
  } else if (kind === 'add-goal') {
    const target = Number(d.target);
    if (!d.name || !(target > 0)) return;
    state.goals.push({ id: uid('g'), name: d.name, target, saved: 0, note: d.note || 'A new goal for the household.' });
    saveState(state);
    render();
    note('add-goal-note', `Added “${d.name}” with a ${money(target)} target.`);
  } else if (kind === 'save-settings') {
    const payday = Number(d.payday);
    state.household.name = d.name || state.household.name;
    state.household.members = d.members ? d.members.split(',').map((m) => m.trim()).filter(Boolean) : state.household.members;
    state.household.payday = payday >= 1 && payday <= 28 ? payday : state.household.payday;
    state.household.currency = d.currency || state.household.currency;
    saveState(state);
    note('settings-note', 'Saved. The new household name shows on every page.');
    render();
  }
});

// ---- clicks ----

document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'delete-transaction') {
    const t = state.transactions.find((x) => x.id === btn.dataset.id);
    state.transactions = state.transactions.filter((x) => x.id !== btn.dataset.id);
    saveState(state);
    render();
    if (t) note('add-transaction-note', `Deleted ${money(t.amount)} — ${t.merchant}.`);
  } else if (action === 'toggle-bill') {
    const bill = state.bills.find((b) => b.id === btn.dataset.id);
    if (bill) { bill.paid = !bill.paid; saveState(state); render(); }
  } else if (action === 'chart-mode') {
    chartMode = btn.dataset.mode;
    render();
  } else if (action === 'trend-range') {
    trendMonths = Number(btn.dataset.months) || 6;
    render();
  } else if (action === 'export-csv') {
    const head = 'Date,Merchant,Category,Note,Amount\n';
    const lines = [...state.transactions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((t) => [t.date, `"${t.merchant.replace(/"/g, '""')}"`, t.category, `"${(t.note || '').replace(/"/g, '""')}"`, t.amount.toFixed(2)].join(','));
    download(`hearth-ledger-transactions-${'2026-11'}.csv`, head + lines.join('\n'), 'text/csv');
    note('export-note', `Downloaded ${lines.length} transactions as a CSV file.`);
  } else if (action === 'export-json') {
    download('hearth-ledger-data.json', JSON.stringify(state, null, 2), 'application/json');
    note('settings-data-note', 'Downloaded the household data as JSON.');
  } else if (action === 'print-report') {
    window.print();
  } else if (action === 'reset-data') {
    if (window.confirm('Reset everything to the November demo figures? Your changes will be lost.')) {
      state = resetState();
      render();
      note('settings-data-note', 'Reset to the November demo figures.');
    }
  }
});

// ---- live inputs: calculators update as you type, budget edits on change ----

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.matches('[data-calc="split"]')) updateSplit();
  if (el.matches('[data-calc="debt"]')) updateDebt();
  if (el.matches('[data-calc="fund"]')) updateFund();
});

document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.matches('[data-budget]')) {
    const v = Number(el.value);
    if (Number.isFinite(v) && v >= 0) {
      state.budgets[el.dataset.budget] = v;
      saveState(state);
      render();
    }
  }
  if (el.id === 'filter-cat') {
    const form = document.getElementById('tx-filter');
    if (form) form.requestSubmit();
  }
});

function download(filename, text, type) {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

window.addEventListener('hashchange', render);
render();
