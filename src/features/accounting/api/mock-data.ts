import type {
  Account,
  ApMetrics,
  ArMetrics,
  AuditEntry,
  BalanceSheet,
  CashFlowStatement,
  Expense,
  FinanceKpis,
  FinancePayment,
  IncomeExpensePoint,
  JournalEntry,
  LedgerEntry,
  PayableRow,
  ProfitAndLoss,
  ReceivableRow,
  TaxRule,
} from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString()
const daysFromNow = (n: number) => new Date(now + n * 86400000).toISOString()

// --- Chart of Accounts ---

export const mockAccounts: Account[] = [
  { id: "acc-assets", name: "Assets", code: "1000", type: "asset", parentId: null, currency: "USD", status: "active", balance: 1262500 },
  { id: "acc-cash", name: "Cash", code: "1100", type: "asset", parentId: "acc-assets", currency: "USD", status: "active", balance: 185000 },
  { id: "acc-bank", name: "Bank", code: "1200", type: "asset", parentId: "acc-assets", currency: "USD", status: "active", balance: 265000 },
  { id: "acc-inventory", name: "Inventory", code: "1300", type: "asset", parentId: "acc-assets", currency: "USD", status: "active", balance: 812500 },
  { id: "acc-liabilities", name: "Liabilities", code: "2000", type: "liability", parentId: null, currency: "USD", status: "active", balance: 55700 },
  { id: "acc-payable", name: "Supplier Payable", code: "2100", type: "liability", parentId: "acc-liabilities", currency: "USD", status: "active", balance: 55700 },
  { id: "acc-equity", name: "Equity", code: "3000", type: "equity", parentId: null, currency: "USD", status: "active", balance: 1206800 },
  { id: "acc-capital", name: "Owner's Capital", code: "3100", type: "equity", parentId: "acc-equity", currency: "USD", status: "active", balance: 1206800 },
  { id: "acc-income", name: "Income", code: "4000", type: "income", parentId: null, currency: "USD", status: "active", balance: 2500000 },
  { id: "acc-sales", name: "Sales Revenue", code: "4100", type: "income", parentId: "acc-income", currency: "USD", status: "active", balance: 2500000 },
  { id: "acc-expenses", name: "Expenses", code: "5000", type: "expense", parentId: null, currency: "USD", status: "active", balance: 800000 },
  { id: "acc-purchase-cost", name: "Purchase Cost", code: "5100", type: "expense", parentId: "acc-expenses", currency: "USD", status: "active", balance: 425000 },
  { id: "acc-salary", name: "Salary", code: "5200", type: "expense", parentId: "acc-expenses", currency: "USD", status: "active", balance: 180000 },
  { id: "acc-operating", name: "Operating Expense", code: "5300", type: "expense", parentId: "acc-expenses", currency: "USD", status: "active", balance: 195000 },
]

// --- Journal Entries ---

export const mockJournalEntries: JournalEntry[] = [
  {
    id: "je-1",
    reference: "JE-2026-0101",
    date: daysAgo(1),
    lines: [
      { id: "jl-1", accountId: "acc-cash", accountName: "Cash", debit: 136.88, credit: 0, description: "POS sale SINV-2026-1201" },
      { id: "jl-2", accountId: "acc-sales", accountName: "Sales Revenue", debit: 0, credit: 136.88, description: "POS sale SINV-2026-1201" },
    ],
    description: "Daily POS sales posting",
    status: "posted",
    createdBy: "Accountant",
    createdAt: daysAgo(1),
  },
  {
    id: "je-2",
    reference: "JE-2026-0102",
    date: daysAgo(2),
    lines: [
      { id: "jl-3", accountId: "acc-inventory", accountName: "Inventory", debit: 4120, credit: 0, description: "GRN-2026-0056 goods received" },
      { id: "jl-4", accountId: "acc-payable", accountName: "Supplier Payable", debit: 0, credit: 4120, description: "PO-2026-0110 Nike Apparel Co." },
    ],
    description: "Goods receipt from Nike Apparel Co.",
    status: "approved",
    createdBy: "Accountant",
    createdAt: daysAgo(2),
  },
  {
    id: "je-3",
    reference: "JE-2026-0103",
    date: daysAgo(0),
    lines: [
      { id: "jl-5", accountId: "acc-salary", accountName: "Salary", debit: 15000, credit: 0, description: "July payroll" },
      { id: "jl-6", accountId: "acc-bank", accountName: "Bank", debit: 0, credit: 15000, description: "July payroll" },
    ],
    description: "Monthly payroll",
    status: "submitted",
    createdBy: "Finance Manager",
    createdAt: daysAgo(0),
  },
  {
    id: "je-4",
    reference: "JE-2026-0104",
    date: daysAgo(0),
    lines: [
      { id: "jl-7", accountId: "acc-operating", accountName: "Operating Expense", debit: 1200, credit: 0, description: "Store rent adjustment" },
      { id: "jl-8", accountId: "acc-cash", accountName: "Cash", debit: 0, credit: 1200, description: "Store rent adjustment" },
    ],
    description: "Rent true-up",
    status: "draft",
    createdBy: "Accountant",
    createdAt: daysAgo(0),
  },
]

