import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { AdminUser } from "../types"
import type { UserFormValues } from "../schemas/user.schema"
import { mockUsers } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real controller: @Controller('users') — NOT /admin/users. Global,
// permission-gated only — no companyId context needed for CRUD itself.
// UserResponseDto has no phone/username/role/company/branch field —
// role/company assignment are separate resources, joined in below.

type BackendUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED"

type BackendUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  status: BackendUserStatus
  isEmailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

type BackendUserRole = { id: string; name: string; code: string }
type BackendCompanyMembership = { id: string; userId: string; companyId: string; status: string; isPrimary: boolean }

function mapStatus(status: BackendUserStatus): AdminUser["status"] {
  const map: Record<BackendUserStatus, AdminUser["status"]> = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
    LOCKED: "locked",
  }
  return map[status]
}

function mapBackendToUser(
  bu: BackendUser,
  roles: BackendUserRole[] = [],
  companyNames: string[] = [],
): AdminUser {
  return {
    id: bu.id,
    name: bu.displayName || `${bu.firstName} ${bu.lastName}`.trim(),
    email: bu.email,
    status: mapStatus(bu.status),
    isEmailVerified: bu.isEmailVerified,
    roleNames: roles.map((r) => r.name),
    companyNames,
    lastLoginAt: bu.lastLoginAt,
    createdAt: bu.createdAt,
  }
}

async function fetchUserRoles(userId: string): Promise<BackendUserRole[]> {
  try {
    const { data } = await apiClient.get<BackendUserRole[]>(`/users/${userId}/roles`)
    return data
  } catch {
    return []
  }
}

async function fetchUserCompanyNames(userId: string): Promise<string[]> {
  try {
    const [{ data: memberships }, companiesRes] = await Promise.all([
      apiClient.get<BackendCompanyMembership[]>(`/users/${userId}/companies`),
      apiClient.get<{ data: Array<{ id: string; name: string }>; meta: unknown }>("/companies", {
        params: { limit: 100 },
      }),
    ])
    const companies = companiesRes.data.data ?? []
    return memberships
      .filter((m) => m.status === "ACTIVE")
      .map((m) => companies.find((c) => c.id === m.companyId)?.name)
      .filter((name): name is string => !!name)
  } catch {
    return []
  }
}

export async function fetchUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) return delay(mockUsers)
  const { data } = await apiClient.get<{ data: BackendUser[]; meta: unknown }>("/users", {
    params: { limit: 100 },
  })
  const users = data.data ?? []
  // Role/company are per-user joins with no batch endpoint — fetched in
  // parallel per row, same join pattern used elsewhere in this codebase
  // (e.g. Purchase Order supplier join) since the list endpoint doesn't
  // return them.
  return Promise.all(
    users.map(async (bu) => {
      const [roles, companyNames] = await Promise.all([fetchUserRoles(bu.id), fetchUserCompanyNames(bu.id)])
      return mapBackendToUser(bu, roles, companyNames)
    }),
  )
}

export async function fetchUser(id: string): Promise<AdminUser | undefined> {
  if (USE_MOCK) return delay(mockUsers.find((u) => u.id === id))
  try {
    const { data } = await apiClient.get<BackendUser>(`/users/${id}`)
    const [roles, companyNames] = await Promise.all([fetchUserRoles(id), fetchUserCompanyNames(id)])
    return mapBackendToUser(data, roles, companyNames)
  } catch {
    return undefined
  }
}

/** CreateUserDto only accepts email/password/firstName/lastName/displayName
 * — it does NOT grant roles or company/branch membership (Phase 08 §13 on
 * the backend, confirmed via source read). Role and company/branch
 * assignment are separate calls, chained here after the base user exists
 * so the single-page form's UX is preserved while the underlying requests
 * match the real multi-step contract. A partial failure after user
 * creation (e.g. role assignment 400s) leaves a real, valid user record
 * with no role/company yet — surfaced as a normal mutation error, not
 * silently swallowed. */
export async function createUser(values: UserFormValues): Promise<AdminUser> {
  if (USE_MOCK) {
    return delay({
      id: `usr-${Date.now()}`,
      name: values.name,
      email: values.email,
      status: "active",
      isEmailVerified: false,
      roleNames: [],
      companyNames: [],
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
    })
  }
  const [firstName, ...rest] = values.name.trim().split(" ")
  const { data: created } = await apiClient.post<BackendUser>("/users", {
    email: values.email,
    password: values.password,
    firstName: firstName || values.name,
    lastName: rest.join(" ") || "-",
  })

  if (values.roleId) {
    await apiClient.put(`/users/${created.id}/roles`, { roleIds: [values.roleId] })
  }
  if (values.companyId) {
    // AssignCompanyMembershipDto only accepts {companyId} — no isPrimary
    // field on assign (isPrimary is set some other way, not exposed here).
    await apiClient.post(`/users/${created.id}/companies`, { companyId: values.companyId })
  }
  if (values.branchId) {
    await apiClient.post(`/users/${created.id}/branches`, { branchId: values.branchId })
  }

  const [roles, companyNames] = await Promise.all([fetchUserRoles(created.id), fetchUserCompanyNames(created.id)])
  return mapBackendToUser(created, roles, companyNames)
}

export async function updateUser(id: string, values: UserFormValues): Promise<AdminUser> {
  if (USE_MOCK) {
    const existing = mockUsers.find((u) => u.id === id)
    if (!existing) throw new Error("User not found")
    return delay({ ...existing, name: values.name, email: values.email })
  }
  // UpdateUserDto has no email/password/status/role/company/branch field —
  // those are separate concerns (auth-boundary, UserRole, UserCompany).
  const [firstName, ...rest] = values.name.trim().split(" ")
  const { data: updated } = await apiClient.patch<BackendUser>(`/users/${id}`, {
    firstName: firstName || values.name,
    lastName: rest.join(" ") || "-",
  })

  if (values.roleId) {
    await apiClient.put(`/users/${id}/roles`, { roleIds: [values.roleId] })
  }

  const [roles, companyNames] = await Promise.all([fetchUserRoles(id), fetchUserCompanyNames(id)])
  return mapBackendToUser(updated, roles, companyNames)
}

/** Real backend has no hard DELETE exposed for administration — soft
 * delete only, and deactivate is the correct/reversible administrative
 * action from this UI. */
export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.post(`/users/${id}/deactivate`)
}
