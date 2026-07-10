"use client"

import { useState } from "react"
import { Sparkles, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { AttributeSelector } from "@/components/products/AttributeSelector"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useAttributeOptions, buildVariantSku, generateVariantCombinations } from "../hooks/useVariants"
import type { ProductVariant, VariantStatus } from "../types"

type VariantManagerProps = {
  variants: ProductVariant[]
  onChange: (variants: ProductVariant[]) => void
  productId: string
  brandCode: string
  categoryCode: string
  basePricing: { costPrice: number; sellingPrice: number }
}

const statusVariant: Record<VariantStatus, "default" | "secondary"> = {
  active: "default",
  inactive: "secondary",
}

/** Fashion Variant Builder: attribute selection -> Cartesian generation -> editable variant table. */
export function VariantManager({
  variants,
  onChange,
  productId,
  brandCode,
  categoryCode,
  basePricing,
}: VariantManagerProps) {
  const attributesByKind = useAttributeOptions()
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function handleGenerate() {
    const combinations = generateVariantCombinations({ color: selectedColors, size: selectedSizes })
    const existingKeys = new Set(variants.map((v) => `${v.attributes.color}-${v.attributes.size}`))

    const newVariants: ProductVariant[] = combinations
      .filter((combo) => !existingKeys.has(`${combo.color}-${combo.size}`))
      .map((combo, index) => {
        const sequence = variants.length + index + 1
        const sku = buildVariantSku(brandCode, categoryCode, combo, sequence)
        return {
          id: `var-${Date.now()}-${index}`,
          productId,
          sku,
          barcode: `${Date.now()}`.slice(-6).padStart(6, "0") + String(sequence).padStart(3, "0"),
          attributes: combo,
          costPrice: basePricing.costPrice,
          sellingPrice: basePricing.sellingPrice,
          stockQuantity: 0,
          status: "active" as VariantStatus,
        }
      })

    onChange([...variants, ...newVariants])
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }

  function removeVariant(id: string) {
    onChange(variants.filter((v) => v.id !== id))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variant Builder</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <AttributeSelector
            label="Colors"
            options={attributesByKind.color ?? []}
            selected={selectedColors}
            onToggle={(value) => toggle(selectedColors, setSelectedColors, value)}
          />
          <AttributeSelector
            label="Sizes"
            options={attributesByKind.size ?? []}
            selected={selectedSizes}
            onToggle={(value) => toggle(selectedSizes, setSelectedSizes, value)}
          />
          <div>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={selectedColors.length === 0 && selectedSizes.length === 0}
            >
              <Sparkles /> Generate Variants
            </Button>
            {(selectedColors.length > 0 || selectedSizes.length > 0) && (
              <p className="mt-2 text-xs text-muted-foreground">
                Will generate {Math.max(selectedColors.length, 1) * Math.max(selectedSizes.length, 1)} combination(s).
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variants ({variants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <EmptyState
              title="No variants yet"
              description="Select colors and sizes above, then generate variants."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                    <TableCell>{variant.attributes.color ?? "—"}</TableCell>
                    <TableCell>{variant.attributes.size ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{variant.barcode}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.costPrice}
                        onChange={(e) => updateVariant(variant.id, { costPrice: Number(e.target.value) || 0 })}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.sellingPrice}
                        onChange={(e) => updateVariant(variant.id, { sellingPrice: Number(e.target.value) || 0 })}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(variant.id, { stockQuantity: Number(e.target.value) || 0 })}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() =>
                          updateVariant(variant.id, {
                            status: variant.status === "active" ? "inactive" : "active",
                          })
                        }
                      >
                        <Badge variant={statusVariant[variant.status]} className="cursor-pointer capitalize">
                          {variant.status}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeVariant(variant.id)}
                        aria-label="Remove variant"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {variants.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Total stock across variants: {formatNumber(variants.reduce((sum, v) => sum + v.stockQuantity, 0))} ·
              Price range: {formatCurrency(Math.min(...variants.map((v) => v.sellingPrice)))} –{" "}
              {formatCurrency(Math.max(...variants.map((v) => v.sellingPrice)))}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
