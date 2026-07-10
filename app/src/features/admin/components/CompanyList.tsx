"use client"

import { Building2, MoreHorizontal, Pencil } from "lucide-react"
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
import { useCompanies } from "../hooks/useRoles"
import type { Company } from "../types"

type CompanyListProps = {
  onEdit: (company: Company) => void
}

/** Multi-company list — parent group company with subsidiary companies indented beneath it. */
export function CompanyList({ onEdit }: CompanyListProps) {
  const { data, isLoading, isError, refetch } = useCompanies()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load companies." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No companies found" description="Create your first company to get started." />
  }

  const roots = data.filter((c) => !c.parentId)
  const childrenOf = (id: string) => data.filter((c) => c.parentId === id)

  function renderCompany(company: Company, depth: number) {
    const children = childrenOf(company.id)
    return (
      <div key={company.id} style={{ marginLeft: depth * 24 }} className="flex flex-col gap-3">
        <Card>
          <CardContent className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{company.name}</p>
                <Badge variant={company.status === "active" ? "default" : "outline"} className="shrink-0">
                  {company.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Tax ID: {company.taxId} · Currency: {company.currency}
              </p>
              <p className="text-xs text-muted-foreground">{company.address}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Company actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(company)}>
                  <Pencil /> Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
        {children.map((child) => renderCompany(child, depth + 1))}
      </div>
    )
  }

  return <div className="flex flex-col gap-3">{roots.map((root) => renderCompany(root, 0))}</div>
}
