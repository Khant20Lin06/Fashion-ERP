"use client"

import { VariantTable } from "@/features/products/components/VariantTable"

export default function VariantsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Variant Management</h1>
        <p className="text-sm text-muted-foreground">Every SKU across all products, with attributes, pricing, and stock.</p>
      </div>

      <VariantTable />
    </div>
  )
}
