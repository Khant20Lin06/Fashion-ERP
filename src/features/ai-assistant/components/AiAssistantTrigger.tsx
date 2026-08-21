"use client"

import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/auth.store"
import { hasPermission } from "@/types/user"
import { useAiChatStore } from "../stores/ai-chat.store"

/** Header trigger for the AI Assistant panel — only shown to users who
 * actually hold ai_assistant.chat (mapped from the real permission code
 * via ACTION_MAP's "chat" -> "create" entry). */
export function AiAssistantTrigger() {
  const user = useAuthStore((s) => s.user)
  const setOpen = useAiChatStore((s) => s.setOpen)
  const canChat = hasPermission(user, "ai_assistant", "create")

  if (!canChat) return null

  return (
    <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open AI Assistant">
      <Bot className="size-5" />
    </Button>
  )
}