// --- General Ledger ---

export const mockLedgerEntries: LedgerEntry[] = [
  { id: "gl-1", date: daysAgo(1), reference: "JE-2026-0101", accountId: "acc-cash", accountName: "Cash", debit: 136.88, credit: 0, balance: 185000, user: "Accountant" },
  { id: "gl-2", date: daysAgo(1), reference: "JE-2026-0101", accountId: "acc-sales", accountName: "Sales Revenue", debit: 0, credit: 136.88, balance: 2500000, user: "Accountant" },
  { id: "gl-3", date: daysAgo(2), reference: "JE-2026-0102", accountId: "acc-inventory", accountName: "Inventory", debit: 4120, credit: 0, balance: 812500, user: "Accountant" },
  { id: "gl-4", date: daysAgo(2), reference: "JE-2026-0102", accountId: "acc-payable", accountName: "Supplier Payable", debit: 0, credit: 4120, balance: 55700, user: "Accountant" },
  { id: "gl-5", date: daysAgo(5), reference: "PMT-2026-0071", accountId: "acc-bank", accountName: "Bank", debit: 0, credit: 2000, balance: 265000, user: "Finance Manager" },
  { id: "gl-6", date: daysAgo(5), reference: "PMT-2026-0071", accountId: "acc-payable", accountName: "Supplier Payable", debit: 2000, credit: 0, balance: 59820, user: "Finance Manager" },
  { id: "gl-7", date: daysAgo(9), reference: "SINV-2026-1195", accountId: "acc-cash", accountName: "Cash", debit: 108, credit: 0, balance: 184863.12, user: "Cashier" },
  { id: "gl-8", date: daysAgo(9), reference: "SINV-2026-1195", accountId: "acc-sales", accountName: "Sales Revenue", debit: 0, credit: 108, balance: 2499863.12, user: "Cashier" },
]

// --- Accounts Receivable ---

export const mockReceivables: ReceivableRow[] = [
  { id: "ar-1", customerName: "Min Thu", invoiceNumber: "SINV-2026-1202", date: daysAgo(1), amount: 139.32, paid: 70, remaining: 69.32, dueDate: daysFromNow(14), status: "partial" },
  { id: "ar-2", customerName: "Su Su Aung", invoiceNumber: "SINV-2026-1180", date: daysAgo(15), amount: 27, paid: 0, remaining: 27, dueDate: daysAgo(1), status: "overdue" },
  { id: "ar-3", customerName: "Aye Chan Moe", invoiceNumber: "SINV-2026-1201", date: daysAgo(3), amount: 136.88, paid: 136.88, remaining: 0, dueDate: daysAgo(3), status: "paid" },
  { id: "ar-4", customerName: "Kyaw Zin Htet", invoiceNumber: "SINV-2026-1210", date: daysAgo(0), amount: 220, paid: 0, remaining: 220, dueDate: daysFromNow(30), status: "pending" },
]

export const arMetrics: ArMetrics = {
  totalOutstanding: 316.32,
  overdueAmount: 27,
  paidAmount: 206.88,
  customerBalance: 316.32,
}

