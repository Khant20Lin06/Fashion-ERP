"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WebhookTable } from "@/features/webhooks/components/WebhookTable"
import { WebhookFormDialog } from "@/features/webhooks/components/WebhookForm"
import { WebhookSecretDialog } from "@/features/webhooks/components/WebhookSecretDialog"
import type { WebhookSubscriptionCreated } from "@/features/webhooks/types"

/**
 * Real backend capability: webhook subscription + delivery management
 * (erp-pos fashion api src/modules/webhooks). There is no generic
 * third-party integration marketplace (Telegram/Shopify/payment
 * providers/etc.) implemented anywhere on the backend — this page
 * represents that accurately rather than showing fake connector cards.
 */
export default function AdminIntegrationsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [createdWebhook, setCreatedWebhook] = useState<WebhookSubscriptionCreated | undefined>(undefined)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground">
            Send real-time event notifications to external systems.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Add Webhook
        </Button>
      </div>

      <WebhookTable />

      <WebhookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(created) => {
          setCreatedWebhook(created)
          setSecretDialogOpen(true)
        }}
      />
      <WebhookSecretDialog open={secretDialogOpen} onOpenChange={setSecretDialogOpen} webhook={createdWebhook} />
    </div>
  )
}
