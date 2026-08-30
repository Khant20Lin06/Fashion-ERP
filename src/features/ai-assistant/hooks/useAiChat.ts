import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  deleteConversation,
  fetchAiModels,
  fetchConversationMessages,
  fetchConversations,
  sendChatMessage,
  type SendChatMessageInput,
} from "../api/ai-chat.api"

export function useConversations() {
  return useQuery({ queryKey: ["ai-assistant", "conversations"], queryFn: fetchConversations })
}

/** Static once the AI provider is configured — cached indefinitely for
 * the session rather than refetched on every panel open. */
export function useAiModels() {
  return useQuery({
    queryKey: ["ai-assistant", "models"],
    queryFn: fetchAiModels,
    staleTime: Infinity,
  })
}

export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["ai-assistant", "conversations", conversationId, "messages"],
    queryFn: () => fetchConversationMessages(conversationId as string),
    enabled: !!conversationId,
  })
}

export function useSendChatMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SendChatMessageInput) => sendChatMessage(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["ai-assistant", "conversations"] })
      queryClient.invalidateQueries({
        queryKey: ["ai-assistant", "conversations", result.conversation.id, "messages"],
      })
    },
    onError: (error) => toastApiError(error, "The assistant couldn't respond"),
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-assistant", "conversations"] })
      toast.success("Conversation deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete conversation"),
  })
}
