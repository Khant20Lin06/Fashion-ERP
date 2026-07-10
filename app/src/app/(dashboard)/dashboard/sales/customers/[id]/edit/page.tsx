"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomer } from "@/features/sales/hooks/useCustomers"
import { CustomerForm } from "@/features/sales/components/CustomerForm"

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>()
  const { data: customer, isLoading, isError, refetch } = useCustomer(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this customer." onRetry={refetch} />

  if (!customer) {
    return <EmptyState title="Customer not found" description="This customer may have been deleted or moved." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Customer</h1>
        <p className="text-sm text-muted-foreground">{customer.name}</p>
      </div>
      <CustomerForm customer={customer} />
    </div>
  )
}
