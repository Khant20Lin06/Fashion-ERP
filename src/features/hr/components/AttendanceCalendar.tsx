"use client"

import { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useEmployees } from "../hooks/useEmployees"
import { useAttendanceRecords } from "../hooks/useAttendance"
import type { AttendanceStatus } from "../types"

const statusDotClass: Record<AttendanceStatus, string> = {
  present: "bg-success",
  absent: "bg-destructive",
  late: "bg-warning",
  half_day: "bg-warning/60",
  leave: "bg-secondary-foreground/40",
  holiday: "bg-muted-foreground/40",
}

function getMonthDays(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
}

/** Attendance Calendar — monthly/weekly view with an employee filter, dot-coded by status. */
export function AttendanceCalendar() {
  const { data: employees } = useEmployees()
  const { data: records } = useAttendanceRecords()
  const [view, setView] = useState<"monthly" | "weekly">("monthly")
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined)

  const now = new Date()
  const monthDays = useMemo(() => getMonthDays(now.getFullYear(), now.getMonth()), [now])
  const weekDays = useMemo(() => {
    const start = new Date(now)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
  }, [now])

  const days = view === "monthly" ? monthDays : weekDays

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceStatus[]>()
    for (const record of records ?? []) {
      if (employeeId && record.employeeId !== employeeId) continue
      const key = new Date(record.date).toDateString()
      const existing = map.get(key) ?? []
      existing.push(record.status)
      map.set(key, existing)
    }
    return map
  }, [records, employeeId])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "monthly" | "weekly")}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={employeeId ?? "all"} onValueChange={(v) => setEmployeeId(v === "all" ? undefined : v)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {(employees ?? []).map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("grid gap-2", view === "monthly" ? "grid-cols-7" : "grid-cols-7")}>
        {days.map((day) => {
          const statuses = recordsByDate.get(day.toDateString()) ?? []
          const isToday = day.toDateString() === now.toDateString()
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border p-2 text-xs",
                isToday && "border-primary bg-primary/5"
              )}
            >
              <span className="font-medium">{day.getDate()}</span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {statuses.length === 0 ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  statuses.map((status, index) => (
                    <span key={index} className={cn("size-1.5 rounded-full", statusDotClass[status])} title={status} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
