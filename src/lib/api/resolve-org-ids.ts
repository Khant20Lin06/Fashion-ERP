import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"

let cachedBranchId: string | undefined
let cachedWarehouseId: string | undefined
let cachedForCompanyId: string | undefined

/** Resolves a branch for the given company. Cached per company after first success. */
export async function resolveBranchId(companyId?: string): Promise<string> {
  const resolvedCompanyId = companyId ?? (await resolveCompanyId())
  if (cachedBranchId && cachedForCompanyId === resolvedCompanyId) return cachedBranchId

  const { data } = await apiClient.get<{ data: Array<{ id: string; companyId: string; status?: string }> }>(
    "/branches",
    { params: { companyId: resolvedCompanyId } },
  )
  const inCompany = (data.data ?? []).filter((item) => item.companyId === resolvedCompanyId)
  const branch = inCompany.find((item) => item.status === "ACTIVE")
  const id = branch?.id
  if (!id) {
    throw new Error(
      inCompany.length === 0
        ? "No branch found. Please set up a branch first."
        : "No active branch found. Please activate a branch first."
    )
  }

  cachedBranchId = id
  cachedForCompanyId = resolvedCompanyId
  return id
}

/** Resolves a warehouse for the given company. Required to confirm POS sales.
 * Prefers an ACTIVE warehouse — Sale.confirm() rejects an inactive
 * warehouseId server-side, so silently picking an inactive one here would
 * only surface as a confusing checkout failure later. */
export async function resolveWarehouseId(companyId?: string): Promise<string> {
  const resolvedCompanyId = companyId ?? (await resolveCompanyId())
  if (cachedWarehouseId && cachedForCompanyId === resolvedCompanyId) return cachedWarehouseId

  const { data } = await apiClient.get<{ data: Array<{ id: string; companyId: string; status?: string }> }>(
    "/warehouses",
    { params: { companyId: resolvedCompanyId } },
  )
  const inCompany = (data.data ?? []).filter((item) => item.companyId === resolvedCompanyId)
  const warehouse = inCompany.find((item) => item.status === "ACTIVE")
  const id = warehouse?.id
  if (!id) {
    throw new Error(
      inCompany.length === 0
        ? "No warehouse found. Please set up a warehouse first."
        : "No active warehouse found. Please activate a warehouse first."
    )
  }

  cachedWarehouseId = id
  cachedForCompanyId = resolvedCompanyId
  return id
}

export function clearCachedOrgIds(): void {
  cachedBranchId = undefined
  cachedWarehouseId = undefined
  cachedForCompanyId = undefined
}
