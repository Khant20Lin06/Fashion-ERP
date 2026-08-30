"use client"

import { PriceListWorkspace } from "@/features/products/components/PriceListWorkspace"

export default function PriceListsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Price Lists</h1>
        <p className="text-sm text-muted-foreground">
          Manage effective-dated selling prices by product variant and transactional UOM.
        </p>
      </div>

      <PriceListWorkspace />
    </div>
  )
}
