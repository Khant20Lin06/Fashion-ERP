"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/features/admin/hooks/useUsers"
import { UserForm } from "@/features/admin/components/UserForm"

export default function EditUserPage() {
  const params = useParams<{ id: string }>()
  const { data: user, isLoading, isError, refetch } = useUser(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this user." onRetry={refetch} />

  if (!user) {
    return <EmptyState title="User not found" description="This user may have been removed." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit User</h1>
        <p className="text-sm text-muted-foreground">{user.name}</p>
      </div>
      <UserForm user={user} />
    </div>
  )
}
