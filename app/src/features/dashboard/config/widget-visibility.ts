import type { UserRole } from "@/types/user"
import type { DashboardWidgetKey } from "../types"

const allWidgets: DashboardWidgetKey[] = [
  "kpis",
  "salesOverview",
  "revenueChart",
  "inventoryStatus",
  "recentOrders",
  "topProducts",
  "lowStockAlert",
  "customerAnalytics",
]

/**
 * RBAC dashboard config — which widgets each role sees. `super_admin` and
 * `business_owner` see everything; every other role gets a curated subset
 * relevant to their job, per the platform-wide "omission over denial" rule
 * (a role without access to a widget never sees a disabled placeholder for
 * it — it's simply not rendered).
 */
const widgetsByRole: Partial<Record<UserRole, DashboardWidgetKey[]>> = {
  super_admin: allWidgets,
  business_owner: allWidgets,
  regional_manager: ["kpis", "salesOverview", "revenueChart", "inventoryStatus", "topProducts", "customerAnalytics"],
  branch_manager: ["kpis", "salesOverview", "inventoryStatus", "recentOrders", "topProducts", "lowStockAlert"],
  store_manager: ["kpis", "salesOverview", "recentOrders", "lowStockAlert"],
  cashier: ["kpis", "recentOrders"],
  sales_associate: ["kpis", "recentOrders", "topProducts"],
  warehouse_staff: ["inventoryStatus", "lowStockAlert"],
  inventory_controller: ["kpis", "inventoryStatus", "lowStockAlert", "topProducts"],
  purchasing_officer: ["kpis", "inventoryStatus", "lowStockAlert"],
  finance_manager: ["kpis", "revenueChart", "salesOverview"],
  marketing_team: ["kpis", "customerAnalytics", "topProducts"],
}

export function getVisibleWidgets(role: UserRole | undefined): Set<DashboardWidgetKey> {
  if (!role) return new Set()
  return new Set(widgetsByRole[role] ?? allWidgets)
}

/** KPI metric ids surfaced per role — a coarser widget key ("kpis") gates the
 * section, this further trims which individual metric cards appear within it. */
const kpiIdsByRole: Partial<Record<UserRole, string[]>> = {
  cashier: ["today-revenue", "total-orders"],
  sales_associate: ["today-revenue", "total-orders", "avg-order-value"],
  warehouse_staff: ["total-products", "low-stock", "out-of-stock", "stock-value"],
  inventory_controller: ["total-products", "low-stock", "out-of-stock", "stock-value"],
  purchasing_officer: ["low-stock", "out-of-stock", "pending-po"],
  finance_manager: ["today-revenue", "monthly-revenue", "avg-order-value", "pending-po"],
  marketing_team: ["total-customers", "new-customers", "loyalty-members"],
}

export function getVisibleKpiIds(role: UserRole | undefined): string[] | undefined {
  if (!role) return undefined
  return kpiIdsByRole[role]
}
