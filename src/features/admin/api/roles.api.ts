import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Branch, Company, Role } from "../types"
import type { BranchFormValues, CompanyFormValues, RoleFormValues } from "../schemas/role.schema"
import { mockBranches, mockCompanies, mockRoles } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Roles ---
// Real controller: @Controller('roles') — NOT /admin/roles. Roles are
// global (no companyId column on Role at all) and gated purely by RBAC
// permission codes — no company/branch context applies to this resource.

type BackendRoleStatus = "ACTIVE" | "INACTIVE"

type BackendRole = {
  id: string
  name: string
  code: string
  description: string | null
  status: BackendRoleStatus
  isSystemRole: boolean
  permissionCodes: string[]
  scopes: Array<{ resource: string; scope: string; scopeValue: string | null }>
  createdAt: string
  updatedAt: string
}

function mapBackendToRole(br: BackendRole): Role {
  return {
    id: br.id,
    name: br.name,
    code: br.code,
    description: br.description ?? "",
    status: br.status === "ACTIVE" ? "active" : "inactive",
    isSystemRole: br.isSystemRole,
    permissionCodes: br.permissionCodes,
  }
}

export async function fetchRoles(): Promise<Role[]> {
  if (USE_MOCK) return delay(mockRoles)
  const { data } = await apiClient.get<{ data: BackendRole[]; meta: unknown }>("/roles", {
    params: { limit: 100 },
  })
  return (data.data ?? []).map(mapBackendToRole)
}

// CreateRoleDto requires `code` (uppercase/digits/underscore) — the form's
// `permissionGroups` has no equivalent on create; permissions are only
// settable afterward via the dedicated PUT /roles/:id/permissions.
export async function createRole(values: RoleFormValues): Promise<Role> {
  if (USE_MOCK) {
    return delay({
      id: `role-${Date.now()}`,
      name: values.name,
      code: values.code,
      description: values.description ?? "",
      status: values.status,
      isSystemRole: false,
      permissionCodes: [],
    })
  }
  const { data } = await apiClient.post<BackendRole>("/roles", {
    name: values.name,
    code: values.code,
    description: values.description || undefined,
  })
  return mapBackendToRole(data)
}

export async function updateRole(id: string, values: RoleFormValues): Promise<Role> {
  if (USE_MOCK) {
    const existing = mockRoles.find((r) => r.id === id)
    if (!existing) throw new Error("Role not found")
    return delay({ ...existing, ...values })
  }
  // UpdateRoleDto has no `code` field — immutable after creation.
  const { data } = await apiClient.patch<BackendRole>(`/roles/${id}`, {
    name: values.name,
    description: values.description || undefined,
  })
  const desiredStatus = values.status === "active" ? "ACTIVE" : "INACTIVE"
  if (desiredStatus !== data.status) {
    const action = desiredStatus === "ACTIVE" ? "activate" : "deactivate"
    const { data: afterStatus } = await apiClient.post<BackendRole>(`/roles/${id}/${action}`)
    return mapBackendToRole(afterStatus)
  }
  return mapBackendToRole(data)
}

