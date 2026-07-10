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
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
  type FilterValues,
} from "@/components/data-table"
import { EmployeeAvatar } from "@/components/hr/EmployeeAvatar"
import { useDepartments } from "../hooks/useOrganization"
import { useDeleteEmployee, useEmployees } from "../hooks/useEmployees"
import type { Employee, EmployeeStatus } from "../types"

const statusVariant: Record<EmployeeStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  on_leave: "secondary",
  suspended: "outline",
  terminated: "destructive",
}

/** Employee Master DataTable — the primary /hr/employees list view. */
export function EmployeeTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useEmployees()
  const { data: departments } = useDepartments()
  const { mutate: deleteEmployee } = useDeleteEmployee()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((employee) => {
      if (filters.department && employee.departmentId !== filters.department) return false
      if (filters.status && employee.status !== filters.status) return false
      return true
    })
  }, [data, filters])

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
    },
    {
      accessorKey: "designation",
      header: ({ column }) => <ColumnHeader column={column} title="Position" />,
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => <ColumnHeader column={column} title="Branch" />,
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
            <DropdownMenuItem variant="destructive" onClick={() => deleteEmployee(row.original.id)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
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
            { label: "On Leave", value: "on_leave" },
            { label: "Suspended", value: "suspended" },
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
  )
}
