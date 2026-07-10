"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WarehouseList } from "@/features/inventory/components/WarehouseList"
import { WarehouseFormDialog } from "@/features/inventory/components/WarehouseForm"
import type { Warehouse } from "@/features/inventory/types"

export default function WarehousePage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | undefined>(undefined)

  function openCreate() {
    setEditingWarehouse(undefined)
    setDialogOpen(true)
  }

  function openEdit(warehouse: Warehouse) {
    setEditingWarehouse(warehouse)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Manage warehouses across all branches.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Warehouse
        </Button>
      </div>

      <WarehouseList onEdit={openEdit} />

      <WarehouseFormDialog open={dialogOpen} onOpenChange={setDialogOpen} warehouse={editingWarehouse} />
    </div>
  )
}
