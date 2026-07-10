"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomer } from "@/features/sales/hooks/useCustomers"
import { CustomerDetail } from "@/features/sales/components/CustomerDetail"

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: customer, isLoading, isError, refetch } = useCustomer(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this customer." onRetry={refetch} />

  if (!customer) {
    return <EmptyState title="Customer not found" description="This customer may have been deleted or moved." />
  }

  return <CustomerDetail customer={customer} />
}
