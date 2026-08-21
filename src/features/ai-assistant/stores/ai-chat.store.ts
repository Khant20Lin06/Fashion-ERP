import { create } from "zustand"

type AiChatState = {
  isOpen: boolean
  activeConversationId: string | undefined
  setOpen: (open: boolean) => void
  setActiveConversationId: (id: string | undefined) => void
}

export const useAiChatStore = create<AiChatState>((set) => ({
  isOpen: false,
  activeConversationId: undefined,
  setOpen: (isOpen) => set({ isOpen }),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
}))
