import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { AttendanceMetrics, AttendanceOverviewPoint, AttendanceRecord, AttendanceStatus, Shift } from "../types"
import { attendanceMetrics, attendanceOverview, mockAttendanceRecords, mockShifts } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Attendance ---
// Real controller: @Controller('attendance') — NOT /hr/attendance.

type BackendAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HALF_DAY"

type BackendAttendanceRecord = {
  id: string
  employeeId: string
  companyId: string
  branchId: string
  attendanceDate: string
  status: BackendAttendanceStatus
  checkInAt: string | null
  checkOutAt: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

function mapAttendanceStatus(status: BackendAttendanceStatus): AttendanceStatus {
  const map: Record<BackendAttendanceStatus, AttendanceStatus> = {
    PRESENT: "present",
    ABSENT: "absent",
    LATE: "late",
    LEAVE: "leave",
    HALF_DAY: "half_day",
  }
  return map[status]
}

function hoursBetween(start: string | null, end: string | null): number {
  if (!start || !end) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return ms > 0 ? Math.round((ms / 3_600_000) * 100) / 100 : 0
}

function mapBackendToRecord(be: BackendAttendanceRecord): AttendanceRecord {
  return {
    id: be.id,
    employeeId: be.employeeId,
    // Not returned by this endpoint — would require an employees join.
    employeeName: "",
    date: be.attendanceDate,
    checkIn: be.checkInAt ?? undefined,
    checkOut: be.checkOutAt ?? undefined,
    workingHours: hoursBetween(be.checkInAt, be.checkOutAt),
    status: mapAttendanceStatus(be.status),
  }
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  if (USE_MOCK) return delay(mockAttendanceRecords)
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendAttendanceRecord[]; meta: unknown }>(
    "/attendance",
    { params: { companyId, limit: 100 } },
  )
  return (data.data ?? []).map(mapBackendToRecord)
}

/** No backend aggregate endpoint exists for attendance metrics/overview —
 * derived client-side from the real records instead of calling a fictional
 * /hr/attendance/metrics route. `earlyLeave`/`overtime` have no backend
 * source at all (AttendanceRecord has no late/overtime calculation — status
 * is a raw caller-supplied enum, never derived from check-in/out times) and
 * are omitted entirely rather than hardcoded to a 0 that would look like a
 * real, counted value. */
export async function fetchAttendanceMetrics(): Promise<AttendanceMetrics> {
  if (USE_MOCK) return delay(attendanceMetrics)
  const records = await fetchAttendanceRecords()
  return {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
  }
}

export async function fetchAttendanceOverview(): Promise<AttendanceOverviewPoint[]> {
  if (USE_MOCK) return delay(attendanceOverview)
  const records = await fetchAttendanceRecords()
  const byDate = new Map<string, AttendanceOverviewPoint>()
  for (const r of records) {
    const point = byDate.get(r.date) ?? { period: r.date, present: 0, absent: 0, late: 0 }
    if (r.status === "present") point.present += 1
    else if (r.status === "absent") point.absent += 1
    else if (r.status === "late") point.late += 1
    byDate.set(r.date, point)
  }
  return Array.from(byDate.values()).sort((a, b) => a.period.localeCompare(b.period))
}

// --- Shifts ---
// No backend module exists for shifts in Phase 00-31 — mock-only until a
// real endpoint is added; UI should treat this as unavailable in live mode.

export type ShiftFormValues = Omit<Shift, "id">

export async function fetchShifts(): Promise<Shift[]> {
  if (USE_MOCK) return delay(mockShifts)
  return []
}

export async function createShift(values: ShiftFormValues): Promise<Shift> {
  if (USE_MOCK) return delay({ id: `shift-${Date.now()}`, ...values })
  throw new Error("Shift management is not available yet.")
}

export async function updateShift(id: string, values: ShiftFormValues): Promise<Shift> {
  if (USE_MOCK) {
    const existing = mockShifts.find((s) => s.id === id)
    if (!existing) throw new Error("Shift not found")
    return delay({ ...existing, ...values })
  }
  throw new Error("Shift management is not available yet.")
}

export async function deleteShift(_id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  throw new Error("Shift management is not available yet.")
}
