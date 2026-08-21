import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { LeaveBalance, LeaveDashboardMetrics, LeaveRequest, LeaveStatus, LeaveType } from "../types"
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

// Real controller: @Controller('leave-requests') — NOT /hr/leaves.
// The backend models leave type as a companyId-scoped leave-types row
// (arbitrary code/name), not the fixed frontend enum
// (annual/sick/emergency/unpaid/maternity). We resolve the UUID by
// case-insensitive code match against the real /leave-types list.

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

let cachedLeaveTypes: BackendLeaveType[] | null = null

async function fetchLeaveTypes(companyId: string): Promise<BackendLeaveType[]> {
  if (cachedLeaveTypes) return cachedLeaveTypes
  const { data } = await apiClient.get<{ data: BackendLeaveType[]; meta: unknown }>(
    "/leave-types",
    { params: { companyId, limit: 100 } },
  )
  cachedLeaveTypes = data.data ?? []
  return cachedLeaveTypes
}

async function resolveLeaveTypeId(companyId: string, type: LeaveType): Promise<string> {
  const types = await fetchLeaveTypes(companyId)
  const match = types.find((t) => t.code.toLowerCase() === type.toLowerCase())
  if (!match) {
    throw new Error(
      `No leave type configured for "${type}". Ask an admin to create a leave type with code "${type}" under Leave Types.`,
    )
  }
  return match.id
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

function mapBackendToLeaveRequest(be: BackendLeaveRequest, typeCode: string): LeaveRequest {
  return {
    id: be.id,
    reference: be.id.slice(0, 8).toUpperCase(),
    employeeId: be.employeeId,
    // Not returned by this endpoint — would require an employees join.
    employeeName: "",
    type: (typeCode as LeaveType) || "annual",
    startDate: be.fromDate,
    endDate: be.toDate,
    days: daysBetween(be.fromDate, be.toDate),
    reason: be.reason ?? "",
    status: mapLeaveStatus(be.status),
    createdAt: be.createdAt,
  }
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  if (USE_MOCK) return delay(mockLeaveRequests)
  const companyId = await resolveCompanyId()
  const [{ data }, types] = await Promise.all([
    apiClient.get<{ data: BackendLeaveRequest[]; meta: unknown }>("/leave-requests", {
      params: { companyId, limit: 100 },
    }),
    fetchLeaveTypes(companyId),
  ])
  const typeById = new Map(types.map((t) => [t.id, t.code]))
  return (data.data ?? []).map((r) => mapBackendToLeaveRequest(r, typeById.get(r.leaveTypeId) ?? ""))
}

/** No backend aggregate endpoint exists for leave dashboard metrics —
 * derived client-side from the real leave requests. */
export async function fetchLeaveDashboardMetrics(): Promise<LeaveDashboardMetrics> {
  if (USE_MOCK) return delay(leaveDashboardMetrics)
  const requests = await fetchLeaveRequests()
  return {
    totalRequests: requests.length,
    pending: requests.filter((r) => r.status === "requested").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  }
}

/** No backend leave-balance endpoint exists yet (accrual/entitlement
 * tracking is not part of Phase 00-31) — returns an empty list against a
 * live backend instead of calling a fictional route. */
export async function fetchLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
  if (USE_MOCK) return delay(mockLeaveBalances.filter((b) => b.employeeId === employeeId))
  return []
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
  const companyId = await resolveCompanyId()
  const leaveTypeId = await resolveLeaveTypeId(companyId, values.type)
  // companyId is an optional query param the route uses for DataScope
  // resolution — live-verified as required in this environment (omitting
  // it 400s "companyId is required"), so it's sent explicitly.
  const { data } = await apiClient.post<BackendLeaveRequest>(
    "/leave-requests",
    {
      employeeId: values.employeeId,
      leaveTypeId,
      fromDate: values.startDate,
      toDate: values.endDate,
      reason: values.reason,
    },
    { params: { companyId } },
  )
  return mapBackendToLeaveRequest(data, values.type)
}

/** Real backend uses dedicated action routes (POST :id/approve,
 * POST :id/reject, POST :id/cancel) rather than a generic status PATCH —
 * a single approval step, no manager-then-HR distinction. */
export async function updateLeaveRequestStatus(id: string, status: LeaveStatus): Promise<LeaveRequest> {
  if (USE_MOCK) {
    const existing = mockLeaveRequests.find((l) => l.id === id)
    if (!existing) throw new Error("Leave request not found")
    return delay({ ...existing, status })
  }
  const action = status === "approved" ? "approve" : status === "rejected" ? "reject" : "cancel"
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendLeaveRequest>(
    `/leave-requests/${id}/${action}`,
    {},
    { params: { companyId } },
  )
  const types = await fetchLeaveTypes(companyId)
  const typeCode = types.find((t) => t.id === data.leaveTypeId)?.code ?? ""
  return mapBackendToLeaveRequest(data, typeCode)
}
