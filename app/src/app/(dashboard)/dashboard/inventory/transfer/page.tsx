"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockTransferForm } from "@/features/inventory/components/StockTransferForm"
import { TransferList } from "@/features/inventory/components/TransferList"

export default function StockTransferPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock Transfer</h1>
        <p className="text-sm text-muted-foreground">Move stock between warehouses with a manager approval workflow.</p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Transfer</TabsTrigger>
          <TabsTrigger value="list">All Transfers</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <StockTransferForm />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <TransferList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
