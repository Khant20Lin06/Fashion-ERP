import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SecurityEvent } from "@/features/admin/types"

const severityVariant: Record<SecurityEvent["severity"], "default" | "secondary" | "outline" | "destructive"> = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
}

const severityDot: Record<SecurityEvent["severity"], string> = {
  low: "bg-muted-foreground",
  medium: "bg-warning",
  high: "bg-destructive",
}

type SecurityCardProps = {
  event: SecurityEvent
}

/** Security event card — used on the Security Dashboard's event feed. */
export function SecurityCard({ event }: SecurityCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", severityDot[event.severity])} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium capitalize">{event.type.replace(/_/g, " ")}</p>
            <Badge variant={severityVariant[event.severity]} className="shrink-0 capitalize">
              {event.severity}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <p className="text-xs text-muted-foreground">
            {event.user} · {event.ipAddress} · {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
