"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/features/products/hooks/useProducts"
import { ProductDetail } from "@/features/products/components/ProductDetail"

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: product, isLoading, isError, refetch } = useProduct(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load this product." onRetry={refetch} />
  }

  if (!product) {
    return <EmptyState title="Product not found" description="This product may have been deleted or moved." />
  }

  return <ProductDetail product={product} />
}
