import { Badge } from "@/components/ui/badge"
import type { InvoicePaymentStatus, ReturnStatus, SalesOrderStatus } from "@/features/sales/types"

type AnySalesStatus = SalesOrderStatus | ReturnStatus | InvoicePaymentStatus

const config: Record<AnySalesStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  confirmed: { label: "Confirmed", variant: "secondary" },
  processing: { label: "Processing", variant: "secondary" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  requested: { label: "Requested", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  processed: { label: "Processed", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  paid: { label: "Paid", variant: "default" },
  partial: { label: "Partial", variant: "secondary" },
  unpaid: { label: "Unpaid", variant: "outline" },
  refunded: { label: "Refunded", variant: "destructive" },
}

type ReturnStatusBadgeProps = {
  status: AnySalesStatus
}

/** Universal status badge for Sales Order / Return / Invoice payment statuses. */
export function ReturnStatusBadge({ status }: ReturnStatusBadgeProps) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