// --- Accounts Payable ---

export const mockPayables: PayableRow[] = [
  { id: "ap-1", supplierName: "Nike Apparel Co.", invoiceNumber: "PINV-2026-0201", amount: 4120, paid: 2000, balance: 2120, dueDate: daysFromNow(20), status: "partial" },
  { id: "ap-2", supplierName: "Zara Textile Group", invoiceNumber: "PINV-2026-0203", amount: 2592, paid: 0, balance: 2592, dueDate: daysFromNow(35), status: "pending" },
  { id: "ap-3", supplierName: "Bangkok Fabric Mills", invoiceNumber: "PINV-2026-0198", amount: 1839.6, paid: 0, balance: 1839.6, dueDate: daysAgo(3), status: "overdue" },
  { id: "ap-4", supplierName: "Nike Apparel Co.", invoiceNumber: "PINV-2026-0202", amount: 2160, paid: 2160, balance: 0, dueDate: daysAgo(5), status: "paid" },
]

export const apMetrics: ApMetrics = {
  outstandingPayable: 6551.6,
  dueThisWeek: 1839.6,
  paidAmount: 4160,
  supplierBalance: 6551.6,
}

// --- Payments ---

export const mockFinancePayments: FinancePayment[] = [
  {
    id: "fp-1",
    reference: "PMT-2026-0071",
    direction: "outgoing",
    partyName: "Nike Apparel Co.",
    relatedReference: "PINV-2026-0201",
    amount: 2000,
    method: "bank_transfer",
    date: daysAgo(5),
    status: "reconciled",
    createdBy: "Finance Manager",
  },
  {
    id: "fp-2",
    reference: "RCV-2026-0110",
    direction: "incoming",
    partyName: "Min Thu",
    relatedReference: "SINV-2026-1202",
    amount: 70,
    method: "bank_transfer",
    date: daysAgo(1),
    status: "paid",
    createdBy: "Accountant",
  },
  {
    id: "fp-3",
    reference: "PMT-2026-0073",
    direction: "outgoing",
    partyName: "Bangkok Fabric Mills",
    relatedReference: "PINV-2026-0198",
    amount: 1839.6,
    method: "cheque",
    date: daysAgo(0),
    status: "approved",
    createdBy: "Accountant",
  },
  {
    id: "fp-4",
    reference: "PMT-2026-0074",
    direction: "outgoing",
    partyName: "Zara Textile Group",
    relatedReference: "PINV-2026-0203",
    amount: 1000,
    method: "bank_transfer",
    date: daysAgo(0),
    status: "created",
    createdBy: "Accountant",
  },
]

// --- Expenses ---

export const mockExpenses: Expense[] = [
  {
    id: "exp-1",
    reference: "EXP-2026-0210",
    category: "rent",
    amount: 10000,
    date: daysAgo(8),
    method: "bank_transfer",
    description: "July store rent — Yangon flagship",
    status: "paid",
    submittedBy: "Finance Manager",
    createdAt: daysAgo(9),
  },
  {
    id: "exp-2",
    reference: "EXP-2026-0211",
    category: "marketing",
    amount: 2500,
    date: daysAgo(3),
    method: "card",
    description: "Summer Sale 2026 social media campaign",
    receiptFilename: "meta-ads-invoice.pdf",
    status: "finance_approved",
    submittedBy: "Marketing Team",
    createdAt: daysAgo(4),
  },
  {
    id: "exp-3",
    reference: "EXP-2026-0212",
    category: "transport",
    amount: 320,
    date: daysAgo(1),
    method: "cash",
    description: "Stock transfer trucking — Yangon to Mandalay",
    status: "manager_approved",
    submittedBy: "Warehouse Staff",
    createdAt: daysAgo(1),
  },
  {
    id: "exp-4",
    reference: "EXP-2026-0213",
    category: "utilities",
    amount: 480,
    date: daysAgo(0),
    method: "mobile_payment",
    description: "Electricity bill — July",
    status: "submitted",
    submittedBy: "Store Manager",
    createdAt: daysAgo(0),
  },
]

// --- Taxes ---

