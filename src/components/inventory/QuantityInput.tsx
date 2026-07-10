"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type QuantityInputProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

/** Stepper input for entering quantities — transfer qty, adjustment qty, count qty. */
export function QuantityInput({ value, onChange, min = 0, max, className }: QuantityInputProps) {
  function clamp(next: number) {
    let result = next
    if (min !== undefined) result = Math.max(min, result)
    if (max !== undefined) result = Math.min(max, result)
    return result
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => onChange(clamp(value - 1))}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" />
      </Button>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        className="w-16 text-center"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => onChange(clamp(value + 1))}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
