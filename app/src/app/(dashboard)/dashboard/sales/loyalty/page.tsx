"use client"

import { useState } from "react"
import { EmptyState } from "@/components/ui/empty-state"
import { CustomerSelector } from "@/features/sales/components/CustomerSelector"
import { LoyaltyPanel } from "@/features/sales/components/LoyaltyPanel"
import { useCustomer } from "@/features/sales/hooks/useCustomers"

export default function LoyaltyPage() {
  const [customerId, setCustomerId] = useState<string | undefined>(undefined)
  const { data: customer } = useCustomer(customerId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Loyalty Program</h1>
        <p className="text-sm text-muted-foreground">View and manage a customer&apos;s loyalty points and membership.</p>
      </div>

      <div className="max-w-sm">
        <CustomerSelector value={customerId} onChange={setCustomerId} placeholder="Select a customer" />
      </div>

      {customer ? (
        <LoyaltyPanel customer={customer} />
      ) : (
        <EmptyState title="Select a customer" description="Choose a customer above to view their loyalty details." />
      )}
    </div>
  )
}
