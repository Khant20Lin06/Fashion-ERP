import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Permission } from "../types"
import { mockPermissions } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real controller: @Controller('permissions') — NOT /admin/permissions.
// GET /permissions returns a flat, bare array (no {data,meta} envelope,
// no module/matrix grouping) — {id, resource, action, code, description}.
// A role's own permissions are read from RoleResponseDto.permissionCodes
// (see roles.api.ts::fetchRoles) and written via PUT /roles/:id/permissions
// with a full permissionIds array — there is no per-user permission
// override concept anywhere in the backend RBAC model (permissions flow
// Role -> User via user_roles only).

export async function fetchPermissions(): Promise<Permission[]> {
  if (USE_MOCK) return delay(mockPermissions)
  const { data } = await apiClient.get<Permission[]>("/permissions")
  return data
}
