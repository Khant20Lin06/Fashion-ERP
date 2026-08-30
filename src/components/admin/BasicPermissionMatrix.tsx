"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Permission } from "@/features/admin/types"

const BASIC_MODULES = ["Product", "Inventory", "Sales", "Purchase", "Accounting", "HR", "Reports", "Administration"] as const
const BASIC_ACTIONS = ["view", "create", "edit", "delete", "approve", "export"] as const

type BasicModule = (typeof BASIC_MODULES)[number]
type BasicAction = (typeof BASIC_ACTIONS)[number]

type BasicPermissionMatrixProps = {
  permissions: Permission[]
  grantedIds: Set<string>
  onToggleGroup?: (permissionIds: string[], checked: boolean) => void
  readOnly?: boolean
}

type SummaryCell = {
  permissionIds: string[]
  grantedCount: number
}

const PRODUCT_RESOURCES = new Set([
  "categories",
  "brands",
  "collections",
  "attribute_options",
  "products",
  "product_variants",
  "product_variant_uoms",
  "barcodes",
  "price_lists",
  "price_list_items",
  "uoms",
])

const INVENTORY_RESOURCES = new Set([
  "warehouses",
  "goods_receipts",
  "stock_transfers",
  "stock_adjustments",
  "inventory_ledger",
])

const SALES_RESOURCES = new Set([
  "customers",
  "customer_groups",
  "sales_accounts",
  "sales_orders",
  "sales_invoices",
  "sales_returns",
  "payments",
  "payment_methods",
  "promotions",
  "loyalty",
  "sales",
])

const PURCHASE_RESOURCES = new Set([
  "suppliers",
  "purchase_orders",
  "purchase_receipts",
  "purchase_returns",
  "supplier_payments",
])

const ACCOUNTING_RESOURCES = new Set([
  "accounts",
  "journal_entries",
  "general_ledger",
  "trial_balance",
  "balance_sheet",
  "profit_loss",
  "ar_ap",
])

const HR_RESOURCES = new Set([
  "employees",
  "departments",
  "designations",
  "employee_assignments",
  "leave_types",
  "leave_requests",
  "attendance",
  "shifts",
  "employee_compensations",
  "payroll_components",
  "employee_payroll_components",
  "payroll_configuration",
  "payroll_periods",
  "payroll_runs",
])

const ADMINISTRATION_RESOURCES = new Set([
  "users",
  "roles",
  "permissions",
  "user_roles",
  "companies",
  "branches",
  "settings",
  "user_organizations",
  "notifications",
  "webhooks",
  "ai_assistant",
  "ai_knowledge",
])

function getBasicModule(resource: string): BasicModule {
  if (resource === "reports") return "Reports"
  if (PRODUCT_RESOURCES.has(resource)) return "Product"
  if (INVENTORY_RESOURCES.has(resource)) return "Inventory"
  if (SALES_RESOURCES.has(resource)) return "Sales"
  if (PURCHASE_RESOURCES.has(resource)) return "Purchase"
  if (ACCOUNTING_RESOURCES.has(resource)) return "Accounting"
  if (HR_RESOURCES.has(resource)) return "HR"
  if (ADMINISTRATION_RESOURCES.has(resource)) return "Administration"
  return "Administration"
}

function getBasicAction(action: string): BasicAction | null {
  const normalized = action.toLowerCase()

  if (normalized === "read" || normalized.endsWith(".read")) return "view"
  if (normalized === "create") return "create"
  if (normalized === "delete" || normalized.endsWith(".delete")) return "delete"
  if (normalized === "export" || normalized.endsWith(".export")) return "export"

  if (["approve", "reject", "confirm", "cancel", "post", "calculate", "finalize"].includes(normalized)) {
    return "approve"
  }

  if (
    normalized === "update" ||
    normalized.endsWith(".update") ||
    [
      "activate",
      "deactivate",
      "lock",
      "unlock",
      "assign",
      "remove",
      "unassign",
      "manage",
      "redeem",
      "chat",
      "ingest",
      "discount.apply",
    ].includes(normalized)
  ) {
    return "edit"
  }

  return null
}

function createEmptyCell(): SummaryCell {
  return { permissionIds: [], grantedCount: 0 }
}

function formatActionLabel(action: BasicAction) {
  return action.charAt(0).toUpperCase() + action.slice(1)
}

