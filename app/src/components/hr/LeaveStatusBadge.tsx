import { Badge } from "@/components/ui/badge"
import type { LeaveStatus, PayrollStatus } from "@/features/hr/types"

const config: Record<LeaveStatus | PayrollStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  requested: { label: "Requested", variant: "outline" },
  manager_approved: { label: "Manager Approved", variant: "secondary" },
  hr_approved: { label: "HR Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  draft: { label: "Draft", variant: "outline" },
  hr_reviewed: { label: "HR Reviewed", variant: "secondary" },
  finance_approved: { label: "Finance Approved", variant: "secondary" },
  paid: { label: "Paid", variant: "default" },
}

type LeaveStatusBadgeProps = {
  status: LeaveStatus | PayrollStatus
}

/** Universal workflow status badge — Leave Request / Payroll statuses. */
export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
