"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDisconnectIntegration, useUpdateIntegration } from "../hooks/useSettings"
import type { Integration } from "../types"

type IntegrationConfigDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  integration?: Integration
}

/** Integration configuration dialog — API Key, Secret, Endpoint, connect/disconnect. */
export function IntegrationConfigDialog({ open, onOpenChange, integration }: IntegrationConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && integration && (
          <IntegrationConfigDialogContent onOpenChange={onOpenChange} integration={integration} key={integration.id} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function IntegrationConfigDialogContent({
  onOpenChange,
  integration,
}: {
  onOpenChange: (open: boolean) => void
  integration: Integration
}) {
  const [apiKey, setApiKey] = useState(integration.apiKey ?? "")
  const [secret, setSecret] = useState("")
  const [endpoint, setEndpoint] = useState(integration.endpoint ?? "")
  const updateIntegration = useUpdateIntegration()
  const disconnectIntegration = useDisconnectIntegration()

  function handleSave() {
    updateIntegration.mutate(
      { id: integration.id, values: { apiKey, endpoint } },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  function handleDisconnect() {
    disconnectIntegration.mutate(integration.id, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Configure {integration.name}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="api-key">API Key</Label>
          <Input id="api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="secret">Secret</Label>
          <Input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Enter secret" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endpoint">Endpoint</Label>
          <Input id="endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.example.com" />
        </div>
      </div>
      <DialogFooter className="flex items-center justify-between sm:justify-between">
        {integration.status === "connected" && (
          <Button type="button" variant="destructive" onClick={handleDisconnect} disabled={disconnectIntegration.isPending}>
            Disconnect
          </Button>
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateIntegration.isPending}>
            Save
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
