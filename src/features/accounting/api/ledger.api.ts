import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type {
  AccountType,
  AuditEntry,
  BalanceSheet,
  CashFlowStatement,
  FinanceKpis,
  IncomeExpensePoint,
  JournalEntry,
  JournalStatus,
  LedgerEntry,
  ProfitAndLoss,
  TrialBalance,
} from "../types"
import type { JournalEntryFormValues } from "../schemas/journal.schema"
import {
  balanceSheet,
  cashFlowStatement,
  financeKpis,
  incomeVsExpense,
  mockAuditEntries,
  mockJournalEntries,
  mockLedgerEntries,
  profitAndLoss,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Journal Entries ---
// JournalEntryStatus (backend, exact enum): DRAFT | POSTED | CANCELLED — no
// SUBMITTED/APPROVED workflow (D12, LOCKED). Real routes: GET/POST
// /journal-entries + POST /journal-entries/:id/post only — no generic
// status PATCH, no reject/cancel endpoint. Neither backend response DTO
// (JournalEntryResponseDto/GeneralLedgerRow) returns a `balance` field —
// balances only ever exist as a backend-computed report total (Trial
// Balance/P&L/Balance Sheet), never a property of an entry, line, or
// ledger row.

type BackendJournalStatus = "DRAFT" | "POSTED" | "CANCELLED"

type BackendJournalEntryLine = {
  id: string
  accountId: string
  debitAmount: string
  creditAmount: string
  referenceType: string | null
  referenceId: string | null
  description: string | null
  createdAt: string
}

type BackendJournalEntry = {
  id: string
  journalNumber: string
  companyId: string
  branchId: string | null
  accountingPeriodId: string
  entryDate: string
  status: BackendJournalStatus
  sourceType: string | null
  sourceId: string | null
  description: string
  totalDebit: string
  totalCredit: string
  createdBy: string
  postedBy: string | null
  postedAt: string | null
  createdAt: string
  updatedAt: string
  lines?: BackendJournalEntryLine[]
}

function mapJournalStatus(status: BackendJournalStatus): JournalStatus {
  const map: Record<BackendJournalStatus, JournalStatus> = {
    DRAFT: "draft",
    POSTED: "posted",
    CANCELLED: "cancelled",
  }
  return map[status]
}

function mapBackendToJournalEntry(
  be: BackendJournalEntry,
  accounts: Array<{ id: string; name: string }> = [],
): JournalEntry {
  return {
    id: be.id,
    reference: be.journalNumber,
    date: be.entryDate,
    description: be.description,
    lines: (be.lines ?? []).map((line) => ({
      id: line.id,
      accountId: line.accountId,
      accountName: accounts.find((a) => a.id === line.accountId)?.name ?? "",
      debit: parseFloat(line.debitAmount) || 0,
      credit: parseFloat(line.creditAmount) || 0,
      description: line.description ?? undefined,
    })),
    status: mapJournalStatus(be.status),
    createdBy: be.createdBy,
    createdAt: be.createdAt,
  }
}

async function fetchAccountsForJoin(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data } = await apiClient.get<{ data: Array<{ id: string; name: string }>; meta: unknown }>(
      "/accounts",
      { params: { companyId, limit: 200 } },
    )
    return data.data ?? []
  } catch {
    return []
  }
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  if (USE_MOCK) return delay(mockJournalEntries)
  const companyId = await resolveCompanyId()
  // Real backend route is `/journal-entries` (not `/accounting/journal`),
  // returning the usual `{data,meta}` pagination envelope.
  const [jeRes, accounts] = await Promise.all([
    apiClient.get<{ data: BackendJournalEntry[]; meta: unknown }>("/journal-entries", {
      params: { companyId, limit: 100 },
    }),
    fetchAccountsForJoin(companyId),
  ])
  return (jeRes.data.data ?? []).map((be) => mapBackendToJournalEntry(be, accounts))
}

export async function createJournalEntry(values: JournalEntryFormValues): Promise<JournalEntry> {
  if (USE_MOCK) {
    return delay({
      id: `je-${Date.now()}`,
      reference: values.reference,
      date: values.date,
      description: values.description,
      lines: values.lines.map((line, index) => ({ id: `jl-${Date.now()}-${index}`, ...line })),
      status: "draft",
      createdBy: "You",
      createdAt: new Date().toISOString(),
    })
  }
  const companyId = await resolveCompanyId()
  // CreateJournalEntryDto has no `reference` field — journalNumber is
  // always server-generated — so the user's typed reference is folded into
  // `description` rather than silently discarded. Line shape is remapped
  // to debitAmount/creditAmount decimal strings (accountName is a
  // display-only field the DTO doesn't accept).
  const description = [values.reference, values.description].filter(Boolean).join(" — ")
  const { data } = await apiClient.post<BackendJournalEntry>("/journal-entries", {
    companyId,
    entryDate: values.date || undefined,
    description,
    lines: values.lines.map((line) => ({
      accountId: line.accountId,
      debitAmount: line.debit.toFixed(2),
      creditAmount: line.credit.toFixed(2),
      description: line.description || undefined,
    })),
  })
  const accounts = await fetchAccountsForJoin(companyId)
  return mapBackendToJournalEntry(data, accounts)
}

