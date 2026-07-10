import { Card, CardContent } from "@/components/ui/card"
import { LeaveStatusBadge } from "./LeaveStatusBadge"
import { formatCurrency } from "@/lib/format"
import type { PayrollEntry } from "@/features/hr/types"

type SalaryCardProps = {
  entry: PayrollEntry
}

/** Payroll summary card — Basic/Allowance/Bonus/Deduction breakdown and Net Salary, e.g. for ESS payslip view. */
export function SalaryCard({ entry }: SalaryCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{entry.period}</p>
          <LeaveStatusBadge status={entry.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-muted-foreground">Basic Salary</span>
          <span className="text-right">{formatCurrency(entry.basicSalary)}</span>
          <span className="text-muted-foreground">Allowance</span>
          <span className="text-right">{formatCurrency(entry.allowance)}</span>
          <span className="text-muted-foreground">Bonus</span>
          <span className="text-right">{formatCurrency(entry.bonus)}</span>
          <span className="text-muted-foreground">Deduction</span>
          <span className="text-right text-destructive">-{formatCurrency(entry.deduction)}</span>
          <span className="text-muted-foreground">Tax</span>
          <span className="text-right text-destructive">-{formatCurrency(entry.tax)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
          <span>Net Salary</span>
          <span>{formatCurrency(entry.netSalary)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
