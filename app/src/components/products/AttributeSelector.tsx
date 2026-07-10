"use client"

import { cn } from "@/lib/utils"
import type { AttributeOption } from "@/features/products/types"

type AttributeSelectorProps = {
  label: string
  options: AttributeOption[]
  selected: string[]
  onToggle: (value: string) => void
}

/** Multi-select chip grid for a single attribute dimension (size/color/style/material). */
export function AttributeSelector({ label, options, selected, onToggle }: AttributeSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-transparent hover:bg-accent"
              )}
            >
              {option.swatch && (
                <span
                  className="size-3 rounded-full border border-border/50"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden
                />
              )}
              {option.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}
