// Hearth Ledger — the two money calculators. Pure arithmetic, no I/O,
// so the pages can call them live and the numbers always agree with the
// figures shown elsewhere on the site.

// 50/30/20: needs get half the take-home pay, wants get 30%, savings get 20%.
export function split503020(monthlyIncome) {
  const income = Math.max(0, Number(monthlyIncome) || 0);
  return {
    income,
    needs: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2,
  };
}

// Debt payoff: month by month, interest accrues on the balance at
// apr/12, then the payment (base + extra) comes off. The last month pays
// only what is left. Returns the schedule plus the headline numbers.
export function payoffSchedule(balance, aprPercent, basePayment, extraPayment) {
  const start = Math.max(0, Number(balance) || 0);
  const monthlyRate = (Number(aprPercent) || 0) / 100 / 12;
  const payment = Math.max(0, Number(basePayment) || 0) + Math.max(0, Number(extraPayment) || 0);
  const rows = [];
  if (start === 0) return { months: 0, totalInterest: 0, totalPaid: 0, rows, affordable: true };
  if (payment <= 0 || payment <= start * monthlyRate) {
    // The payment never covers a month's interest: the debt never shrinks.
    return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, rows, affordable: false };
  }
  let owed = start;
  let interestPaid = 0;
  let guard = 0;
  while (owed > 0.005 && guard < 1200) {
    guard += 1;
    const interest = owed * monthlyRate;
    const due = owed + interest;
    const paid = Math.min(payment, due);
    owed = due - paid;
    interestPaid += interest;
    rows.push({
      month: guard,
      interest: Number(interest.toFixed(2)),
      paid: Number(paid.toFixed(2)),
      left: Number(Math.max(0, owed).toFixed(2)),
    });
  }
  const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
  return {
    months: rows.length,
    totalInterest: Number(interestPaid.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    rows,
    affordable: true,
  };
}

export function money(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return "$" + Math.round(Number(n)).toLocaleString("en-US");
}
