import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
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
  updateRolePermissions,
} from "../api/roles.api"
import type { BranchFormValues, CompanyFormValues, RoleFormValues } from "../schemas/role.schema"

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
    onError: (error) => toastApiError(error, "Failed to create role"),
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
    onError: (error) => toastApiError(error, "Failed to update role"),
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
    onError: (error) => toastApiError(error, "Failed to delete role"),
  })
}

// --- Role Permissions ---
// Full-replace semantics, matching PUT /roles/:id/permissions exactly.

export function useUpdateRolePermissions(roleId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (permissionIds: string[]) => updateRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] })
      toast.success("Permissions updated")
    },
    onError: (error) => toastApiError(error, "Failed to update permissions"),
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
    onError: (error) => toastApiError(error, "Failed to create company"),
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
    onError: (error) => toastApiError(error, "Failed to update company"),
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
    onError: (error) => toastApiError(error, "Failed to create branch"),
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
    onError: (error) => toastApiError(error, "Failed to update branch"),
  })
}
