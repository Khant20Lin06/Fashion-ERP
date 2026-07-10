"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AttributeOptionFormDialog } from "@/features/products/components/AttributeOptionForm"
import { AttributeOptionList } from "@/features/products/components/AttributeOptionList"
import type { AttributeOption } from "@/features/products/types"

export default function SizesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<AttributeOption | undefined>(undefined)

  function openCreate() {
    setEditingOption(undefined)
    setDialogOpen(true)
  }

  function openEdit(option: AttributeOption) {
    setEditingOption(option)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Size Management</h1>
          <p className="text-sm text-muted-foreground">Manage the size options available across your catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Size
        </Button>
      </div>

      <AttributeOptionList kind="size" onEdit={openEdit} />

      <AttributeOptionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} kind="size" option={editingOption} />
    </div>
  )
}
