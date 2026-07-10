import { Badge } from "@/components/ui/badge"
import type { PaymentStatus, PurchaseOrderStatus, RequestStatus, ReturnStatus } from "@/features/purchase/types"

type AnyPurchaseStatus = PurchaseOrderStatus | RequestStatus | PaymentStatus | ReturnStatus

const config: Record<AnyPurchaseStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  submitted: { label: "Submitted", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  converted: { label: "Converted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  pending_approval: { label: "Pending Approval", variant: "secondary" },
  partially_received: { label: "Partially Received", variant: "secondary" },
  received: { label: "Received", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  completed: { label: "Completed", variant: "default" },
  paid: { label: "Paid", variant: "default" },
  partial: { label: "Partial", variant: "secondary" },
  unpaid: { label: "Unpaid", variant: "outline" },
  overdue: { label: "Overdue", variant: "destructive" },
}

type PurchaseStatusBadgeProps = {
  status: AnyPurchaseStatus
}

/** Universal status badge for Purchase Request / Purchase Order / Payment / Return statuses. */
export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
