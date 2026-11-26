// Hearth Ledger — the shell: hash routing, saved state, and every control
// on the eight pages. State lives in localStorage under one key; the seed
// data in data.js is only the starting point, and Reset restores it.

import { TRANSACTIONS, BILLS, GOALS, HOUSEHOLD, INCOME_TOTAL } from "./data.js";
import {
  renderDashboard,
  renderBudget,
  renderTransactions,
  renderBills,
  renderGoals,
  renderReports,
  renderCalculators,
  renderSettings,
  totalSpent,
  unpaidTotal,
} from "./pages.js";
import { split503020, payoffSchedule, money } from "./calc.js";

const STORAGE_KEY = "hearth-ledger-v3";

const ROUTES = {
  "": { title: "Dashboard", render: renderDashboard },
  budget: { title: "Budget", render: renderBudget },
  transactions: { title: "Transactions", render: renderTransactions },
  bills: { title: "Bills", render: renderBills },
  goals: { title: "Goals", render: renderGoals },
  reports: { title: "Reports", render: renderReports },
  calculators: { title: "Calculators", render: renderCalculators },
  settings: { title: "Settings", render: renderSettings },
};

function freshState() {
  return {
    householdName: HOUSEHOLD.name,
    transactions: JSON.parse(JSON.stringify(TRANSACTIONS)),
    bills: JSON.parse(JSON.stringify(BILLS)),
    goals: JSON.parse(JSON.stringify(GOALS)),
    chartMode: "donut",
    trendMonths: 6,
    txnFilter: "All",
    calcIncome: INCOME_TOTAL,
    debtBalance: 4200,
    debtApr: 22.9,
    debtPayment: 300,
    debtExtra: 150,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const saved = JSON.parse(raw);
    const base = freshState();
    return { ...base, ...saved };
  } catch {
    return freshState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or a full store: the site still works for this visit.
  }
}

const state = loadState();
const main = document.getElementById("app");

function route() {
  const hash = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  const page = ROUTES[hash] || ROUTES[""];
  document.title = `${page.title} — Hearth Ledger`;
  main.innerHTML = page.render(state);
  for (const link of document.querySelectorAll(".nav-link")) {
    const target = link.getAttribute("href").replace(/^#\/?/, "");
    link.classList.toggle("current", target === hash || (target === "" && hash === ""));
    if (target === hash || (target === "" && hash === "")) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  window.scrollTo(0, 0);
}

function rerender() {
  saveState();
  route();
}

// --- chart + trend toggles -----------------------------------------------
document.addEventListener("click", (event) => {
  const chartBtn = event.target.closest("[data-chart]");
  if (chartBtn) {
    state.chartMode = chartBtn.getAttribute("data-chart");
    rerender();
    return;
  }
  const trendBtn = event.target.closest("[data-trend]");
  if (trendBtn) {
    state.trendMonths = Number(trendBtn.getAttribute("data-trend"));
    rerender();
    return;
  }
  const payBtn = event.target.closest("[data-pay-bill]");
  if (payBtn) {
    const bill = state.bills.find((b) => b.id === payBtn.getAttribute("data-pay-bill"));
    if (bill) {
      bill.paid = true;
      rerender();
    }
    return;
  }
  const goalBtn = event.target.closest("[data-add-goal]");
  if (goalBtn) {
    const goal = state.goals.find((g) => g.id === goalBtn.getAttribute("data-add-goal"));
    if (goal) {
      goal.saved = Math.min(goal.target, goal.saved + 50);
      rerender();
    }
    return;
  }
  if (event.target.id === "save-name") {
    const input = document.getElementById("household-name-input");
    const name = input.value.trim();
    if (name) {
      state.householdName = name;
      saveState();
      document.getElementById("name-saved").textContent = `Saved — the household is now “${name}”.`;
    }
    return;
  }
  if (event.target.id === "reset-demo") {
    const keep = state;
    const fresh = freshState();
    Object.assign(keep, fresh);
    saveState();
    route();
    const msg = document.getElementById("reset-msg");
    if (msg) msg.textContent = "Back to the demo month: 54 transactions, $6,989.00 spent.";
  }
});

// --- transaction form, filter, calculators --------------------------------
document.addEventListener("submit", (event) => {
  if (event.target.id !== "txn-form") return;
  event.preventDefault();
  const merchant = document.getElementById("f-merchant").value.trim();
  const amount = Number(document.getElementById("f-amount").value);
  const date = document.getElementById("f-date").value || "2026-11-28";
  const category = document.getElementById("f-category").value;
  if (!merchant || !(amount > 0)) return;
  state.transactions.push({
    id: `u${Date.now()}`,
    date,
    merchant,
    category,
    amount: Math.round(amount * 100) / 100,
  });
  saveState();
  route();
  const msg = document.getElementById("txn-added");
  if (msg) {
    msg.textContent = `Added ${merchant} — ${money(amount)}. Now ${state.transactions.length} transactions, ${money(totalSpent(state.transactions))} spent.`;
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "txn-filter") {
    state.txnFilter = event.target.value;
    saveState();
    route();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "income-input") {
    const income = Number(event.target.value);
    if (!(income >= 0)) return;
    state.calcIncome = income;
    const split = split503020(income);
    const needs = document.getElementById("out-needs");
    const wants = document.getElementById("out-wants");
    const savings = document.getElementById("out-savings");
    if (needs) needs.textContent = money(split.needs);
    if (wants) wants.textContent = money(split.wants);
    if (savings) savings.textContent = money(split.savings);
    saveState();
    return;
  }
  if (event.target.id && event.target.id.startsWith("debt-")) {
    const read = (id) => Number(document.getElementById(id).value);
    state.debtBalance = read("debt-balance");
    state.debtApr = read("debt-apr");
    state.debtPayment = read("debt-payment");
    state.debtExtra = read("debt-extra");
    const box = document.getElementById("debt-result");
    if (!box) return;
    const debt = payoffSchedule(state.debtBalance, state.debtApr, state.debtPayment, state.debtExtra);
    const base = payoffSchedule(state.debtBalance, state.debtApr, state.debtPayment, 0);
    if (debt.affordable) {
      box.innerHTML = `<p class="result">Debt-free in <strong>${debt.months} months</strong> — ${money(debt.totalInterest)} of interest, ${money(debt.totalPaid)} paid in all.</p>
        <p class="card-note">With the base payment alone it would take ${base.months} months and ${money(base.totalInterest)} of interest. The extra ${money(state.debtExtra)} a month saves ${money(base.totalInterest - debt.totalInterest)} and ${base.months - debt.months} months.</p>`;
    } else {
      box.innerHTML = `<p class="result">That payment does not cover a month of interest — the balance would grow. Raise the payment above ${money((state.debtBalance * state.debtApr) / 100 / 12)} a month.</p>`;
    }
    saveState();
  }
});

window.addEventListener("hashchange", route);
route();
