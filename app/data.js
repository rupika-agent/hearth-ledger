// Hearth Ledger — seed data for the Rivera household, November 2026.
// Every figure below is the demo month's own data: 54 expense entries that
// add up to $6,989.00, income of $7,850.00, a plan of $7,760.00 and unpaid
// bills of $397.97. Nothing here is fetched from anywhere.

export const HOUSEHOLD = {
  name: "Rivera Household",
  month: "November 2026",
  members: ["Mara Rivera", "Jon Rivera", "Theo Rivera"],
  currency: "USD",
};

export const INCOME_ENTRIES = [
  { id: "inc-1", date: "2026-11-01", source: "Rivera Design Studio", label: "Salary — Mara", amount: 6800.0 },
  { id: "inc-2", date: "2026-11-10", source: "Weekend Markets", label: "Freelance market stall", amount: 650.0 },
  { id: "inc-3", date: "2026-11-15", source: "City Revenue", label: "Tax refund", amount: 240.0 },
  { id: "inc-4", date: "2026-11-27", source: "Hearth Savings", label: "Savings interest", amount: 160.0 },
];

export const INCOME_TOTAL = 7850.0;

export const PLAN = [
  { category: "Housing", planned: 2450.0 },
  { category: "Groceries", planned: 880.0 },
  { category: "Dining", planned: 420.0 },
  { category: "Transport", planned: 560.0 },
  { category: "Utilities", planned: 390.0 },
  { category: "Health", planned: 320.0 },
  { category: "Fun", planned: 480.0 },
  { category: "Clothing", planned: 260.0 },
  { category: "Home", planned: 300.0 },
  { category: "Subscriptions", planned: 180.0 },
  { category: "Savings", planned: 1200.0 },
  { category: "Misc", planned: 320.0 },
];

export const PLAN_TOTAL = 7760.0;

// 54 expense transactions, November 2026. Category subtotals:
// Housing 2450.00, Groceries 812.45, Dining 386.20, Transport 512.75,
// Utilities 368.40, Health 296.10, Fun 412.60, Clothing 238.90,
// Home 274.35, Subscriptions 164.97, Misc 276.78, Savings 795.50.
// Grand total: $6,989.00.
export const TRANSACTIONS = [
  { id: "t01", date: "2026-11-01", merchant: "Maple Court Apartments", category: "Housing", amount: 2280.0 },
  { id: "t02", date: "2026-11-03", merchant: "City Parking", category: "Housing", amount: 65.0 },
  { id: "t03", date: "2026-11-10", merchant: "Maple Court HOA", category: "Housing", amount: 75.0 },
  { id: "t04", date: "2026-11-18", merchant: "KeepSafe Storage", category: "Housing", amount: 30.0 },

  { id: "t05", date: "2026-11-02", merchant: "GreenMart", category: "Groceries", amount: 96.4 },
  { id: "t06", date: "2026-11-05", merchant: "GreenMart", category: "Groceries", amount: 84.25 },
  { id: "t07", date: "2026-11-08", merchant: "FreshFields Market", category: "Groceries", amount: 112.8 },
  { id: "t08", date: "2026-11-11", merchant: "GreenMart", category: "Groceries", amount: 76.15 },
  { id: "t09", date: "2026-11-14", merchant: "Corner Bakery & Deli", category: "Groceries", amount: 93.6 },
  { id: "t10", date: "2026-11-16", merchant: "FreshFields Market", category: "Groceries", amount: 88.9 },
  { id: "t11", date: "2026-11-19", merchant: "GreenMart", category: "Groceries", amount: 104.35 },
  { id: "t12", date: "2026-11-23", merchant: "GreenMart", category: "Groceries", amount: 79.5 },
  { id: "t13", date: "2026-11-26", merchant: "FreshFields Market", category: "Groceries", amount: 76.5 },

  { id: "t14", date: "2026-11-02", merchant: "Noodle House", category: "Dining", amount: 48.6 },
  { id: "t15", date: "2026-11-06", merchant: "Taco Libre", category: "Dining", amount: 32.4 },
  { id: "t16", date: "2026-11-09", merchant: "Sakura Sushi", category: "Dining", amount: 56.75 },
  { id: "t17", date: "2026-11-13", merchant: "Burger Barn", category: "Dining", amount: 41.2 },
  { id: "t18", date: "2026-11-15", merchant: "Trattoria Luna", category: "Dining", amount: 62.9 },
  { id: "t19", date: "2026-11-20", merchant: "Coffee Loft", category: "Dining", amount: 38.45 },
  { id: "t20", date: "2026-11-22", merchant: "Noodle House", category: "Dining", amount: 54.3 },
  { id: "t21", date: "2026-11-27", merchant: "Pizza Pronto", category: "Dining", amount: 51.6 },

  { id: "t22", date: "2026-11-03", merchant: "Metro Fuel", category: "Transport", amount: 58.0 },
  { id: "t23", date: "2026-11-07", merchant: "City Transit", category: "Transport", amount: 42.5 },
  { id: "t24", date: "2026-11-10", merchant: "Metro Fuel", category: "Transport", amount: 76.25 },
  { id: "t25", date: "2026-11-14", merchant: "CityCab", category: "Transport", amount: 89.0 },
  { id: "t26", date: "2026-11-17", merchant: "Metro Fuel", category: "Transport", amount: 64.8 },
  { id: "t27", date: "2026-11-21", merchant: "AutoWorks", category: "Transport", amount: 112.4 },
  { id: "t28", date: "2026-11-25", merchant: "Metro Fuel", category: "Transport", amount: 69.8 },

  { id: "t29", date: "2026-11-04", merchant: "BrightPower", category: "Utilities", amount: 118.2 },
  { id: "t30", date: "2026-11-08", merchant: "City Water", category: "Utilities", amount: 41.1 },
  { id: "t31", date: "2026-11-12", merchant: "NorthLink", category: "Utilities", amount: 69.9 },
  { id: "t32", date: "2026-11-15", merchant: "MobileOne", category: "Utilities", amount: 84.0 },
  { id: "t33", date: "2026-11-19", merchant: "HomeGas", category: "Utilities", amount: 55.2 },

  { id: "t34", date: "2026-11-06", merchant: "MediCare Plus", category: "Health", amount: 85.0 },
  { id: "t35", date: "2026-11-12", merchant: "BrightSmile Dental", category: "Health", amount: 42.6 },
  { id: "t36", date: "2026-11-17", merchant: "ClearVision", category: "Health", amount: 128.5 },
  { id: "t37", date: "2026-11-24", merchant: "MediCare Plus", category: "Health", amount: 40.0 },

  { id: "t38", date: "2026-11-07", merchant: "Starlight Cinema", category: "Fun", amount: 24.99 },
  { id: "t39", date: "2026-11-11", merchant: "PlayHouse", category: "Fun", amount: 89.0 },
  { id: "t40", date: "2026-11-16", merchant: "LiveWire Tickets", category: "Fun", amount: 156.4 },
  { id: "t41", date: "2026-11-21", merchant: "Putt Palace", category: "Fun", amount: 67.25 },
  { id: "t42", date: "2026-11-25", merchant: "DogEar Books", category: "Fun", amount: 74.96 },

  { id: "t43", date: "2026-11-09", merchant: "NorthPeak", category: "Clothing", amount: 89.99 },
  { id: "t44", date: "2026-11-18", merchant: "LittleSteps", category: "Clothing", amount: 64.5 },
  { id: "t45", date: "2026-11-26", merchant: "Threadline", category: "Clothing", amount: 84.41 },

  { id: "t46", date: "2026-11-05", merchant: "HomeBase", category: "Home", amount: 132.0 },
  { id: "t47", date: "2026-11-13", merchant: "HomeBase", category: "Home", amount: 58.75 },
  { id: "t48", date: "2026-11-24", merchant: "FixIt Hardware", category: "Home", amount: 83.6 },

  { id: "t49", date: "2026-11-01", merchant: "TuneWave", category: "Subscriptions", amount: 15.99 },
  { id: "t50", date: "2026-11-02", merchant: "SkyVault", category: "Subscriptions", amount: 119.0 },
  { id: "t51", date: "2026-11-10", merchant: "Daily Post", category: "Subscriptions", amount: 29.98 },

  { id: "t52", date: "2026-11-08", merchant: "Gift for Aunt Rosa", category: "Misc", amount: 145.0 },
  { id: "t53", date: "2026-11-20", merchant: "HappyPaws Vet", category: "Misc", amount: 131.78 },

  { id: "t54", date: "2026-11-28", merchant: "Hearth Savings", category: "Savings", amount: 795.5 },
];