export async function updateJournalEntryStatus(id: string, status: JournalStatus): Promise<JournalEntry> {
  if (USE_MOCK) {
    const existing = mockJournalEntries.find((j) => j.id === id)
    if (!existing) throw new Error("Journal entry not found")
    return delay({ ...existing, status })
  }
  // NOTE: the real backend has no generic status-PATCH route — only
  // `POST /journal-entries/{id}/post` (draft -> posted, one-way) exists.
  // There is no route to cancel/reopen a journal entry. This call only
  // actually works for status === "posted"; any other target status is
  // out of scope for the current backend (documented gap, not fixed here
  // since it would require a new backend endpoint).
  if (status !== "posted") {
    throw new Error(
      `Journal entry status transition to "${status}" is not supported by the backend (only draft -> posted via POST /journal-entries/{id}/post exists).`,
    )
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendJournalEntry>(
    `/journal-entries/${id}/post`,
    {},
    { params: { companyId } },
  )
  const accounts = await fetchAccountsForJoin(companyId)
  return mapBackendToJournalEntry(data, accounts)
}

// --- General Ledger ---

type BackendGeneralLedgerRow = {
  journalEntryLineId: string
  journalEntryId: string
  journalNumber: string
  entryDate: string
  accountId: string
  accountCode: string
  accountName: string
  debitAmount: string
  creditAmount: string
  description: string | null
  sourceType: string | null
  sourceId: string | null
}

function mapBackendToLedgerEntry(be: BackendGeneralLedgerRow): LedgerEntry {
  return {
    id: be.journalEntryLineId,
    date: be.entryDate,
    reference: be.journalNumber,
    accountId: be.accountId,
    accountName: be.accountName,
    debit: parseFloat(be.debitAmount) || 0,
    credit: parseFloat(be.creditAmount) || 0,
    // Not returned by this endpoint — GeneralLedgerRow has no user/actor
    // field (only journalEntry.createdBy, which this row shape omits).
    user: "",
  }
}

export async function fetchLedgerEntries(): Promise<LedgerEntry[]> {
  if (USE_MOCK) return delay(mockLedgerEntries)
  const companyId = await resolveCompanyId()
  // Real backend route is `/general-ledger` (not `/accounting/ledger`),
  // returning the usual `{data,meta}` pagination envelope.
  const { data } = await apiClient.get<{ data: BackendGeneralLedgerRow[]; meta: unknown }>(
    "/general-ledger",
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapBackendToLedgerEntry)
}

// --- Financial Statements ---
// Real /reports/profit-loss and /reports/balance-sheet response shapes are
// nested {rows,total} groups, not the frontend's flat ProfitAndLoss/
// BalanceSheet types — mapped explicitly below rather than cast directly
// (the previous version cast the raw response straight to the frontend
// type, silently producing `undefined` for every field on both statements
// pages). Neither report includes a COGS/gross-profit line — the backend
// explicitly has no COGS engine (Inventory Valuation is a future phase).

type BackendReportRow = { accountId: string; accountCode: string; accountName: string; amount?: string; balance?: string }
type BackendProfitLoss = {
  fromDate: string | null
  toDate: string | null
  revenue: { rows: BackendReportRow[]; total: string }
  expense: { rows: BackendReportRow[]; total: string }
  netIncome: string
}
type BackendBalanceSheet = {
  asOfDate: string
  assets: { rows: BackendReportRow[]; total: string }
  liabilities: { rows: BackendReportRow[]; total: string }
  equity: { rows: BackendReportRow[]; total: string }
  totalLiabilitiesAndEquity: string
  balanced: boolean
}

export async function fetchProfitAndLoss(): Promise<ProfitAndLoss> {
  if (USE_MOCK) return delay(profitAndLoss)
  const companyId = await resolveCompanyId()
  // Real backend route is `/reports/profit-loss` (not
  // `/accounting/statements/profit-and-loss`). This is a single computed
  // object, not a paginated list, so no {data,meta} envelope applies here.
  const { data } = await apiClient.get<BackendProfitLoss>("/reports/profit-loss", {
    params: { companyId },
  })
  const revenue = parseFloat(data.revenue.total) || 0
  const expenses = parseFloat(data.expense.total) || 0
  return {
    revenue,
    // No COGS/gross-profit concept exists backend-side — costOfGoodsSold
    // is always 0 and grossProfit collapses to revenue, an honest
    // reflection of the report's real scope rather than an invented figure.
    costOfGoodsSold: 0,
    grossProfit: revenue,
    expenses,
    netProfit: parseFloat(data.netIncome) || 0,
  }
}

export async function fetchBalanceSheet(): Promise<BalanceSheet> {
  if (USE_MOCK) return delay(balanceSheet)
  const companyId = await resolveCompanyId()
  // Real backend route is `/reports/balance-sheet` (not
  // `/accounting/statements/balance-sheet`).
  const { data } = await apiClient.get<BackendBalanceSheet>("/reports/balance-sheet", {
    params: { companyId },
  })
  const toLines = (rows: BackendReportRow[]) =>
    rows.map((r) => ({ label: `${r.accountCode} ${r.accountName}`, amount: parseFloat(r.balance ?? r.amount ?? "0") || 0 }))
  return {
    assets: toLines(data.assets.rows),
    liabilities: toLines(data.liabilities.rows),
    equity: toLines(data.equity.rows),
    totalAssets: parseFloat(data.assets.total) || 0,
    totalLiabilities: parseFloat(data.liabilities.total) || 0,
    totalEquity: parseFloat(data.equity.total) || 0,
  }
}

// --- Trial Balance ---
// Real, backend-computed endpoint (GET /trial-balance) — previously had no
// frontend consumer at all despite being a fully working, LOCKED report.

type BackendAccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
type BackendTrialBalanceRow = {
  accountId: string
  accountCode: string
  accountName: string
  accountType: BackendAccountType
  totalDebit: string
  totalCredit: string
}
type BackendTrialBalance = {
  rows: BackendTrialBalanceRow[]
  totalDebit: string
  totalCredit: string
}

const BACKEND_TO_FRONTEND_ACCOUNT_TYPE: Record<BackendAccountType, AccountType> = {
  ASSET: "asset",
  LIABILITY: "liability",
  EQUITY: "equity",
  REVENUE: "income",
  EXPENSE: "expense",
}

export async function fetchTrialBalance(): Promise<TrialBalance> {
  if (USE_MOCK) {
    const { mockAccounts } = await import("./mock-data")
    const rows = mockAccounts.map((a) => ({
      accountId: a.id,
      accountCode: a.code,
      accountName: a.name,
      accountType: a.type,
      totalDebit: 0,
      totalCredit: 0,
    }))
    return delay({ rows, totalDebit: 0, totalCredit: 0 })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<BackendTrialBalance>("/trial-balance", {
    params: { companyId },
  })
  return {
    rows: data.rows.map((r) => ({
      accountId: r.accountId,
      accountCode: r.accountCode,
      accountName: r.accountName,
      accountType: BACKEND_TO_FRONTEND_ACCOUNT_TYPE[r.accountType],
      totalDebit: parseFloat(r.totalDebit) || 0,
      totalCredit: parseFloat(r.totalCredit) || 0,
    })),
    totalDebit: parseFloat(data.totalDebit) || 0,
    totalCredit: parseFloat(data.totalCredit) || 0,
  }
}

// --- Finance Dashboard ---
//
// fetchCashFlowStatement / fetchFinanceKpis / fetchIncomeVsExpense below
// have NO backend counterpart at any path — there is no cash-flow-statement
// endpoint, no accounting KPI-aggregate endpoint, and no income-vs-expense
// analytics endpoint anywhere in the backend (confirmed against the live
// OpenAPI document). Real mode must never present fabricated totals as if
// they were genuine — reads return an honest empty/throw, matching every
// other confirmed BACKEND GAP in this codebase (see e.g. Sales Returns,
// Loyalty, Discount Rules). Consumers show FeatureUnavailable / an honest
// empty state, not fake numbers.

export async function fetchCashFlowStatement(): Promise<CashFlowStatement> {
  if (USE_MOCK) return delay(cashFlowStatement)
  throw new Error("Cash flow statement is not available yet.")
}

export async function fetchFinanceKpis(): Promise<FinanceKpis> {
  if (USE_MOCK) return delay(financeKpis)
  throw new Error("Finance dashboard KPIs are not available yet.")
}

export async function fetchIncomeVsExpense(): Promise<IncomeExpensePoint[]> {
  if (USE_MOCK) return delay(incomeVsExpense)
  throw new Error("Income vs. expense analytics are not available yet.")
}

// --- Audit Log ---
// Real backend route: GET /reports/accounting/audit-log, permission
// reports.accounting_audit.read (erp-pos fashion api
// AccountingAuditLogController / AccountingAuditLogService). Returns
// {data: AccountingAuditLogRow[], meta}. Rows are synthesized server-side
// from JournalEntry/Payment/Sale/PurchaseOrder activity, sorted newest
// first — there is no separate audit-log table, no free-text change
// description, and no user-name resolution (performedBy is the raw
// createdBy/postedBy user id, not a display name).

type BackendAccountingAuditLogRow = {
  entityType: "JOURNAL_ENTRY" | "PAYMENT" | "SALE" | "PURCHASE_ORDER"
  entityId: string
  action: "CREATED" | "POSTED" | "CONFIRMED"
  referenceNumber: string
  performedBy: string | null
  companyId: string
  timestamp: string
}

export async function fetchAuditEntries(): Promise<AuditEntry[]> {
  if (USE_MOCK) return delay(mockAuditEntries)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendAccountingAuditLogRow[]; meta: unknown }>(
    "/reports/accounting/audit-log",
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map((row) => ({
    entityId: row.entityId,
    entityType: row.entityType,
    action: row.action,
    referenceNumber: row.referenceNumber,
    performedBy: row.performedBy,
    timestamp: row.timestamp,
  }))
}
