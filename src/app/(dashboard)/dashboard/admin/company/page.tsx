"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompanyFormDialog } from "@/features/admin/components/CompanyForm"
import { CompanyList } from "@/features/admin/components/CompanyList"
import type { Company } from "@/features/admin/types"

export default function AdminCompanyPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined)

  function handleCreate() {
    setEditingCompany(undefined)
    setFormOpen(true)
  }

  function handleEdit(company: Company) {
    setEditingCompany(company)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Multi Company Management</h1>
          <p className="text-sm text-muted-foreground">Manage the group company and its subsidiaries.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus /> New Company
        </Button>
      </div>

      <CompanyList onEdit={handleEdit} />

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} company={editingCompany} />
    </div>
  )
}
