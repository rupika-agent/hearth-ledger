// Hearth Ledger — the demo month, and the small helpers every page uses.
//
// The Alvarez household's November 2026 lives here: income, the plan for
// each category, 54 transactions, the bills, the savings goals and six
// months of history. The whole state is one object, kept in localStorage
// under one key. Nothing in this file ever leaves the browser.

export const STORE_KEY = 'hearth-ledger-v1';
export const MONTH_LABEL = 'November 2026';
export const MONTH_ID = '2026-11';

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', icon: '⌂', color: '#1f4d3a' },
  { id: 'groceries', name: 'Groceries', icon: '◉', color: '#2e7d5b' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#b7791f' },
  { id: 'transport', name: 'Transport', icon: '➤', color: '#4a6fa5' },
  { id: 'dining', name: 'Dining out', icon: '✦', color: '#c0563c' },
  { id: 'kids', name: 'Kids & school', icon: '✎', color: '#7c5cbf' },
  { id: 'health', name: 'Health', icon: '+', color: '#3d8b8b' },
  { id: 'entertainment', name: 'Entertainment', icon: '♪', color: '#a34d7a' },
  { id: 'clothing', name: 'Clothing', icon: '◈', color: '#6b7c93' },
  { id: 'savings', name: 'Savings', icon: '⬢', color: '#1f4d3a' },
  { id: 'debt', name: 'Debt payoff', icon: '↺', color: '#8a5a2b' },
  { id: 'home', name: 'Home & garden', icon: '❀', color: '#5b8c5a' },
  { id: 'gifts', name: 'Gifts & giving', icon: '♥', color: '#b0526b' },
  { id: 'personal', name: 'Personal', icon: '☺', color: '#778899' },
  { id: 'misc', name: 'Miscellaneous', icon: '•', color: '#999999' },
];

