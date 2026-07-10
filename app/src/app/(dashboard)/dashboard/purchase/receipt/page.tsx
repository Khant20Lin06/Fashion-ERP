"use client"

import { Separator } from "@/components/ui/separator"
import { GoodsReceiptForm } from "@/features/purchase/components/GoodsReceiptForm"
import { GoodsReceiptList } from "@/features/purchase/components/GoodsReceiptList"

export default function GoodsReceiptPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Goods Receipt</h1>
        <p className="text-sm text-muted-foreground">Receive purchased goods into a warehouse and update inventory.</p>
      </div>

      <GoodsReceiptForm />

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Recent Receipts</h2>
        <GoodsReceiptList />
      </div>
    </div>
  )
}
