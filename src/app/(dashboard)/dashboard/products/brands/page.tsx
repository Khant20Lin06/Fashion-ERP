"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandList } from "@/features/products/components/BrandList"
import { BrandFormDialog } from "@/features/products/components/BrandForm"
import type { Brand } from "@/features/products/types"

export default function BrandsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>(undefined)

  function openCreate() {
    setEditingBrand(undefined)
    setDialogOpen(true)
  }

  function openEdit(brand: Brand) {
    setEditingBrand(brand)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brand Management</h1>
          <p className="text-sm text-muted-foreground">Manage the brands carried across your catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Brand
        </Button>
      </div>

      <BrandList onEdit={openEdit} />

      <BrandFormDialog open={dialogOpen} onOpenChange={setDialogOpen} brand={editingBrand} />
    </div>
  )
}
