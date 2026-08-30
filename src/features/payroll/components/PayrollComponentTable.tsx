"use client"

import { useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

function getDeleteBlockReason(component: PayrollComponent): string | null {
  if (component.canDelete) return null

  const reasons: string[] = []
  if (component.assignmentCount > 0) {
    reasons.push(`${component.assignmentCount} employee assignment${component.assignmentCount === 1 ? "" : "s"}`)
  }
  if (component.historyCount > 0) {
    reasons.push(`${component.historyCount} payroll history row${component.historyCount === 1 ? "" : "s"}`)
  }

  return reasons.length > 0 ? `In use by ${reasons.join(" and ")}` : "Referenced by payroll data"
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

  function handleEditDialogChange(open: boolean) {
    setFormOpen(open)
    if (!open) setEditing(undefined)
  }

  function handleDeleteDialogChange(open: boolean) {
    if (!open) setPendingDelete(undefined)
  }

  function confirmDelete() {
    if (!pendingDelete?.canDelete) {
      setPendingDelete(undefined)
      return
    }
    deleteComponent.mutate(pendingDelete.id, {
      onSettled: () => setPendingDelete(undefined),
    })
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
      cell: ({ row }) => {
        const deleteBlockReason = getDeleteBlockReason(row.original)

        return (
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
            {deleteBlockReason ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{deleteBlockReason}</DropdownMenuLabel>
                <DropdownMenuItem variant="destructive" disabled>
                  <Trash2 /> Delete unavailable
                </DropdownMenuItem>
              </>
            ) : (
            <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(row.original)}>
              <Trash2 /> Delete
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
        searchPlaceholder="Search components..."
        exportFilename="payroll-components"
        emptyTitle="No payroll components"
        emptyDescription="Add earning, deduction, or employer-contribution components."
      />

      {formOpen && (
        <PayrollComponentFormDialog open={formOpen} onOpenChange={handleEditDialogChange} component={editing} />
      )}

      {pendingDelete && (
        <AlertDialog open onOpenChange={handleDeleteDialogChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this payroll component?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove <span className="font-medium">{pendingDelete.name}</span>. Components
                referenced by employee assignments or payroll history cannot be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteComponent.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={!pendingDelete.canDelete || deleteComponent.isPending} onClick={confirmDelete}>
                {deleteComponent.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
