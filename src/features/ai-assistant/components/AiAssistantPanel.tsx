"use client"

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import {
  Bot,
  CornerDownLeft,
  History,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Send,
  Trash2,
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buildNativeScrollbarClassName } from "@/components/ui/native-scrollbar.classes"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { SendChatMessageInput } from "../api/ai-chat.api"
import { useAiChatStore } from "../stores/ai-chat.store"
import {
  useAiModels,
  useConversationMessages,
  useConversations,
  useDeleteConversation,
  useSendChatMessage,
} from "../hooks/useAiChat"
import { AiMessageBubble } from "./AiMessageBubble"
import { AiModelPicker } from "./AiModelPicker"
import type { AiChatMode, AiChatSource, AiConversation } from "../types"

const MODE_LABEL: Record<AiChatMode, string> = {
  remote_llm: "AI",
  local_llm: "Local Assistant",
  local_fallback: "Knowledge Search",
}

const SUGGESTED_PROMPTS = [
  "Summarize today's sales performance and call out anything unusual.",
  "Which products are low on stock and need reordering soon?",
  "Show me overdue customer balances I should follow up on.",
  "What promotions or discounts affected margin the most this week?",
]

const DEFAULT_HISTORY_WIDTH = 240
const MIN_HISTORY_WIDTH = 220
const MAX_HISTORY_WIDTH = 360

type HistoryGroup = {
  label: "Today" | "Yesterday" | "Older"
  items: AiConversation[]
}

function getHistoryLabel(updatedAt: string): HistoryGroup["label"] {
  const updated = new Date(updatedAt)
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfUpdated = new Date(updated.getFullYear(), updated.getMonth(), updated.getDate())
  const diffMs = startOfToday.getTime() - startOfUpdated.getTime()
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays <= 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  return "Older"
}

function groupConversations(conversations: AiConversation[] | undefined): HistoryGroup[] {
  if (!conversations || conversations.length === 0) return []

  const grouped = new Map<HistoryGroup["label"], AiConversation[]>()
  for (const conversation of conversations) {
    const label = getHistoryLabel(conversation.updatedAt)
    const list = grouped.get(label) ?? []
    list.push(conversation)
    grouped.set(label, list)
  }

  return (["Today", "Yesterday", "Older"] as const)
    .map((label) => ({ label, items: grouped.get(label) ?? [] }))
    .filter((group) => group.items.length > 0)
}

function findFallbackConversationId(conversations: AiConversation[] | undefined, deletedId: string): string | undefined {
  if (!conversations || conversations.length <= 1) return undefined

  const index = conversations.findIndex((conversation) => conversation.id === deletedId)
  if (index === -1) return undefined

  return conversations[index + 1]?.id ?? conversations[index - 1]?.id
}

function getInitialHistoryWidth(): number {
  if (typeof window === "undefined") return DEFAULT_HISTORY_WIDTH

  const savedWidth = window.localStorage.getItem("ai-assistant-history-width")
  if (!savedWidth) return DEFAULT_HISTORY_WIDTH

  const parsed = Number(savedWidth)
  if (!Number.isFinite(parsed)) return DEFAULT_HISTORY_WIDTH

  return Math.min(MAX_HISTORY_WIDTH, Math.max(MIN_HISTORY_WIDTH, parsed))
}

type ConversationHistoryListProps = {
  groups: HistoryGroup[]
  activeConversationId: string | undefined
  onSelect: (id: string) => void
  onRequestDelete: (id: string) => void
  className?: string
}

