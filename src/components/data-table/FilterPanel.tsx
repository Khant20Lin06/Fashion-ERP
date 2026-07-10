"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export type FilterFieldOption = { label: string; value: string }

export type FilterFieldConfig = {
  key: string
  label: string
  options: FilterFieldOption[]
}

export type FilterValues = Record<string, string | undefined>

type FilterPanelProps = {
  fields: FilterFieldConfig[]
  values: FilterValues
  onChange: (values: FilterValues) => void
}

/**
 * Config-driven filter panel — reused for Product filters (Category, Brand,
 * Size, Color, Status), Sales filters (Date range, Payment method,
 * Customer), Inventory filters (Warehouse, Stock status), etc. Each screen
 * passes its own `fields` config rather than a bespoke filter UI being
 * built per module.
 */
export function FilterPanel({ fields, values, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false)
  const activeCount = Object.values(values).filter(Boolean).length

  function setField(key: string, value: string | undefined) {
    onChange({ ...values, [key]: value })
  }

  function clearAll() {
    onChange({})
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="size-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filters</p>
          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-xs text-muted-foreground">
              Clear all
            </Button>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={`filter-${field.key}`} className="text-xs text-muted-foreground">
                {field.label}
              </Label>
              <div className="flex items-center gap-1.5">
                <Select
                  value={values[field.key] ?? ""}
                  onValueChange={(value) => setField(field.key, value || undefined)}
                >
                  <SelectTrigger id={`filter-${field.key}`} size="sm" className="flex-1">
                    <SelectValue placeholder={`Any ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {values[field.key] && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => setField(field.key, undefined)}
                    aria-label={`Clear ${field.label} filter`}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
