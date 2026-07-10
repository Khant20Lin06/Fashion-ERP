"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { MoneyInput } from "@/components/accounting/MoneyInput"
import { PaymentMethodSelector } from "@/components/accounting/PaymentMethodSelector"
import { expenseFormSchema, type ExpenseFormValues } from "../schemas/expense.schema"
import { useCreateExpense } from "../hooks/usePayments"
import type { ExpenseCategory } from "../types"

const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: "salary", label: "Salary" },
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "marketing", label: "Marketing" },
  { value: "transport", label: "Transport" },
  { value: "maintenance", label: "Maintenance" },
]

/** Expense submission form — Employee -> Manager Approval -> Finance Approval -> Payment. */
export function ExpenseForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const createExpense = useCreateExpense()

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "rent",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      method: "bank_transfer",
      description: "",
      receiptFilename: "",
    },
  })

  function onSubmit(values: ExpenseFormValues) {
    createExpense.mutate(values, {
      onSuccess: () => {
        form.reset({
          category: "rent",
          amount: 0,
          date: new Date().toISOString().slice(0, 10),
          method: "bank_transfer",
          description: "",
          receiptFilename: "",
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
            <CardTitle className="text-base">Submit Expense</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <MoneyInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <PaymentMethodSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this expense for?" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="receiptFilename"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Receipt Attachment</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files?.[0]?.name ?? "")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createExpense.isPending}>
            Submit Expense
          </Button>
        </div>
      </form>
    </Form>
  )
}
