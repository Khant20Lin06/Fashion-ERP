import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { Employee, EmployeeDocument, EmployeeStatus } from "../types"
import type { EmployeeFormValues } from "../schemas/employee.schema"
import { mockEmployeeDocuments, mockEmployees } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ---------- Backend DTO types (src/modules/employees + src/modules/hr) ----------
// Real controller: @Controller('employees') — NOT /hr/employees.
// Department/designation are NOT returned by GET /employees itself — they
// live on a separate, distinct-effective-dated EmployeeAssignment record
// (@Controller('employee-assignments')), joined in below via each
// employee's current (status=ACTIVE, no effectiveTo in the past) row.
// There is no manager relationship anywhere in the backend at all — no
// managerId-equivalent field exists on Employee or EmployeeAssignment —
// so Employee.managerId/managerName remain genuinely unavailable, not a
// wiring gap.
type BackendEmployeeStatus = "ACTIVE" | "INACTIVE" | "TERMINATED"

type BackendEmployee = {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  displayName: string
  phone: string | null
  email: string | null
  dateOfBirth: string | null
  address: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  userId: string | null
  companyId: string
  branchId: string
  status: BackendEmployeeStatus
  joinedAt: string | null
  terminatedAt: string | null
  createdAt: string
  updatedAt: string
}

type BackendEmployeeAssignmentStatus = "ACTIVE" | "INACTIVE"

type BackendEmployeeAssignment = {
  id: string
  employeeId: string
  companyId: string
  branchId: string
  departmentId: string | null
  designationId: string | null
  warehouseId: string | null
  effectiveFrom: string
  effectiveTo: string | null
  status: BackendEmployeeAssignmentStatus
}

type BackendDesignation = {
  id: string
  companyId: string
  name: string
  code: string | null
}

function mapStatus(status: BackendEmployeeStatus): EmployeeStatus {
  const map: Record<BackendEmployeeStatus, EmployeeStatus> = {
    ACTIVE: "active",
    INACTIVE: "suspended",
    TERMINATED: "terminated",
  }
  return map[status]
}

/** The one ACTIVE assignment in effect today for this employee (a real
 * employee could in principle have a future-dated or historical row too —
 * "current" means status=ACTIVE and effectiveFrom has already started). */
function currentAssignmentFor(
  employeeId: string,
  assignments: BackendEmployeeAssignment[],
): BackendEmployeeAssignment | undefined {
  const today = new Date().toISOString().slice(0, 10)
  return assignments
    .filter(
      (a) =>
        a.employeeId === employeeId &&
        a.status === "ACTIVE" &&
        a.effectiveFrom <= today &&
        (!a.effectiveTo || a.effectiveTo >= today),
    )
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]
}

function mapBackendToEmployee(
  be: BackendEmployee,
  departments: Array<{ id: string; name: string }> = [],
  designations: BackendDesignation[] = [],
  assignments: BackendEmployeeAssignment[] = [],
): Employee {
  const assignment = currentAssignmentFor(be.id, assignments)
  return {
    id: be.id,
    employeeCode: be.employeeCode,
    name: be.displayName || `${be.firstName} ${be.lastName}`.trim(),
    gender: "other",
    dateOfBirth: be.dateOfBirth ?? "",
    phone: be.phone ?? "",
    email: be.email ?? "",
    address: be.address ?? "",
    departmentId: assignment?.departmentId ?? "",
    departmentName: departments.find((d) => d.id === assignment?.departmentId)?.name ?? "",
    designation: designations.find((d) => d.id === assignment?.designationId)?.name ?? "",
    branchId: be.branchId,
    // Not returned by GET /employees or resolvable from assignments (no
    // branch name is included in EmployeeAssignmentResponseDto either) —
    // callers needing this join /branches themselves.
    branchName: "",
    // No employmentType field exists anywhere backend-side — genuinely
    // unavailable, not a wiring gap. Defaulted for display only.
    employmentType: "full_time",
    joiningDate: be.joinedAt ?? be.createdAt,
    // No manager relationship exists anywhere backend-side.
    managerId: undefined,
    managerName: undefined,
    workingHoursPerWeek: 40,
    location: "",
    status: mapStatus(be.status),
  }
}

async function fetchDepartmentsForJoin(companyId: string): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data } = await apiClient.get<{ data: Array<{ id: string; name: string }>; meta: unknown }>(
      "/departments",
      { params: { companyId, limit: 200 } },
    )
    return data.data ?? []
  } catch {
    return []
  }
}

