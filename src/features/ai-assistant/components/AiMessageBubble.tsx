import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { AiChatSource, AiMessage } from "../types"

type AiMessageBubbleProps = {
  message: AiMessage
  sources?: AiChatSource[]
}

/** A single chat turn — user or assistant. TOOL/SYSTEM-role messages are
 * never persisted by the backend (confirmed against AiChatService), so
 * this only ever renders USER/ASSISTANT. */
export function AiMessageBubble({ message, sources }: AiMessageBubbleProps) {
  const isUser = message.role === "USER"

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>
      <div className={cn("flex max-w-[85%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {message.content}
        </div>
        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sources.map((source) => (
              <span
                key={`${source.documentId}-${source.chunkIndex}`}
                className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                title={source.title}
              >
                {source.title}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-muted-foreground">{formatRelativeTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
