"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PromotionTable } from "@/features/promotions/components/PromotionTable"
import { PromotionFormDialog } from "@/features/promotions/components/PromotionForm"

export default function DiscountsPage() {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Percentage and fixed-amount discount codes applied at checkout.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Add Promotion
        </Button>
      </div>

      <PromotionTable />

      <PromotionFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
