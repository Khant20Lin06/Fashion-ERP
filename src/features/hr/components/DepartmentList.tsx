"use client"

import { useState } from "react"
import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/format"
import { useDeleteDepartment, useDepartments } from "../hooks/useOrganization"
import type { Department } from "../types"

type DepartmentListProps = {
  onEdit: (department: Department) => void
}

/** Department management grid - Name, Code, Employee count, Status. */
export function DepartmentList({ onEdit }: DepartmentListProps) {
  const { data, isLoading, isError, refetch } = useDepartments()
  const deleteDepartment = useDeleteDepartment()
  const [pendingDelete, setPendingDelete] = useState<Department | undefined>(undefined)

  async function confirmDelete() {
    if (!pendingDelete) return
    await deleteDepartment.mutateAsync(pendingDelete.id)
    setPendingDelete(undefined)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load departments." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No departments found" description="Create your first department to get started." />
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((department) => (
          <Card key={department.id}>
            <CardContent className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{department.name}</p>
                  <Badge variant={department.status === "active" ? "default" : "outline"} className="shrink-0">
                    {department.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{department.code || "-"}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(department.employeeCount)} employees</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Department actions">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(department)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPendingDelete(department)} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this department?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `This will permanently remove "${pendingDelete.name}" if it is not referenced by employee assignments.`
                : "This will permanently remove the selected department."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDepartment.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteDepartment.isPending}>
              {deleteDepartment.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
