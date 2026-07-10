"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryTree } from "@/features/products/components/CategoryTree"
import { CategoryFormDialog } from "@/features/products/components/CategoryForm"
import type { Category } from "@/features/products/types"

export default function CategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
  const [defaultParentId, setDefaultParentId] = useState<string | undefined>(undefined)

  function openCreate() {
    setEditingCategory(undefined)
    setDefaultParentId(undefined)
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setDefaultParentId(undefined)
    setDialogOpen(true)
  }

  function openAddChild(parentId: string) {
    setEditingCategory(undefined)
    setDefaultParentId(parentId)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Category Management</h1>
          <p className="text-sm text-muted-foreground">Organize products into categories and sub-categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Category
        </Button>
      </div>

      <CategoryTree onEdit={openEdit} onAddChild={openAddChild} />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        defaultParentId={defaultParentId}
      />
    </div>
  )
}
