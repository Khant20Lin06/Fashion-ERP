"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { PayrollComponentTypeBadge } from "@/components/payroll/PayrollStatusBadge"
import { formatCurrency, formatPercent } from "@/lib/format"
import {
  useDeletePayrollComponent,
  usePayrollComponents,
  useSetPayrollComponentActive,
} from "../hooks/usePayroll"
import { PayrollComponentFormDialog } from "./PayrollComponentForm"
import type { PayrollComponent } from "../types"

function formatComponentValue(component: PayrollComponent): string {
  if (component.calculationType === "FIXED_AMOUNT") {
    return formatCurrency(Number(component.fixedAmount ?? 0))
  }
  return formatPercent(Number(component.percentage ?? 0))
}

/** Payroll Components management table — earning/deduction/employer-contribution master data. */
export function PayrollComponentTable() {
  const { data, isLoading, isError, refetch } = usePayrollComponents()
  const setActive = useSetPayrollComponentActive()
  const deleteComponent = useDeletePayrollComponent()

  const [editing, setEditing] = useState<PayrollComponent | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PayrollComponent | undefined>(undefined)

  function openEdit(component: PayrollComponent) {
    setEditing(component)
    setFormOpen(true)
  }

  const columns: DataTableColumnDef<PayrollComponent>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Name" />,
    },
    {
      accessorKey: "code",
      header: ({ column }) => <ColumnHeader column={column} title="Code" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("code")}</span>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <ColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <PayrollComponentTypeBadge type={row.getValue("type")} />,
    },
    {
      id: "value",
      header: "Value",
      cell: ({ row }) => formatComponentValue(row.original),
    },
    {
      accessorKey: "isTaxable",
      header: ({ column }) => <ColumnHeader column={column} title="Taxable" />,
      cell: ({ row }) => (row.getValue("isTaxable") ? "Yes" : "No"),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <ColumnHeader column={column} title="Active" />,
      cell: ({ row }) => (
        <Switch
          checked={row.getValue("isActive")}
          onCheckedChange={(checked) => setActive.mutate({ id: row.original.id, isActive: checked })}
          disabled={setActive.isPending}
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(row.original)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
        searchPlaceholder="Search components..."
        exportFilename="payroll-components"
        emptyTitle="No payroll components"
        emptyDescription="Add earning, deduction, or employer-contribution components."
      />

      <PayrollComponentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(undefined)
        }}
        component={editing}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this payroll component?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{pendingDelete?.name}</span>. Components
              referenced by employee assignments or payroll history cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteComponent.mutate(pendingDelete.id)
                setPendingDelete(undefined)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
