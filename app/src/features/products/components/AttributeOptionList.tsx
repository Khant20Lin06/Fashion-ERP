"use client"

import { MoreHorizontal, Pencil, Ruler, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAttributeOptionsByKind, useDeleteAttributeOption } from "../hooks/useAttributes"
import type { AttributeKind, AttributeOption } from "../types"

type AttributeOptionListProps = {
  kind: AttributeKind
  onEdit: (option: AttributeOption) => void
}

/** Flat attribute option grid — reused by the Size and Color management pages. */
export function AttributeOptionList({ kind, onEdit }: AttributeOptionListProps) {
  const { data, isLoading, isError, refetch } = useAttributeOptionsByKind(kind)
  const { mutate: deleteOption } = useDeleteAttributeOption(kind)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message={`Couldn't load ${kind} options.`} onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title={`No ${kind} options found`} description={`Add your first ${kind} to get started.`} />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((option) => (
        <Card key={option.id}>
          <CardContent className="flex items-center gap-3 px-4">
            {option.swatch ? (
              <span
                className="size-8 shrink-0 rounded-full border border-border/50"
                style={{ backgroundColor: option.swatch }}
                aria-hidden
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
                <Ruler className="size-4 text-muted-foreground" />
              </div>
            )}
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{option.value}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Option actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(option)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => deleteOption(option.id)}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
