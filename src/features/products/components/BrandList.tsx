"use client"

import { Building2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { useBrands, useDeleteBrand } from "../hooks/useBrands"
import type { Brand } from "../types"

type BrandListProps = {
  onEdit: (brand: Brand) => void
}

/** Brand management grid — name, logo, country, description, status. */
export function BrandList({ onEdit }: BrandListProps) {
  const { data, isLoading, isError, refetch } = useBrands()
  const { mutate: deleteBrand } = useDeleteBrand()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load brands." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No brands found" description="Create your first brand to get started." />
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((brand) => (
        <Card key={brand.id}>
          <CardContent className="flex items-start gap-3 px-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <Building2 className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{brand.name}</p>
                <Badge variant={brand.isActive ? "default" : "outline"} className="shrink-0">
                  {brand.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {brand.country && <p className="text-xs text-muted-foreground">{brand.country}</p>}
              {brand.description && <p className="line-clamp-2 text-xs text-muted-foreground">{brand.description}</p>}
              <p className="text-xs text-muted-foreground">{brand.productCount} products</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Brand actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(brand)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => deleteBrand(brand.id)}>
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
