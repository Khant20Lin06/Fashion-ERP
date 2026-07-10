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
import { useLoginHistory, useUserActivity } from "../hooks/useUsers"
import { useRolePermissions } from "../hooks/useRoles"
import type { AdminUser } from "../types"

type UserProfileProps = {
  user: AdminUser
}

/** User Detail page: header + Profile/Roles/Permissions/Login History/Activity tabs. */
export function UserProfile({ user }: UserProfileProps) {
  const { data: loginHistory, isLoading: loadingHistory } = useLoginHistory(user.id)
  const { data: activity, isLoading: loadingActivity } = useUserActivity(user.id)
  const { data: rolePermissions, isLoading: loadingPermissions } = useRolePermissions(user.roleId)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <UserAvatar name={user.name} photoUrl={user.avatarUrl} size="lg" />
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {user.email} · {user.companyName}
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
          <TabsTrigger value="login-history">Login History</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{user.companyName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Branch</p>
                <p className="font-medium">{user.branchName}</p>
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
              <CardTitle className="text-base">Assigned Role</CardTitle>
            </CardHeader>
            <CardContent>
              <RoleBadge roleName={user.roleName} isSystem />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          {loadingPermissions || !rolePermissions ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <PermissionMatrix matrix={rolePermissions.matrix} readOnly />
          )}
        </TabsContent>

        <TabsContent value="login-history" className="mt-4">
          {loadingHistory ? (
            <Skeleton className="h-40 w-full" />
          ) : !loginHistory || loginHistory.length === 0 ? (
            <EmptyState title="No login history" description="Login attempts will appear here." />
          ) : (
            <div className="flex flex-col gap-2">
              {loginHistory.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {entry.device} · {entry.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.ipAddress} · {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={entry.success ? "default" : "destructive"}>
                      {entry.success ? "Success" : "Failed"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          {loadingActivity ? (
            <Skeleton className="h-40 w-full" />
          ) : !activity || activity.length === 0 ? (
            <EmptyState title="No activity" description="User activity will appear here." />
          ) : (
            <div className="flex flex-col gap-2">
              {activity.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.module}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
