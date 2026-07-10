import { apiClient } from "@/lib/api/client"
import type { Branch, Company, Role } from "../types"
import type { BranchFormValues, CompanyFormValues, RoleFormValues } from "../schemas/role.schema"
import { mockBranches, mockCompanies, mockRoles } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Roles ---

export async function fetchRoles(): Promise<Role[]> {
  if (USE_MOCK) return delay(mockRoles)
  const { data } = await apiClient.get<Role[]>("/admin/roles")
  return data
}

export async function createRole(values: RoleFormValues): Promise<Role> {
  if (USE_MOCK) {
    return delay({
      id: `role-${Date.now()}`,
      name: values.name,
      description: values.description,
      permissionGroups: values.permissionGroups,
      userCount: 0,
      status: values.status,
      isSystem: false,
    })
  }
  const { data } = await apiClient.post<Role>("/admin/roles", values)
  return data
}

export async function updateRole(id: string, values: RoleFormValues): Promise<Role> {
  if (USE_MOCK) {
    const existing = mockRoles.find((r) => r.id === id)
    if (!existing) throw new Error("Role not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Role>(`/admin/roles/${id}`, values)
  return data
}

export async function deleteRole(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/admin/roles/${id}`)
}

// --- Companies ---

export async function fetchCompanies(): Promise<Company[]> {
  if (USE_MOCK) return delay(mockCompanies)
  const { data } = await apiClient.get<Company[]>("/admin/companies")
  return data
}

export async function createCompany(values: CompanyFormValues): Promise<Company> {
  if (USE_MOCK) {
    return delay({ id: `co-${Date.now()}`, ...values })
  }
  const { data } = await apiClient.post<Company>("/admin/companies", values)
  return data
}

export async function updateCompany(id: string, values: CompanyFormValues): Promise<Company> {
  if (USE_MOCK) {
    const existing = mockCompanies.find((c) => c.id === id)
    if (!existing) throw new Error("Company not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Company>(`/admin/companies/${id}`, values)
  return data
}

// --- Branches ---

export async function fetchBranches(): Promise<Branch[]> {
  if (USE_MOCK) return delay(mockBranches)
  const { data } = await apiClient.get<Branch[]>("/admin/branches")
  return data
}

export async function createBranch(values: BranchFormValues): Promise<Branch> {
  if (USE_MOCK) {
    const company = mockCompanies.find((c) => c.id === values.companyId)
    return delay({
      id: `br-${Date.now()}`,
      name: values.name,
      code: values.code,
      companyId: values.companyId,
      companyName: company?.name ?? "",
      type: values.type,
      address: values.address,
      managerId: values.managerId,
      warehouseId: values.warehouseId,
      status: values.status,
    })
  }
  const { data } = await apiClient.post<Branch>("/admin/branches", values)
  return data
}

export async function updateBranch(id: string, values: BranchFormValues): Promise<Branch> {
  if (USE_MOCK) {
    const existing = mockBranches.find((b) => b.id === id)
    if (!existing) throw new Error("Branch not found")
    const company = mockCompanies.find((c) => c.id === values.companyId)
    return delay({ ...existing, ...values, companyName: company?.name ?? existing.companyName })
  }
  const { data } = await apiClient.put<Branch>(`/admin/branches/${id}`, values)
  return data
}
