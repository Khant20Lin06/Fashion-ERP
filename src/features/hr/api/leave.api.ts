import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { LeaveBalance, LeaveDashboardMetrics, LeaveRequest, LeaveStatus } from "../types"
import type { LeaveRequestFormValues } from "../schemas/leave.schema"
import { leaveDashboardMetrics, mockLeaveBalances, mockLeaveRequests } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / 86400000) + 1
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  if (USE_MOCK) return delay(mockLeaveRequests)
  const { data } = await apiClient.get<LeaveRequest[]>("/hr/leaves")
  return data
}

export async function fetchLeaveDashboardMetrics(): Promise<LeaveDashboardMetrics> {
  if (USE_MOCK) return delay(leaveDashboardMetrics)
  const { data } = await apiClient.get<LeaveDashboardMetrics>("/hr/leaves/metrics")
  return data
}

export async function fetchLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
  if (USE_MOCK) return delay(mockLeaveBalances.filter((b) => b.employeeId === employeeId))
  const { data } = await apiClient.get<LeaveBalance[]>(`/hr/leaves/balances`, { params: { employeeId } })
  return data
}

export async function createLeaveRequest(values: LeaveRequestFormValues): Promise<LeaveRequest> {
  if (USE_MOCK) {
    const { mockEmployees } = await import("./mock-data")
    const employee = mockEmployees.find((e) => e.id === values.employeeId)
    return delay({
      id: `lv-${Date.now()}`,
      reference: `LV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      employeeId: values.employeeId,
      employeeName: employee?.name ?? "",
      type: values.type,
      startDate: values.startDate,
      endDate: values.endDate,
      days: daysBetween(values.startDate, values.endDate),
      reason: values.reason,
      attachmentFilename: values.attachmentFilename,
      status: "requested",
      createdAt: new Date().toISOString(),
    })
  }
  const { data } = await apiClient.post<LeaveRequest>("/hr/leaves", values)
  return data
}

export async function updateLeaveRequestStatus(id: string, status: LeaveStatus): Promise<LeaveRequest> {
  if (USE_MOCK) {
    const existing = mockLeaveRequests.find((l) => l.id === id)
    if (!existing) throw new Error("Leave request not found")
    return delay({ ...existing, status })
  }
  const { data } = await apiClient.patch<LeaveRequest>(`/hr/leaves/${id}/status`, { status })
  return data
}
