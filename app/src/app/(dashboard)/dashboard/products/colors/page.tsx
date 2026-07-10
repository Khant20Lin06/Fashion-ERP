"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AttributeOptionFormDialog } from "@/features/products/components/AttributeOptionForm"
import { AttributeOptionList } from "@/features/products/components/AttributeOptionList"
import type { AttributeOption } from "@/features/products/types"

export default function ColorsPage() {
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
          <h1 className="text-2xl font-semibold tracking-tight">Color Management</h1>
          <p className="text-sm text-muted-foreground">Manage the color options available across your catalog.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Color
        </Button>
      </div>

      <AttributeOptionList kind="color" onEdit={openEdit} />

      <AttributeOptionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} kind="color" option={editingOption} />
    </div>
  )
}
