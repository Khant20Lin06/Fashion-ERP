"use client"

import { useState } from "react"
import { Calculator } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoneyInput } from "@/components/accounting/MoneyInput"
import { formatCurrency } from "@/lib/format"
import { useTaxRules } from "../hooks/usePayments"

/** Quick tax calculator — pick a tax rule, enter an amount, see the computed tax and total. */
export function TaxCalculator() {
  const { data: rules } = useTaxRules()
  const activeRules = (rules ?? []).filter((r) => r.isActive)
  const [ruleId, setRuleId] = useState<string | undefined>(undefined)
  const [amount, setAmount] = useState(0)

  const selectedRule = activeRules.find((r) => r.id === ruleId)
  const taxAmount = selectedRule ? (amount * selectedRule.ratePercent) / 100 : 0
  const total = amount + taxAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="size-4" /> Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tax Rule</label>
            <Select value={ruleId} onValueChange={setRuleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tax rule" />
              </SelectTrigger>
              <SelectContent>
                {activeRules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {rule.name} ({rule.ratePercent}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Amount</label>
            <MoneyInput value={amount} onChange={setAmount} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span>{formatCurrency(amount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Tax {selectedRule ? `(${selectedRule.ratePercent}%)` : ""}
            </span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-1.5 text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
