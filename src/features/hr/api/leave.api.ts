import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { LeaveBalance, LeaveDashboardMetrics, LeaveRequest, LeaveStatus, LeaveType } from "../types"
import type { LeaveRequestFormValues } from "../schemas/leave.schema"
import { leaveDashboardMetrics, mockLeaveBalances, mockLeaveRequests } from "./mock-data"
import { fetchEmployees } from "./employee.api"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

export type LeaveTypeOption = {
  code: string
  label: string
}

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.round(ms / 86400000) + 1
}

type BackendLeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

type BackendLeaveRequest = {
  id: string
  employeeId: string
  companyId: string
  branchId: string
  leaveTypeId: string
  fromDate: string
  toDate: string
  reason: string | null
  status: BackendLeaveRequestStatus
  approvedByUserId: string | null
  rejectedByUserId: string | null
  decisionAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

type BackendLeaveType = {
  id: string
  companyId: string
  name: string
  code: string
  description: string | null
  isPaid: boolean
  defaultDays: string | null
  status: "ACTIVE" | "INACTIVE"
}

function mapLeaveStatus(status: BackendLeaveRequestStatus): LeaveStatus {
  const map: Record<BackendLeaveRequestStatus, LeaveStatus> = {
    PENDING: "requested",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  }
  return map[status]
}

function mapBackendToLeaveRequest(
  request: BackendLeaveRequest,
  leaveType: BackendLeaveType | undefined,
  employeeName: string | undefined,
): LeaveRequest {
  const typeCode = leaveType?.code?.trim() || "unknown"
  return {
    id: request.id,
    reference: request.id.slice(0, 8).toUpperCase(),
    employeeId: request.employeeId,
    employeeName: employeeName?.trim() || "Unknown employee",
    type: typeCode,
    typeLabel: leaveType?.name?.trim() || typeCode,
    startDate: request.fromDate,
    endDate: request.toDate,
    days: daysBetween(request.fromDate, request.toDate),
    reason: request.reason ?? "",
    status: mapLeaveStatus(request.status),
    createdAt: request.createdAt,
  }
}

async function fetchLeaveTypes(companyId: string): Promise<BackendLeaveType[]> {
  const { data } = await apiClient.get<{ data: BackendLeaveType[]; meta: unknown }>("/leave-types", {
    params: { companyId, limit: 100 },
  })
  return data.data ?? []
}

export async function fetchLeaveTypeOptions(): Promise<LeaveTypeOption[]> {
  if (USE_MOCK) {
    const options = [
      { code: "annual", label: "Annual Leave" },
      { code: "sick", label: "Sick Leave" },
      { code: "emergency", label: "Emergency Leave" },
      { code: "unpaid", label: "Unpaid Leave" },
      { code: "maternity", label: "Maternity Leave" },
    ]
    return delay(options)
  }

  const companyId = await resolveCompanyId()
  const types = await fetchLeaveTypes(companyId)
  return types
    .filter((type) => type.status === "ACTIVE")
    .map((type) => ({
      code: type.code,
      label: type.name,
    }))
}

async function resolveLeaveType(companyId: string, typeCode: LeaveType): Promise<BackendLeaveType> {
  const types = await fetchLeaveTypes(companyId)
  const match = types.find((type) => type.status === "ACTIVE" && type.code.toLowerCase() === typeCode.toLowerCase())
  if (!match) {
    throw new Error(
      `No active leave type is configured for code "${typeCode}". Ask an admin to create or activate that leave type under Leave Types.`,
    )
  }
  return match
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  if (USE_MOCK) return delay(mockLeaveRequests)

  const companyId = await resolveCompanyId()
  const [{ data }, types, employees] = await Promise.all([
    apiClient.get<{ data: BackendLeaveRequest[]; meta: unknown }>("/leave-requests", {
      params: { companyId, limit: 100 },
    }),
    fetchLeaveTypes(companyId),
    fetchEmployees(),
  ])

  const typeById = new Map(types.map((type) => [type.id, type]))
  const employeeNameById = new Map(employees.map((employee) => [employee.id, employee.name]))

  return (data.data ?? []).map((request) =>
    mapBackendToLeaveRequest(request, typeById.get(request.leaveTypeId), employeeNameById.get(request.employeeId)),
  )
}

export async function fetchLeaveDashboardMetrics(): Promise<LeaveDashboardMetrics> {
  if (USE_MOCK) return delay(leaveDashboardMetrics)
  const requests = await fetchLeaveRequests()
  return {
    totalRequests: requests.length,
    pending: requests.filter((request) => request.status === "requested").length,
    approved: requests.filter((request) => request.status === "approved").length,
    rejected: requests.filter((request) => request.status === "rejected").length,
  }
}

export async function fetchLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
  if (USE_MOCK) return delay(mockLeaveBalances.filter((balance) => balance.employeeId === employeeId))
  return []
}

export async function createLeaveRequest(values: LeaveRequestFormValues): Promise<LeaveRequest> {
  if (USE_MOCK) {
    const { mockEmployees } = await import("./mock-data")
    const employee = mockEmployees.find((item) => item.id === values.employeeId)
    const option = (await fetchLeaveTypeOptions()).find((item) => item.code === values.type)
    return delay({
      id: `lv-${Date.now()}`,
      reference: `LV-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      employeeId: values.employeeId,
      employeeName: employee?.name ?? "",
      type: values.type,
      typeLabel: option?.label ?? values.type,
      startDate: values.startDate,
      endDate: values.endDate,
      days: daysBetween(values.startDate, values.endDate),
      reason: values.reason,
      attachmentFilename: values.attachmentFilename,
      status: "requested",
      createdAt: new Date().toISOString(),
    })
  }

  const companyId = await resolveCompanyId()
  const leaveType = await resolveLeaveType(companyId, values.type)
  const { data } = await apiClient.post<BackendLeaveRequest>(
    "/leave-requests",
    {
      employeeId: values.employeeId,
      leaveTypeId: leaveType.id,
      fromDate: values.startDate,
      toDate: values.endDate,
      reason: values.reason,
    },
    { params: { companyId } },
  )

  const employees = await fetchEmployees()
  const employeeName = employees.find((employee) => employee.id === data.employeeId)?.name
  return mapBackendToLeaveRequest(data, leaveType, employeeName)
}

export async function updateLeaveRequestStatus(id: string, status: LeaveStatus): Promise<LeaveRequest> {
  if (USE_MOCK) {
    const existing = mockLeaveRequests.find((leave) => leave.id === id)
    if (!existing) throw new Error("Leave request not found")
    return delay({ ...existing, status })
  }

  const action = status === "approved" ? "approve" : status === "rejected" ? "reject" : "cancel"
  const companyId = await resolveCompanyId()
  const [response, types, employees] = await Promise.all([
    apiClient.post<BackendLeaveRequest>(`/leave-requests/${id}/${action}`, {}, { params: { companyId } }),
    fetchLeaveTypes(companyId),
    fetchEmployees(),
  ])

  const leaveType = types.find((type) => type.id === response.data.leaveTypeId)
  const employeeName = employees.find((employee) => employee.id === response.data.employeeId)?.name
  return mapBackendToLeaveRequest(response.data, leaveType, employeeName)
}
