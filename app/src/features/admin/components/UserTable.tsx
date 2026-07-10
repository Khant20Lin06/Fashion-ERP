"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { UserAvatar } from "@/components/admin/UserAvatar"
import { RoleBadge, AdminUserStatusBadge } from "@/components/admin/RoleBadge"
import { useCompanies } from "../hooks/useRoles"
import { useDeleteUser, useUsers } from "../hooks/useUsers"
import type { AdminUser } from "../types"

/** Admin User Management DataTable — the primary /dashboard/admin/users list view. */
export function UserTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useUsers()
  const { data: companies } = useCompanies()
  const { mutate: deleteUser } = useDeleteUser()
  const [filters, setFilters] = useState<FilterValues>({})

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((user) => {
      if (filters.company && user.companyId !== filters.company) return false
      if (filters.status && user.status !== filters.status) return false
      return true
    })
  }, [data, filters])

  const columns: DataTableColumnDef<AdminUser>[] = [
    {
      id: "avatar",
      header: "Avatar",
      enableSorting: false,
      cell: ({ row }) => <UserAvatar name={row.original.name} photoUrl={row.original.avatarUrl} />,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <ColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:underline"
          onClick={() => router.push(`/dashboard/admin/users/${row.original.id}`)}
        >
          {row.getValue("name")}
        </button>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <ColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "roleName",
      header: ({ column }) => <ColumnHeader column={column} title="Role" />,
      cell: ({ row }) => <RoleBadge roleName={row.getValue("roleName")} />,
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => <ColumnHeader column={column} title="Company" />,
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => <ColumnHeader column={column} title="Branch" />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <AdminUserStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "lastLoginAt",
      header: ({ column }) => <ColumnHeader column={column} title="Last Login" />,
      cell: ({ row }) => {
        const value = row.getValue<string | undefined>("lastLoginAt")
        return value ? new Date(value).toLocaleString() : <span className="text-muted-foreground">Never</span>
      },
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
            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/users/${row.original.id}`)}>
              <Eye /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/users/${row.original.id}/edit`)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => deleteUser(row.original.id)}>
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
      searchPlaceholder="Search users..."
      filterFields={[
        {
          key: "company",
          label: "Company",
          options: (companies ?? []).map((c) => ({ label: c.name, value: c.id })),
        },
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Locked", value: "locked" },
            { label: "Pending", value: "pending" },
          ],
        },
      ]}
      filterValues={filters}
      onFilterChange={setFilters}
      exportFilename="users"
      emptyTitle="No users found"
      emptyDescription="Add your first user to get started."
    />
  )
}
