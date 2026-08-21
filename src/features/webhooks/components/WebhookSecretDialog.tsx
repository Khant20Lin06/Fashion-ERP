"use client"

import { useState } from "react"
import { Copy, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { WebhookSubscriptionCreated } from "../types"

type WebhookSecretDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook: WebhookSubscriptionCreated | undefined
}

/**
 * One-time signing-secret reveal, shown only immediately after
 * POST /webhooks succeeds. The real backend never returns this secret
 * again through any other endpoint (GET list/detail and PATCH all use a
 * response shape with no `secret` field at all — confirmed against the
 * actual DTOs) — so this dialog is architecturally the only place in the
 * whole app this value can ever be displayed. It is never persisted to
 * component state outside this dialog's own props, never written to
 * localStorage/sessionStorage, and never logged.
 */
export function WebhookSecretDialog({ open, onOpenChange, webhook }: WebhookSecretDialogProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!webhook) return
    try {
      await navigator.clipboard.writeText(webhook.secret)
      setCopied(true)
      toast.success("Secret copied to clipboard")
    } catch {
      toast.error("Couldn't copy automatically — please select and copy the value manually.")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setCopied(false)
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-warning" /> Webhook Signing Secret
          </DialogTitle>
          <DialogDescription>
            This secret is shown only once and cannot be retrieved again. Copy it now and store it securely —
            you&apos;ll use it to verify the authenticity of incoming webhook requests.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input readOnly value={webhook?.secret ?? ""} className="font-mono text-xs" />
          <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label="Copy secret">
            <Copy className="size-4" />
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} disabled={!copied}>
            {copied ? "Done" : "Copy the secret to continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
