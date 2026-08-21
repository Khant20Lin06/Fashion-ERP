import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { Account, AccountType } from "../types"
import { mockAccounts } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// No `currency` field on AccountFormValues — Account has no currency
// concept backend-side (see types.ts's own comment on Account).
export type AccountFormValues = {
  name: string
  code: string
  type: AccountType
  parentId: string | null
  status: "active" | "inactive"
}

// AccountType (backend, exact enum): ASSET | LIABILITY | EQUITY | REVENUE |
// EXPENSE — the frontend form's lowercase "income" maps to REVENUE (label
// text stays "Income", matching the accounting-101 term most users expect,
// while the value transmitted is the real backend enum).
type BackendAccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"

const FRONTEND_TO_BACKEND_TYPE: Record<AccountType, BackendAccountType> = {
  asset: "ASSET",
  liability: "LIABILITY",
  equity: "EQUITY",
  income: "REVENUE",
  expense: "EXPENSE",
}
const BACKEND_TO_FRONTEND_TYPE: Record<BackendAccountType, AccountType> = {
  ASSET: "asset",
  LIABILITY: "liability",
  EQUITY: "equity",
  REVENUE: "income",
  EXPENSE: "expense",
}

type BackendAccount = {
  id: string
  companyId: string
  parentId: string | null
  code: string
  name: string
  accountType: BackendAccountType
  isActive: boolean
  isSystemAccount: boolean
  createdAt: string
  updatedAt: string
}

// AccountResponseDto has no `balance` or `currency` field at all — Account
// is pure chart-of-accounts master data (see types.ts's own comment).
function mapBackendToAccount(ba: BackendAccount): Account {
  return {
    id: ba.id,
    name: ba.name,
    code: ba.code,
    type: BACKEND_TO_FRONTEND_TYPE[ba.accountType],
    parentId: ba.parentId,
    status: ba.isActive ? "active" : "inactive",
  }
}

export async function fetchAccounts(): Promise<Account[]> {
  if (USE_MOCK) return delay(mockAccounts)
  const companyId = await resolveCompanyId()
  // Real backend route is `/accounts` (not `/accounting/accounts`), and
  // like every other list endpoint returns a `{ data, meta }` pagination
  // envelope rather than a bare array.
  const { data } = await apiClient.get<{ data: BackendAccount[]; meta: unknown }>("/accounts", {
    params: { companyId, limit: 200 },
  })
  return (data.data ?? []).map(mapBackendToAccount)
}

// The real backend's CreateAccountDto/UpdateAccountDto shape is narrower
// than this frontend form and rejects unknown properties (global
// ValidationPipe forbidNonWhitelisted): create expects `accountType` (not
// `type`), has no `currency` field, and no `status` field; update accepts
// only `name`/`parentId`/`isActive` — `code`/`accountType` are immutable
// after creation and there is no delete endpoint at all ("prefer
// deactivation" via `isActive`). See
// src/modules/accounting/dto/{create,update}-account.dto.ts on the backend.
function toCreatePayload(values: AccountFormValues) {
  return {
    code: values.code,
    name: values.name,
    accountType: FRONTEND_TO_BACKEND_TYPE[values.type],
    parentId: values.parentId ?? undefined,
  }
}

function toUpdatePayload(values: AccountFormValues) {
  return {
    name: values.name,
    parentId: values.parentId ?? undefined,
    isActive: values.status === "active",
  }
}

export async function createAccount(values: AccountFormValues): Promise<Account> {
  if (USE_MOCK) {
    return delay({ id: `acc-${Date.now()}`, name: values.name, code: values.code, type: values.type, parentId: values.parentId, status: values.status })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendAccount>("/accounts", {
    ...toCreatePayload(values),
    companyId,
  })
  return mapBackendToAccount(data)
}

export async function updateAccount(id: string, values: AccountFormValues): Promise<Account> {
  if (USE_MOCK) {
    const existing = mockAccounts.find((a) => a.id === id)
    if (!existing) throw new Error("Account not found")
    return delay({ ...existing, name: values.name, parentId: values.parentId, status: values.status })
  }
  // Real backend only exposes PATCH on /accounts/{id}, not PUT. code/
  // accountType are immutable after creation and silently dropped here
  // (not sent) rather than causing a validation error if the caller still
  // passes the original values through. companyId is an optional query
  // param the route uses for DataScope resolution — live-verified as
  // required in this environment (omitting it 400s "companyId is
  // required"), so it's resolved and sent explicitly rather than relying
  // on an implicit fallback that doesn't actually apply here.
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendAccount>(`/accounts/${id}`, toUpdatePayload(values), {
    params: { companyId },
  })
  return mapBackendToAccount(data)
}

// No deleteAccount function: the real backend has no DELETE /accounts/{id}
// route at all (only GET/POST/PATCH exist on the accounts module, see
// erp-pos fashion api AccountsController) — deleting a GL account isn't a
// supported operation server-side. A previous version of this function
// called DELETE anyway, which would 404/405 on every real invocation; it
// and its unused useDeleteAccount hook were removed rather than left as a
// call that always fails.
