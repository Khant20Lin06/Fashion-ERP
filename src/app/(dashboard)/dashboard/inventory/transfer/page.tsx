"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockTransferForm } from "@/features/inventory/components/StockTransferForm";
import { TransferList } from "@/features/inventory/components/TransferList";
import { BranchTransferTable } from "@/features/inventory/components/BranchTransferTable";
import { Building2, ArrowLeftRight } from "lucide-react";

export default function StockTransferPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Transfer Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage multi-branch inter-store stock transfers with full dispatch & receiving workflows, or perform instant warehouse transfers.
        </p>
      </div>

      <Tabs defaultValue="branch-transfers" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="branch-transfers" className="gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Branch Transfers (Multi-Step Workflow)
          </TabsTrigger>
          <TabsTrigger value="quick-transfer" className="gap-2">
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            Quick Warehouse Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branch-transfers" className="space-y-4">
          <BranchTransferTable />
        </TabsContent>

        <TabsContent value="quick-transfer" className="space-y-4">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="new">New Quick Transfer</TabsTrigger>
              <TabsTrigger value="list">Completed Transfers</TabsTrigger>
            </TabsList>
            <TabsContent value="new" className="mt-4">
              <StockTransferForm />
            </TabsContent>
            <TabsContent value="list" className="mt-4">
              <TransferList />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
