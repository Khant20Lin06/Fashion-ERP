"use client"

import { useRouter } from "next/navigation"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { PayrollRunStatusBadge } from "@/components/payroll/PayrollStatusBadge"
import { formatCurrency, formatNumber } from "@/lib/format"
import { usePayrollRuns } from "../hooks/usePayroll"
import type { PayrollRun } from "../types"

/** Payroll Runs list — the primary /dashboard/hr/payroll runs view. Row click opens the run's calculate/review/finalize workflow. */
export function PayrollRunTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = usePayrollRuns()

  const columns: DataTableColumnDef<PayrollRun>[] = [
    {
      accessorKey: "runNumber",
      header: ({ column }) => <ColumnHeader column={column} title="Run #" />,
      cell: ({ row }) => (
        <button
          className="font-mono text-xs font-medium hover:underline"
          onClick={() => router.push(`/dashboard/hr/payroll/runs/${row.original.id}`)}
        >
          {row.getValue("runNumber")}
        </button>
      ),
    },
    {
      accessorKey: "employeeCount",
      header: ({ column }) => <ColumnHeader column={column} title="Employees" />,
      cell: ({ row }) => formatNumber(row.getValue("employeeCount")),
    },
    {
      accessorKey: "totalGrossPay",
      header: ({ column }) => <ColumnHeader column={column} title="Gross Pay" />,
      cell: ({ row }) => formatCurrency(Number(row.getValue("totalGrossPay"))),
    },
    {
      accessorKey: "totalDeductions",
      header: ({ column }) => <ColumnHeader column={column} title="Deductions" />,
      cell: ({ row }) => formatCurrency(Number(row.getValue("totalDeductions"))),
    },
    {
      accessorKey: "totalNetPay",
      header: ({ column }) => <ColumnHeader column={column} title="Net Pay" />,
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.getValue("totalNetPay")))}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <PayrollRunStatusBadge status={row.getValue("status")} />,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search runs..."
      exportFilename="payroll-runs"
      emptyTitle="No payroll runs"
      emptyDescription="Start a payroll run from an open payroll period."
    />
  )
}
