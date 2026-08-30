"use client"

import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import { useDeleteUom, useSetUomStatus, useUoms } from "../hooks/useUoms"
import type { Uom } from "../types"

type UomListProps = {
  onEdit: (uom: Uom) => void
}

export function UomList({ onEdit }: UomListProps) {
  const { data, isLoading, isError, refetch } = useUoms()
  const { mutate: deleteUom } = useDeleteUom()
  const { mutate: setStatus } = useSetUomStatus()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorState message="Couldn't load UOMs." onRetry={refetch} />
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No UOMs yet" description="Create your first unit of measure to start assigning base and alternate units." />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((uom) => (
        <Card key={uom.id}>
          <CardContent className="flex items-start justify-between gap-3 px-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{uom.name}</p>
                <Badge variant={uom.isActive ? "default" : "outline"}>{uom.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border px-2 py-0.5 font-mono">{uom.code}</span>
                <span>{uom.category}</span>
                <span>{uom.decimalPlaces} dp</span>
                {uom.symbol ? <span>Symbol: {uom.symbol}</span> : null}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="UOM actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(uom)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus({ id: uom.id, isActive: !uom.isActive })}>
                  <Power /> {uom.isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => deleteUom(uom.id)}>
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
