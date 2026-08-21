"use client"

import { useState } from "react"
import { Calculator, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { PayrollRunStatusBadge } from "@/components/payroll/PayrollStatusBadge"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  useCalculatePayrollRun,
  useCancelPayrollRun,
  useFinalizePayrollRun,
  usePayrollRunEmployees,
} from "../hooks/usePayroll"
import type { PayrollRun, PayrollRunEmployee } from "../types"

type PayrollRunDetailProps = {
  run: PayrollRun
}

/**
 * Payroll Run workflow: DRAFT -> Calculate -> CALCULATED -> Finalize ->
 * FINALIZED (terminal). Only these transitions exist on the real backend
 * (POST .../calculate, .../finalize, .../cancel) — there is no re-
 * calculate on an already-CALCULATED run and no un-finalize; every total
 * shown here is exactly what the backend computed and returned, never
 * recalculated client-side.
 */
export function PayrollRunDetail({ run }: PayrollRunDetailProps) {
  const { data: employees, isLoading: loadingEmployees } = usePayrollRunEmployees(run.id)
  const calculate = useCalculatePayrollRun()
  const finalize = useFinalizePayrollRun()
  const cancelRun = useCancelPayrollRun()
  const [confirmFinalize, setConfirmFinalize] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const columns: DataTableColumnDef<PayrollRunEmployee>[] = [
    {
      accessorKey: "employeeCodeSnapshot",
      header: ({ column }) => <ColumnHeader column={column} title="Employee Code" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("employeeCodeSnapshot")}</span>,
    },
    {
      accessorKey: "employeeNameSnapshot",
      header: ({ column }) => <ColumnHeader column={column} title="Employee" />,
    },
    {
      accessorKey: "departmentSnapshot",
      header: ({ column }) => <ColumnHeader column={column} title="Department" />,
      cell: ({ row }) => row.getValue("departmentSnapshot") ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "baseSalarySnapshot",
      header: ({ column }) => <ColumnHeader column={column} title="Base Salary" />,
      cell: ({ row }) => formatCurrency(Number(row.getValue("baseSalarySnapshot"))),
    },
    {
      accessorKey: "grossPay",
      header: ({ column }) => <ColumnHeader column={column} title="Gross Pay" />,
      cell: ({ row }) => formatCurrency(Number(row.getValue("grossPay"))),
    },
    {
      accessorKey: "totalDeductions",
      header: ({ column }) => <ColumnHeader column={column} title="Deductions" />,
      cell: ({ row }) => formatCurrency(Number(row.getValue("totalDeductions"))),
    },
    {
      accessorKey: "netPay",
      header: ({ column }) => <ColumnHeader column={column} title="Net Pay" />,
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.getValue("netPay")))}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{run.runNumber}</h1>
            <PayrollRunStatusBadge status={run.status} />
          </div>
          <p className="text-sm text-muted-foreground">{formatNumber(run.employeeCount)} employees</p>
        </div>
        <div className="flex gap-2">
          {run.status === "DRAFT" && (
            <Button onClick={() => calculate.mutate(run.id)} disabled={calculate.isPending}>
              <Calculator /> Calculate
            </Button>
          )}
          {run.status === "CALCULATED" && (
            <Button onClick={() => setConfirmFinalize(true)} disabled={finalize.isPending}>
              <CheckCircle2 /> Finalize
            </Button>
          )}
          {(run.status === "DRAFT" || run.status === "CALCULATED") && (
            <Button variant="outline" onClick={() => setConfirmCancel(true)} disabled={cancelRun.isPending}>
              <XCircle /> Cancel Run
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gross Pay</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(Number(run.totalGrossPay))}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(Number(run.totalDeductions))}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Net Pay</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatCurrency(Number(run.totalNetPay))}</CardContent>
        </Card>
      </div>

      {run.status === "DRAFT" ? (
        <EmptyState
          title="Not calculated yet"
          description="Run Calculate to generate payslips for every active employee with resolvable compensation as of the period start date."
        />
      ) : (
        <DataTable
          columns={columns}
          data={employees}
          isLoading={loadingEmployees}
          searchPlaceholder="Search employees..."
          exportFilename={`${run.runNumber}-employees`}
          emptyTitle="No payslips"
          emptyDescription="No employees were included in this run."
        />
      )}

      <AlertDialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize this payroll run?</AlertDialogTitle>
            <AlertDialogDescription>
              Finalizing locks every payslip in this run and closes the payroll period. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                finalize.mutate(run.id)
                setConfirmFinalize(false)
              }}
            >
              Finalize
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this payroll run?</AlertDialogTitle>
            <AlertDialogDescription>
              This discards the run and reopens its payroll period. You can start a new run for the same period
              afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Run</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cancelRun.mutate(run.id)
                setConfirmCancel(false)
              }}
            >
              Cancel Run
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
