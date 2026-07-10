"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { formatCurrency } from "@/lib/format"
import { useEmployees } from "../hooks/useEmployees"
import { useCreatePayrollEntry } from "../hooks/usePayroll"
import { calculateNetSalary, payrollEntryFormSchema, type PayrollEntryFormValues } from "../schemas/payroll.schema"

/** Payroll entry form — Net Salary = Basic + Allowance + Bonus - Deduction - Tax, calculated live. */
export function PayrollEntryForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { data: employees } = useEmployees()
  const createEntry = useCreatePayrollEntry()

  const form = useForm<PayrollEntryFormValues>({
    resolver: zodResolver(payrollEntryFormSchema),
    defaultValues: {
      employeeId: "",
      period: new Date().toISOString().slice(0, 7),
      basicSalary: 0,
      allowance: 0,
      bonus: 0,
      deduction: 0,
      tax: 0,
    },
  })

  const values = form.watch()
  const netSalary = calculateNetSalary(values)

  function onSubmit(formValues: PayrollEntryFormValues) {
    createEntry.mutate(formValues, {
      onSuccess: () => {
        form.reset({
          employeeId: "",
          period: new Date().toISOString().slice(0, 7),
          basicSalary: 0,
          allowance: 0,
          bonus: 0,
          deduction: 0,
          tax: 0,
        })
        onSubmitted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Payroll Entry</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(employees ?? []).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basicSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Basic Salary</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} value={field.value} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allowance</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} value={field.value} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} value={field.value} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deduction</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} value={field.value} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} value={field.value} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-end">
              <div className="w-full rounded-lg border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Net Salary</p>
                <p className="text-xl font-semibold">{formatCurrency(netSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createEntry.isPending}>
            Create Payroll Entry
          </Button>
        </div>
      </form>
    </Form>
  )
}
