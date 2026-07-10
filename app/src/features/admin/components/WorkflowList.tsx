"use client"

import { Workflow as WorkflowIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkflows } from "../hooks/useWorkflow"
import type { Workflow, WorkflowStatus } from "../types"

const statusVariant: Record<WorkflowStatus, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  completed: "default",
}

type WorkflowListProps = {
  onSelect: (workflow: Workflow) => void
  selectedId?: string
}

/** Workflow list — Purchase Order Approval, Leave Request, Expense Reimbursement, etc. */
export function WorkflowList({ onSelect, selectedId }: WorkflowListProps) {
  const { data, isLoading, isError, refetch } = useWorkflows()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load workflows." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No workflows found" description="Create your first workflow to get started." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((workflow) => (
        <Card
          key={workflow.id}
          className={`cursor-pointer transition-shadow hover:shadow-md ${selectedId === workflow.id ? "ring-2 ring-ring" : ""}`}
          onClick={() => onSelect(workflow)}
        >
          <CardContent className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <WorkflowIcon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{workflow.name}</p>
                <Badge variant={statusVariant[workflow.status]} className="shrink-0 capitalize">
                  {workflow.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{workflow.description}</p>
              <p className="text-xs capitalize text-muted-foreground">Module: {workflow.module}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
