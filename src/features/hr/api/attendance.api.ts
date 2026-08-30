import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { AttendanceMetrics, AttendanceOverviewPoint, AttendanceRecord, AttendanceStatus, Shift } from "../types"
import { attendanceMetrics, attendanceOverview, mockAttendanceRecords, mockShifts } from "./mock-data"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH
const ATTENDANCE_PAGE_SIZE = 100

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

type BackendAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "HALF_DAY"

type BackendAttendanceRecord = {
  id: string
  employeeId: string
  employeeName?: string | null
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

type PaginatedResponse<T> = {
  data?: T[]
  meta?: {
    page?: number
    limit?: number
    total?: number
  } | null
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
    employeeName: be.employeeName?.trim() || "Unknown employee",
    date: be.attendanceDate,
    checkIn: be.checkInAt ?? undefined,
    checkOut: be.checkOutAt ?? undefined,
    workingHours: hoursBetween(be.checkInAt, be.checkOutAt),
    status: mapAttendanceStatus(be.status),
  }
}

async function fetchAllAttendanceRows(companyId: string): Promise<BackendAttendanceRecord[]> {
  let page = 1
  let total = Number.POSITIVE_INFINITY
  const rows: BackendAttendanceRecord[] = []

  while (rows.length < total) {
    const { data } = await apiClient.get<PaginatedResponse<BackendAttendanceRecord>>("/attendance", {
      params: { companyId, page, limit: ATTENDANCE_PAGE_SIZE },
    })
    const batch = data.data ?? []
    rows.push(...batch)

    const reportedTotal = data.meta?.total
    total =
      typeof reportedTotal === "number"
        ? reportedTotal
        : batch.length < ATTENDANCE_PAGE_SIZE
          ? rows.length
          : rows.length + ATTENDANCE_PAGE_SIZE

    if (batch.length < ATTENDANCE_PAGE_SIZE) break
    page += 1
  }

  return rows
}

function summarizeAttendanceMetrics(records: AttendanceRecord[]): AttendanceMetrics {
  const summaryDate = records.reduce<string | null>(
    (latest, record) => (!latest || record.date > latest ? record.date : latest),
    null,
  )

  if (!summaryDate) {
    return { present: 0, absent: 0, late: 0, summaryDate: null }
  }

  const dayRecords = records.filter((record) => record.date === summaryDate)
  return {
    present: dayRecords.filter((record) => record.status === "present").length,
    absent: dayRecords.filter((record) => record.status === "absent").length,
    late: dayRecords.filter((record) => record.status === "late").length,
    summaryDate,
  }
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  if (USE_MOCK) return delay(mockAttendanceRecords)
  const companyId = await resolveCompanyId()
  const rows = await fetchAllAttendanceRows(companyId)
  return rows.map(mapBackendToRecord)
}

// No backend aggregate endpoint exists for attendance metrics/overview, so
// the frontend derives these summaries from the live attendance rows.
export async function fetchAttendanceMetrics(): Promise<AttendanceMetrics> {
  if (USE_MOCK) return delay(attendanceMetrics)
  const records = await fetchAttendanceRecords()
  return summarizeAttendanceMetrics(records)
}

export async function fetchAttendanceOverview(): Promise<AttendanceOverviewPoint[]> {
  if (USE_MOCK) return delay(attendanceOverview)
  const records = await fetchAttendanceRecords()
  const byDate = new Map<string, AttendanceOverviewPoint>()
  for (const record of records) {
    const point = byDate.get(record.date) ?? { period: record.date, present: 0, absent: 0, late: 0 }
    if (record.status === "present") point.present += 1
    else if (record.status === "absent") point.absent += 1
    else if (record.status === "late") point.late += 1
    byDate.set(record.date, point)
  }
  return Array.from(byDate.values()).sort((a, b) => a.period.localeCompare(b.period))
}

// No backend module exists for shifts in Phase 00-31, so shift CRUD remains
// mock-only until a real endpoint is added.
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
    const existing = mockShifts.find((shift) => shift.id === id)
    if (!existing) throw new Error("Shift not found")
    return delay({ ...existing, ...values })
  }
  throw new Error("Shift management is not available yet.")
}

export async function deleteShift(_id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  throw new Error("Shift management is not available yet.")
}
