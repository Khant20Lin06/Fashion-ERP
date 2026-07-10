"use client"

import { useMemo, useState } from "react"
import { ChevronRight, Landmark } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { useAccounts } from "@/features/accounting/hooks/useAccounts"
import type { Account } from "@/features/accounting/types"

type AccountNode = Account & { children: AccountNode[] }

function buildTree(accounts: Account[]): AccountNode[] {
  const nodes = new Map<string, AccountNode>(accounts.map((a) => [a.id, { ...a, children: [] }]))
  const roots: AccountNode[] = []
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function AccountRow({ node, depth, onSelect }: { node: AccountNode; depth: number; onSelect?: (account: Account) => void }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="group flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 hover:bg-accent/50"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect?.(node)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
          className={cn("flex size-5 items-center justify-center", !hasChildren && "invisible")}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        </button>
        <Landmark className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{node.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{node.code}</span>
        {node.status === "inactive" && (
          <Badge variant="outline" className="text-xs">
            Inactive
          </Badge>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{formatCurrency(node.balance)}</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <AccountRow key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

type AccountTreeProps = {
  onSelect?: (account: Account) => void
}

/** Chart of Accounts tree — Assets/Liabilities/Equity/Income/Expenses with nested sub-accounts. */
export function AccountTree({ onSelect }: AccountTreeProps) {
  const { data, isLoading, isError, refetch } = useAccounts()
  const tree = useMemo(() => buildTree(data ?? []), [data])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load chart of accounts." onRetry={refetch} />

  if (tree.length === 0) {
    return <EmptyState title="No accounts yet" description="Create your first account to get started." />
  }

  return (
    <div className="rounded-lg border p-2">
      {tree.map((node) => (
        <AccountRow key={node.id} node={node} depth={0} onSelect={onSelect} />
      ))}
    </div>
  )
}
