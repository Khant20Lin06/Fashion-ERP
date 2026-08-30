"use client"

import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchaseRfqForm } from "@/features/purchase/components/PurchaseRfqForm"
import { PurchaseRfqWorkspace } from "@/features/purchase/components/PurchaseRfqWorkspace"

export default function PurchaseRfqPage() {
  const searchParams = useSearchParams()
  const defaultValue = searchParams.get("rfqId") ? "workspace" : "new"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RFQ & Quotations</h1>
        <p className="text-sm text-muted-foreground">Request prices from suppliers, compare quotations, and convert the awarded quote into a purchase order.</p>
      </div>

      <Tabs defaultValue={defaultValue}>
        <TabsList>
          <TabsTrigger value="new">New RFQ</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <PurchaseRfqForm />
        </TabsContent>
        <TabsContent value="workspace" className="mt-4">
          <PurchaseRfqWorkspace />
        </TabsContent>
      </Tabs>
    </div>
  )
}
