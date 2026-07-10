import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DateRange, DateRangePreset, DashboardWidget } from "../types"

function computePresetRange(preset: DateRangePreset): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()
  if (preset === "today") {
    return { from: new Date(now.setHours(0, 0, 0, 0)).toISOString(), to }
  }
  if (preset === "this_week") {
    const start = new Date(now)
    start.setDate(start.getDate() - start.getDay())
    start.setHours(0, 0, 0, 0)
    return { from: start.toISOString(), to }
  }
  if (preset === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: start.toISOString(), to }
  }
  return { from: to, to }
}

const defaultWidgets: DashboardWidget[] = [
  { id: "w-1", type: "kpi_revenue", title: "Total Revenue", colSpan: 1 },
  { id: "w-2", type: "kpi_profit", title: "Gross Profit", colSpan: 1 },
  { id: "w-3", type: "kpi_orders", title: "Total Orders", colSpan: 1 },
  { id: "w-4", type: "kpi_customers", title: "Customer Growth", colSpan: 1 },
  { id: "w-5", type: "revenue_chart", title: "Revenue Trend", colSpan: 2 },
  { id: "w-6", type: "top_products", title: "Top Products", colSpan: 2 },
]

type ReportStoreState = {
  dateRange: DateRange
  setDateRangePreset: (preset: DateRangePreset) => void
  setCustomDateRange: (from: string, to: string) => void
  branch?: string
  warehouse?: string
  setBranch: (branch: string | undefined) => void
  setWarehouse: (warehouse: string | undefined) => void

  dashboardWidgets: DashboardWidget[]
  setDashboardWidgets: (widgets: DashboardWidget[]) => void
  resetDashboardWidgets: () => void
}

export const useReportStore = create<ReportStoreState>()(
  persist(
    (set) => ({
      dateRange: { preset: "this_month", ...computePresetRange("this_month") },
      setDateRangePreset: (preset) => set({ dateRange: { preset, ...computePresetRange(preset) } }),
      setCustomDateRange: (from, to) => set({ dateRange: { preset: "custom", from, to } }),

      branch: undefined,
      warehouse: undefined,
      setBranch: (branch) => set({ branch }),
      setWarehouse: (warehouse) => set({ warehouse }),

      dashboardWidgets: defaultWidgets,
      setDashboardWidgets: (widgets) => set({ dashboardWidgets: widgets }),
      resetDashboardWidgets: () => set({ dashboardWidgets: defaultWidgets }),
    }),
    {
      name: "erp-report-preferences",
      partialize: (state) => ({ dashboardWidgets: state.dashboardWidgets }),
    }
  )
)
