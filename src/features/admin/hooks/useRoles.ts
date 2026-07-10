import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createBranch,
  createCompany,
  createRole,
  deleteRole,
  fetchBranches,
  fetchCompanies,
  fetchRoles,
  updateBranch,
  updateCompany,
  updateRole,
} from "../api/roles.api"
import {
  fetchRolePermissions,
  fetchUserPermissionOverrides,
  setUserPermissionOverride,
  updateRolePermissions,
} from "../api/permissions.api"
import type { BranchFormValues, CompanyFormValues, RoleFormValues } from "../schemas/role.schema"
import type { PermissionAction, RolePermissions } from "../types"

// --- Roles ---

export function useRoles() {
  return useQuery({ queryKey: ["admin", "roles"], queryFn: fetchRoles })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: RoleFormValues) => createRole(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      toast.success("Role created")
    },
    onError: () => toast.error("Failed to create role"),
  })
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: RoleFormValues) => updateRole(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      toast.success("Role updated")
    },
    onError: () => toast.error("Failed to update role"),
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      toast.success("Role deleted")
    },
    onError: () => toast.error("Failed to delete role"),
  })
}

// --- Permissions ---

export function useRolePermissions(roleId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "permissions", "roles", roleId],
    queryFn: () => fetchRolePermissions(roleId as string),
    enabled: !!roleId,
  })
}

export function useUpdateRolePermissions(roleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (matrix: RolePermissions["matrix"]) => updateRolePermissions(roleId, matrix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "roles", roleId] })
      toast.success("Permissions updated")
    },
    onError: () => toast.error("Failed to update permissions"),
  })
}

export function useUserPermissionOverrides(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "permissions", "users", userId],
    queryFn: () => fetchUserPermissionOverrides(userId as string),
    enabled: !!userId,
  })
}

export function useSetUserPermissionOverride(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ module, action, granted }: { module: string; action: PermissionAction; granted: boolean }) =>
      setUserPermissionOverride(userId, module, action, granted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "users", userId] })
      toast.success("Permission override saved")
    },
    onError: () => toast.error("Failed to save permission override"),
  })
}

// --- Companies ---

export function useCompanies() {
  return useQuery({ queryKey: ["admin", "companies"], queryFn: fetchCompanies })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CompanyFormValues) => createCompany(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] })
      toast.success("Company created")
    },
    onError: () => toast.error("Failed to create company"),
  })
}

export function useUpdateCompany(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CompanyFormValues) => updateCompany(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] })
      toast.success("Company updated")
    },
    onError: () => toast.error("Failed to update company"),
  })
}

// --- Branches ---

export function useBranches() {
  return useQuery({ queryKey: ["admin", "branches"], queryFn: fetchBranches })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: BranchFormValues) => createBranch(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] })
      toast.success("Branch created")
    },
    onError: () => toast.error("Failed to create branch"),
  })
}

export function useUpdateBranch(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: BranchFormValues) => updateBranch(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] })
      toast.success("Branch updated")
    },
    onError: () => toast.error("Failed to update branch"),
  })
}
