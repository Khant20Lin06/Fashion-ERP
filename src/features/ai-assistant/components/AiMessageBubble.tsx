"use client"

import { Fragment, useState, type ReactNode } from "react"
import { Bot, Check, Copy, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/format"
import type { AiChatSource, AiMessage } from "../types"

type AiMessageBubbleProps = {
  message: AiMessage
  sources?: AiChatSource[]
}

type MarkdownBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "unordered-list"; items: string[] }
  | { kind: "ordered-list"; items: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "code"; language: string | null; content: string }

function isTableSeparator(line: string): boolean {
  const normalized = line.trim()
  return /^\|?[\s:-]+\|[\s|:-]*$/.test(normalized)
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n")
  const blocks: MarkdownBlock[] = []

  for (let i = 0; i < lines.length; ) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i += 1
      continue
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || null
      const codeLines: string[] = []
      i += 1

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i += 1
      }

      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i += 1
      }

      blocks.push({
        kind: "code",
        language,
        content: codeLines.join("\n").trimEnd(),
      })
      continue
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed)
    if (headingMatch) {
      blocks.push({
        kind: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      })
      i += 1
      continue
    }

    if (trimmed.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headers = parseTableCells(line)
      const rows: string[][] = []
      i += 2

      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim()) {
        rows.push(parseTableCells(lines[i]))
        i += 1
      }

      blocks.push({ kind: "table", headers, rows })
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""))
        i += 1
      }
      blocks.push({ kind: "unordered-list", items })
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""))
        i += 1
      }
      blocks.push({ kind: "ordered-list", items })
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""))
        i += 1
      }
      blocks.push({ kind: "quote", lines: quoteLines })
      continue
    }

    const paragraphLines: string[] = []
    while (i < lines.length) {
      const current = lines[i].trim()
      if (
        !current ||
        current.startsWith("```") ||
        /^(#{1,3})\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current) ||
        /^>\s?/.test(current) ||
        (current.includes("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1]))
      ) {
        break
      }

      paragraphLines.push(lines[i].trim())
      i += 1
    }

    if (paragraphLines.length > 0) {
      blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") })
      continue
    }

    i += 1
  }

  return blocks
}

function renderInline(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)

  return tokens.filter(Boolean).map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-background/80 px-1 py-0.5 text-[0.9em] font-medium">
          {token.slice(1, -1)}
        </code>
      )
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index} className="font-semibold">{token.slice(2, -2)}</strong>
    }

    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
        >
          {linkMatch[1]}
        </a>
      )
    }

    return <Fragment key={index}>{token}</Fragment>
  })
}

function renderBlock(block: MarkdownBlock, key: number): ReactNode {
  switch (block.kind) {
    case "heading": {
      const className =
        block.level === 1
          ? "text-base font-semibold tracking-tight"
          : block.level === 2
            ? "text-sm font-semibold tracking-tight"
            : "text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      return (
        <div key={key} className={className}>
          {renderInline(block.text)}
        </div>
      )
    }
    case "paragraph":
      return (
        <p key={key} className="whitespace-pre-wrap leading-6">
          {renderInline(block.text)}
        </p>
      )
    case "unordered-list":
      return (
        <ul key={key} className="space-y-1 pl-5 leading-6 list-disc">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      )
    case "ordered-list":
      return (
        <ol key={key} className="space-y-1 pl-5 leading-6 list-decimal">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      )
    case "quote":
      return (
        <blockquote key={key} className="border-l-2 border-border/70 pl-3 italic text-muted-foreground">
          <div className="space-y-1">
            {block.lines.map((line, index) => (
              <p key={index}>{renderInline(line)}</p>
            ))}
          </div>
        </blockquote>
      )
    case "table":
      return (
        <div key={key} className="overflow-hidden rounded-lg border border-border/70 bg-background/80">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                {block.headers.map((header, index) => (
                  <TableHead key={index} className="h-9 px-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {renderInline(header)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="px-3 py-2 align-top whitespace-normal">
                      {renderInline(cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    case "code":
      return (
        <div key={key} className="overflow-hidden rounded-lg border border-border/60 bg-background/80">
          {block.language && (
            <div className="border-b border-border/60 px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {block.language}
            </div>
          )}
          <pre className="overflow-x-auto px-3 py-2 text-xs leading-5">
            <code>{block.content}</code>
          </pre>
        </div>
      )
  }
}

/** A single chat turn - user or assistant. TOOL/SYSTEM-role messages are
 * never persisted by the backend (confirmed against AiChatService), so
 * this only ever renders USER/ASSISTANT. */
export function AiMessageBubble({ message, sources }: AiMessageBubbleProps) {
  const isUser = message.role === "USER"
  const [copied, setCopied] = useState(false)
  const blocks = parseMarkdown(message.content)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success(isUser ? "Message copied" : "Reply copied")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Couldn't copy automatically")
    }
  }

  return (
    <div className={cn("flex gap-2 sm:gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "mt-1 flex size-7 shrink-0 items-center justify-center rounded-full sm:size-8",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </div>

      <div className={cn("flex max-w-[92%] flex-col gap-1.5 sm:max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm shadow-sm sm:px-4 sm:py-3",
            isUser ? "bg-primary text-primary-foreground" : "border border-border/70 bg-muted/60",
          )}
        >
          <div className="space-y-3">
            {blocks.map((block, index) => renderBlock(block, index))}
          </div>
        </div>

        <div className={cn("flex flex-wrap items-center gap-1", isUser && "flex-row-reverse")}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(message.createdAt)}</span>
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
      </div>
    </div>
  )
}