export const mockTaxRules: TaxRule[] = [
  { id: "tax-1", name: "Standard VAT", ratePercent: 8, type: "vat", accountId: "acc-payable", accountName: "Supplier Payable", isActive: true },
  { id: "tax-2", name: "Retail Sales Tax", ratePercent: 5, type: "sales_tax", accountId: "acc-sales", accountName: "Sales Revenue", isActive: true },
  { id: "tax-3", name: "Import Purchase Tax", ratePercent: 3, type: "purchase_tax", accountId: "acc-purchase-cost", accountName: "Purchase Cost", isActive: true },
  { id: "tax-4", name: "Contractor Withholding", ratePercent: 2, type: "withholding_tax", accountId: "acc-payable", accountName: "Supplier Payable", isActive: false },
]

// --- Financial Statements ---

export const profitAndLoss: ProfitAndLoss = {
  revenue: 2500000,
  costOfGoodsSold: 1225000,
  grossProfit: 1275000,
  expenses: 475000,
  netProfit: 800000,
}

export const balanceSheet: BalanceSheet = {
  assets: [
    { label: "Cash", amount: 185000 },
    { label: "Bank", amount: 265000 },
    { label: "Inventory", amount: 812500 },
  ],
  liabilities: [{ label: "Supplier Payable", amount: 55700 }],
  equity: [{ label: "Owner's Capital", amount: 1206800 }],
  totalAssets: 1262500,
  totalLiabilities: 55700,
  totalEquity: 1206800,
}

export const cashFlowStatement: CashFlowStatement = {
  operating: [
    { label: "Cash from sales", amount: 486000 },
    { label: "Supplier payments", amount: -298000 },
    { label: "Operating expenses", amount: -92000 },
  ],
  investing: [{ label: "Store fit-out equipment", amount: -45000 }],
  financing: [{ label: "Owner capital injection", amount: 60000 }],
  netOperating: 96000,
  netInvesting: -45000,
  netFinancing: 60000,
  netChange: 111000,
}

// --- Finance Dashboard ---

export const financeKpis: FinanceKpis = {
  totalRevenue: 2500000,
  totalExpenses: 800000,
  netProfit: 1700000,
  netMarginPercent: 68,
  cashBalance: 450000,
}

export const incomeVsExpense: IncomeExpensePoint[] = [
  { period: "Feb", income: 380000, expense: 120000 },
  { period: "Mar", income: 402000, expense: 132000 },
  { period: "Apr", income: 415000, expense: 128000 },
  { period: "May", income: 398000, expense: 140000 },
  { period: "Jun", income: 445000, expense: 138000 },
  { period: "Jul", income: 425000, expense: 142000 },
]

// --- Audit Log ---

export const mockAuditEntries: AuditEntry[] = [
  { id: "aud-1", date: daysAgo(0), user: "Accountant", action: "Created", module: "Journal", reference: "JE-2026-0104", changes: "New draft journal entry ($1,200 rent true-up)" },
  { id: "aud-2", date: daysAgo(0), user: "Finance Manager", action: "Submitted", module: "Journal", reference: "JE-2026-0103", changes: "Status: draft → submitted" },
  { id: "aud-3", date: daysAgo(0), user: "Accountant", action: "Created", module: "Payments", reference: "PMT-2026-0074", changes: "New outgoing payment ($1,000 to Zara Textile Group)" },
  { id: "aud-4", date: daysAgo(1), user: "Store Manager", action: "Submitted", module: "Expenses", reference: "EXP-2026-0213", changes: "New utilities expense ($480)" },
  { id: "aud-5", date: daysAgo(2), user: "Finance Manager", action: "Approved", module: "Journal", reference: "JE-2026-0102", changes: "Status: submitted → approved" },
  { id: "aud-6", date: daysAgo(3), user: "Finance Manager", action: "Approved", module: "Expenses", reference: "EXP-2026-0211", changes: "Status: manager_approved → finance_approved" },
  { id: "aud-7", date: daysAgo(5), user: "Finance Manager", action: "Reconciled", module: "Payments", reference: "PMT-2026-0071", changes: "Status: paid → reconciled; matched bank statement line" },
]
