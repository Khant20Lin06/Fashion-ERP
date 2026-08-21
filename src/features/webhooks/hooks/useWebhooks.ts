import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createWebhook,
  deleteWebhook,
  fetchWebhookById,
  fetchWebhookDeliveries,
  fetchWebhooks,
  testWebhook,
  updateWebhook,
  type CreateWebhookInput,
  type UpdateWebhookInput,
} from "../api/webhook.api"

export function useWebhooks() {
  return useQuery({ queryKey: ["webhooks"], queryFn: fetchWebhooks })
}

export function useWebhook(id: string | undefined) {
  return useQuery({
    queryKey: ["webhooks", id],
    queryFn: () => fetchWebhookById(id as string),
    enabled: !!id,
  })
}

export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CreateWebhookInput) => createWebhook(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] })
      toast.success("Webhook created")
    },
    onError: (error) => toastApiError(error, "Failed to create webhook"),
  })
}

export function useUpdateWebhook(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UpdateWebhookInput) => updateWebhook(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] })
      toast.success("Webhook updated")
    },
    onError: (error) => toastApiError(error, "Failed to update webhook"),
  })
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] })
      toast.success("Webhook deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete webhook"),
  })
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: (id: string) => testWebhook(id),
    onError: (error) => toastApiError(error, "Failed to send test event"),
  })
}

export function useWebhookDeliveries(webhookId: string | undefined) {
  return useQuery({
    queryKey: ["webhooks", webhookId, "deliveries"],
    queryFn: () => fetchWebhookDeliveries(webhookId as string),
    enabled: !!webhookId,
  })
}
