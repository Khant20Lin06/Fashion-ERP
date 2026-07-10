import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { Employee, EmployeeDocument } from "../types"
import type { EmployeeFormValues } from "../schemas/employee.schema"
import { mockEmployeeDocuments, mockEmployees } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function fetchEmployees(): Promise<Employee[]> {
  if (USE_MOCK) return delay(mockEmployees)
  const { data } = await apiClient.get<Employee[]>("/hr/employees")
  return data
}

export async function fetchEmployeeById(id: string): Promise<Employee | undefined> {
  if (USE_MOCK) return delay(mockEmployees.find((e) => e.id === id))
  const { data } = await apiClient.get<Employee>(`/hr/employees/${id}`)
  return data
}

export async function fetchEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  if (USE_MOCK) return delay(mockEmployeeDocuments.filter((d) => d.employeeId === employeeId))
  const { data } = await apiClient.get<EmployeeDocument[]>(`/hr/employees/${employeeId}/documents`)
  return data
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
  const { data } = await apiClient.post<Employee>("/hr/employees", values)
  return data
}

export async function updateEmployee(id: string, values: EmployeeFormValues): Promise<Employee> {
  if (USE_MOCK) {
    const existing = mockEmployees.find((e) => e.id === id)
    if (!existing) throw new Error("Employee not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Employee>(`/hr/employees/${id}`, values)
  return data
}

export async function deleteEmployee(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/hr/employees/${id}`)
}
