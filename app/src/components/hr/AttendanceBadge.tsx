import { Badge } from "@/components/ui/badge"
import type { AttendanceStatus } from "@/features/hr/types"

const config: Record<AttendanceStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  present: { label: "Present", variant: "default" },
  absent: { label: "Absent", variant: "destructive" },
  late: { label: "Late", variant: "secondary" },
  half_day: { label: "Half Day", variant: "outline" },
  leave: { label: "Leave", variant: "secondary" },
  holiday: { label: "Holiday", variant: "outline" },
}

type AttendanceBadgeProps = {
  status: AttendanceStatus
}

/** Attendance status badge — Present / Absent / Late / Half Day / Leave / Holiday. */
export function AttendanceBadge({ status }: AttendanceBadgeProps) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
