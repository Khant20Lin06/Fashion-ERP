"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateWebhook, useUpdateWebhook } from "../hooks/useWebhooks"
import { WEBHOOK_EVENT_TYPES } from "../types"
import type { WebhookSubscription, WebhookSubscriptionCreated } from "../types"

type WebhookFormValues = {
  url: string
  description: string
  events: string[]
  isActive: boolean
}

type WebhookFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook?: WebhookSubscription
  /** Fired only after a successful CREATE, with the one-time secret — the
   * caller is responsible for showing it exactly once (see
   * WebhookSecretDialog). Never fired on edit, since PATCH never returns
   * a secret. */
  onCreated?: (created: WebhookSubscriptionCreated) => void
}

function defaultValuesFor(webhook: WebhookSubscription | undefined): WebhookFormValues {
  return {
    url: webhook?.url ?? "",
    description: webhook?.description ?? "",
    events: webhook?.events ?? [],
    isActive: webhook?.isActive ?? true,
  }
}

/** Create/edit dialog for a Webhook Subscription. Only "payment.confirmed"
 * is a real, subscribable event today — the checklist intentionally shows
 * only that option rather than a full event catalog, since no other event
 * type exists on the backend yet. */
export function WebhookFormDialog({ open, onOpenChange, webhook, onCreated }: WebhookFormDialogProps) {
  const createWebhook = useCreateWebhook()
  const updateWebhook = useUpdateWebhook(webhook?.id ?? "")
  const isEditing = !!webhook

  const form = useForm<WebhookFormValues>({ defaultValues: defaultValuesFor(webhook) })

  useEffect(() => {
    if (open) form.reset(defaultValuesFor(webhook))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, webhook])

  function onSubmit(values: WebhookFormValues) {
    if (isEditing) {
      updateWebhook.mutate(
        { url: values.url, description: values.description, events: values.events, isActive: values.isActive },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }
    createWebhook.mutate(
      { url: values.url, description: values.description, events: values.events },
      {
        onSuccess: (created) => {
          onOpenChange(false)
          onCreated?.(created)
        },
      },
    )
  }

  const isPending = createWebhook.isPending || updateWebhook.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Webhook" : "New Webhook"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="url"
              rules={{ required: "URL is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endpoint URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/webhooks/erp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this webhook for?" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="events"
              rules={{ validate: (value) => value.length > 0 || "Select at least one event" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Events</FormLabel>
                  <div className="flex flex-col gap-2 rounded-lg border p-3">
                    {WEBHOOK_EVENT_TYPES.map((eventType) => (
                      <div key={eventType} className="flex items-center gap-2">
                        <Checkbox
                          id={`event-${eventType}`}
                          checked={field.value.includes(eventType)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, eventType]
                                : field.value.filter((e: string) => e !== eventType),
                            )
                          }
                        />
                        <label htmlFor={`event-${eventType}`} className="font-mono text-sm">
                          {eventType}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <FormLabel className="font-normal">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? "Save Changes" : "Create Webhook"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
