/** Core domain types for the Accounting & Finance Management module. */

export type AccountType = "asset" | "liability" | "equity" | "income" | "expense"
export type AccountStatus = "active" | "inactive"

// AccountResponseDto has no `balance` or `currency` field — Account is pure
// chart-of-accounts master data, never a live balance snapshot. Per-account
// balances only ever exist as a backend-computed report row (Trial Balance,
// P&L, Balance Sheet), never as a property of the Account resource itself.
export type Account = {
  id: string
  name: string
  code: string
  type: AccountType
  parentId: string | null
  status: AccountStatus
}

// --- Journal Entries (double-entry) ---

// JournalEntryStatus (backend, exact enum): DRAFT | POSTED | CANCELLED —
// no SUBMITTED/APPROVED workflow exists (D12, LOCKED).
export type JournalStatus = "draft" | "posted" | "cancelled"

export type JournalLine = {
  id: string
  accountId: string
  accountName: string
  debit: number
  credit: number
  description?: string
}

export type JournalEntry = {
  id: string
  reference: string
  date: string
  lines: JournalLine[]
  description?: string
  status: JournalStatus
  createdBy: string
  createdAt: string
}

// --- General Ledger ---
// GeneralLedgerRow (backend) has no running/opening/closing balance field —
// D5/D20 (LOCKED): the General Ledger is a pure read-query over POSTED
// JournalEntryLine rows, never a physical ledger table with a stored
// balance. A per-account balance only ever exists as a backend-computed
// report total (Trial Balance/P&L/Balance Sheet), not a ledger-row property.
export type LedgerEntry = {
  id: string
  date: string
  reference: string
  accountId: string
  accountName: string
  debit: number
  credit: number
  user: string
}

// --- Accounts Receivable / Payable ---

export type ReceivableStatus = "paid" | "partial" | "pending" | "overdue"

export type ReceivableRow = {
  id: string
  customerName: string
  invoiceNumber: string
  date: string
  amount: number
  paid: number
  remaining: number
  dueDate: string
  status: ReceivableStatus
}

export type ArMetrics = {
  totalOutstanding: number
  overdueAmount: number
  paidAmount: number
  customerBalance: number
}

export type PayableRow = {
  id: string
  supplierName: string
  invoiceNumber: string
  amount: number
  paid: number
  balance: number
  dueDate: string
  status: ReceivableStatus
}

export type ApMetrics = {
  outstandingPayable: number
  dueThisWeek: number
  paidAmount: number
  supplierBalance: number
}

// --- Payments ---

export type FinancePaymentMethod = "cash" | "bank_transfer" | "card" | "mobile_payment" | "cheque"
export type PaymentDirection = "incoming" | "outgoing"
export type FinancePaymentStatus = "created" | "approved" | "paid" | "reconciled"

export type FinancePayment = {
  id: string
  reference: string
  direction: PaymentDirection
  partyName: string
  relatedReference?: string
  amount: number
  method: FinancePaymentMethod
  date: string
  status: FinancePaymentStatus
  createdBy: string
}

// --- Expenses ---

export type ExpenseCategory = "salary" | "rent" | "utilities" | "marketing" | "transport" | "maintenance"
export type ExpenseStatus = "submitted" | "manager_approved" | "finance_approved" | "paid" | "rejected"

export type Expense = {
  id: string
  reference: string
  category: ExpenseCategory
  amount: number
  date: string
  method: FinancePaymentMethod
  description: string
  receiptFilename?: string
  status: ExpenseStatus
  submittedBy: string
  createdAt: string
}

// --- Taxes ---

export type TaxType = "vat" | "sales_tax" | "purchase_tax" | "withholding_tax"

export type TaxRule = {
  id: string
  name: string
  ratePercent: number
  type: TaxType
  accountId: string
  accountName: string
  isActive: boolean
}

// --- Trial Balance ---
// Real, backend-computed endpoint (GET /trial-balance) — SUM(debit)/SUM(credit)
// per account, grouped server-side over POSTED journal lines.
export type TrialBalanceRow = {
  accountId: string
  accountCode: string
  accountName: string
  accountType: AccountType
  totalDebit: number
  totalCredit: number
}

export type TrialBalance = {
  rows: TrialBalanceRow[]
  totalDebit: number
  totalCredit: number
}

// --- Financial Statements ---

export type ProfitAndLoss = {
  revenue: number
  costOfGoodsSold: number
  grossProfit: number
  expenses: number
  netProfit: number
}

export type BalanceSheetLine = {
  label: string
  amount: number
}

export type BalanceSheet = {
  assets: BalanceSheetLine[]
  liabilities: BalanceSheetLine[]
  equity: BalanceSheetLine[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}

export type CashFlowStatement = {
  operating: BalanceSheetLine[]
  investing: BalanceSheetLine[]
  financing: BalanceSheetLine[]
  netOperating: number
  netInvesting: number
  netFinancing: number
  netChange: number
}

// --- Finance Dashboard ---

export type FinanceKpis = {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  netMarginPercent: number
  cashBalance: number
}

export type IncomeExpensePoint = {
  period: string
  income: number
  expense: number
}

// --- Audit Log ---
// Mirrors the real backend row exactly (erp-pos fashion api
// AccountingAuditLogRow, GET /reports/accounting/audit-log) — entityType/
// action/referenceNumber/performedBy/timestamp only. There is no
// free-text "changes" description and no user-name resolution on the
// backend (performedBy is the raw createdBy/postedBy user id).

export type AuditEntry = {
  entityId: string
  entityType: "JOURNAL_ENTRY" | "PAYMENT" | "SALE" | "PURCHASE_ORDER"
  action: "CREATED" | "POSTED" | "CONFIRMED"
  referenceNumber: string
  performedBy: string | null
  timestamp: string
}

export type AccountingFilters = {
  account?: string
  status?: string
}