export function BasicPermissionMatrix({
  permissions,
  grantedIds,
  onToggleGroup,
  readOnly,
}: BasicPermissionMatrixProps) {
  const summary = useMemo(() => {
    const rows = Object.fromEntries(
      BASIC_MODULES.map((moduleName) => [
        moduleName,
        Object.fromEntries(BASIC_ACTIONS.map((action) => [action, createEmptyCell()])),
      ]),
    ) as Record<BasicModule, Record<BasicAction, SummaryCell>>

    for (const permission of permissions) {
      const moduleName = getBasicModule(permission.resource)
      const action = getBasicAction(permission.action)
      if (!action) continue

      const cell = rows[moduleName][action]
      cell.permissionIds.push(permission.id)
      if (grantedIds.has(permission.id)) {
        cell.grantedCount += 1
      }
    }

    return rows
  }, [grantedIds, permissions])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{BASIC_MODULES.length} modules</Badge>
        <Badge variant="outline">{BASIC_ACTIONS.length} actions</Badge>
      </div>

      <div className="grid gap-3 md:hidden">
        {BASIC_MODULES.map((moduleName) => (
          <div key={moduleName} className="rounded-xl border border-border/70 bg-card/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="font-medium">{moduleName}</div>
              <Badge variant="secondary">
                {BASIC_ACTIONS.reduce((count, action) => {
                  const cell = summary[moduleName][action]
                  return count + (cell.grantedCount > 0 ? 1 : 0)
                }, 0)}
                /{BASIC_ACTIONS.length}
              </Badge>
            </div>

            <div className="grid gap-2">
              {BASIC_ACTIONS.map((action) => {
                const cell = summary[moduleName][action]
                const total = cell.permissionIds.length
                const isChecked = total > 0 && cell.grantedCount === total
                const isIndeterminate = cell.grantedCount > 0 && cell.grantedCount < total

                return (
                  <div
                    key={action}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{formatActionLabel(action)}</p>
                      <p className="text-xs text-muted-foreground">
                        {total === 0 ? "Not available" : `${cell.grantedCount} of ${total} permissions`}
                      </p>
                    </div>

                    {total === 0 ? (
                      <span className="text-xs text-muted-foreground/60">-</span>
                    ) : readOnly ? (
                      isChecked ? (
                        <Check className="size-4 text-success" />
                      ) : isIndeterminate ? (
                        <span className="text-xs font-medium text-muted-foreground">{cell.grantedCount}/{total}</span>
                      ) : (
                        <X className={cn("size-4 text-muted-foreground/40")} />
                      )
                    ) : (
                      <Checkbox
                        checked={isIndeterminate ? "indeterminate" : isChecked}
                        onCheckedChange={(value) => onToggleGroup?.(cell.permissionIds, value === true)}
                        aria-label={`${moduleName} ${action}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block rounded-xl border border-border/70 bg-card/60">
        <ScrollArea className="w-full">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="sticky left-0 z-20 min-w-[180px] bg-muted/30 px-5 py-4 text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Module
                </th>
                {BASIC_ACTIONS.map((action) => (
                  <th
                    key={action}
                    className="min-w-[110px] px-4 py-4 text-center text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BASIC_MODULES.map((moduleName) => (
                <tr key={moduleName} className="border-b border-border/60 last:border-0">
                  <td className="sticky left-0 z-10 bg-card px-5 py-4 font-medium">{moduleName}</td>
                  {BASIC_ACTIONS.map((action) => {
                    const cell = summary[moduleName][action]
                    const total = cell.permissionIds.length
                    const isChecked = total > 0 && cell.grantedCount === total
                    const isIndeterminate = cell.grantedCount > 0 && cell.grantedCount < total

                    if (total === 0) {
                      return (
                        <td key={action} className="px-4 py-4 text-center text-muted-foreground/40">
                          -
                        </td>
                      )
                    }

                    return (
                      <td key={action} className="px-4 py-4 text-center">
                        <div className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border/60 bg-background/50 px-2">
                          {readOnly ? (
                            isChecked ? (
                              <Check className="size-4 text-success" />
                            ) : isIndeterminate ? (
                              <span className="text-xs font-medium text-muted-foreground">
                                {cell.grantedCount}/{total}
                              </span>
                            ) : (
                              <X className={cn("size-4 text-muted-foreground/40")} />
                            )
                          ) : (
                            <Checkbox
                              checked={isIndeterminate ? "indeterminate" : isChecked}
                              onCheckedChange={(value) => onToggleGroup?.(cell.permissionIds, value === true)}
                              aria-label={`${moduleName} ${action}`}
                            />
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <p className="text-xs text-muted-foreground">
        Basic view groups multiple backend permissions into one module action. Use Advanced view for exact resource-level control.
      </p>
    </div>
  )
}
