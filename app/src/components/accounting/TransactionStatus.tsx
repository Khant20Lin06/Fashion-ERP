import { Badge } from "@/components/ui/badge"
import type {
  ExpenseStatus,
  FinancePaymentStatus,
  JournalStatus,
  ReceivableStatus,
} from "@/features/accounting/types"

type AnyTransactionStatus = JournalStatus | FinancePaymentStatus | ExpenseStatus | ReceivableStatus

const config: Record<AnyTransactionStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  submitted: { label: "Submitted", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  posted: { label: "Posted", variant: "default" },
  created: { label: "Created", variant: "outline" },
  paid: { label: "Paid", variant: "default" },
  reconciled: { label: "Reconciled", variant: "default" },
  manager_approved: { label: "Manager Approved", variant: "secondary" },
  finance_approved: { label: "Finance Approved", variant: "secondary" },
  rejected: { label: "Rejected", variant: "destructive" },
  partial: { label: "Partial", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  overdue: { label: "Overdue", variant: "destructive" },
}

type TransactionStatusProps = {
  status: AnyTransactionStatus
}

/** Universal status badge for Journal / Payment / Expense / Receivable-Payable statuses. */
export function TransactionStatus({ status }: TransactionStatusProps) {
  const { label, variant } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}
