"use client"

import { Shield, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { useDeleteRole, useRoles } from "../hooks/useRoles"
import type { Role } from "../types"

type RoleMatrixProps = {
  onEdit: (role: Role) => void
}

/** Role list — Name, Description, Permission Groups, User Count, Status. */
export function RoleMatrix({ onEdit }: RoleMatrixProps) {
  const { data, isLoading, isError, refetch } = useRoles()
  const { mutate: deleteRole } = useDeleteRole()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load roles." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No roles found" description="Create your first role to get started." />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((role) => (
        <Card key={role.id}>
          <CardContent className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Shield className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{role.name}</p>
                <Badge variant={role.status === "active" ? "default" : "outline"} className="shrink-0">
                  {role.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{role.description}</p>
              <div className="flex flex-wrap gap-1">
                {role.permissionGroups.map((group) => (
                  <Badge key={group} variant="secondary" className="text-xs capitalize">
                    {group}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{formatNumber(role.userCount)} users</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Role actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(role)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                {!role.isSystem && (
                  <DropdownMenuItem variant="destructive" onClick={() => deleteRole(role.id)}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
