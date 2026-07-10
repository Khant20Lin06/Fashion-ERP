"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { DiscountBadge } from "@/components/sales/DiscountBadge"
import { useDiscountRules, useToggleDiscountRule } from "../hooks/useInvoice"

/** Discount rule management list — Product / Category / Customer / Campaign discounts with active toggle. */
export function DiscountRuleList() {
  const { data, isLoading, isError, refetch } = useDiscountRules()
  const { mutate: toggleRule } = useToggleDiscountRule()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load discount rules." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No discount rules" description="Create a discount rule to get started." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((rule) => (
        <Card key={rule.id}>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{rule.name}</p>
                <DiscountBadge kind={rule.kind} percent={rule.percent} />
              </div>
              <p className="text-xs text-muted-foreground">
                Target: {rule.target}
                {rule.startDate && rule.endDate
                  ? ` · ${new Date(rule.startDate).toLocaleDateString()} - ${new Date(rule.endDate).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{rule.isActive ? "Active" : "Inactive"}</span>
              <Switch checked={rule.isActive} onCheckedChange={(checked) => toggleRule({ id: rule.id, isActive: checked })} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