export async function deleteRole(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/roles/${id}`)
}

/** Full-replace, matching the real PUT semantics — a role's permission set
 * is always sent whole, never patched incrementally. */
export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<Role> {
  if (USE_MOCK) {
    const existing = mockRoles.find((r) => r.id === roleId)
    if (!existing) throw new Error("Role not found")
    return delay({ ...existing, permissionCodes: permissionIds })
  }
  const { data } = await apiClient.put<BackendRole>(`/roles/${roleId}/permissions`, { permissionIds })
  return mapBackendToRole(data)
}

// --- Companies ---
// Real controller: @Controller('companies') — NOT /admin/companies. Also
// global/permission-gated only, no companyId context needed to call it.

type BackendCompanyStatus = "ACTIVE" | "INACTIVE"

type BackendCompany = {
  id: string
  code: string
  name: string
  status: BackendCompanyStatus
  baseCurrency: string
  timezone: string
  country: string | null
  phone: string | null
  email: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

function mapBackendToCompany(bc: BackendCompany): Company {
  return {
    id: bc.id,
    code: bc.code,
    name: bc.name,
    status: bc.status === "ACTIVE" ? "active" : "inactive",
    baseCurrency: bc.baseCurrency,
    timezone: bc.timezone,
    country: bc.country ?? "",
    phone: bc.phone ?? "",
    email: bc.email ?? "",
    address: bc.address ?? "",
  }
}

export async function fetchCompanies(): Promise<Company[]> {
  if (USE_MOCK) return delay(mockCompanies)
  const { data } = await apiClient.get<{ data: BackendCompany[]; meta: unknown }>("/companies", {
    params: { limit: 100 },
  })
  return (data.data ?? []).map(mapBackendToCompany)
}

export async function createCompany(values: CompanyFormValues): Promise<Company> {
  if (USE_MOCK) {
    return delay({
      id: `co-${Date.now()}`,
      code: values.code,
      name: values.name,
      status: values.status,
      baseCurrency: values.baseCurrency,
      timezone: values.timezone,
      country: values.country ?? "",
      phone: values.phone ?? "",
      email: values.email ?? "",
      address: values.address ?? "",
    })
  }
  const { data } = await apiClient.post<BackendCompany>("/companies", {
    code: values.code,
    name: values.name,
    baseCurrency: values.baseCurrency,
    timezone: values.timezone,
    country: values.country || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    address: values.address || undefined,
  })
  return mapBackendToCompany(data)
}

export async function updateCompany(id: string, values: CompanyFormValues): Promise<Company> {
  if (USE_MOCK) {
    const existing = mockCompanies.find((c) => c.id === id)
    if (!existing) throw new Error("Company not found")
    return delay({ ...existing, ...values })
  }
  // UpdateCompanyDto has no `code` field — immutable after creation.
  const { data } = await apiClient.patch<BackendCompany>(`/companies/${id}`, {
    name: values.name,
    baseCurrency: values.baseCurrency,
    timezone: values.timezone,
    country: values.country || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    address: values.address || undefined,
  })
  const desiredStatus = values.status === "active" ? "ACTIVE" : "INACTIVE"
  if (desiredStatus !== data.status) {
    const action = desiredStatus === "ACTIVE" ? "activate" : "deactivate"
    const { data: afterStatus } = await apiClient.post<BackendCompany>(`/companies/${id}/${action}`)
    return mapBackendToCompany(afterStatus)
  }
  return mapBackendToCompany(data)
}

// --- Branches ---
// Real controller: @Controller('branches') — NOT /admin/branches. No
// `type`/`managerId`/`warehouseId` field exists on the real entity.

type BackendBranchStatus = "ACTIVE" | "INACTIVE"

type BackendBranch = {
  id: string
  companyId: string
  code: string
  name: string
  status: BackendBranchStatus
  phone: string | null
  email: string | null
  address: string | null
  timezone: string | null
  createdAt: string
  updatedAt: string
}

function mapBackendToBranch(bb: BackendBranch, companies: Company[] = []): Branch {
  return {
    id: bb.id,
    code: bb.code,
    name: bb.name,
    companyId: bb.companyId,
    companyName: companies.find((c) => c.id === bb.companyId)?.name ?? "",
    status: bb.status === "ACTIVE" ? "active" : "inactive",
    phone: bb.phone ?? "",
    email: bb.email ?? "",
    address: bb.address ?? "",
    timezone: bb.timezone ?? "",
  }
}

export async function fetchBranches(): Promise<Branch[]> {
  if (USE_MOCK) return delay(mockBranches)
  const [brRes, companies] = await Promise.all([
    apiClient.get<{ data: BackendBranch[]; meta: unknown }>("/branches", { params: { limit: 100 } }),
    fetchCompanies(),
  ])
  return (brRes.data.data ?? []).map((bb) => mapBackendToBranch(bb, companies))
}

export async function createBranch(values: BranchFormValues): Promise<Branch> {
  if (USE_MOCK) {
    const company = mockCompanies.find((c) => c.id === values.companyId)
    return delay({
      id: `br-${Date.now()}`,
      code: values.code,
      name: values.name,
      companyId: values.companyId,
      companyName: company?.name ?? "",
      status: values.status,
      phone: values.phone ?? "",
      email: values.email ?? "",
      address: values.address ?? "",
      timezone: values.timezone ?? "",
    })
  }
  const { data } = await apiClient.post<BackendBranch>("/branches", {
    companyId: values.companyId,
    code: values.code,
    name: values.name,
    phone: values.phone || undefined,
    email: values.email || undefined,
    address: values.address || undefined,
    timezone: values.timezone || undefined,
  })
  const companies = await fetchCompanies()
  return mapBackendToBranch(data, companies)
}

export async function updateBranch(id: string, values: BranchFormValues): Promise<Branch> {
  if (USE_MOCK) {
    const existing = mockBranches.find((b) => b.id === id)
    if (!existing) throw new Error("Branch not found")
    const company = mockCompanies.find((c) => c.id === values.companyId)
    return delay({ ...existing, ...values, companyName: company?.name ?? existing.companyName })
  }
  // UpdateBranchDto has no `companyId`/`code` field — both immutable after
  // creation (branch code uniqueness is scoped to companyId).
  const { data } = await apiClient.patch<BackendBranch>(`/branches/${id}`, {
    name: values.name,
    phone: values.phone || undefined,
    email: values.email || undefined,
    address: values.address || undefined,
    timezone: values.timezone || undefined,
  })
  const desiredStatus = values.status === "active" ? "ACTIVE" : "INACTIVE"
  const companies = await fetchCompanies()
  if (desiredStatus !== data.status) {
    const action = desiredStatus === "ACTIVE" ? "activate" : "deactivate"
    const { data: afterStatus } = await apiClient.post<BackendBranch>(`/branches/${id}/${action}`)
    return mapBackendToBranch(afterStatus, companies)
  }
  return mapBackendToBranch(data, companies)
}
