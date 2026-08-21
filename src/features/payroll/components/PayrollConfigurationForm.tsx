"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { usePayrollConfiguration, useUpsertPayrollConfiguration } from "../hooks/usePayroll"
import type { UnpaidLeaveCalculation } from "../types"

type PayrollConfigurationFormValues = {
  defaultCurrency: string
  unpaidLeaveCalculation: UnpaidLeaveCalculation
  workingDaysPerMonth: string
}

/**
 * Payroll Configuration — a singleton per company (GET/PUT
 * /payroll/configuration). There is deliberately no tax-rate, pay-
 * frequency, or rounding-rule field here — the real backend entity is
 * not a generic settings bag, only defaultCurrency and how unpaid leave
 * is deducted (NONE or a per-day rate based on workingDaysPerMonth).
 */
export function PayrollConfigurationForm() {
  const { data: configuration, isLoading } = usePayrollConfiguration()
  const upsert = useUpsertPayrollConfiguration()

  const form = useForm<PayrollConfigurationFormValues>({
    defaultValues: {
      defaultCurrency: configuration?.defaultCurrency ?? "USD",
      unpaidLeaveCalculation: configuration?.unpaidLeaveCalculation ?? "NONE",
      workingDaysPerMonth: configuration?.workingDaysPerMonth ? String(configuration.workingDaysPerMonth) : "",
    },
  })
  const unpaidLeaveCalculation = form.watch("unpaidLeaveCalculation")

  useEffect(() => {
    if (configuration) {
      form.reset({
        defaultCurrency: configuration.defaultCurrency,
        unpaidLeaveCalculation: configuration.unpaidLeaveCalculation,
        workingDaysPerMonth: configuration.workingDaysPerMonth ? String(configuration.workingDaysPerMonth) : "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration])

  function onSubmit(values: PayrollConfigurationFormValues) {
    upsert.mutate({
      defaultCurrency: values.defaultCurrency,
      unpaidLeaveCalculation: values.unpaidLeaveCalculation,
      workingDaysPerMonth:
        values.unpaidLeaveCalculation === "DAILY_RATE" && values.workingDaysPerMonth
          ? Number(values.workingDaysPerMonth)
          : undefined,
    })
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payroll Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="defaultCurrency"
              rules={{ required: "Currency is required", pattern: { value: /^[A-Z]{3}$/, message: "Use a 3-letter ISO code, e.g. USD" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Currency</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="USD"
                      className="w-32 font-mono uppercase"
                      maxLength={3}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unpaidLeaveCalculation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unpaid Leave Deduction</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="DAILY_RATE">Daily Rate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {unpaidLeaveCalculation === "DAILY_RATE" && (
              <FormField
                control={form.control}
                name="workingDaysPerMonth"
                rules={{ required: "Working days per month is required when using Daily Rate" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Working Days per Month</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={31} className="w-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <Button type="submit" disabled={upsert.isPending}>
                Save Configuration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
