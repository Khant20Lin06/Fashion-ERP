"use client"

import { useMemo, useState } from "react"
import { ChevronRight, FolderTree, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useCategories, useDeleteCategory } from "../hooks/useCategories"
import type { Category } from "../types"

type CategoryNode = Category & { children: CategoryNode[] }

function buildTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(categories.map((c) => [c.id, { ...c, children: [] }]))
  const roots: CategoryNode[] = []
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function CategoryRow({
  node,
  depth,
  onEdit,
  onAddChild,
}: {
  node: CategoryNode
  depth: number
  onEdit: (category: Category) => void
  onAddChild: (parentId: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const { mutate: deleteCategory } = useDeleteCategory()
  const hasChildren = node.children.length > 0

  return (
    <div>
      <div
        className="group flex items-center gap-1.5 rounded-md py-1.5 pr-2 hover:bg-accent/50"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn("flex size-5 items-center justify-center", !hasChildren && "invisible")}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        </button>
        <FolderTree className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{node.name}</span>
        {!node.isActive && (
          <Badge variant="outline" className="text-xs">
            Inactive
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">({node.productCount})</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-7 opacity-0 group-hover:opacity-100"
              aria-label="Category actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddChild(node.id)}>
              <Plus /> Add sub-category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => deleteCategory(node.id)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <CategoryRow key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  )
}

type CategoryTreeProps = {
  onEdit: (category: Category) => void
  onAddChild: (parentId: string) => void
}

/** Hierarchical category tree — parent categories with nested sub-categories. */
export function CategoryTree({ onEdit, onAddChild }: CategoryTreeProps) {
  const { data, isLoading, isError, refetch } = useCategories()
  const tree = useMemo(() => buildTree(data ?? []), [data])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load categories." onRetry={refetch} />

  if (tree.length === 0) {
    return <EmptyState title="No categories yet" description="Create your first category to organize products." />
  }

  return (
    <div className="rounded-lg border p-2">
      {tree.map((node) => (
        <CategoryRow key={node.id} node={node} depth={0} onEdit={onEdit} onAddChild={onAddChild} />
      ))}
    </div>
  )
}
