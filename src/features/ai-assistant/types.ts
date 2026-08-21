/** Core domain types for the AI Assistant chat feature. Mirrors the real
 * backend contract exactly (erp-pos fashion api
 * src/modules/ai-assistant) — confirmed via direct controller/DTO reads
 * and live curl verification during the Phase 19.1 hybrid-provider pass.
 *
 * Confirmed constraints that shape this UI:
 * - Single, non-streaming JSON response per message — no token streaming.
 * - No rename/title-update endpoint; the title is auto-set by the
 *   backend from the first ~100 characters of the first message and
 *   never changes after that.
 * - GET .../messages returns a flat, non-paginated array capped at
 *   AI_MAX_HISTORY_MESSAGES (backend default 20) — older messages become
 *   unreachable past that cap.
 * - DELETE is a soft delete (204), the conversation just stops appearing
 *   in list/detail afterward.
 * - Tool-permission denial is invisible at the HTTP layer — it only
 *   surfaces as natural-language content in the assistant's reply.
 * - As of Phase 19.1, POST /ai/chat is backed by a hybrid provider
 *   (remote LLM -> optional local LLM -> deterministic local fallback)
 *   and always returns a real, non-fabricated reply with no external AI
 *   credentials configured — `mode` on the response tells the frontend
 *   which tier actually answered. A 500 from this endpoint now means a
 *   genuine hard failure (fallback explicitly disabled and every tier
 *   failed, or the tool-call round limit was exceeded), not "no API key."
 */

export type AiMessageRole = "USER" | "ASSISTANT" | "SYSTEM" | "TOOL"

/** Which HybridLlmProvider tier produced a given reply — purely
 * informational, never affects what the assistant is allowed to do. */
export type AiChatMode = "remote_llm" | "local_llm" | "local_fallback"

export type AiMessage = {
  id: string
  role: AiMessageRole
  content: string
  model: string | null
  createdAt: string
}

export type AiConversation = {
  id: string
  companyId: string
  branchId: string | null
  title: string | null
  createdAt: string
  updatedAt: string
}

export type AiChatSource = {
  documentId: string
  title: string
  chunkIndex: number
}

export type AiChatResult = {
  conversation: AiConversation
  message: AiMessage
  sources: AiChatSource[]
  mode: AiChatMode
}
