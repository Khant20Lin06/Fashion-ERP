"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { BasicPermissionMatrix } from "@/components/admin/BasicPermissionMatrix"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionMatrix } from "@/components/admin/PermissionMatrix"
import { usePermissions } from "../hooks/usePermissions"
import { useRoles, useUpdateRolePermissions } from "../hooks/useRoles"
import type { Permission, Role } from "../types"

/** Role Permission Matrix — pick a role, toggle real permission grants
 * (full-replace via PUT /roles/:id/permissions), save. */
export function PermissionTable() {
  const { data: roles } = useRoles()
  const [selectedRoleId, setRoleId] = useState<string | undefined>(undefined)
  const roleId = selectedRoleId ?? roles?.[0]?.id

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-xl flex-1">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="h-11 w-full rounded-xl">
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
        <RolePermissionEditor role={roles?.find((r) => r.id === roleId)} key={roleId} />
      )}
    </div>
  )
}

function RolePermissionEditor({ role }: { role: Role | undefined }) {
  const { data: permissions, isLoading, isError, refetch } = usePermissions()
  const updatePermissions = useUpdateRolePermissions(role?.id ?? "")

  if (isLoading || !permissions) return <Skeleton className="h-96 w-full" />
  if (isError) return <ErrorState message="Couldn't load permissions." onRetry={refetch} />
  if (!role) return null

  return <RolePermissionMatrixForm role={role} permissions={permissions} onSave={(ids) => updatePermissions.mutate(ids)} isSaving={updatePermissions.isPending} />
}

function RolePermissionMatrixForm({
  role,
  permissions,
  onSave,
  isSaving,
}: {
  role: Role
  permissions: Permission[]
  onSave: (permissionIds: string[]) => void
  isSaving: boolean
}) {
  const [grantedIds, setGrantedIds] = useState<Set<string>>(
    () => new Set(permissions.filter((p) => role.permissionCodes.includes(p.code)).map((p) => p.id)),
  )

  function handleToggle(permissionId: string, checked: boolean) {
    setGrantedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(permissionId)
      else next.delete(permissionId)
      return next
    })
  }

  function handleToggleGroup(permissionIds: string[], checked: boolean) {
    setGrantedIds((prev) => {
      const next = new Set(prev)
      for (const permissionId of permissionIds) {
        if (checked) next.add(permissionId)
        else next.delete(permissionId)
      }
      return next
    })
  }

  const grantedCodes = permissions.filter((p) => grantedIds.has(p.id)).map((p) => p.code)

  return (
    <Tabs defaultValue="basic" className="flex flex-col gap-4">
      <Card className="rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-4 border-b border-border/60">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">{role.name} Permissions</CardTitle>
                <Badge variant="outline">{grantedIds.size} selected</Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Manage permissions with a simple module view or switch to advanced resource-level control.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
              <TabsList className="h-11 w-full rounded-xl sm:w-auto">
                <TabsTrigger value="basic" className="px-4">Basic</TabsTrigger>
                <TabsTrigger value="advanced" className="px-4">Advanced</TabsTrigger>
              </TabsList>
              <Button className="h-11 rounded-xl sm:px-5" onClick={() => onSave(Array.from(grantedIds))} disabled={isSaving}>
                <Save /> Save Permissions
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <TabsContent value="basic" className="mt-0">
            <BasicPermissionMatrix permissions={permissions} grantedIds={grantedIds} onToggleGroup={handleToggleGroup} />
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            <PermissionMatrix permissions={permissions} grantedCodes={grantedCodes} onToggle={handleToggle} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  )
}
