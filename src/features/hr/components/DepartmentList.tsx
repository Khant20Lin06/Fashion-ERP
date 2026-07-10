"use client"

import { Building2, MoreHorizontal, Pencil } from "lucide-react"
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
import { useDepartments } from "../hooks/useOrganization"
import type { Department } from "../types"

type DepartmentListProps = {
  onEdit: (department: Department) => void
}

/** Department management grid — Name, Code, Manager, Employee count, Status. */
export function DepartmentList({ onEdit }: DepartmentListProps) {
  const { data, isLoading, isError, refetch } = useDepartments()

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
              <p className="font-mono text-xs text-muted-foreground">{department.code}</p>
              {department.managerName && <p className="text-xs text-muted-foreground">Manager: {department.managerName}</p>}
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
                  <Pencil /> Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
