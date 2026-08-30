import { apiClient } from "@/lib/api/client"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { env } from "@/config/env"
import type { AiChatMode, AiChatResult, AiConversation, AiMessage } from "../types"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Real routes (erp-pos fashion api src/modules/ai-assistant):
//   POST   /ai/chat                        permission ai_assistant.chat
//   GET    /ai/conversations               permission ai_assistant.conversations.read
//   GET    /ai/conversations/:id           permission ai_assistant.conversations.read
//   GET    /ai/conversations/:id/messages  permission ai_assistant.conversations.read
//   DELETE /ai/conversations/:id           permission ai_assistant.conversations.delete
// DataScope-enforced (companyId resolved server-side, never trusted
// directly); every query additionally filters by the caller's own
// userId — conversations are private per-user, not shared within a
// company. There is no PATCH/rename endpoint at all.

type BackendAiConversation = {
  id: string
  companyId: string
  branchId: string | null
  title: string | null
  createdAt: string
  updatedAt: string
}

type BackendAiMessage = {
  id: string
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL"
  content: string
  toolCalls: unknown
  toolResults: unknown
  model: string | null
  createdAt: string
}

type BackendAiChatSource = {
  documentId: string
  title: string
  chunkIndex: number
}

type BackendAiChatResponse = {
  conversation: BackendAiConversation
  message: BackendAiMessage
  sources: BackendAiChatSource[]
  mode: AiChatMode
}

function mapConversation(b: BackendAiConversation): AiConversation {
  return { ...b }
}

function mapMessage(b: BackendAiMessage): AiMessage {
  return { id: b.id, role: b.role, content: b.content, model: b.model, createdAt: b.createdAt }
}

export async function fetchConversations(): Promise<AiConversation[]> {
  if (USE_MOCK) return delay([])
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendAiConversation[]; meta: unknown }>("/ai/conversations", {
    params: { companyId, limit: 50 },
  })
  return (data.data ?? []).map(mapConversation)
}

export async function fetchConversationMessages(conversationId: string): Promise<AiMessage[]> {
  if (USE_MOCK) return delay([])
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.get<{ data: BackendAiMessage[] }>(
    `/ai/conversations/${conversationId}/messages`,
    { params: { companyId } },
  )
  return (data.data ?? []).map(mapMessage)
}

export async function deleteConversation(conversationId: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  const companyId = await resolveCompanyId()
  await apiClient.delete(`/ai/conversations/${conversationId}`, { params: { companyId } })
}

export type AiModelInfo = {
  id: string
  name: string
  /** Null when the provider's catalog doesn't expose pricing — never
   * estimated. A genuinely free model has 0 here, not null. */
  promptPricePerMillionTokens: number | null
  completionPricePerMillionTokens: number | null
}

export type AiModelsResult = {
  /** The remote provider's own live catalog (e.g. OpenRouter's full
   * ~400-model list with real pricing) — never a hardcoded subset. */
  models: AiModelInfo[]
  defaultModel: string | null
}

// GET /ai/chat/models — permission ai_assistant.chat (same as sending a
// message). Empty `models` means the deployment has no remote tier
// configured (or the live catalog fetch failed) — the frontend should
// hide the picker rather than offer a dropdown with nothing selectable.
export async function fetchAiModels(): Promise<AiModelsResult> {
  if (USE_MOCK) return delay({ models: [], defaultModel: null })
  const { data } = await apiClient.get<AiModelsResult>("/ai/chat/models")
  return data
}

export type SendChatMessageInput = {
  message: string
  conversationId?: string
  /** Must be one of fetchAiModels()'s `models` or the backend silently
   * falls back to its own default — never trust this as a real selection
   * without that list already having offered it. */
  model?: string
}

export async function sendChatMessage(input: SendChatMessageInput): Promise<AiChatResult> {
  if (USE_MOCK) {
    const now = new Date().toISOString()
    return delay({
      conversation: {
        id: input.conversationId ?? `aiconv-mock`,
        companyId: "company-mock",
        branchId: null,
        title: input.message.slice(0, 100),
        createdAt: now,
        updatedAt: now,
      },
      message: {
        id: `aimsg-mock-${Date.now()}`,
        role: "ASSISTANT",
        content:
          "This is a mock response — set NEXT_PUBLIC_USE_MOCK_AUTH=false to reach the real backend, which now always answers (remote LLM, local LLM, or a deterministic ERP-data fallback) even with no external AI credentials configured.",
        model: "mock",
        createdAt: now,
      },
      sources: [],
      mode: "local_fallback",
    })
  }
  const companyId = await resolveCompanyId()
  const { data } = await apiClient.post<BackendAiChatResponse>("/ai/chat", {
    message: input.message,
    conversationId: input.conversationId,
    companyId,
    model: input.model,
  })
  return {
    conversation: mapConversation(data.conversation),
    message: mapMessage(data.message),
    sources: data.sources.map((s) => ({ ...s })),
    mode: data.mode,
  }
}
