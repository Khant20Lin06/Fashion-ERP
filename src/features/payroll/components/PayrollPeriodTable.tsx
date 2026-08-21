"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, PlayCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { PayrollPeriodStatusBadge } from "@/components/payroll/PayrollStatusBadge"
import { useCancelPayrollPeriod, useCreatePayrollRun, usePayrollPeriods } from "../hooks/usePayroll"
import type { PayrollPeriod } from "../types"

/** Payroll Periods list — create, cancel, and start a payroll run for an open period. */
export function PayrollPeriodTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = usePayrollPeriods()
  const cancelPeriod = useCancelPayrollPeriod()
  const createRun = useCreatePayrollRun()

  const [pendingCancel, setPendingCancel] = useState<PayrollPeriod | undefined>(undefined)

  function handleStartRun(period: PayrollPeriod) {
    createRun.mutate(period.id, {
      onSuccess: (run) => router.push(`/dashboard/hr/payroll/runs/${run.id}`),
    })
  }

  const columns: DataTableColumnDef<PayrollPeriod>[] = [
    {
      accessorKey: "periodNumber",
      header: ({ column }) => <ColumnHeader column={column} title="Period #" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("periodNumber")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Name" />,
    },
    {
      id: "dates",
      header: "Date Range",
      cell: ({ row }) => {
        const period = row.original
        return (
          <span className="text-xs text-muted-foreground">
            {new Date(period.startDate).toLocaleDateString()} – {new Date(period.endDate).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      accessorKey: "payDate",
      header: ({ column }) => <ColumnHeader column={column} title="Pay Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("payDate")).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <PayrollPeriodStatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const period = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Row actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {period.status === "OPEN" && (
                <DropdownMenuItem onClick={() => handleStartRun(period)} disabled={createRun.isPending}>
                  <PlayCircle /> Start Payroll Run
                </DropdownMenuItem>
              )}
              {(period.status === "OPEN" || period.status === "PROCESSING") && (
                <DropdownMenuItem variant="destructive" onClick={() => setPendingCancel(period)}>
                  <XCircle /> Cancel Period
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchPlaceholder="Search periods..."
        exportFilename="payroll-periods"
        emptyTitle="No payroll periods"
        emptyDescription="Create a payroll period to start a payroll run."
      />

      <AlertDialog open={!!pendingCancel} onOpenChange={(open) => !open && setPendingCancel(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this payroll period?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel <span className="font-medium">{pendingCancel?.name}</span>. If a payroll run has
              already been calculated or finalized for this period, cancel that run first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Period</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingCancel) cancelPeriod.mutate(pendingCancel.id)
                setPendingCancel(undefined)
              }}
            >
              Cancel Period
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
