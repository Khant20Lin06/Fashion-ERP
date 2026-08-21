/**
 * Central registry of every route confirmed (Phase 13 audit) to have no
 * real backend capability, keyed by pathname. This is the single source of
 * truth consumed by:
 *   - src/config/navigation.ts (releaseStatus on each NavItem — drives
 *     sidebar/mobile-nav visibility via useFilteredNavigation)
 *   - src/components/feature-gate/RouteGate.tsx (direct-URL protection —
 *     renders FeatureUnavailable instead of the real page content)
 *
 * A route appearing here means: real backend controller/endpoint search
 * turned up nothing (not "not yet wired," but "does not exist"). Do not add
 * an entry here for a route that's merely unfinished — this registry is
 * for genuine backend gaps only. Removing an entry (once a real backend
 * lands) is the only intended way this list shrinks.
 */
export type GapReason = {
  title: string
  description: string
}

export const BACKEND_GAP_ROUTES: Record<string, GapReason> = {
  // --- Reports (fictional analytics endpoints; a few pages are PARTIAL
  // and stay reachable — see PARTIAL_GAP_ROUTES below) ---
  "/dashboard/reports/sales": {
    title: "Sales Reports (analytics) not available",
    description: "No backend sales-analytics module exists yet. Use Sales → Reports for real sales metrics.",
  },
  "/dashboard/reports/inventory": {
    title: "Inventory Reports not available",
    description: "No backend inventory-analytics module exists yet.",
  },
  "/dashboard/inventory/reports": {
    title: "Inventory Reports not available",
    description: "No backend inventory-analytics module exists yet.",
  },
  "/dashboard/reports/purchase": {
    title: "Purchase Reports (analytics) not available",
    description: "No backend purchase-analytics module exists yet. Use Purchase → Reports for real purchase trend data.",
  },
  "/dashboard/reports/customer": {
    title: "Customer Reports not available",
    description: "No backend customer-analytics module exists yet.",
  },
  "/dashboard/reports/products": {
    title: "Product Reports not available",
    description: "No backend product-analytics module exists yet.",
  },
  "/dashboard/reports/scheduled": {
    title: "Scheduled Reports not available",
    description: "No backend report-scheduling module exists yet.",
  },
  "/dashboard/reports/dashboard": {
    title: "Executive Dashboard not available",
    description: "No backend executive-KPI module exists yet.",
  },
  "/dashboard/reports": {
    title: "Custom Report Builder not available",
    description: "No backend executive-KPI module exists yet.",
  },

  // --- HR Payroll / Performance / Analytics ---
  // /dashboard/hr/payroll removed from this registry (Phase 22) — real
  // backend payroll periods/runs/components/configuration
  // (GET/POST/PATCH /payroll/*, calculate/finalize/cancel workflow) are
  // now wired; see src/features/payroll.
  "/dashboard/hr/performance": {
    title: "Performance Reviews not available",
    description: "No backend performance-review module exists yet.",
  },
  "/dashboard/hr/reports": {
    title: "HR Reports not available",
    description: "No backend HR-analytics module exists yet.",
  },
  "/dashboard/hr/shifts": {
    title: "Shift Management not available",
    description: "No backend shift-scheduling module exists yet.",
  },

  // --- Administration ---
  "/dashboard/admin": {
    title: "Admin Dashboard not available",
    description: "No backend admin-dashboard KPI/activity/module-status endpoints exist yet.",
  },
  "/dashboard/admin/workflows": {
    title: "Workflow Builder not available",
    description: "No backend workflow/automation module exists yet.",
  },
  // /dashboard/admin/integrations removed from this registry (Phase 22) —
  // it now hosts real Webhook subscription/delivery management
  // (GET/POST/PATCH/DELETE /webhooks, POST /webhooks/:id/test,
  // GET /webhooks/:webhookId/deliveries), not a fictional third-party
  // integrations marketplace.
  "/dashboard/admin/audit": {
    title: "Audit Logs not available",
    description: "No backend audit-log module exists yet.",
  },
  "/dashboard/admin/security": {
    title: "Security Center not available",
    description: "No backend security-events/session-management module exists yet.",
  },
  "/dashboard/admin/settings": {
    title: "System Settings not available",
    description: "No backend general/localization/backup settings module exists yet.",
  },

  // --- Sales / Purchase edge features with no backend entity ---
  // /dashboard/sales/discounts, /dashboard/sales/loyalty, and
  // /dashboard/sales/returns removed from this
  // registry — GET/PUT /loyalty/program, GET/POST /loyalty/customers/*, and
  // GET/POST /returns (+confirm/cancel) are real, wired backend endpoints
  // (LoyaltyController/LoyaltyProgramController/SaleReturnsController),
  // confirmed during the Phase 21 frontend↔backend integration audit.
  "/dashboard/purchase/return": {
    title: "Purchase Returns not available",
    description: "No backend purchase-return module exists yet.",
  },
  "/dashboard/inventory/count": {
    title: "Stock Count not available",
    description: "No backend stock-count-session module exists yet.",
  },
  "/dashboard/inventory/scanner": {
    title: "Barcode Scanner not available",
    description: "No backend SKU/barcode lookup endpoint exists yet.",
  },

  // --- Accounting edge features with no backend entity ---
  // Note: /dashboard/accounting/audit was removed from this registry —
  // GET /reports/accounting/audit-log is a real, wired backend endpoint
  // (see AccountingAuditLogController), confirmed during the Phase 21
  // frontend↔backend integration audit.
  "/dashboard/accounting/expense": {
    title: "Expenses not available",
    description: "No backend expense-tracking module exists yet.",
  },
  "/dashboard/accounting/tax": {
    title: "Tax Rules not available",
    description: "No backend tax-rule module exists yet.",
  },
  "/dashboard/purchase/request": {
    title: "Purchase Requests not available",
    description: "No backend pre-PO purchase-request module exists yet. Use Purchase Orders instead.",
  },
  "/dashboard/purchase/invoice": {
    title: "Purchase Invoice not available",
    description: "No backend Purchase Invoice entity exists — Purchase flows from Order to Goods Receipt to Payment directly.",
  },
  "/dashboard/hr/organization": {
    title: "Organization Chart not available",
    description: "No backend organization-tree endpoint exists yet. Use Departments for real department data.",
  },
}

/**
 * Routes that are genuinely PARTIAL — real data on part of the page,
 * fictional/empty on the rest. These stay in navigation (hiding them would
 * throw away real, working functionality) and stay directly reachable, but
 * are listed here so their own page copy can be checked against
 * overclaiming completeness. Not gated by RouteGate.
 */
export const PARTIAL_ROUTES: Record<string, GapReason> = {
  "/dashboard/reports/finance": {
    title: "Financial Reports — partially available",
    description: "The summary KPIs are real; Profit Trend, Expense Breakdown, and Margin Analysis charts have no backend data yet.",
  },
  "/dashboard/hr/ess": {
    title: "Employee Self Service — partially available",
    description: "Attendance and leave requests are real; leave balances, announcements, and payslips have no backend data yet.",
  },
}

export function getGapReason(pathname: string): GapReason | undefined {
  return BACKEND_GAP_ROUTES[pathname]
}
