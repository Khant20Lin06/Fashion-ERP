"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useProduct } from "@/features/products/hooks/useProducts"
import { ProductForm } from "@/features/products/components/ProductForm"

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const { data: product, isLoading, isError, refetch } = useProduct(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load this product." onRetry={refetch} />
  }

  if (!product) {
    return <EmptyState title="Product not found" description="This product may have been deleted or moved." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
        <p className="text-sm text-muted-foreground">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
