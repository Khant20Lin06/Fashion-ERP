"use client"

import { useMemo, useState } from "react"
import { Building, ChevronRight, Store, Users, Warehouse } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useOrgUnits } from "@/features/hr/hooks/useOrganization"
import type { OrgUnit, OrgUnitType } from "@/features/hr/types"

type OrgNode = OrgUnit & { children: OrgNode[] }

const iconByType: Record<OrgUnitType, typeof Building> = {
  company: Building,
  office: Building,
  department: Users,
  store: Store,
  warehouse: Warehouse,
}

function buildTree(units: OrgUnit[]): OrgNode[] {
  const nodes = new Map<string, OrgNode>(units.map((u) => [u.id, { ...u, children: [] }]))
  const roots: OrgNode[] = []
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function OrgRow({ node, depth }: { node: OrgNode; depth: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const Icon = iconByType[node.type]

  return (
    <div>
      <div
        className="flex items-center gap-1.5 rounded-md py-1.5 pr-2 hover:bg-accent/50"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn("flex size-5 items-center justify-center", !hasChildren && "invisible")}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        </button>
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{node.name}</span>
        <span className="text-xs capitalize text-muted-foreground">({node.type})</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <OrgRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

/** Organization structure tree — Company > Offices > Departments/Stores/Warehouse. */
export function OrganizationTree() {
  const { data, isLoading, isError, refetch } = useOrgUnits()
  const tree = useMemo(() => buildTree(data ?? []), [data])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load organization structure." onRetry={refetch} />

  if (tree.length === 0) {
    return <EmptyState title="No organization data" description="Structure will appear here once configured." />
  }

  return (
    <div className="rounded-lg border p-2">
      {tree.map((node) => (
        <OrgRow key={node.id} node={node} depth={0} />
      ))}
    </div>
  )
}
