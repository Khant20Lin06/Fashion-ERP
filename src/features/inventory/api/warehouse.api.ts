import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import { tryResolveCompanyId, resolveCompanyId } from "@/lib/api/resolve-company-id"
import type { Branch, Warehouse, WarehouseType } from "../types"
import { mockBranches, mockWarehouses } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export type WarehouseFormValues = {
  name: string
  code: string
  type: WarehouseType
  branchId: string
  address: string
  status: "active" | "inactive"
}

type BackendWarehouse = {
  id: string
  companyId: string
  branchId: string | null
  code: string
  name: string
  status: string
  type: string
  address: string | null
  createdAt: string
  updatedAt: string
}

type BackendBranch = {
  id: string
  companyId: string
  code: string
  name: string
  status: string
  phone: string | null
  address: string | null
}

async function fetchBackendBranches(companyId: string): Promise<BackendBranch[]> {
  const { data } = await apiClient.get<{ data: BackendBranch[] }>("/branches", {
    params: { companyId },
  })
  return data.data ?? []
}

function mapBackendWarehouse(warehouse: BackendWarehouse, branches: BackendBranch[] = []): Warehouse {
  return {
    id: warehouse.id,
    name: warehouse.name,
    code: warehouse.code,
    type: warehouse.type as WarehouseType,
    branchId: warehouse.branchId ?? "",
    branchName: branches.find((branch) => branch.id === warehouse.branchId)?.name ?? "Main Branch",
    address: warehouse.address ?? "",
    status: warehouse.status === "ACTIVE" ? "active" : "inactive",
    totalProducts: null,
    stockValue: null,
  }
}

function mapBackendBranch(branch: BackendBranch, warehouses: BackendWarehouse[] = []): Branch {
  return {
    id: branch.id,
    name: branch.name,
    warehouseIds: warehouses.filter((warehouse) => warehouse.branchId === branch.id).map((warehouse) => warehouse.id),
  }
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  if (USE_MOCK) return delay(mockWarehouses)

  const companyId = (await tryResolveCompanyId()) ?? (await resolveCompanyId())
  const [warehouseResponse, branches] = await Promise.all([
    apiClient.get<{ data: BackendWarehouse[] }>("/warehouses", { params: { companyId } }),
    fetchBackendBranches(companyId),
  ])

  return (warehouseResponse.data.data ?? []).map((warehouse) => mapBackendWarehouse(warehouse, branches))
}

export async function fetchBranches(): Promise<Branch[]> {
  if (USE_MOCK) return delay(mockBranches)

  const companyId = (await tryResolveCompanyId()) ?? (await resolveCompanyId())
  const [branches, warehouseResponse] = await Promise.all([
    fetchBackendBranches(companyId),
    apiClient.get<{ data: BackendWarehouse[] }>("/warehouses", { params: { companyId } }),
  ])

  return branches.map((branch) => mapBackendBranch(branch, warehouseResponse.data.data ?? []))
}

export async function createWarehouse(values: WarehouseFormValues): Promise<Warehouse> {
  if (USE_MOCK) {
    const branch = mockBranches.find((item) => item.id === values.branchId)
    return delay({
      id: `wh-${Date.now()}`,
      ...values,
      branchName: branch?.name ?? "",
      totalProducts: null,
      stockValue: null,
    })
  }

  const companyId = await resolveCompanyId()
  const payload = {
    companyId,
    branchId: values.branchId,
    code: values.code,
    name: values.name,
    type: values.type,
    address: values.address,
  }

  const { data } = await apiClient.post<BackendWarehouse>("/warehouses", payload)
  const created =
    values.status === "active"
      ? data
      : (
          await apiClient.post<BackendWarehouse>(`/warehouses/${data.id}/deactivate`, null, {
            params: { companyId },
          })
        ).data

  return mapBackendWarehouse(created, await fetchBackendBranches(companyId))
}

export async function updateWarehouse(id: string, values: WarehouseFormValues): Promise<Warehouse> {
  if (USE_MOCK) {
    const existing = mockWarehouses.find((warehouse) => warehouse.id === id)
    if (!existing) throw new Error("Warehouse not found")
    const branch = mockBranches.find((item) => item.id === values.branchId)
    return delay({ ...existing, ...values, branchName: branch?.name ?? existing.branchName })
  }

  const companyId = await resolveCompanyId()
  const { data: patched } = await apiClient.patch<BackendWarehouse>(
    `/warehouses/${id}`,
    {
      name: values.name,
      type: values.type,
      address: values.address,
    },
    { params: { companyId } },
  )

  const desiredStatus = values.status === "active" ? "ACTIVE" : "INACTIVE"
  if (desiredStatus !== patched.status) {
    const action = desiredStatus === "ACTIVE" ? "activate" : "deactivate"
    const { data: afterStatus } = await apiClient.post<BackendWarehouse>(
      `/warehouses/${id}/${action}`,
      null,
      { params: { companyId } },
    )
    return mapBackendWarehouse(afterStatus, await fetchBackendBranches(companyId))
  }

  return mapBackendWarehouse(patched, await fetchBackendBranches(companyId))
}

export async function deleteWarehouse(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)

  const companyId = await resolveCompanyId()
  await apiClient.delete(`/warehouses/${id}`, { params: { companyId } })
}
