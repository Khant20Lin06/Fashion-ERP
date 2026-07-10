"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/features/admin/components/UserTable"

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts across all companies and branches.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/users/create">
            <Plus /> New User
          </Link>
        </Button>
      </div>

      <UserTable />
    </div>
  )
}
