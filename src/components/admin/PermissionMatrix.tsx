"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Permission } from "@/features/admin/types"

type PermissionMatrixProps = {
  /** Every real permission row (GET /permissions) — the full universe to
   * render as columns, grouped by resource. */
  permissions: Permission[]
  /** The permission codes currently granted (a subset of `permissions`). */
  grantedCodes: string[]
  onToggle?: (permissionId: string, checked: boolean) => void
  readOnly?: boolean
}

/** Resource x Action permission grid, built from the real flat GET
 * /permissions list (resource/action/code) — not a fixed frontend-invented
 * module/action taxonomy. Distinct actions are collected across all
 * resources present so the grid stays rectangular; a resource that doesn't
 * support a given action simply has no cell content for it. */
export function PermissionMatrix({ permissions, grantedCodes, onToggle, readOnly }: PermissionMatrixProps) {
  const { resources, actions, byResourceAction } = useMemo(() => {
    const resourceSet = new Set<string>()
    const actionSet = new Set<string>()
    const map = new Map<string, Permission>()
    for (const p of permissions) {
      resourceSet.add(p.resource)
      actionSet.add(p.action)
      map.set(`${p.resource}:${p.action}`, p)
    }
    return {
      resources: Array.from(resourceSet).sort(),
      actions: Array.from(actionSet).sort(),
      byResourceAction: map,
    }
  }, [permissions])

  const grantedSet = useMemo(() => new Set(grantedCodes), [grantedCodes])
  const formatLabel = (value: string) =>
    value
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{resources.length} resources</Badge>
        <Badge variant="outline">{actions.length} actions</Badge>
        <span className="text-xs text-muted-foreground">Scroll horizontally to review the full permission catalog.</span>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/60">
        <ScrollArea className="h-[65vh] w-full">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="sticky top-0 z-30">
              <tr className="border-b bg-muted/30">
                <th className="sticky left-0 z-40 min-w-[220px] bg-muted/30 px-5 py-4 text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Resource
                </th>
                {actions.map((action) => (
                  <th
                    key={action}
                    className="min-w-[120px] px-4 py-4 text-center text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    {formatLabel(action)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource} className="border-b border-border/60 last:border-0">
                  <td className="sticky left-0 z-20 bg-card px-5 py-4 font-medium">{formatLabel(resource)}</td>
                  {actions.map((action) => {
                    const permission = byResourceAction.get(`${resource}:${action}`)
                    if (!permission) return <td key={action} className="px-4 py-4 text-center" />
                    const checked = grantedSet.has(permission.code)
                    return (
                      <td key={action} className="px-4 py-4 text-center">
                        <div className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border/60 bg-background/50 px-2">
                          {readOnly ? (
                            checked ? (
                              <Check className="size-4 text-success" />
                            ) : (
                              <X className={cn("size-4 text-muted-foreground/40")} />
                            )
                          ) : (
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => onToggle?.(permission.id, !!value)}
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
    </div>
  )
}
