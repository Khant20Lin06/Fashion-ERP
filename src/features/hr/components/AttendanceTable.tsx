"use client"

import { useMemo, useState } from "react"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
  type FilterValues,
} from "@/components/data-table"
import { AttendanceBadge } from "@/components/hr/AttendanceBadge"
import { useAttendanceRecords } from "../hooks/useAttendance"
import type { AttendanceRecord } from "../types"

function formatAttendanceDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat("en-US").format(new Date(year, month - 1, day))
}

function formatAttendanceTime(value: string | undefined): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

const columns: DataTableColumnDef<AttendanceRecord>[] = [
  {
    accessorKey: "employeeName",
    header: ({ column }) => <ColumnHeader column={column} title="Employee" />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <ColumnHeader column={column} title="Date" />,
    cell: ({ row }) => formatAttendanceDate(row.getValue<string>("date")),
  },
  {
    accessorKey: "checkIn",
    header: ({ column }) => <ColumnHeader column={column} title="Check In" />,
    cell: ({ row }) => formatAttendanceTime(row.getValue("checkIn")),
  },
  {
    accessorKey: "checkOut",
    header: ({ column }) => <ColumnHeader column={column} title="Check Out" />,
    cell: ({ row }) => formatAttendanceTime(row.getValue("checkOut")),
  },
  {
    accessorKey: "workingHours",
    header: ({ column }) => <ColumnHeader column={column} title="Working Hours" />,
    cell: ({ row }) => `${row.getValue("workingHours")}h`,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <ColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <AttendanceBadge status={row.getValue("status")} />,
  },
]

/** Attendance table - Employee/Date/Check In/Check Out/Working Hours/Status. */
export function AttendanceTable() {
  const { data, isLoading, isError, refetch } = useAttendanceRecords()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((record) => {
      if (filters.status && record.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search attendance..."
      filterFields={[
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Present", value: "present" },
            { label: "Absent", value: "absent" },
            { label: "Late", value: "late" },
            { label: "Half Day", value: "half_day" },
            { label: "Leave", value: "leave" },
            { label: "Holiday", value: "holiday" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="attendance"
      emptyTitle="No attendance records"
      emptyDescription="Attendance data will appear here once recorded."
    />
  )
}
