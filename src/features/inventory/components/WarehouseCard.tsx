"use client"

import { MapPin, MoreHorizontal, Pencil, Trash2, Warehouse as WarehouseIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useDeleteWarehouse } from "../hooks/useWarehouse"
import type { Warehouse } from "../types"

type WarehouseCardProps = {
  warehouse: Warehouse
  onEdit: (warehouse: Warehouse) => void
}

function renderMetric(value: number | null, formatter: (input: number) => string): string {
  return value === null ? "Unavailable" : formatter(value)
}

export function WarehouseCard({ warehouse, onEdit }: WarehouseCardProps) {
  const { mutate: deleteWarehouse } = useDeleteWarehouse()

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <WarehouseIcon className="size-4" />
          </div>
          <div>
            <p className="font-medium">{warehouse.name}</p>
            <p className="text-xs text-muted-foreground">{warehouse.code}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label="Warehouse actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(warehouse)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => deleteWarehouse(warehouse.id)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span>{warehouse.address || "Address not provided"}</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Type: {warehouse.type.replaceAll("_", " ")}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-xs text-muted-foreground">Total Products</p>
            <p className="text-sm font-semibold">{renderMetric(warehouse.totalProducts, formatNumber)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stock Value</p>
            <p className="text-sm font-semibold">{renderMetric(warehouse.stockValue, formatCurrency)}</p>
          </div>
          <Badge variant={warehouse.status === "active" ? "default" : "outline"}>
            {warehouse.status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
