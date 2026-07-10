import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type {
  Announcement,
  Department,
  DepartmentDistributionPoint,
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

export type DepartmentFormValues = {
  name: string
  code: string
  managerId?: string
  status: "active" | "inactive"
}

// --- Departments ---

export async function fetchDepartments(): Promise<Department[]> {
  if (USE_MOCK) return delay(mockDepartments)
  const { data } = await apiClient.get<Department[]>("/hr/departments")
  return data
}

export async function createDepartment(values: DepartmentFormValues): Promise<Department> {
  if (USE_MOCK) {
    const { mockEmployees } = await import("./mock-data")
    const manager = mockEmployees.find((e) => e.id === values.managerId)
    return delay({
      id: `dept-${Date.now()}`,
      name: values.name,
      code: values.code,
      managerId: values.managerId,
      managerName: manager?.name,
      employeeCount: 0,
      status: values.status,
    })
  }
  const { data } = await apiClient.post<Department>("/hr/departments", values)
  return data
}

export async function updateDepartment(id: string, values: DepartmentFormValues): Promise<Department> {
  if (USE_MOCK) {
    const existing = mockDepartments.find((d) => d.id === id)
    if (!existing) throw new Error("Department not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Department>(`/hr/departments/${id}`, values)
  return data
}

// --- Organization Tree ---

export async function fetchOrgUnits(): Promise<OrgUnit[]> {
  if (USE_MOCK) return delay(mockOrgUnits)
  const { data } = await apiClient.get<OrgUnit[]>("/hr/organization")
  return data
}

// --- HR Dashboard ---

export async function fetchHrKpis(): Promise<HrKpis> {
  if (USE_MOCK) return delay(hrKpis)
  const { data } = await apiClient.get<HrKpis>("/hr/kpis")
  return data
}

export async function fetchDepartmentDistribution(): Promise<DepartmentDistributionPoint[]> {
  if (USE_MOCK) return delay(departmentDistribution)
  const { data } = await apiClient.get<DepartmentDistributionPoint[]>("/hr/analytics/department-distribution")
  return data
}

export async function fetchUpcomingEvents(): Promise<UpcomingEvent[]> {
  if (USE_MOCK) return delay(upcomingEvents)
  const { data } = await apiClient.get<UpcomingEvent[]>("/hr/upcoming-events")
  return data
}

// --- Announcements (ESS) ---

export async function fetchAnnouncements(): Promise<Announcement[]> {
  if (USE_MOCK) return delay(mockAnnouncements)
  const { data } = await apiClient.get<Announcement[]>("/hr/announcements")
  return data
}
