import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { PermissionAction, RolePermissions, UserPermissionOverride } from "../types"
import { mockRolePermissions } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchRolePermissions(roleId: string): Promise<RolePermissions> {
  if (USE_MOCK) {
    return delay(
      mockRolePermissions[roleId] ?? {
        roleId,
        matrix: [
          { module: "product", moduleLabel: "Product", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "inventory", moduleLabel: "Inventory", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "sales", moduleLabel: "Sales", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "purchase", moduleLabel: "Purchase", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "accounting", moduleLabel: "Accounting", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "hr", moduleLabel: "HR", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "reports", moduleLabel: "Reports", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
          { module: "admin", moduleLabel: "Administration", actions: { view: false, create: false, edit: false, delete: false, approve: false, export: false } },
        ],
      }
    )
  }
  const { data } = await apiClient.get<RolePermissions>(`/admin/permissions/roles/${roleId}`)
  return data
}

export async function updateRolePermissions(roleId: string, matrix: RolePermissions["matrix"]): Promise<RolePermissions> {
  if (USE_MOCK) return delay({ roleId, matrix })
  const { data } = await apiClient.put<RolePermissions>(`/admin/permissions/roles/${roleId}`, { matrix })
  return data
}

export async function fetchUserPermissionOverrides(userId: string): Promise<UserPermissionOverride[]> {
  if (USE_MOCK) return delay([])
  const { data } = await apiClient.get<UserPermissionOverride[]>(`/admin/permissions/users/${userId}/overrides`)
  return data
}

export async function setUserPermissionOverride(
  userId: string,
  module: string,
  action: PermissionAction,
  granted: boolean
): Promise<UserPermissionOverride> {
  if (USE_MOCK) {
    return delay({ id: `ovr-${Date.now()}`, userId, module, action, granted })
  }
  const { data } = await apiClient.post<UserPermissionOverride>(`/admin/permissions/users/${userId}/overrides`, {
    module,
    action,
    granted,
  })
  return data
}
