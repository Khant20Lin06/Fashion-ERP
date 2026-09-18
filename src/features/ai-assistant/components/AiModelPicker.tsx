"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { buildNativeScrollbarClassName } from "@/components/ui/native-scrollbar.classes"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { AiModelInfo } from "../api/ai-chat.api"

function formatPrice(pricePerMillion: number | null): string {
  if (pricePerMillion === null) return ""
  if (pricePerMillion === 0) return "Free"
  return `$${pricePerMillion.toFixed(2)}/M`
}

/**
 * Searchable picker over the remote provider's live model catalog (can be
 * hundreds of entries — e.g. OpenRouter's ~400 models — so a plain <Select>
 * isn't usable). Sorted cheapest-first so free/low-cost models surface
 * before ones likely to fail with HTTP 402 on an account with no credit
 * for premium models.
 */
export function AiModelPicker({
  models,
  value,
  onChange,
}: {
  models: AiModelInfo[]
  value: string | undefined
  onChange: (modelId: string) => void
}) {
  const [open, setOpen] = useState(false)

  const sorted = [...models].sort((a, b) => {
    const priceA = a.promptPricePerMillionTokens ?? Infinity
    const priceB = b.promptPricePerMillionTokens ?? Infinity
    return priceA - priceB
  })

  const selected = models.find((m) => m.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          title={selected?.name ?? selected?.id ?? "Select model"}
          className="w-auto max-w-56 justify-between gap-1.5 text-xs"
        >
          <span className="truncate">{selected?.name ?? selected?.id ?? "Select model"}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 max-h-96 p-0"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Command className="max-h-96">
          <CommandInput placeholder="Search models…" />
          <CommandList
            hideScrollbar={false}
            className={cn(buildNativeScrollbarClassName("max-h-80"), "overscroll-contain")}
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {sorted.map((model) => (
                <CommandItem
                  key={model.id}
                  value={`${model.id} ${model.name}`}
                  title={model.name}
                  onSelect={() => {
                    onChange(model.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("size-4", model.id === value ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1 truncate">{model.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatPrice(model.promptPricePerMillionTokens)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
