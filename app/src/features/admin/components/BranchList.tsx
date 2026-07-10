"use client"

import { Building, MoreHorizontal, Pencil, Store, Warehouse } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranches, useCompanies } from "../hooks/useRoles"
import type { Branch, BranchType } from "../types"

type BranchListProps = {
  onEdit: (branch: Branch) => void
}

const typeIcon: Record<BranchType, typeof Building> = {
  head_office: Building,
  retail_store: Store,
  warehouse: Warehouse,
  outlet: Store,
}

const typeLabel: Record<BranchType, string> = {
  head_office: "Head Office",
  retail_store: "Retail Store",
  warehouse: "Warehouse",
  outlet: "Outlet",
}

/** Multi-branch list grouped by company — Head Office / Retail Store / Warehouse / Outlet. */
export function BranchList({ onEdit }: BranchListProps) {
  const { data: branches, isLoading, isError, refetch } = useBranches()
  const { data: companies } = useCompanies()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load branches." onRetry={refetch} />

  if (!branches || branches.length === 0) {
    return <EmptyState title="No branches found" description="Create your first branch to get started." />
  }

  return (
    <div className="flex flex-col gap-6">
      {(companies ?? []).map((company) => {
        const companyBranches = branches.filter((b) => b.companyId === company.id)
        if (companyBranches.length === 0) return null
        return (
          <div key={company.id} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{company.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {companyBranches.map((branch) => {
                const Icon = typeIcon[branch.type]
                return (
                  <Card key={branch.id}>
                    <CardContent className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{branch.name}</p>
                          <Badge variant={branch.status === "active" ? "default" : "outline"} className="shrink-0">
                            {branch.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">{branch.code}</p>
                        <p className="text-xs text-muted-foreground">{typeLabel[branch.type]}</p>
                        {branch.managerName && <p className="text-xs text-muted-foreground">Manager: {branch.managerName}</p>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Branch actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(branch)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
