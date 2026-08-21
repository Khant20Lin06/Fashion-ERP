"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Plus, Send, Trash2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import { useAiChatStore } from "../stores/ai-chat.store"
import { useConversationMessages, useConversations, useDeleteConversation, useSendChatMessage } from "../hooks/useAiChat"
import { AiMessageBubble } from "./AiMessageBubble"
import type { AiChatMode, AiChatSource } from "../types"

const MODE_LABEL: Record<AiChatMode, string> = {
  remote_llm: "AI",
  local_llm: "Local Assistant",
  local_fallback: "Knowledge Search",
}

/**
 * AI Assistant chat panel — single, non-streaming request/response per
 * message (the real backend has no streaming support). Conversations
 * cannot be renamed (no such endpoint exists; the title is auto-set once
 * from the first message) and message history is capped at the
 * backend's AI_MAX_HISTORY_MESSAGES — older turns simply aren't
 * retrievable past that. Deleting a conversation is a real soft delete.
 */
export function AiAssistantPanel() {
  const isOpen = useAiChatStore((s) => s.isOpen)
  const setOpen = useAiChatStore((s) => s.setOpen)
  const activeConversationId = useAiChatStore((s) => s.activeConversationId)
  const setActiveConversationId = useAiChatStore((s) => s.setActiveConversationId)

  const { data: conversations, isLoading: loadingConversations, isError: conversationsError } = useConversations()
  const { data: messages, isLoading: loadingMessages, isError: messagesError } = useConversationMessages(
    activeConversationId,
  )
  const sendMessage = useSendChatMessage()
  const deleteConversation = useDeleteConversation()

  const [draft, setDraft] = useState("")
  const [pendingDelete, setPendingDelete] = useState<string | undefined>(undefined)
  const [lastSources, setLastSources] = useState<AiChatSource[]>([])
  const [lastMode, setLastMode] = useState<AiChatMode | undefined>(undefined)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, sendMessage.isPending])

  function handleSend() {
    const trimmed = draft.trim()
    if (!trimmed || sendMessage.isPending) return
    sendMessage.mutate(
      { message: trimmed, conversationId: activeConversationId },
      {
        onSuccess: (result) => {
          setActiveConversationId(result.conversation.id)
          setLastSources(result.sources)
          setLastMode(result.mode)
          setDraft("")
        },
      },
    )
  }

  function handleNewConversation() {
    setActiveConversationId(undefined)
    setLastSources([])
    setLastMode(undefined)
    setDraft("")
  }

  function handleDelete(id: string) {
    deleteConversation.mutate(id, {
      onSuccess: () => {
        if (activeConversationId === id) handleNewConversation()
      },
    })
    setPendingDelete(undefined)
  }

  const activeConversation = conversations?.find((c) => c.id === activeConversationId)

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-2xl"
        >

          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="size-5" /> AI Assistant
            </SheetTitle>
          </SheetHeader>

          <div className="flex min-h-0 flex-1">
            <div className="hidden min-h-0 w-48 shrink-0 flex-col border-r sm:flex">
              <div className="p-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewConversation}>
                  <Plus className="size-4" /> New chat
                </Button>
              </div>
              <ScrollArea className="flex-1">
                {loadingConversations ? (
                  <div className="flex flex-col gap-2 p-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : conversationsError ? (
                  <p className="p-3 text-xs text-muted-foreground">Couldn&apos;t load conversations.</p>
                ) : !conversations || conversations.length === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground">No conversations yet.</p>
                ) : (
                  <div className="flex flex-col gap-0.5 p-2">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setActiveConversationId(conversation.id)}
                        className={cn(
                          "group flex items-start justify-between gap-1 rounded-md px-2 py-1.5 text-left text-xs hover:bg-accent",
                          conversation.id === activeConversationId && "bg-accent",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {conversation.title || "Untitled conversation"}
                        </span>
                        <Trash2
                          className="size-3 shrink-0 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
                          onClick={(event) => {
                            event.stopPropagation()
                            setPendingDelete(conversation.id)
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <ScrollArea className="min-h-0 flex-1 px-4 py-3">
                {!activeConversationId ? (
                  <EmptyState
                    title="Ask the AI Assistant"
                    description="Ask about sales, inventory, payments, or financial reports — the assistant reads real data through the same permissions you have."
                    className="border-none"
                  />
                ) : loadingMessages ? (
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-3/4" />
                    ))}
                  </div>
                ) : messagesError ? (
                  <ErrorState message="Couldn't load this conversation." />
                ) : !messages || messages.length === 0 ? (
                  <EmptyState title="No messages yet" description="Send a message to start this conversation." className="border-none" />
                ) : (
                  <div className="flex flex-col gap-4">
                    {messages.map((message, index) => (
                      <AiMessageBubble
                        key={message.id}
                        message={message}
                        sources={index === messages.length - 1 ? lastSources : undefined}
                      />
                    ))}
                  </div>
                )}
                {sendMessage.isPending && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Bot className="size-4 animate-pulse" /> Thinking…
                  </div>
                )}
                <div ref={scrollRef} />
              </ScrollArea>

              {activeConversation && (
                <div className="flex items-center justify-between gap-2 border-t px-4 py-1.5 text-xs text-muted-foreground">
                  <span>Started {formatRelativeTime(activeConversation.createdAt)}</span>
                  {lastMode && (
                    <Badge variant="outline" className="font-normal">
                      {MODE_LABEL[lastMode]}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2 border-t p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask a question…"
                  rows={2}
                  className="resize-none"
                  maxLength={4000}
                />
                <Button size="icon" onClick={handleSend} disabled={!draft.trim() || sendMessage.isPending}>
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation and its message history will be removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingDelete && handleDelete(pendingDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
