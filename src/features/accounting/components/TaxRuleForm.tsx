"use client"

import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useAccounts } from "../hooks/useAccounts"
import { useCreateTaxRule } from "../hooks/usePayments"
import type { TaxRuleFormValues } from "../api/tax.api"
import type { TaxType } from "../types"

const typeOptions: { value: TaxType; label: string }[] = [
  { value: "vat", label: "VAT" },
  { value: "sales_tax", label: "Sales Tax" },
  { value: "purchase_tax", label: "Purchase Tax" },
  { value: "withholding_tax", label: "Withholding Tax" },
]

type TaxRuleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create dialog for a new Tax rule — Name, Rate, Type, Account Mapping, Status. */
export function TaxRuleFormDialog({ open, onOpenChange }: TaxRuleFormDialogProps) {
  const { data: accounts } = useAccounts()
  const createTaxRule = useCreateTaxRule()

  const form = useForm<TaxRuleFormValues>({
    defaultValues: { name: "", ratePercent: 0, type: "vat", accountId: "", isActive: true },
  })

  function onSubmit(values: TaxRuleFormValues) {
    createTaxRule.mutate(values, {
      onSuccess: () => {
        form.reset({ name: "", ratePercent: 0, type: "vat", accountId: "", isActive: true })
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Tax Rule</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Standard VAT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ratePercent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((option) => (
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
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Mapping</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(accounts ?? []).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
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
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaxRule.isPending}>
                Create Tax Rule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
