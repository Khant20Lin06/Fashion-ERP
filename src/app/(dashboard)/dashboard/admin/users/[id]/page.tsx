"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/features/admin/hooks/useUsers"
import { UserProfile } from "@/features/admin/components/UserProfile"

export default function AdminUserProfilePage() {
  const params = useParams<{ id: string }>()
  const { data: user, isLoading, isError, refetch } = useUser(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this user." onRetry={refetch} />

  if (!user) {
    return <EmptyState title="User not found" description="This user may have been removed." />
  }

  return <UserProfile user={user} />
}
