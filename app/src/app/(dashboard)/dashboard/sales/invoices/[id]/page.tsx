"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useInvoice } from "@/features/sales/hooks/useInvoice"
import { SalesInvoiceDetail } from "@/features/sales/components/SalesInvoiceDetail"

export default function SalesInvoiceDetailPage() {
  const params = useParams<{ id: string }>()
  const { data: invoice, isLoading, isError, refetch } = useInvoice(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this invoice." onRetry={refetch} />

  if (!invoice) {
    return <EmptyState title="Invoice not found" description="This invoice may have been deleted or moved." />
  }

  return <SalesInvoiceDetail invoice={invoice} />
}
