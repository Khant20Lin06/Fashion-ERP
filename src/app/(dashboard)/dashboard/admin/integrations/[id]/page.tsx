"use client"

import { useParams } from "next/navigation"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { WebhookActiveBadge } from "@/components/webhooks/WebhookStatusBadge"
import { useWebhook } from "@/features/webhooks/hooks/useWebhooks"
import { WebhookDeliveryTable } from "@/features/webhooks/components/WebhookDeliveryTable"

export default function WebhookDeliveriesPage() {
  const params = useParams<{ id: string }>()
  const { data: webhook, isLoading, isError, refetch } = useWebhook(params.id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load this webhook." onRetry={refetch} />

  if (!webhook) {
    return <EmptyState title="Webhook not found" description="This webhook may have been deleted." />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-mono">{webhook.url}</h1>
          <p className="text-sm text-muted-foreground">
            Subscribed to: <span className="font-mono">{webhook.events.join(", ")}</span>
          </p>
        </div>
        <WebhookActiveBadge isActive={webhook.isActive} />
      </div>

      <WebhookDeliveryTable webhookId={webhook.id} />
    </div>
  )
}
