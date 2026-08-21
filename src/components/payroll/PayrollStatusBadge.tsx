import { Badge } from "@/components/ui/badge"
import type { PayrollComponentType, PayrollPeriodStatus, PayrollRunStatus } from "@/features/payroll/types"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

const periodStatusConfig: Record<PayrollPeriodStatus, { label: string; variant: BadgeVariant }> = {
  OPEN: { label: "Open", variant: "outline" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  FINALIZED: { label: "Finalized", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

export function PayrollPeriodStatusBadge({ status }: { status: PayrollPeriodStatus }) {
  const { label, variant } = periodStatusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

const runStatusConfig: Record<PayrollRunStatus, { label: string; variant: BadgeVariant }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  CALCULATED: { label: "Calculated", variant: "secondary" },
  FINALIZED: { label: "Finalized", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
}

export function PayrollRunStatusBadge({ status }: { status: PayrollRunStatus }) {
  const { label, variant } = runStatusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

const componentTypeConfig: Record<PayrollComponentType, { label: string; variant: BadgeVariant }> = {
  EARNING: { label: "Earning", variant: "default" },
  DEDUCTION: { label: "Deduction", variant: "destructive" },
  EMPLOYER_CONTRIBUTION: { label: "Employer Contribution", variant: "secondary" },
}

export function PayrollComponentTypeBadge({ type }: { type: PayrollComponentType }) {
  const { label, variant } = componentTypeConfig[type]
  return <Badge variant={variant}>{label}</Badge>
}
