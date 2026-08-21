import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type {
  Announcement,
  Department,
  DepartmentDistributionPoint,
  DepartmentStatus,
  HrKpis,
  OrgUnit,
  UpcomingEvent,
} from "../types"
import {
  departmentDistribution,
  hrKpis,
  mockAnnouncements,
  mockDepartments,
  mockOrgUnits,
  upcomingEvents,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// No `managerId` field — CreateDepartmentDto/UpdateDepartmentDto have no
// manager relationship anywhere on the backend Department entity.
export type DepartmentFormValues = {
  name: string
  code: string
  status: "active" | "inactive"
}

// --- Departments ---
// Real controller: @Controller('departments') — NOT /hr/departments. The
// backend has no managerId field anywhere; that stays genuinely
// unavailable. employeeCount is not a Department field either, but it IS
// honestly computable via a real join against /employee-assignments (see
// countEmployeesByDepartment below) rather than left at a fake 0. Status
// is not settable on create/update — it's toggled via
// POST :id/activate|deactivate.

type BackendDepartmentStatus = "ACTIVE" | "INACTIVE"

type BackendDepartment = {
  id: string
  companyId: string
  name: string
  code: string | null
  description: string | null
  status: BackendDepartmentStatus
  createdAt: string
  updatedAt: string
}

function mapDepartmentStatus(status: BackendDepartmentStatus): DepartmentStatus {
  return status === "ACTIVE" ? "active" : "inactive"
}

function mapBackendToDepartment(bd: BackendDepartment, employeeCount = 0): Department {
  return {
    id: bd.id,
    name: bd.name,
    code: bd.code ?? "",
    employeeCount,
    status: mapDepartmentStatus(bd.status),
  }
}

type BackendEmployeeAssignmentStatus = "ACTIVE" | "INACTIVE"

type BackendEmployeeAssignment = {
  employeeId: string
  departmentId: string | null
  effectiveFrom: string
  effectiveTo: string | null
  status: BackendEmployeeAssignmentStatus
}

// Department has no employeeCount field on the backend — computed here
// from /employee-assignments the same way employee.api.ts resolves each
// employee's current department, counting distinct employees whose
// currently-active assignment (status=ACTIVE, effectiveFrom already
// started, effectiveTo not yet passed) points at this department.
async function countEmployeesByDepartment(companyId: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  try {
    const { data } = await apiClient.get<{ data: BackendEmployeeAssignment[]; meta: unknown }>(
      "/employee-assignments",
      { params: { companyId, limit: 200 } },
    )
    const today = new Date().toISOString().slice(0, 10)
    const currentByEmployee = new Map<string, BackendEmployeeAssignment>()
    for (const a of data.data ?? []) {
      if (a.status !== "ACTIVE" || a.effectiveFrom > today) continue
      if (a.effectiveTo && a.effectiveTo < today) continue
      const existing = currentByEmployee.get(a.employeeId)
      if (!existing || a.effectiveFrom > existing.effectiveFrom) {
        currentByEmployee.set(a.employeeId, a)
      }
    }
    for (const a of currentByEmployee.values()) {
      if (!a.departmentId) continue
      counts.set(a.departmentId, (counts.get(a.departmentId) ?? 0) + 1)
    }
  } catch {
    // Assignment lookup failing shouldn't block the department list —
    // rows just fall back to a 0 count.
  }
  return counts
}

export async function fetchDepartments(): Promise<Department[]> {
  if (USE_MOCK) return delay(mockDepartments)
  const companyId = await resolveCompanyId()
  const [{ data }, counts] = await Promise.all([
    apiClient.get<{ data: BackendDepartment[]; meta: unknown }>("/departments", {
      params: { companyId, limit: 100 },
    }),
    countEmployeesByDepartment(companyId),
  ])
  return (data.data ?? []).map((bd) => mapBackendToDepartment(bd, counts.get(bd.id) ?? 0))
}

export async function createDepartment(values: DepartmentFormValues): Promise<Department> {
  if (USE_MOCK) {
    return delay({
      id: `dept-${Date.now()}`,
      name: values.name,
      code: values.code,
      employeeCount: 0,
      status: values.status,
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendDepartment>("/departments", {
    companyId,
    name: values.name,
    code: values.code || undefined,
  })
  return mapBackendToDepartment(data)
}

export async function updateDepartment(id: string, values: DepartmentFormValues): Promise<Department> {
  if (USE_MOCK) {
    const existing = mockDepartments.find((d) => d.id === id)
    if (!existing) throw new Error("Department not found")
    return delay({ ...existing, ...values })
  }
  // companyId is an optional query param the route uses for DataScope
  // resolution — live-verified as required in this environment (omitting
  // it 400s "companyId is required").
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.patch<BackendDepartment>(
    `/departments/${id}`,
    { name: values.name, code: values.code || undefined },
    { params: { companyId } },
  )
  if (values.status === "active" && data.status !== "ACTIVE") {
    await apiClient.post(`/departments/${id}/activate`, {}, { params: { companyId } })
  } else if (values.status === "inactive" && data.status !== "INACTIVE") {
    await apiClient.post(`/departments/${id}/deactivate`, {}, { params: { companyId } })
  }
  return mapBackendToDepartment({ ...data, status: values.status === "active" ? "ACTIVE" : "INACTIVE" })
}

// --- Organization Tree ---
// No backend endpoint models a company/office/department/store/warehouse
// tree — mock-only until a real endpoint exists.

export async function fetchOrgUnits(): Promise<OrgUnit[]> {
  if (USE_MOCK) return delay(mockOrgUnits)
  return []
}

// --- HR Dashboard ---
// No backend HR KPI/analytics/events endpoints exist in Phase 00-31 —
// mock-only until real endpoints exist.

// No HR KPI/dashboard-aggregate endpoint exists anywhere in the backend —
// returns undefined ("unavailable") rather than a hardcoded all-zero
// object, which would be visually indistinguishable from "0 real
// employees" on the dashboard card.
export async function fetchHrKpis(): Promise<HrKpis | undefined> {
  if (USE_MOCK) return delay(hrKpis)
  return undefined
}

export async function fetchDepartmentDistribution(): Promise<DepartmentDistributionPoint[]> {
  if (USE_MOCK) return delay(departmentDistribution)
  return []
}

export async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  if (USE_MOCK) return delay(upcomingEvents)
  return []
}

// --- Announcements (ESS) ---
// No backend announcements endpoint exists — mock-only.

export async function fetchAnnouncements(): Promise<Announcement[]> {
  if (USE_MOCK) return delay(mockAnnouncements)
  return []
}
