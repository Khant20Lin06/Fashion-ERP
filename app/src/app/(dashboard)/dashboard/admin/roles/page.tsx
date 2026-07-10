"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleFormDialog } from "@/features/admin/components/RoleForm"
import { RoleMatrix } from "@/features/admin/components/RoleMatrix"
import type { Role } from "@/features/admin/types"

export default function AdminRolesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | undefined>(undefined)

  function handleCreate() {
    setEditingRole(undefined)
    setFormOpen(true)
  }

  function handleEdit(role: Role) {
    setEditingRole(role)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Role Management</h1>
          <p className="text-sm text-muted-foreground">Define roles and assign permission groups.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> New Role
        </Button>
      </div>

      <RoleMatrix onEdit={handleEdit} />

      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editingRole} />
    </div>
  )
}
