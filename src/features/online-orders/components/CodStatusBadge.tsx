import { Badge } from "@/components/ui/badge"
import type { CodStatus } from "../types"

export function CodStatusBadge({ status }: { status?: CodStatus | null }) {
  if (!status || status === "NONE") {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
        Prepaid / No COD
      </Badge>
    )
  }

  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
        >
          COD Pending
        </Badge>
      )
    case "SETTLED":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
        >
          COD Settled
        </Badge>
      )
    case "FAILED":
      return (
        <Badge variant="destructive">
          COD Failed
        </Badge>
      )
    default:
      return null
  }
}