function ConversationHistoryList({
  groups,
  activeConversationId,
  onSelect,
  onRequestDelete,
  className,
}: ConversationHistoryListProps) {
  if (groups.length === 0) {
    return <p className="p-3 text-xs text-muted-foreground">No conversations yet.</p>
  }

  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      <div className={buildNativeScrollbarClassName("min-h-0 h-full")}>
        <div className="space-y-4 p-2">
          {groups.map((group) => (
            <section key={group.label} className="space-y-1.5">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((conversation) => {
                  const isActive = conversation.id === activeConversationId
                  return (
                    <div
                      key={conversation.id}
                      role="button"
                      tabIndex={0}
                      title={conversation.title || "Untitled conversation"}
                      onClick={() => onSelect(conversation.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          onSelect(conversation.id)
                        }
                      }}
                      className={cn(
                        "group relative flex min-w-0 cursor-pointer items-start gap-2 overflow-hidden rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:bg-accent/70",
                        isActive && "border-border bg-accent/80 shadow-sm",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-9 w-0.5 shrink-0 rounded-full bg-transparent",
                          isActive && "bg-primary",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {conversation.title || "Untitled conversation"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Updated {formatRelativeTime(conversation.updatedAt)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className={cn(
                              "mt-0.5 shrink-0 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                              isActive && "opacity-100",
                            )}
                            onClick={(event) => event.stopPropagation()}
                            aria-label="Conversation actions"
                          >
                            <MoreHorizontal className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={(event) => {
                              event.preventDefault()
                              onRequestDelete(conversation.id)
                            }}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-background to-transparent" />
    </div>
  )
}

/**
 * AI Assistant chat panel - single, non-streaming request/response per
 * message (the real backend has no streaming support). Conversations
 * cannot be renamed (no such endpoint exists; the title is auto-set once
 * from the first message) and message history is capped at the
 * backend's AI_MAX_HISTORY_MESSAGES - older turns simply aren't
 * retrievable past that. Deleting a conversation is a real soft delete.
 */
export function AiAssistantPanel() {
  const isOpen = useAiChatStore((s) => s.isOpen)
  const setOpen = useAiChatStore((s) => s.setOpen)
  const activeConversationId = useAiChatStore((s) => s.activeConversationId)
  const setActiveConversationId = useAiChatStore((s) => s.setActiveConversationId)
  const selectedModel = useAiChatStore((s) => s.selectedModel)
  const setSelectedModel = useAiChatStore((s) => s.setSelectedModel)

  const { data: modelsData } = useAiModels()
  const {
    data: conversations,
    isLoading: loadingConversations,
    isError: conversationsError,
    refetch: refetchConversations,
  } = useConversations()
  const {
    data: messages,
    isLoading: loadingMessages,
    isError: messagesError,
    refetch: refetchMessages,
  } = useConversationMessages(activeConversationId)
  const sendMessage = useSendChatMessage()
  const deleteConversation = useDeleteConversation()

  const [draft, setDraft] = useState("")
  const [pendingDelete, setPendingDelete] = useState<string | undefined>(undefined)
  const [lastSources, setLastSources] = useState<AiChatSource[]>([])
  const [lastMode, setLastMode] = useState<AiChatMode | undefined>(undefined)
  const [lastAttempt, setLastAttempt] = useState<SendChatMessageInput | undefined>(undefined)
  const [mobileView, setMobileView] = useState<"chat" | "history">("chat")
  const [historyWidth, setHistoryWidth] = useState(getInitialHistoryWidth)
  const scrollRef = useRef<HTMLDivElement>(null)
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null)

  const historyGroups = useMemo(() => groupConversations(conversations), [conversations])
  const activeConversation = conversations?.find((c) => c.id === activeConversationId)
  const activeConversationTitle = activeConversation?.title || "Untitled conversation"
  const canSend = !!draft.trim() && !sendMessage.isPending
  const hasInlineRetry = sendMessage.isError && !!lastAttempt

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, sendMessage.isPending])

  useEffect(() => {
    window.localStorage.setItem("ai-assistant-history-width", String(historyWidth))
  }, [historyWidth])

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const resizeState = resizeStateRef.current
      if (!resizeState) return

      const nextWidth = resizeState.startWidth + (event.clientX - resizeState.startX)
      setHistoryWidth(Math.min(MAX_HISTORY_WIDTH, Math.max(MIN_HISTORY_WIDTH, nextWidth)))
    }

    function stopResizing() {
      resizeStateRef.current = null
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", stopResizing)
    window.addEventListener("pointercancel", stopResizing)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", stopResizing)
      window.removeEventListener("pointercancel", stopResizing)
    }
  }, [])

  function handleResizeStart(event: ReactPointerEvent<HTMLButtonElement>) {
    resizeStateRef.current = { startX: event.clientX, startWidth: historyWidth }
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  function resetHistoryWidth() {
    setHistoryWidth(DEFAULT_HISTORY_WIDTH)
  }

  function openConversation(id: string) {
    if (id !== activeConversationId) {
      setActiveConversationId(id)
    }
    setLastSources([])
    setLastMode(undefined)
    setMobileView("chat")
  }

  function submitMessage(input: SendChatMessageInput) {
    setLastAttempt(input)
    sendMessage.mutate(input, {
      onSuccess: (result) => {
        setActiveConversationId(result.conversation.id)
        setLastSources(result.sources)
        setLastMode(result.mode)
        setDraft("")
        setLastAttempt(undefined)
        setMobileView("chat")
      },
    })
  }

  function handleSend(overrideMessage?: string) {
    const trimmed = (overrideMessage ?? draft).trim()
    if (!trimmed || sendMessage.isPending) return

    submitMessage({
      message: trimmed,
      conversationId: activeConversationId,
      model: selectedModel,
    })
  }

  function handleNewConversation() {
    setActiveConversationId(undefined)
    setLastSources([])
    setLastMode(undefined)
    setLastAttempt(undefined)
    setDraft("")
    setMobileView("chat")
    sendMessage.reset()
  }

  function handleDelete(id: string) {
    const fallbackConversationId = activeConversationId === id ? findFallbackConversationId(conversations, id) : undefined

    deleteConversation.mutate(id, {
      onSuccess: () => {
        if (activeConversationId === id) {
          if (fallbackConversationId) {
            openConversation(fallbackConversationId)
          } else {
            handleNewConversation()
          }
        }
      },
    })
    setPendingDelete(undefined)
  }

  function renderChatArea() {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 px-3 py-3 sm:px-4 sm:py-4">
          {!activeConversationId ? (
            <div className="space-y-4">
              <EmptyState
                title="Ask the AI Assistant"
                description="Ask about sales, inventory, payments, or financial reports - the assistant reads real data through the same permissions you have."
                className="border-none"
              />
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Try one of these prompts
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      className="h-auto justify-start whitespace-normal rounded-xl px-3 py-2.5 text-left text-sm"
                      onClick={() => handleSend(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : loadingMessages ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-20 w-[78%] rounded-2xl" />
              <Skeleton className="ml-auto h-14 w-[56%] rounded-2xl" />
              <Skeleton className="h-28 w-[82%] rounded-2xl" />
            </div>
          ) : messagesError ? (
            <ErrorState
              title="Couldn't load this conversation"
              message="Try reloading the thread to continue where you left off."
              onRetry={() => {
                void refetchMessages()
              }}
            />
          ) : !messages || messages.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                title="No messages yet"
                description="Send a message to start this conversation."
                className="border-none"
              />
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.slice(0, 2).map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-auto rounded-xl whitespace-normal text-left"
                    onClick={() => handleSend(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
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
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Bot className="size-4 animate-pulse" /> Thinking...
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </ScrollArea>

        {activeConversation && (
          <div className="border-t px-3 py-2 sm:px-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
                title={activeConversationTitle}
              >
                {activeConversationTitle}
              </span>
              {lastMode && (
                <Badge variant="outline" className="shrink-0 font-normal">
                  {MODE_LABEL[lastMode]}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Started {formatRelativeTime(activeConversation.createdAt)}
            </p>
          </div>
        )}

        <div className="border-t bg-background/95 p-2.5 supports-backdrop-filter:backdrop-blur-sm sm:p-3">
          {hasInlineRetry && lastAttempt && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <span>The last message didn&apos;t go through.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7"
                onClick={() => submitMessage(lastAttempt)}
              >
                <RotateCcw className="size-3.5" />
                Retry
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-border/70 bg-background p-2 shadow-xs">
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(e) => {
                  if (sendMessage.isError) sendMessage.reset()
                  setDraft(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about sales, inventory, customers, or reports..."
                rows={2}
                className="min-h-24 resize-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                maxLength={4000}
              />
              <Button size="icon" className="mb-1 size-9 shrink-0" onClick={() => handleSend()} disabled={!canSend}>
                <Send className="size-4" />
              </Button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CornerDownLeft className="size-3" />
                <span className="hidden sm:inline">Enter to send, Shift+Enter for a new line</span>
                <span className="sm:hidden">Enter sends</span>
              </span>
              <span>{draft.length}/4000</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 bg-background/95 supports-backdrop-filter:backdrop-blur-sm data-[side=right]:w-full data-[side=right]:sm:max-w-3xl"
        >
          <SheetHeader className="flex-row items-center justify-between gap-2 border-b px-3 py-3 pr-14 space-y-0 sm:px-4 sm:pr-16">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="size-5" /> AI Assistant
            </SheetTitle>
            {modelsData && modelsData.models.length > 1 && (
              <AiModelPicker
                models={modelsData.models}
                value={selectedModel ?? modelsData.defaultModel ?? undefined}
                onChange={setSelectedModel}
              />
            )}
          </SheetHeader>

          <div className="flex items-center gap-2 border-b px-3 py-2 sm:hidden">
            <Button variant="outline" size="sm" className="flex-1 justify-start" onClick={handleNewConversation}>
              <Plus className="size-4" /> New chat
            </Button>
            <Button
              variant={mobileView === "history" ? "default" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setMobileView((current) => (current === "history" ? "chat" : "history"))}
            >
              <History className="size-4" /> History
            </Button>
          </div>

          <div className="flex min-h-0 flex-1">
            <div
              className="hidden min-h-0 shrink-0 flex-col overflow-hidden border-r sm:flex"
              style={{ width: historyWidth }}
            >
              <div className="p-2.5">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleNewConversation}>
                  <Plus className="size-4" /> New chat
                </Button>
              </div>

              {loadingConversations ? (
                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : conversationsError ? (
                <div className="p-2">
                  <ErrorState
                    title="Couldn't load conversations"
                    message="Refresh the list to reopen a previous thread."
                    onRetry={() => {
                      void refetchConversations()
                    }}
                    className="px-3 py-8"
                  />
                </div>
              ) : (
                <ConversationHistoryList
                  groups={historyGroups}
                  activeConversationId={activeConversationId}
                  onSelect={openConversation}
                  onRequestDelete={setPendingDelete}
                />
              )}
            </div>

            <div className="relative hidden w-3 shrink-0 items-stretch justify-center sm:flex">
              <button
                type="button"
                aria-label="Resize chat history sidebar"
                title="Drag to resize history sidebar. Double-click to reset width."
                className="group absolute inset-y-0 left-1/2 flex w-3 -translate-x-1/2 items-center justify-center"
                onPointerDown={handleResizeStart}
                onDoubleClick={resetHistoryWidth}
              >
                <span className="h-full w-px rounded-full bg-border transition-colors group-hover:bg-foreground/30 group-active:bg-primary" />
                <span className="absolute h-12 w-1.5 rounded-full bg-border/80 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100" />
              </button>
            </div>

            <div className={cn("min-h-0 flex-1 sm:hidden", mobileView === "history" ? "flex" : "hidden")}>
              {loadingConversations ? (
                <div className="flex w-full flex-col gap-2 p-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
                </div>
              ) : conversationsError ? (
                <div className="w-full p-3">
                  <ErrorState
                    title="Couldn't load conversations"
                    message="Refresh the list to reopen a previous thread."
                    onRetry={() => {
                      void refetchConversations()
                    }}
                  />
                </div>
              ) : (
                <ConversationHistoryList
                  groups={historyGroups}
                  activeConversationId={activeConversationId}
                  onSelect={openConversation}
                  onRequestDelete={setPendingDelete}
                  className="w-full"
                />
              )}
            </div>

            <div className={cn("min-h-0 flex-1", mobileView === "history" ? "hidden sm:flex" : "flex")}>
              {renderChatArea()}
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
