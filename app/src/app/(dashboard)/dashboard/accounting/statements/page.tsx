"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BalanceSheetStatement,
  CashFlowStatementCard,
  ProfitAndLossStatement,
} from "@/features/accounting/components/FinancialSummary"

export default function FinancialStatementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financial Statements</h1>
        <p className="text-sm text-muted-foreground">Profit &amp; Loss, Balance Sheet, and Cash Flow.</p>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList>
          <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        </TabsList>
        <TabsContent value="pnl" className="mt-4">
          <ProfitAndLossStatement />
        </TabsContent>
        <TabsContent value="balance-sheet" className="mt-4">
          <BalanceSheetStatement />
        </TabsContent>
        <TabsContent value="cash-flow" className="mt-4">
          <CashFlowStatementCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
