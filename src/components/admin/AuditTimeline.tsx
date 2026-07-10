import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import type { AdminAuditEntry } from "@/features/admin/types"

const actionVariant: Record<AdminAuditEntry["action"], "default" | "secondary" | "outline" | "destructive"> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
  approve: "default",
  login: "outline",
  logout: "outline",
}

type AuditTimelineProps = {
  entries: AdminAuditEntry[]
}

/** Vertical audit timeline — User, Action, Module, Record, Old/New value, IP, Timestamp. */
export function AuditTimeline({ entries }: AuditTimelineProps) {
  if (entries.length === 0) {
    return <EmptyState title="No audit activity" description="Actions across the system will appear here." />
  }

  return (
    <div className="flex flex-col">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
            {index < entries.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">
                {entry.user} <span className="font-normal text-muted-foreground">{entry.action}d</span> {entry.record}
              </p>
              <Badge variant={actionVariant[entry.action]} className="capitalize">
                {entry.action}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {entry.module} · {entry.companyName} · {entry.ipAddress}
            </p>
            {(entry.oldValue || entry.newValue) && (
              <div className="mt-1.5 flex items-center gap-3 text-xs">
                {entry.oldValue && (
                  <span className="text-muted-foreground">
                    Old: <span className="font-medium text-foreground">{entry.oldValue}</span>
                  </span>
                )}
                {entry.newValue && (
                  <span className="text-muted-foreground">
                    New: <span className="font-medium text-foreground">{entry.newValue}</span>
                  </span>
                )}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
