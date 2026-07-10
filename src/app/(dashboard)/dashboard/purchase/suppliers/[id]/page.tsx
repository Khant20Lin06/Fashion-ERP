"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupplier } from "@/features/purchase/hooks/useSuppliers"
import { SupplierDetail } from "@/features/purchase/components/SupplierDetail"

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: supplier, isLoading, isError, refetch } = useSupplier(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this supplier." onRetry={refetch} />

  if (!supplier) {
    return <EmptyState title="Supplier not found" description="This supplier may have been deleted or moved." />
  }

  return <SupplierDetail supplier={supplier} />
}
