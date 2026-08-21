"use client"

import { useState } from "react"
import { Award, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { LoyaltyCard } from "@/components/sales/LoyaltyCard"
import { formatNumber, formatRelativeTime } from "@/lib/format"
import { useLoyaltyBalance, useLoyaltyTransactions, useRedeemLoyaltyPoints } from "../hooks/useInvoice"
import type { Customer } from "../types"

// The real backend has no fixed points-per-dollar-spent or redemption-rate
// constant — those are configurable per company via GET/PUT
// /loyalty/program (pointsPerCurrencyUnit, redemptionValuePerPoint), not
// wired into this panel yet. Showing a made-up rate here would misstate
// the actual program config, so the panel no longer displays or uses one.

type LoyaltyPanelProps = {
  customer: Customer
}

/** Loyalty program panel — points balance, earn/redeem, membership level. */
export function LoyaltyPanel({ customer }: LoyaltyPanelProps) {
  const { data: balance, isLoading: isBalanceLoading } = useLoyaltyBalance(customer.id)
  const { data: transactions } = useLoyaltyTransactions(customer.id)
  const redeemPoints = useRedeemLoyaltyPoints(customer.id)
  const [redeemAmount, setRedeemAmount] = useState(0)

  const availablePoints = balance ?? 0
  const canRedeem = redeemAmount > 0 && redeemAmount <= availablePoints && !isBalanceLoading

  return (
    <div className="flex flex-col gap-4">
      <LoyaltyCard points={availablePoints} memberLevel={customer.memberLevel} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="size-4" /> Redeem Points
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {isBalanceLoading ? "Loading balance…" : `${formatNumber(availablePoints)} points available`}
          </p>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium">Points to redeem</label>
              <Input
                type="number"
                min={0}
                max={availablePoints}
                value={redeemAmount || ""}
                onChange={(e) => setRedeemAmount(Number(e.target.value) || 0)}
              />
            </div>
            <Button
              onClick={() => redeemPoints.mutate(redeemAmount, { onSuccess: () => setRedeemAmount(0) })}
              disabled={!canRedeem || redeemPoints.isPending}
            >
              Redeem
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="size-4" /> Points History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <EmptyState title="No point activity" description="Loyalty point earnings and redemptions will appear here." />
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tx.reference} · {formatRelativeTime(tx.date)}
                  </span>
                  <span className={tx.type === "earn" ? "text-success" : "text-destructive"}>
                    {tx.points > 0 ? "+" : ""}
                    {formatNumber(tx.points)} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