export function seedState() {
  return {
    household: {
      name: 'The Alvarez Household',
      members: ['Maya Alvarez', 'Daniel Alvarez', 'Sofia (9)', 'Leo (6)'],
      payday: 1,
      currency: '$',
    },
    income: [
      { id: 'inc-1', source: 'Maya — salary (Riverbank Credit Union)', amount: 4850, day: 1 },
      { id: 'inc-2', source: 'Daniel — salary (Northfield Logistics)', amount: 2700, day: 1 },
      { id: 'inc-3', source: 'Daniel — weekend tutoring', amount: 300, day: 15 },
    ],
    budgets: {
      housing: 1950, groceries: 880, utilities: 430, transport: 540,
      dining: 260, kids: 420, health: 310, entertainment: 180,
      clothing: 150, savings: 1200, debt: 600, home: 250,
      gifts: 150, personal: 240, misc: 200,
    },
    transactions: [
      { id: 't01', date: '2026-11-01', merchant: 'Maple Court Apartments — rent', category: 'housing', amount: 1950.00, note: 'Monthly rent, autopay' },
      { id: 't02', date: '2026-11-01', merchant: 'GreenMart Supermarket', category: 'groceries', amount: 148.62, note: 'Weekly shop' },
      { id: 't03', date: '2026-11-02', merchant: 'City Power & Light', category: 'utilities', amount: 142.30, note: 'October electricity' },
      { id: 't04', date: '2026-11-03', merchant: 'Northside Pharmacy', category: 'health', amount: 46.80, note: 'Prescriptions' },
      { id: 't05', date: '2026-11-04', merchant: 'Bluebird Cafe', category: 'dining', amount: 38.50, note: 'Lunch with Maya' },
      { id: 't06', date: '2026-11-05', merchant: 'GreenMart Supermarket', category: 'groceries', amount: 121.44, note: 'Weekly shop' },
      { id: 't07', date: '2026-11-06', merchant: 'Sunoco Fuel', category: 'transport', amount: 52.10, note: 'Tank fill-up' },
      { id: 't08', date: '2026-11-07', merchant: 'Little Oaks School — lunch plan', category: 'kids', amount: 96.00, note: 'November lunches, Sofia + Leo' },
      { id: 't09', date: '2026-11-08', merchant: 'StreamHouse + MusicBox', category: 'entertainment', amount: 32.98, note: 'Monthly subscriptions' },
      { id: 't10', date: '2026-11-09', merchant: 'GreenMart Supermarket', category: 'groceries', amount: 164.90, note: 'Weekly shop + pantry stock-up' },
      { id: 't11', date: '2026-11-10', merchant: 'Bright Smiles Dental', category: 'health', amount: 120.00, note: "Leo's check-up" },
      { id: 't12', date: '2026-11-11', merchant: 'Harbor Books', category: 'kids', amount: 42.35, note: 'School book fair' },
      { id: 't13', date: '2026-11-12', merchant: 'City Water Works', category: 'utilities', amount: 68.40, note: 'Water bill' },
      { id: 't14', date: '2026-11-13', merchant: 'Trattoria Verde', category: 'dining', amount: 86.20, note: 'Friday family dinner' },
      { id: 't15', date: '2026-11-14', merchant: 'GreenMart Supermarket', category: 'groceries', amount: 139.75, note: 'Weekly shop' },
      { id: 't16', date: '2026-11-15', merchant: 'Metro Transit — monthly pass', category: 'transport', amount: 80.00, note: "Daniel's pass" },
      { id: 't17', date: '2026-11-16', merchant: 'Sunoco Fuel', category: 'transport', amount: 48.60, note: 'Tank fill-up' },
      { id: 't18', date: '2026-11-17', merchant: 'KidsZone Sports Club', category: 'kids', amount: 118.00, note: "Sofia's swimming term" },
      { id: 't19', date: '2026-11-18', merchant: 'FiberNet Internet', category: 'utilities', amount: 79.00, note: 'Monthly broadband' },
      { id: 't20', date: '2026-11-19', merchant: 'GreenMart Supermarket', category: 'groceries', amount: 167.30, note: 'Weekly shop' },
      { id: 't21', date: '2026-11-20', merchant: 'Bright Mobile', category: 'utilities', amount: 112.00, note: 'Two lines, monthly' },
      { id: 't22', date: '2026-11-21', merchant: 'Corner Bakery', category: 'dining', amount: 24.75, note: 'Saturday pastries' },
      { id: 't23', date: '2026-11-22', merchant: 'Old Navy Kids', category: 'clothing', amount: 96.40, note: 'Winter coats for the kids' },
      { id: 't24', date: '2026-11-23', merchant: 'Garden Depot', category: 'home', amount: 64.20, note: 'Autumn garden supplies' },
      { id: 't25', date: '2026-11-24', merchant: 'Sunoco Fuel', category: 'transport', amount: 44.90, note: 'Tank fill-up' },
      { id: 't26', date: '2026-11-25', merchant: 'City Clinic — flu shots', category: 'health', amount: 60.00, note: 'Family flu shots' },
      { id: 't28', date: '2026-11-25', merchant: 'Transfer to emergency fund', category: 'savings', amount: 1200.00, note: 'Automatic transfer on payday' },
      { id: 't29', date: '2026-11-25', merchant: 'Extra card payment', category: 'debt', amount: 600.00, note: 'Above the minimum, on plan' },
      { id: 't30', date: '2026-11-26', merchant: 'Paws & Claws Vet', category: 'health', amount: 62.50, note: "Check-up for Biscuit the dog" },
      { id: 't31', date: '2026-11-06', merchant: 'Post Office — parcels', category: 'misc', amount: 18.40, note: 'Return parcel' },
      { id: 't32', date: '2026-11-07', merchant: 'Shear Delight Salon', category: 'personal', amount: 65.00, note: "Maya's haircut" },
      { id: 't33', date: '2026-11-08', merchant: 'Riverside Mini Golf', category: 'entertainment', amount: 28.00, note: 'Family outing' },
      { id: 't34', date: '2026-11-09', merchant: 'Paper & Ink Stationers', category: 'misc', amount: 22.75, note: 'Printing and stationery' },
      { id: 't35', date: '2026-11-10', merchant: 'Bloom & Branch Florist', category: 'gifts', amount: 58.00, note: 'Birthday gift for Grandma Rosa' },
      { id: 't36', date: '2026-11-12', merchant: 'Hardware Barn', category: 'home', amount: 42.80, note: 'Light bulbs and fixings' },
      { id: 't37', date: '2026-11-13', merchant: 'Stride Sports', category: 'personal', amount: 89.99, note: "Daniel's gym shoes" },
      { id: 't38', date: '2026-11-14', merchant: 'Regal Cinema', category: 'entertainment', amount: 54.00, note: 'Saturday film, four tickets' },
      { id: 't39', date: '2026-11-15', merchant: 'Community Food Bank', category: 'gifts', amount: 40.00, note: 'Monthly donation' },
      { id: 't40', date: '2026-11-17', merchant: 'Pet Pantry', category: 'misc', amount: 52.60, note: 'Food for Biscuit' },
      { id: 't41', date: '2026-11-18', merchant: 'Petal & Stem Florist', category: 'gifts', amount: 24.50, note: 'Thank-you flowers for the neighbours' },
      { id: 't42', date: '2026-11-19', merchant: 'City Centre Parking', category: 'transport', amount: 18.50, note: 'Saturday parking' },
      { id: 't43', date: '2026-11-19', merchant: 'Home & Hearth Store', category: 'home', amount: 38.00, note: 'Doormat and cleaning supplies' },
      { id: 't44', date: '2026-11-20', merchant: 'Little Oaks School — photos', category: 'kids', amount: 48.50, note: 'School photo pack' },
      { id: 't45', date: '2026-11-21', merchant: 'Glow Skincare', category: 'personal', amount: 48.00, note: "Maya's skincare" },
      { id: 't46', date: '2026-11-21', merchant: 'City Cabs', category: 'transport', amount: 28.68, note: 'Late-night taxi home' },
      { id: 't47', date: '2026-11-21', merchant: 'The Game Shelf', category: 'entertainment', amount: 38.50, note: 'Board game night' },
      { id: 't48', date: '2026-11-22', merchant: 'Sakura Sushi — takeaway', category: 'dining', amount: 58.40, note: 'Sunday takeaway' },
      { id: 't49', date: '2026-11-22', merchant: 'Corner Market Stall', category: 'misc', amount: 31.25, note: 'Household odds and ends' },
      { id: 't50', date: '2026-11-23', merchant: 'Little Oaks — art class', category: 'kids', amount: 60.00, note: "Sofia's after-school art term" },
      { id: 't51', date: '2026-11-23', merchant: 'StreamHouse rental', category: 'entertainment', amount: 7.99, note: 'Film rental' },
      { id: 't52', date: '2026-11-24', merchant: 'Fix-It Plumbing', category: 'home', amount: 45.00, note: 'Kitchen tap repair' },
      { id: 't53', date: '2026-11-24', merchant: 'Pizza Friday', category: 'dining', amount: 31.15, note: 'Friday pizza night' },
      { id: 't54', date: '2026-11-25', merchant: 'Sparkle Car Wash', category: 'misc', amount: 15.00, note: 'Wash and vacuum' },
      { id: 't55', date: '2026-11-26', merchant: 'Bright Cleaners', category: 'misc', amount: 16.00, note: 'Dry cleaning' },
    ].filter((t) => t.amount > 0),
    bills: [
      { id: 'b01', name: 'Rent — Maple Court Apartments', amount: 1950.00, due: 1, paid: true, recurring: 'Monthly' },
      { id: 'b02', name: 'Electricity — City Power & Light', amount: 142.30, due: 12, paid: true, recurring: 'Monthly' },
      { id: 'b03', name: 'Water — City Water Works', amount: 68.40, due: 15, paid: true, recurring: 'Monthly' },
      { id: 'b04', name: 'Internet — FiberNet', amount: 79.00, due: 18, paid: true, recurring: 'Monthly' },
      { id: 'b05', name: 'Mobile — Bright Mobile (2 lines)', amount: 112.00, due: 20, paid: true, recurring: 'Monthly' },
      { id: 'b06', name: 'Car insurance — SafeDrive', amount: 186.00, due: 25, paid: true, recurring: 'Monthly' },
      { id: 'b07', name: 'Streaming — StreamHouse + MusicBox', amount: 32.98, due: 27, paid: false, recurring: 'Monthly' },
      { id: 'b08', name: 'Gym — Riverside Fitness', amount: 45.00, due: 28, paid: false, recurring: 'Monthly' },
      { id: 'b09', name: 'Car payment — Northfield Auto', amount: 310.00, due: 30, paid: false, recurring: 'Monthly' },
      { id: 'b10', name: 'Cloud storage — CloudVault 2 TB', amount: 9.99, due: 30, paid: false, recurring: 'Monthly' },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 12000, saved: 9400, note: 'Six months of essentials, for peace of mind.' },
      { id: 'g2', name: 'Family trip — Japan', target: 4500, saved: 2850, note: 'Flights and a week in Kyoto next spring.' },
      { id: 'g3', name: 'New car down payment', target: 6000, saved: 1700, note: 'Replace the 2014 sedan before next winter.' },
      { id: 'g4', name: "Kids' college starter", target: 5000, saved: 3250, note: 'A head start for Sofia and Leo.' },
    ],
    history: [
      { month: 'Jun 2026', income: 7850, spent: 7120 },
      { month: 'Jul 2026', income: 7850, spent: 6890 },
      { month: 'Aug 2026', income: 8150, spent: 7340 },
      { month: 'Sep 2026', income: 7850, spent: 6705 },
      { month: 'Oct 2026', income: 7850, spent: 7044 },
      { month: 'Nov 2026', income: 7850, spent: 6989 },
    ],
  };
}

// Read the saved month back; when storage is empty, unreadable or from an
// older shape, start again from the seed figures above.
export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.transactions && parsed.budgets) return parsed;
    }
  } catch { /* bad storage: fall through to the seed */ }
  return seedState();
}

export function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* private mode: memory only */ }
}

export function resetState() {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

// ---- derived figures: recomputed from the state on every render, so no
// page can ever disagree with another one about the same month ----

export function totalIncome(state) {
  return state.income.reduce((sum, row) => sum + row.amount, 0);
}

export function spentByCategory(state) {
  const spent = {};
  for (const cat of CATEGORIES) spent[cat.id] = 0;
  for (const t of state.transactions) {
    if (spent[t.category] !== undefined) spent[t.category] += t.amount;
  }
  return spent;
}

export function totalSpent(state) {
  return state.transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function totalBudgeted(state) {
  return Object.values(state.budgets).reduce((sum, v) => sum + v, 0);
}

export function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: '•', color: '#999999' };
}

export function money(n) {
  const sign = n < 0 ? '−' : '';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m - 1]} ${d}`;
}

export function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}
