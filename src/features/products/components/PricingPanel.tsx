"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarginCard, PriceCard } from "@/components/products/PriceCard"
import type { ProductPricing } from "../types"

type PricingPanelProps = {
  value: ProductPricing
  onChange: (value: ProductPricing) => void
}

/** Pricing section of the product form — cost/selling/discount/wholesale + tax, with live margin. */
export function PricingPanel({ value, onChange }: PricingPanelProps) {
  function set<K extends keyof ProductPricing>(key: K, raw: string) {
    const parsed = raw === "" ? 0 : Number(raw)
    onChange({ ...value, [key]: Number.isNaN(parsed) ? 0 : parsed })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pricing</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="cost-price">Cost Price</Label>
            <Input
              id="cost-price"
              type="number"
              min={0}
              step="0.01"
              value={value.costPrice}
              onChange={(e) => set("costPrice", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="selling-price">Selling Price</Label>
            <Input
              id="selling-price"
              type="number"
              min={0}
              step="0.01"
              value={value.sellingPrice}
              onChange={(e) => set("sellingPrice", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="discount-price">Discount Price</Label>
            <Input
              id="discount-price"
              type="number"
              min={0}
              step="0.01"
              value={value.discountPrice ?? ""}
              onChange={(e) => set("discountPrice", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wholesale-price">Wholesale Price</Label>
            <Input
              id="wholesale-price"
              type="number"
              min={0}
              step="0.01"
              value={value.wholesalePrice ?? ""}
              onChange={(e) => set("wholesalePrice", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax-rate">Tax Rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={value.taxRate}
              onChange={(e) => set("taxRate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <PriceCard label="Cost Price" value={value.costPrice} tone="muted" />
          <PriceCard label="Selling Price" value={value.sellingPrice} />
          {value.discountPrice ? <PriceCard label="Discount Price" value={value.discountPrice} tone="muted" /> : null}
          <MarginCard costPrice={value.costPrice} sellingPrice={value.sellingPrice} />
        </div>
      </CardContent>
    </Card>
  )
}
