"use client"

import { useState } from "react"
import { EmptyState } from "@/components/ui/empty-state"
import { WorkflowBuilder } from "@/features/admin/components/WorkflowBuilder"
import { WorkflowList } from "@/features/admin/components/WorkflowList"
import type { Workflow } from "@/features/admin/types"

export default function AdminWorkflowsPage() {
  const [selected, setSelected] = useState<Workflow | undefined>(undefined)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workflow Builder</h1>
        <p className="text-sm text-muted-foreground">Design approval workflows with triggers, conditions, and actions.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <WorkflowList onSelect={setSelected} selectedId={selected?.id} />

        {selected ? (
          <WorkflowBuilder workflow={selected} key={selected.id} />
        ) : (
          <EmptyState title="Select a workflow" description="Choose a workflow on the left to edit its steps." />
        )}
      </div>
    </div>
  )
}
