"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useSupplier } from "@/features/purchase/hooks/useSuppliers"
import { SupplierForm } from "@/features/purchase/components/SupplierForm"

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>()
  const { data: supplier, isLoading, isError, refetch } = useSupplier(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this supplier." onRetry={refetch} />

  if (!supplier) {
    return <EmptyState title="Supplier not found" description="This supplier may have been deleted or moved." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Supplier</h1>
        <p className="text-sm text-muted-foreground">{supplier.name}</p>
      </div>
      <SupplierForm supplier={supplier} />
    </div>
  )
}
