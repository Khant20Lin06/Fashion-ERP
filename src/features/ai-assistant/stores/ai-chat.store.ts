import { create } from "zustand"

type AiChatState = {
  isOpen: boolean
  activeConversationId: string | undefined
  /** undefined = use the backend's own default (AI_CHAT_MODEL) — only
   * ever set to a value that came from GET /ai/chat/models. */
  selectedModel: string | undefined
  setOpen: (open: boolean) => void
  setActiveConversationId: (id: string | undefined) => void
  setSelectedModel: (model: string | undefined) => void
}

export const useAiChatStore = create<AiChatState>((set) => ({
  isOpen: false,
  activeConversationId: undefined,
  selectedModel: undefined,
  setOpen: (isOpen) => set({ isOpen }),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
}))
