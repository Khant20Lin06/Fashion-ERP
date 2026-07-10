"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useTaxRules, useToggleTaxRule } from "../hooks/usePayments"
import type { TaxType } from "../types"

const typeLabels: Record<TaxType, string> = {
  vat: "VAT",
  sales_tax: "Sales Tax",
  purchase_tax: "Purchase Tax",
  withholding_tax: "Withholding Tax",
}

/** Tax rule list — Name, Rate, Type, Account Mapping, with active toggle. */
export function TaxRuleList() {
  const { data, isLoading, isError, refetch } = useTaxRules()
  const { mutate: toggleRule } = useToggleTaxRule()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load tax rules." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No tax rules" description="Create a tax rule to get started." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((rule) => (
        <Card key={rule.id}>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{rule.name}</p>
                <Badge variant="outline">{typeLabels[rule.type]}</Badge>
                <Badge variant="secondary">{rule.ratePercent}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Mapped to: {rule.accountName}</p>
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
