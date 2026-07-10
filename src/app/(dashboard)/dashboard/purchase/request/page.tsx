"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchaseRequestForm } from "@/features/purchase/components/PurchaseRequestForm"
import { PurchaseRequestList } from "@/features/purchase/components/PurchaseRequestList"

export default function PurchaseRequestPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Request</h1>
        <p className="text-sm text-muted-foreground">Internal requests before purchasing, with an approval workflow.</p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Request</TabsTrigger>
          <TabsTrigger value="list">All Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <PurchaseRequestForm />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <PurchaseRequestList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
