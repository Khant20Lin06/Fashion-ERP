"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UomFormDialog } from "@/features/products/components/UomForm"
import { UomList } from "@/features/products/components/UomList"
import type { Uom } from "@/features/products/types"

export default function UomsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUom, setEditingUom] = useState<Uom | undefined>(undefined)

  function openCreate() {
    setEditingUom(undefined)
    setDialogOpen(true)
  }

  function openEdit(uom: Uom) {
    setEditingUom(uom)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">UOM Management</h1>
          <p className="text-sm text-muted-foreground">
            Maintain enterprise units of measure for products, alternate packs, and transactional conversions.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add UOM
        </Button>
      </div>

      <UomList onEdit={openEdit} />

      <UomFormDialog open={dialogOpen} onOpenChange={setDialogOpen} uom={editingUom} />
    </div>
  )
}
