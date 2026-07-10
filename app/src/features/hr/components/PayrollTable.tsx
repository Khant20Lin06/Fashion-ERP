"use client"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { LeaveStatusBadge } from "@/components/hr/LeaveStatusBadge"
import { formatCurrency } from "@/lib/format"
import { usePayrollEntries, useUpdatePayrollStatus } from "../hooks/usePayroll"
import type { PayrollEntry, PayrollStatus } from "../types"

const nextStatus: Partial<Record<PayrollStatus, PayrollStatus>> = {
  draft: "hr_reviewed",
  hr_reviewed: "finance_approved",
  finance_approved: "paid",
}

const nextStatusLabel: Partial<Record<PayrollStatus, string>> = {
  draft: "HR Review",
  hr_reviewed: "Finance Approve",
  finance_approved: "Mark Paid",
}

/** Payroll table — Employee/Basic/Allowance/Bonus/Deduction/Net Salary/Status with workflow actions. */
export function PayrollTable() {
  const { data, isLoading, isError, refetch } = usePayrollEntries()
  const { mutate: updateStatus, isPending } = useUpdatePayrollStatus()

  const columns: DataTableColumnDef<PayrollEntry>[] = [
    {
      accessorKey: "employeeName",
      header: ({ column }) => <ColumnHeader column={column} title="Employee" />,
    },
    {
      accessorKey: "basicSalary",
      header: ({ column }) => <ColumnHeader column={column} title="Basic Salary" />,
      cell: ({ row }) => formatCurrency(row.getValue("basicSalary")),
    },
    {
      accessorKey: "allowance",
      header: ({ column }) => <ColumnHeader column={column} title="Allowance" />,
      cell: ({ row }) => formatCurrency(row.getValue("allowance")),
    },
    {
      accessorKey: "bonus",
      header: ({ column }) => <ColumnHeader column={column} title="Bonus" />,
      cell: ({ row }) => formatCurrency(row.getValue("bonus")),
    },
    {
      accessorKey: "deduction",
      header: ({ column }) => <ColumnHeader column={column} title="Deduction" />,
      cell: ({ row }) => formatCurrency(row.getValue("deduction")),
    },
    {
      accessorKey: "netSalary",
      header: ({ column }) => <ColumnHeader column={column} title="Net Salary" />,
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.getValue("netSalary"))}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <LeaveStatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const upcoming = nextStatus[row.original.status]
        if (!upcoming) return null
        return (
          <Button size="sm" variant="outline" onClick={() => updateStatus({ id: row.original.id, status: upcoming })} disabled={isPending}>
            {nextStatusLabel[row.original.status]}
          </Button>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search payroll..."
      exportFilename="payroll"
      emptyTitle="No payroll entries"
      emptyDescription="Payroll records will appear here once generated."
    />
  )
}
