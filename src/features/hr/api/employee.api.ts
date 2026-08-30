import axios from "axios"
import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { Employee, EmployeeDocument, EmployeeStatus } from "../types"
import type { EmployeeFormValues } from "../schemas/employee.schema"
import {
  mockBranches,
  mockDepartments,
  mockDesignations,
  mockEmployeeDocuments,
  mockEmployees,
} from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

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
  assignmentId?: string | null
  departmentId?: string | null
  departmentName?: string | null
  designationId?: string | null
  designationName?: string | null
  branchName?: string | null
  assignmentEffectiveFrom?: string | null
}

type AssignmentMutationInput = {
  assignmentId?: string
  employeeId: string
  companyId: string
  branchId: string
  departmentId: string
  designationId: string
  joiningDate: string
}

function mapStatus(status: BackendEmployeeStatus): EmployeeStatus {
  const map: Record<BackendEmployeeStatus, EmployeeStatus> = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    TERMINATED: "terminated",
  }
  return map[status]
}

function mapBackendToEmployee(employee: BackendEmployee): Employee {
  return {
    id: employee.id,
    userId: employee.userId ?? undefined,
    assignmentId: employee.assignmentId ?? undefined,
    employeeCode: employee.employeeCode,
    name: employee.displayName || `${employee.firstName} ${employee.lastName}`.trim(),
    dateOfBirth: employee.dateOfBirth ?? "",
    phone: employee.phone ?? "",
    email: employee.email ?? "",
    address: employee.address ?? "",
    departmentId: employee.departmentId ?? "",
    departmentName: employee.departmentName ?? "",
    designationId: employee.designationId ?? undefined,
    designation: employee.designationName ?? "",
    branchId: employee.branchId,
    branchName: employee.branchName ?? "",
    joiningDate: employee.assignmentEffectiveFrom ?? employee.joinedAt ?? employee.createdAt,
    status: mapStatus(employee.status),
  }
}

function splitEmployeeName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ")
  const parts = normalized.split(" ").filter(Boolean)
  const firstName = parts[0] ?? normalized
  const lastName = parts.slice(1).join(" ") || firstName

  return {
    displayName: normalized,
    firstName,
    lastName,
  }
}

async function upsertEmployeeAssignment(input: AssignmentMutationInput): Promise<void> {
  const payload = {
    employeeId: input.employeeId,
    companyId: input.companyId,
    branchId: input.branchId,
    departmentId: input.departmentId,
    designationId: input.designationId || undefined,
    effectiveFrom: input.joiningDate,
  }

  if (input.assignmentId) {
    await apiClient.patch(
      `/employee-assignments/${input.assignmentId}`,
      {
        departmentId: input.departmentId,
        designationId: input.designationId || null,
        effectiveFrom: input.joiningDate,
      },
      { params: { companyId: input.companyId } },
    )
    return
  }

  await apiClient.post("/employee-assignments", payload)
}

function mapMockEmployee(values: EmployeeFormValues, id: string): Employee {
  const department = mockDepartments.find((item) => item.id === values.departmentId)
  const designation = mockDesignations.find((item) => item.id === values.designationId)
  const branch = mockBranches.find((item) => item.id === values.branchId)

  return {
    id,
    userId: undefined,
    assignmentId: `assign-${id}`,
    employeeCode: values.employeeCode,
    name: values.name,
    dateOfBirth: values.dateOfBirth,
    phone: values.phone,
    email: values.email,
    address: values.address,
    departmentId: values.departmentId,
    departmentName: department?.name ?? "",
    designationId: values.designationId || undefined,
    designation: designation?.name ?? "",
    branchId: values.branchId,
    branchName: branch?.name ?? "",
    joiningDate: values.joiningDate,
    status: "active",
  }
}

export async function fetchEmployees(): Promise<Employee[]> {
  if (USE_MOCK) return delay(mockEmployees)

  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendEmployee[]; meta: unknown }>("/employees", {
    params: { companyId, limit: 100 },
  })

  return (data.data ?? []).map(mapBackendToEmployee)
}

export async function fetchEmployeeById(id: string): Promise<Employee | undefined> {
  if (USE_MOCK) return delay(mockEmployees.find((employee) => employee.id === id))

  const companyId = await resolveCompanyId()

  try {
    const { data } = await apiClient.get<BackendEmployee>(`/employees/${id}`, { params: { companyId } })
    return mapBackendToEmployee(data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function fetchEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  if (USE_MOCK) return delay(mockEmployeeDocuments.filter((document) => document.employeeId === employeeId))
  return []
}

export async function createEmployee(values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    return delay(mapMockEmployee(values, `emp-${Date.now()}`))
  }

  const companyId = await resolveCompanyId()
  const { firstName, lastName, displayName } = splitEmployeeName(values.name)
  const { data } = await apiClient.post<BackendEmployee>("/employees", {
    companyId,
    branchId: values.branchId,
    employeeCode: values.employeeCode,
    firstName,
    lastName,
    displayName,
    phone: values.phone || undefined,
    email: values.email || undefined,
    dateOfBirth: values.dateOfBirth || undefined,
    address: values.address || undefined,
  })

  await upsertEmployeeAssignment({
    employeeId: data.id,
    companyId,
    branchId: values.branchId,
    departmentId: values.departmentId,
    designationId: values.designationId,
    joiningDate: values.joiningDate,
  })

  return (await fetchEmployeeById(data.id)) ?? mapMockEmployee(values, data.id)
}

export async function updateEmployee(id: string, values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    const existing = mockEmployees.find((employee) => employee.id === id)
    if (!existing) throw new Error("Employee not found")
    return delay({
      ...existing,
      ...mapMockEmployee(values, id),
      status: existing.status,
    })
  }

  const companyId = await resolveCompanyId()
  const existing = await fetchEmployeeById(id)
  const { firstName, lastName, displayName } = splitEmployeeName(values.name)

  await apiClient.patch<BackendEmployee>(
    `/employees/${id}`,
    {
      firstName,
      lastName,
      displayName,
      phone: values.phone || undefined,
      email: values.email || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      address: values.address || undefined,
    },
    { params: { companyId } },
  )

  await upsertEmployeeAssignment({
    assignmentId: existing?.assignmentId,
    employeeId: id,
    companyId,
    branchId: existing?.branchId ?? values.branchId,
    departmentId: values.departmentId,
    designationId: values.designationId,
    joiningDate: values.joiningDate,
  })

  return (await fetchEmployeeById(id)) ?? mapMockEmployee(values, id)
}

export async function deleteEmployee(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.post(`/employees/${id}/deactivate`, {}, { params: { companyId } })
}

export async function destroyEmployee(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/employees/${id}`, { params: { companyId } })
}

export async function activateEmployee(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.post(`/employees/${id}/activate`, {}, { params: { companyId } })
}

export async function terminateEmployee(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.post(`/employees/${id}/terminate`, {}, { params: { companyId } })
}
