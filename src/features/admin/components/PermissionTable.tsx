"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PermissionMatrix } from "@/components/admin/PermissionMatrix"
import { useRoles, useRolePermissions, useUpdateRolePermissions } from "../hooks/useRoles"
import type { PermissionAction, PermissionMatrixRow, RolePermissions } from "../types"

/** Advanced Permission Matrix — pick a role, toggle Module x Action grants, save. */
export function PermissionTable() {
  const { data: roles } = useRoles()
  const [selectedRoleId, setRoleId] = useState<string | undefined>(undefined)
  const roleId = selectedRoleId ?? roles?.[0]?.id

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm flex-1">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {(roles ?? []).map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!roleId ? (
        <EmptyState title="Select a role" description="Choose a role above to view and edit its permissions." />
      ) : (
        <RolePermissionEditor roleId={roleId} key={roleId} />
      )}
    </div>
  )
}

function RolePermissionEditor({ roleId }: { roleId: string }) {
  const { data: rolePermissions, isLoading } = useRolePermissions(roleId)
  const updatePermissions = useUpdateRolePermissions(roleId)

  if (isLoading || !rolePermissions) {
    return <Skeleton className="h-96 w-full" />
  }

  return <RolePermissionMatrixForm rolePermissions={rolePermissions} onSave={(matrix) => updatePermissions.mutate(matrix)} isSaving={updatePermissions.isPending} />
}

function RolePermissionMatrixForm({
  rolePermissions,
  onSave,
  isSaving,
}: {
  rolePermissions: RolePermissions
  onSave: (matrix: PermissionMatrixRow[]) => void
  isSaving: boolean
}) {
  const [matrix, setMatrix] = useState(rolePermissions.matrix)

  function handleToggle(module: string, action: PermissionAction, checked: boolean) {
    setMatrix((prev) =>
      prev.map((row) => (row.module === module ? { ...row, actions: { ...row.actions, [action]: checked } } : row))
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => onSave(matrix)} disabled={isSaving}>
          <Save /> Save Permissions
        </Button>
      </div>
      <PermissionMatrix matrix={matrix} onToggle={handleToggle} />
    </div>
  )
}
