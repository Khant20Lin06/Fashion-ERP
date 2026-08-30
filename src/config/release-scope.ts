/**
 * Central registry of every route confirmed to have no real backend
 * capability, keyed by pathname. This is the single source of truth
 * consumed by:
 *   - src/config/navigation.ts
 *   - src/components/feature-gate/RouteGate.tsx
 */
export type GapReason = {
  title: string
  description: string
}

export const BACKEND_GAP_ROUTES: Record<string, GapReason> = {
  "/dashboard/reports/sales": {
    title: "Sales Reports (analytics) not available",
    description: "No backend sales-analytics module exists yet. Use Sales -> Reports for real sales metrics.",
  },
  "/dashboard/reports/inventory": {
    title: "Inventory Reports not available",
    description: "No backend inventory-analytics module exists yet.",
  },
  "/dashboard/inventory/reports": {
    title: "Inventory Reports not available",
    description: "No backend inventory-analytics module exists yet.",
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

  "/dashboard/admin": {
    title: "Admin Dashboard not available",
    description: "No backend admin-dashboard KPI, activity, or module-status endpoints exist yet.",
  },
  "/dashboard/admin/workflows": {
    title: "Workflow Builder not available",
    description: "No backend workflow or automation module exists yet.",
  },
  "/dashboard/admin/audit": {
    title: "Audit Logs not available",
    description: "No backend audit-log module exists yet.",
  },
  "/dashboard/admin/security": {
    title: "Security Center not available",
    description: "No backend security-events or session-management module exists yet.",
  },
  "/dashboard/admin/settings": {
    title: "System Settings not available",
    description: "No backend general, localization, or backup settings module exists yet.",
  },

  "/dashboard/inventory/count": {
    title: "Stock Count not available",
    description: "No backend stock-count-session module exists yet.",
  },
  "/dashboard/inventory/scanner": {
    title: "Barcode Scanner not available",
    description: "No backend SKU or barcode lookup endpoint exists yet.",
  },

  "/dashboard/accounting/expense": {
    title: "Expenses not available",
    description: "No backend expense-tracking module exists yet.",
  },
  "/dashboard/accounting/tax": {
    title: "Tax Rules not available",
    description: "No backend tax-rule module exists yet.",
  },
  "/dashboard/hr/organization": {
    title: "Organization Chart not available",
    description: "No backend organization-tree endpoint exists yet. Use Departments for real department data.",
  },
}

/**
 * Routes that are genuinely partial. They stay reachable because some real
 * functionality exists, but the page must not overclaim completeness.
 */
export const PARTIAL_ROUTES: Record<string, GapReason> = {
  "/dashboard/reports/purchase": {
    title: "Purchase Reports - partially available",
    description: "Spend trend and supplier totals are real. Supplier quality, delivery-rate, and cost-change analytics are not tracked by the backend yet.",
  },
  "/dashboard/purchase/reports": {
    title: "Purchase Reports - partially available",
    description: "Spend trend and supplier totals are real. Supplier quality, delivery-rate, and cost-change analytics are not tracked by the backend yet.",
  },
  "/dashboard/reports/finance": {
    title: "Financial Reports - partially available",
    description: "The summary KPIs are real. Profit Trend, Expense Breakdown, and Margin Analysis charts have no backend data yet.",
  },
  "/dashboard/hr/ess": {
    title: "Employee Self Service - partially available",
    description: "Attendance and leave requests are real. Leave balances, announcements, and payslips have no backend data yet.",
  },
}

export function getGapReason(pathname: string): GapReason | undefined {
  return BACKEND_GAP_ROUTES[pathname]
}