async function fetchDesignationsForJoin(companyId: string): Promise<BackendDesignation[]> {
  try {
    const { data } = await apiClient.get<{ data: BackendDesignation[]; meta: unknown }>(
      "/designations",
      { params: { companyId, limit: 200 } },
    )
    return data.data ?? []
  } catch {
    return []
  }
}

async function fetchAssignmentsForJoin(companyId: string): Promise<BackendEmployeeAssignment[]> {
  try {
    const { data } = await apiClient.get<{ data: BackendEmployeeAssignment[]; meta: unknown }>(
      "/employee-assignments",
      { params: { companyId, limit: 200 } },
    )
    return data.data ?? []
  } catch {
    return []
  }
}

async function fetchJoinData(companyId: string) {
  const [departments, designations, assignments] = await Promise.all([
    fetchDepartmentsForJoin(companyId),
    fetchDesignationsForJoin(companyId),
    fetchAssignmentsForJoin(companyId),
  ])
  return { departments, designations, assignments }
}

export async function fetchEmployees(): Promise<Employee[]> {
  if (USE_MOCK) return delay(mockEmployees)
  const companyId = await resolveCompanyId()
  const [empRes, { departments, designations, assignments }] = await Promise.all([
    apiClient.get<{ data: BackendEmployee[]; meta: unknown }>("/employees", {
      params: { companyId, limit: 100 },
    }),
    fetchJoinData(companyId),
  ])
  return (empRes.data.data ?? []).map((be) => mapBackendToEmployee(be, departments, designations, assignments))
}

export async function fetchEmployeeById(id: string): Promise<Employee | undefined> {
  if (USE_MOCK) return delay(mockEmployees.find((e) => e.id === id))
  const companyId = await resolveCompanyId()
  try {
    const [empRes, { departments, designations, assignments }] = await Promise.all([
      apiClient.get<BackendEmployee>(`/employees/${id}`, { params: { companyId } }),
      fetchJoinData(companyId),
    ])
    return mapBackendToEmployee(empRes.data, departments, designations, assignments)
  } catch {
    return undefined
  }
}

/** Documents are not part of the Phase 00-31 employees API — no backend
 * endpoint exists yet, so this returns an empty list against a live backend
 * instead of calling a fictional route. */
export async function fetchEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  if (USE_MOCK) return delay(mockEmployeeDocuments.filter((d) => d.employeeId === employeeId))
  return []
}

export async function createEmployee(values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    const { mockDepartments } = await import("./mock-data")
    const department = mockDepartments.find((d) => d.id === values.departmentId)
    return delay({
      id: `emp-${Date.now()}`,
      ...values,
      departmentName: department?.name ?? "",
      branchName: "",
      status: values.status,
    })
  }
  const companyId = await resolveCompanyId()
  const [firstName, ...rest] = values.name.trim().split(" ")
  // employeeCode is a required CreateEmployeeDto field — live-verified as
  // required (a create without it 400s "employeeCode must be a string");
  // the form already collects it as "Employee ID," it just wasn't being
  // sent.
  const { data } = await apiClient.post<BackendEmployee>("/employees", {
    companyId,
    branchId: values.branchId,
    employeeCode: values.employeeCode,
    firstName: firstName || values.name,
    lastName: rest.join(" ") || "-",
    phone: values.phone || undefined,
    email: values.email || undefined,
    dateOfBirth: values.dateOfBirth || undefined,
    address: values.address || undefined,
  })
  return mapBackendToEmployee(data)
}

export async function updateEmployee(id: string, values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    const existing = mockEmployees.find((e) => e.id === id)
    if (!existing) throw new Error("Employee not found")
    return delay({ ...existing, ...values })
  }
  const companyId = await resolveCompanyId()
  const [firstName, ...rest] = values.name.trim().split(" ")
  // companyId is an optional query param the route uses for DataScope
  // resolution — live-verified as required in this environment (omitting
  // it 400s "companyId is required").
  const { data } = await apiClient.patch<BackendEmployee>(
    `/employees/${id}`,
    {
      firstName: firstName || values.name,
      lastName: rest.join(" ") || "-",
      phone: values.phone || undefined,
      email: values.email || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      address: values.address || undefined,
    },
    { params: { companyId } },
  )
  return mapBackendToEmployee(data)
}

/** The employees API has no DELETE — employees are deactivated/terminated
 * instead (POST :id/deactivate, POST :id/terminate). Deactivate is the
 * closest safe equivalent to a destructive "delete" from the UI. */
export async function deleteEmployee(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.post(`/employees/${id}/deactivate`, {}, { params: { companyId } })
}
