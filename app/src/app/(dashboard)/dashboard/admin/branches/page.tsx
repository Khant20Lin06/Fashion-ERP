"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BranchFormDialog } from "@/features/admin/components/BranchForm"
import { BranchList } from "@/features/admin/components/BranchList"
import type { Branch } from "@/features/admin/types"

export default function AdminBranchesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>(undefined)

  function handleCreate() {
    setEditingBranch(undefined)
    setFormOpen(true)
  }

  function handleEdit(branch: Branch) {
    setEditingBranch(branch)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Multi Branch Management</h1>
          <p className="text-sm text-muted-foreground">Manage branches, warehouses, and outlets across every company.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> New Branch
        </Button>
      </div>

      <BranchList onEdit={handleEdit} />

      <BranchFormDialog open={formOpen} onOpenChange={setFormOpen} branch={editingBranch} />
    </div>
  )
}
