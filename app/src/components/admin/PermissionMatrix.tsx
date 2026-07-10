"use client"

import { Check, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { PermissionAction, PermissionMatrixRow } from "@/features/admin/types"

const actionColumns: { key: PermissionAction; label: string }[] = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
  { key: "export", label: "Export" },
]

type PermissionMatrixProps = {
  matrix: PermissionMatrixRow[]
  onToggle?: (module: string, action: PermissionAction, checked: boolean) => void
  readOnly?: boolean
}

/** Module x Action permission grid — Role Management and Permission Matrix pages. */
export function PermissionMatrix({ matrix, onToggle, readOnly }: PermissionMatrixProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Module</th>
            {actionColumns.map((col) => (
              <th key={col.key} className="px-4 py-2.5 text-center font-medium text-muted-foreground">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr key={row.module} className="border-b last:border-0">
              <td className="px-4 py-2.5 font-medium">{row.moduleLabel}</td>
              {actionColumns.map((col) => {
                const checked = row.actions[col.key]
                return (
                  <td key={col.key} className="px-4 py-2.5 text-center">
                    {readOnly ? (
                      checked ? (
                        <Check className="mx-auto size-4 text-success" />
                      ) : (
                        <X className={cn("mx-auto size-4 text-muted-foreground/40")} />
                      )
                    ) : (
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => onToggle?.(row.module, col.key, !!value)}
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
