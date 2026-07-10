"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DepartmentList } from "@/features/hr/components/DepartmentList"
import { DepartmentFormDialog } from "@/features/hr/components/DepartmentForm"
import type { Department } from "@/features/hr/types"

export default function DepartmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>(undefined)

  function openCreate() {
    setEditingDepartment(undefined)
    setDialogOpen(true)
  }

  function openEdit(department: Department) {
    setEditingDepartment(department)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">Manage departments, managers, and headcount.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Department
        </Button>
      </div>

      <DepartmentList onEdit={openEdit} />

      <DepartmentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} department={editingDepartment} />
    </div>
  )
}
