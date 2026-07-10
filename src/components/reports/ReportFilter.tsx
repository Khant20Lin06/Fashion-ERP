"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type ReportFilterField = {
  key: string
  label: string
  options: { label: string; value: string }[]
}

type ReportFilterProps = {
  fields: ReportFilterField[]
  values: Record<string, string | undefined>
  onChange: (key: string, value: string | undefined) => void
}

/** Inline dimension filter bar — Branch / Warehouse / Sales Person / Customer Group / Category, etc. */
export function ReportFilter({ fields, values, onChange }: ReportFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {fields.map((field) => (
        <Select
          key={field.key}
          value={values[field.key] ?? "all"}
          onValueChange={(value) => onChange(field.key, value === "all" ? undefined : value)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder={field.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {field.label}</SelectItem>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
