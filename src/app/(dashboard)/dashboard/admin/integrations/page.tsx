"use client"

import { useState } from "react"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { IntegrationCard } from "@/features/admin/components/IntegrationCard"
import { IntegrationConfigDialog } from "@/features/admin/components/IntegrationConfigDialog"
import { useIntegrations } from "@/features/admin/hooks/useSettings"
import type { Integration } from "@/features/admin/types"

export default function AdminIntegrationsPage() {
  const { data, isLoading, isError, refetch } = useIntegrations()
  const [configuring, setConfiguring] = useState<Integration | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleConfigure(integration: Integration) {
    setConfiguring(integration)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integration Management</h1>
        <p className="text-sm text-muted-foreground">Connect payment gateways, accounting, HR, and e-commerce systems.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Couldn't load integrations." onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} onConfigure={handleConfigure} />
          ))}
        </div>
      )}

      <IntegrationConfigDialog open={dialogOpen} onOpenChange={setDialogOpen} integration={configuring} />
    </div>
  )
}
