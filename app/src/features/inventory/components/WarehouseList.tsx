"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranches, useWarehouses } from "../hooks/useWarehouse"
import { WarehouseCard } from "./WarehouseCard"
import type { Warehouse } from "../types"

type WarehouseListProps = {
  onEdit: (warehouse: Warehouse) => void
}

/** Warehouse list grouped by branch — Myanmar Branch > Yangon/Mandalay, Thailand Branch > Bangkok/Chiang Mai. */
export function WarehouseList({ onEdit }: WarehouseListProps) {
  const { data: warehouses, isLoading: loadingWarehouses, isError, refetch } = useWarehouses()
  const { data: branches, isLoading: loadingBranches } = useBranches()

  if (loadingWarehouses || loadingBranches) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load warehouses." onRetry={refetch} />

  if (!warehouses || warehouses.length === 0) {
    return <EmptyState title="No warehouses yet" description="Add your first warehouse to start tracking stock." />
  }

  return (
    <div className="flex flex-col gap-6">
      {(branches ?? []).map((branch) => {
        const branchWarehouses = warehouses.filter((w) => w.branchId === branch.id)
        if (branchWarehouses.length === 0) return null
        return (
          <div key={branch.id} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{branch.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {branchWarehouses.map((warehouse) => (
                <WarehouseCard key={warehouse.id} warehouse={warehouse} onEdit={onEdit} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
