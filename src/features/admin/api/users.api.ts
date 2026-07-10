import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { AdminUser, ActivityEntry, LoginHistoryEntry } from "../types"
import type { UserFormValues } from "../schemas/user.schema"
import { mockActivity, mockBranches, mockCompanies, mockLoginHistory, mockRoles, mockUsers } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchUsers(): Promise<AdminUser[]> {
  if (USE_MOCK) return delay(mockUsers)
  const { data } = await apiClient.get<AdminUser[]>("/admin/users")
  return data
}

export async function fetchUser(id: string): Promise<AdminUser | undefined> {
  if (USE_MOCK) return delay(mockUsers.find((u) => u.id === id))
  const { data } = await apiClient.get<AdminUser>(`/admin/users/${id}`)
  return data
}

export async function createUser(values: UserFormValues): Promise<AdminUser> {
  if (USE_MOCK) {
    const role = mockRoles.find((r) => r.id === values.roleId)
    const company = mockCompanies.find((c) => c.id === values.companyId)
    const branch = mockBranches.find((b) => b.id === values.branchId)
    return delay({
      id: `usr-${Date.now()}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      username: values.username,
      roleId: values.roleId,
      roleName: role?.name ?? "",
      companyId: values.companyId,
      companyName: company?.name ?? "",
      branchId: values.branchId,
      branchName: branch?.name ?? "",
      status: values.status,
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<AdminUser>("/admin/users", values)
  return data
}

export async function updateUser(id: string, values: UserFormValues): Promise<AdminUser> {
  if (USE_MOCK) {
    const existing = mockUsers.find((u) => u.id === id)
    if (!existing) throw new Error("User not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<AdminUser>(`/admin/users/${id}`, values)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/admin/users/${id}`)
}

export async function fetchLoginHistory(userId: string): Promise<LoginHistoryEntry[]> {
  if (USE_MOCK) return delay(mockLoginHistory.filter((h) => h.userId === userId))
  const { data } = await apiClient.get<LoginHistoryEntry[]>(`/admin/users/${userId}/login-history`)
  return data
}

export async function fetchUserActivity(userId: string): Promise<ActivityEntry[]> {
  if (USE_MOCK) return delay(mockActivity.filter((a) => a.userId === userId))
  const { data } = await apiClient.get<ActivityEntry[]>(`/admin/users/${userId}/activity`)
  return data
}
