"use client"

import { usePathname } from "next/navigation"
import { BACKEND_GAP_ROUTES } from "@/config/release-scope"
import { FeatureUnavailable } from "./FeatureUnavailable"

/**
 * Direct-URL protection for confirmed BACKEND GAP routes. Hiding a page
 * from the sidebar (see releaseStatus in navigation.ts) only stops
 * discovery through navigation — a user who already knows or bookmarks the
 * URL, or who types it directly, would still reach the real page and
 * trigger its (guaranteed-failing) API calls without this.
 *
 * Wrapping `children` here means a gapped route's page component never
 * mounts at all when matched — its queries never fire, so there is no
 * fictional-endpoint 404, no infinite loading, and no risk of a future
 * change to that page accidentally displaying fabricated data before this
 * gate would catch it.
 *
 * Sits inside MainLayout, above `children`, so it applies to every route
 * under the (dashboard) group without per-page boilerplate.
 */
export function RouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const gap = BACKEND_GAP_ROUTES[pathname]

  if (gap) {
    return <FeatureUnavailable title={gap.title} description={gap.description} />
  }

  return <>{children}</>
}
