import { create } from "zustand"
import type { AdminFilters, RolePermissions } from "../types"

type AdminStoreState = {
  filters: AdminFilters
  setFilter: <K extends keyof AdminFilters>(key: K, value: AdminFilters[K]) => void
  resetFilters: () => void

  selectedUserId: string | undefined
  setSelectedUserId: (id: string | undefined) => void

  permissionCache: Record<string, RolePermissions>
  cachePermissions: (roleId: string, permissions: RolePermissions) => void
  clearPermissionCache: () => void
}

export const useAdminStore = create<AdminStoreState>()((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: {} }),

  selectedUserId: undefined,
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  permissionCache: {},
  cachePermissions: (roleId, permissions) =>
    set((state) => ({ permissionCache: { ...state.permissionCache, [roleId]: permissions } })),
  clearPermissionCache: () => set({ permissionCache: {} }),
}))
