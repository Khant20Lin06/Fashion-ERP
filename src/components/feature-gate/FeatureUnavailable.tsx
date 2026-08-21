import Link from "next/link"
import { ServerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GapReason } from "@/config/release-scope"

type FeatureUnavailableProps = GapReason

/**
 * Shown in place of a page's real content when its route is a confirmed
 * BACKEND GAP (see src/config/release-scope.ts) — reachable either by
 * direct URL entry (hidden from navigation, see RouteGate) or, for a few
 * intentionally-visible gapped items, as the page's only content.
 *
 * Deliberately distinct from ErrorState (implies a retriable transient
 * failure) and EmptyState (implies "no data yet, but the feature works") —
 * this is neither. Never used to mask a real API failure.
 */
export function FeatureUnavailable({ title, description }: FeatureUnavailableProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border px-6 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <ServerOff className="size-7 text-muted-foreground" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  )
}
