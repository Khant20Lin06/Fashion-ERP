import { apiClient } from "@/lib/api/client"
import type { AttendanceMetrics, AttendanceOverviewPoint, AttendanceRecord, Shift } from "../types"
import { attendanceMetrics, attendanceOverview, mockAttendanceRecords, mockShifts } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- Attendance ---

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  if (USE_MOCK) return delay(mockAttendanceRecords)
  const { data } = await apiClient.get<AttendanceRecord[]>("/hr/attendance")
  return data
}

export async function fetchAttendanceMetrics(): Promise<AttendanceMetrics> {
  if (USE_MOCK) return delay(attendanceMetrics)
  const { data } = await apiClient.get<AttendanceMetrics>("/hr/attendance/metrics")
  return data
}

export async function fetchAttendanceOverview(): Promise<AttendanceOverviewPoint[]> {
  if (USE_MOCK) return delay(attendanceOverview)
  const { data } = await apiClient.get<AttendanceOverviewPoint[]>("/hr/attendance/overview")
  return data
}

// --- Shifts ---

export type ShiftFormValues = Omit<Shift, "id">

export async function fetchShifts(): Promise<Shift[]> {
  if (USE_MOCK) return delay(mockShifts)
  const { data } = await apiClient.get<Shift[]>("/hr/shifts")
  return data
}

export async function createShift(values: ShiftFormValues): Promise<Shift> {
  if (USE_MOCK) return delay({ id: `shift-${Date.now()}`, ...values })
  const { data } = await apiClient.post<Shift>("/hr/shifts", values)
  return data
}

export async function updateShift(id: string, values: ShiftFormValues): Promise<Shift> {
  if (USE_MOCK) {
    const existing = mockShifts.find((s) => s.id === id)
    if (!existing) throw new Error("Shift not found")
    return delay({ ...existing, ...values })
  }
  const { data } = await apiClient.put<Shift>(`/hr/shifts/${id}`, values)
  return data
}

export async function deleteShift(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.delete(`/hr/shifts/${id}`)
}