// Bills for November 2026. Unpaid: electric 128.40 + water 46.30 +
// internet 74.50 + phone 89.00 + gym 32.98 + recycling 26.79 = $397.97.
// Marking the gym bill paid leaves $364.99 unpaid.
export const BILLS = [
  { id: "b1", name: "Rent", payee: "Maple Court Apartments", amount: 2280.0, due: "2026-11-01", paid: true },
  { id: "b2", name: "Electric", payee: "BrightPower", amount: 128.4, due: "2026-11-08", paid: false },
  { id: "b3", name: "Water", payee: "City Water", amount: 46.3, due: "2026-11-12", paid: false },
  { id: "b4", name: "Internet", payee: "NorthLink", amount: 74.5, due: "2026-11-15", paid: false },
  { id: "b5", name: "Phone", payee: "MobileOne", amount: 89.0, due: "2026-11-18", paid: false },
  { id: "b6", name: "Gym", payee: "FitLife", amount: 32.98, due: "2026-11-22", paid: false },
  { id: "b7", name: "Recycling", payee: "City Services", amount: 26.79, due: "2026-11-25", paid: false },
  { id: "b8", name: "Home insurance", payee: "SafeHome", amount: 112.4, due: "2026-11-28", paid: true },
];

export const GOALS = [
  { id: "g1", name: "Emergency fund", saved: 2400.0, target: 5000.0, note: "$200 a month, automatic on payday" },
  { id: "g2", name: "Family holiday", saved: 1350.0, target: 3000.0, note: "Seaside trip next summer" },
  { id: "g3", name: "New sofa", saved: 620.0, target: 1200.0, note: "Replace the sagging one in the living room" },
];

// Monthly spending, June–November 2026, for the trend chart.
export const MONTHS = [
  { label: "Jun", spent: 6412.3 },
  { label: "Jul", spent: 6788.15 },
  { label: "Aug", spent: 6543.9 },
  { label: "Sep", spent: 6892.45 },
  { label: "Oct", spent: 6715.8 },
  { label: "Nov", spent: 6989.0 },
];
