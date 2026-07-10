import { Bell, CheckCircle2, GitBranch, Play, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkflowNodeType } from "@/features/admin/types"

const nodeConfig: Record<WorkflowNodeType, { icon: typeof Play; className: string }> = {
  trigger: { icon: Play, className: "border-primary/40 bg-primary/10 text-primary" },
  condition: { icon: GitBranch, className: "border-warning/40 bg-warning/10 text-warning" },
  approval: { icon: CheckCircle2, className: "border-success/40 bg-success/10 text-success" },
  action: { icon: Zap, className: "border-accent-foreground/20 bg-accent text-accent-foreground" },
  notification: { icon: Bell, className: "border-secondary-foreground/20 bg-secondary text-secondary-foreground" },
}

type WorkflowNodeProps = {
  label: string
  type: WorkflowNodeType
  selected?: boolean
  onClick?: () => void
}

/** Workflow node card — Trigger/Condition/Approval/Action/Notification, used by the Workflow Builder canvas. */
export function WorkflowNode({ label, type, selected, onClick }: WorkflowNodeProps) {
  const { icon: Icon, className } = nodeConfig[type]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-40 items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-left shadow-sm transition-shadow hover:shadow-md",
        className,
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
    >
      <Icon className="size-4 shrink-0" />
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold capitalize">{type}</p>
        <p className="truncate text-sm">{label}</p>
      </div>
    </button>
  )
}
