import type { LucideIcon } from "lucide-react"
import type { Permission } from "./user"

/**
 * Single authoritative classification for whether a feature belongs in this
 * release, checked here (and only here) rather than scattered per-component
 * NODE_ENV checks. See src/config/release-scope.ts for the full contract.
 *
 * - "ready": real backend, correctly wired, ships in navigation as normal.
 * - "partial": some real data, some gapped sections on the same page —
 *   still ships (the real parts have value), but should not overclaim
 *   completeness in its own UI copy.
 * - "backend-gap": no real backend capability exists at all. Hidden from
 *   navigation; direct URL access shows an explicit FeatureUnavailable
 *   page rather than a 404 or a broken fictional-API call.
 * - "out-of-scope": deliberately excluded from this release regardless of
 *   backend status (reserved for future use; none of Phase 13's findings
 *   needed this — every gap found is a genuine backend-gap, not a scoping
 *   choice — but the type exists so a future release can use it without
 *   another registry migration).
 */
export type ReleaseStatus = "ready" | "partial" | "backend-gap" | "out-of-scope"

export type NavItem = {
  label: string
  href?: string
  icon?: LucideIcon
  /**
   * Real backend permission resource key(s) checked against the current
   * user's permissions for visibility — must match the literal first
   * dot-segment of a real `@RequirePermission` code (e.g. "products",
   * "stock_adjustments"; see erp-pos fashion api
   * src/database/seeds/rbac.seed.ts's PERMISSION_CATALOG). A section that
   * spans several real resources (e.g. Inventory = warehouse_stock +
   * stock_adjustments + stock_transfers + goods_receipts +
   * inventory_ledger) takes an array — visible if the user holds the
   * required action on ANY of them. There is no umbrella "inventory",
   * "purchase", "hr", "accounting", "pos", or "dashboard" resource on the
   * backend, so a single invented string here would never match a real
   * user's permission set and would silently hide the whole section.
   */
  module?: string | string[]
  requiredAction?: Permission["actions"][number]
  /** Defaults to "ready" when omitted — only gapped/partial items need to set this. */
  releaseStatus?: ReleaseStatus
  children?: NavItem[]
}
