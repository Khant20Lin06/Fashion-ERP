"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { DateRange, DateRangePreset } from "@/features/reports/types"

const presets: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "custom", label: "Custom" },
]

type DateRangePickerProps = {
  value: DateRange
  onPresetChange: (preset: DateRangePreset) => void
  onCustomChange: (from: string, to: string) => void
}

/** Date range filter — Today / This Week / This Month / Custom, used across every report page. */
export function DateRangePicker({ value, onPresetChange, onCustomChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          size="sm"
          variant={value.preset === preset.value ? "default" : "outline"}
          onClick={() => onPresetChange(preset.value)}
        >
          {preset.label}
        </Button>
      ))}

      {value.preset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="outline" className={cn("gap-1.5")}>
              <Calendar className="size-3.5" />
              {new Date(value.from).toLocaleDateString()} – {new Date(value.to).toLocaleDateString()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={value.from.slice(0, 10)}
                  onChange={(e) => onCustomChange(new Date(e.target.value).toISOString(), value.to)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={value.to.slice(0, 10)}
                  onChange={(e) => onCustomChange(value.from, new Date(e.target.value).toISOString())}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
