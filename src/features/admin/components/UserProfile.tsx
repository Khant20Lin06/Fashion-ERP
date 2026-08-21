"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/admin/UserAvatar"
import { RoleBadge } from "@/components/admin/RoleBadge"
import { PermissionMatrix } from "@/components/admin/PermissionMatrix"
import { usePermissions } from "../hooks/usePermissions"
import { useRoles } from "../hooks/useRoles"
import type { AdminUser } from "../types"

type UserProfileProps = {
  user: AdminUser
}

/** User Detail page: header + Profile/Roles/Permissions tabs. A user can
 * hold multiple roles (no single roleId on the real User entity), so
 * Permissions here shows the union of all codes across the user's assigned
 * roles rather than a single role's matrix. Login History and Activity
 * tabs were removed — no backend endpoint exists for either (BACKEND GAP,
 * confirmed via source read; not fabricated). */
export function UserProfile({ user }: UserProfileProps) {
  const { data: roles, isLoading: loadingRoles } = useRoles()
  const { data: permissions, isLoading: loadingPermissions } = usePermissions()

  const userRoles = (roles ?? []).filter((r) => user.roleNames.includes(r.name))
  const grantedCodes = Array.from(new Set(userRoles.flatMap((r) => r.permissionCodes)))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <UserAvatar name={user.name} size="lg" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.email} · {user.companyNames.join(", ") || "No company assigned"}
            </p>
            <Badge className="capitalize">{user.status}</Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/admin/users/${user.id}/edit`}>
            <Pencil /> Edit User
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Email Verified</p>
                <p className="font-medium">{user.isEmailVerified ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Companies</p>
                <p className="font-medium">{user.companyNames.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Login</p>
                <p className="font-medium">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRoles ? (
                <Skeleton className="h-8 w-full" />
              ) : user.roleNames.length === 0 ? (
                <EmptyState title="No roles assigned" description="Assign a role from the Edit User page." />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.roleNames.map((name) => (
                    <RoleBadge key={name} roleName={name} isSystem />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          {loadingPermissions || !permissions ? (
            <Skeleton className="h-64 w-full" />
          ) : user.roleNames.length === 0 ? (
            <EmptyState title="No permissions" description="This user has no roles assigned yet." />
          ) : (
            <PermissionMatrix permissions={permissions} grantedCodes={grantedCodes} readOnly />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
