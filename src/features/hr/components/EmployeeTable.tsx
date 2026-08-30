"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
  type FilterValues,
} from "@/components/data-table"
import { EmployeeAvatar } from "@/components/hr/EmployeeAvatar"
import { useDepartments } from "../hooks/useOrganization"
import {
  useActivateEmployee,
  useDeleteEmployee,
  useDestroyEmployee,
  useEmployees,
  useTerminateEmployee,
} from "../hooks/useEmployees"
import type { Employee, EmployeeStatus } from "../types"

const statusVariant: Record<EmployeeStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  inactive: "outline",
  terminated: "destructive",
}

type EmployeeStatusAction = "activate" | "deactivate" | "terminate" | "destroy"

/** Employee Master DataTable — the primary /hr/employees list view. */
export function EmployeeTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useEmployees()
  const { data: departments } = useDepartments()
  const activateEmployee = useActivateEmployee()
  const deactivateEmployee = useDeleteEmployee()
  const destroyEmployee = useDestroyEmployee()
  const terminateEmployee = useTerminateEmployee()
  const [filters, setFilters] = useState<FilterValues>({})
  const [pendingAction, setPendingAction] = useState<{ employee: Employee; action: EmployeeStatusAction } | undefined>()

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((employee) => {
      if (filters.department && employee.departmentId !== filters.department) return false
      if (filters.status && employee.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  const isActionPending =
    activateEmployee.isPending ||
    deactivateEmployee.isPending ||
    destroyEmployee.isPending ||
    terminateEmployee.isPending

  function confirmStatusAction() {
    if (!pendingAction) return

    const onSuccess = () => setPendingAction(undefined)
    if (pendingAction.action === "activate") {
      activateEmployee.mutate(pendingAction.employee.id, { onSuccess })
      return
    }
    if (pendingAction.action === "terminate") {
      terminateEmployee.mutate(pendingAction.employee.id, { onSuccess })
      return
    }
    if (pendingAction.action === "destroy") {
      destroyEmployee.mutate(pendingAction.employee.id, { onSuccess })
      return
    }
    deactivateEmployee.mutate(pendingAction.employee.id, { onSuccess })
  }

  function actionLabel(action: EmployeeStatusAction) {
    if (action === "activate") return "Activate"
    if (action === "destroy") return "Delete Permanently"
    if (action === "terminate") return "Terminate"
    return "Archive"
  }

  function actionDescription(employee: Employee, action: EmployeeStatusAction) {
    if (action === "activate") {
      return `${employee.name} will become active again. This does not create a new employee record.`
    }
    if (action === "terminate") {
      return `${employee.name} will be marked as terminated. This is a status change, not a permanent delete.`
    }
    if (action === "destroy") {
      return `${employee.name} will be permanently deleted. This cannot be undone. Only inactive or terminated employees with no linked user, assignment, attendance, leave, payroll, or sales-account records can pass the strict delete guard.`
    }
    return `${employee.name} will be archived and marked inactive. This is a status change, not a permanent delete.`
  }

  const columns: DataTableColumnDef<Employee>[] = [
    {
      id: "photo",
      header: "Photo",
      enableSorting: false,
      cell: ({ row }) => <EmployeeAvatar name={row.original.name} photoUrl={row.original.photoUrl} />,
    },
    {
      accessorKey: "employeeCode",
      header: ({ column }) => <ColumnHeader column={column} title="Employee ID" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("employeeCode")}</span>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => router.push(`/dashboard/hr/employees/${row.original.id}`)}
        >
          {row.getValue("name")}
        </button>
      ),
    },
    {
      accessorKey: "departmentName",
      header: ({ column }) => <ColumnHeader column={column} title="Department" />,
      cell: ({ row }) => row.original.departmentName || <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      accessorKey: "designation",
      header: ({ column }) => <ColumnHeader column={column} title="Position" />,
      cell: ({ row }) => row.original.designation || <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => <ColumnHeader column={column} title="Branch" />,
      cell: ({ row }) => row.original.branchName || <span className="text-muted-foreground">Unassigned</span>,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => <ColumnHeader column={column} title="Phone" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue<EmployeeStatus>("status")
        return (
          <Badge variant={statusVariant[status]} className="capitalize">
            {status.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "joiningDate",
      header: ({ column }) => <ColumnHeader column={column} title="Joining Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("joiningDate")).toLocaleDateString(),
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/hr/employees/${row.original.id}`)}>
              <Eye /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/hr/employees/${row.original.id}/edit`)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            {row.original.status !== "active" ? (
              <DropdownMenuItem disabled={isActionPending} onClick={() => setPendingAction({ employee: row.original, action: "activate" })}>
                Activate
              </DropdownMenuItem>
            ) : null}
            {row.original.status === "active" ? (
              <DropdownMenuItem
                variant="destructive"
                disabled={isActionPending}
                onClick={() => setPendingAction({ employee: row.original, action: "deactivate" })}
              >
                <Trash2 /> Archive
              </DropdownMenuItem>
            ) : null}
            {row.original.status !== "terminated" ? (
              <DropdownMenuItem
                variant="destructive"
                disabled={isActionPending}
                onClick={() => setPendingAction({ employee: row.original, action: "terminate" })}
              >
                Terminate
              </DropdownMenuItem>
            ) : null}
            {row.original.status !== "active" ? (
              <DropdownMenuItem
                variant="destructive"
                disabled={isActionPending}
                onClick={() => setPendingAction({ employee: row.original, action: "destroy" })}
              >
                <Trash2 /> Delete Permanently
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchPlaceholder="Search employees..."
        filterFields={[
          {
            key: "department",
            label: "Department",
            options: (departments ?? []).map((d) => ({ label: d.name, value: d.id })),
          },
          {
            key: "status",
            label: "Status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Terminated", value: "terminated" },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={setFilters}
        exportFilename="employees"
        emptyTitle="No employees found"
        emptyDescription="Add your first employee to get started."
      />

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open && !isActionPending) setPendingAction(undefined)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction ? `${actionLabel(pendingAction.action)} employee?` : "Update employee status?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction ? actionDescription(pendingAction.employee, pendingAction.action) : "This will update the employee status only."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusAction} disabled={isActionPending}>
              {pendingAction ? actionLabel(pendingAction.action) : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
