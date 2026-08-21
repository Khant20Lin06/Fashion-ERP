"use client"

import { useEffect } from "react"
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
import { useCreatePayrollComponent, useUpdatePayrollComponent } from "../hooks/usePayroll"
import type { PayrollCalculationType, PayrollComponent, PayrollComponentType } from "../types"

type PayrollComponentFormValues = {
  name: string
  code: string
  type: PayrollComponentType
  calculationType: PayrollCalculationType
  amountValue: string
  isTaxable: boolean
}

type PayrollComponentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  component?: PayrollComponent
}

function defaultValuesFor(component: PayrollComponent | undefined): PayrollComponentFormValues {
  return {
    name: component?.name ?? "",
    code: component?.code ?? "",
    type: component?.type ?? "EARNING",
    calculationType: component?.calculationType ?? "FIXED_AMOUNT",
    amountValue: component
      ? (component.calculationType === "FIXED_AMOUNT" ? component.fixedAmount : component.percentage) ?? ""
      : "",
    isTaxable: component?.isTaxable ?? false,
  }
}

/**
 * Create/edit dialog for a Payroll Component (earning/deduction/employer
 * contribution). code/type/calculationType are immutable after creation
 * (the real UpdatePayrollComponentDto has no such fields) — disabled,
 * not hidden, when editing. Exactly one of fixedAmount/percentage is
 * sent, matching calculationType, since the backend rejects both being
 * set together.
 */
export function PayrollComponentFormDialog({ open, onOpenChange, component }: PayrollComponentFormDialogProps) {
  const createComponent = useCreatePayrollComponent()
  const updateComponent = useUpdatePayrollComponent(component?.id ?? "")
  const isEditing = !!component

  const form = useForm<PayrollComponentFormValues>({ defaultValues: defaultValuesFor(component) })
  const calculationType = form.watch("calculationType")

  useEffect(() => {
    if (open) form.reset(defaultValuesFor(component))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, component])

  function onSubmit(values: PayrollComponentFormValues) {
    if (isEditing) {
      updateComponent.mutate(
        {
          name: values.name,
          fixedAmount: values.calculationType === "FIXED_AMOUNT" ? values.amountValue : undefined,
          percentage: values.calculationType === "PERCENTAGE_OF_BASE" ? values.amountValue : undefined,
          isTaxable: values.isTaxable,
        },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }
    createComponent.mutate(
      {
        name: values.name,
        code: values.code,
        type: values.type,
        calculationType: values.calculationType,
        fixedAmount: values.calculationType === "FIXED_AMOUNT" ? values.amountValue : undefined,
        percentage: values.calculationType === "PERCENTAGE_OF_BASE" ? values.amountValue : undefined,
        isTaxable: values.isTaxable,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  const isPending = createComponent.isPending || updateComponent.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Payroll Component" : "New Payroll Component"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Housing Allowance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              rules={{ required: "Code is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HOUSING" className="font-mono" disabled={isEditing} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EARNING">Earning</SelectItem>
                        <SelectItem value="DEDUCTION">Deduction</SelectItem>
                        <SelectItem value="EMPLOYER_CONTRIBUTION">Employer Contribution</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="calculationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calculation</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                        <SelectItem value="PERCENTAGE_OF_BASE">Percentage of Base</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amountValue"
              rules={{ required: "Value is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{calculationType === "FIXED_AMOUNT" ? "Fixed Amount" : "Percentage of Base"}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={calculationType === "PERCENTAGE_OF_BASE" ? 100 : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isTaxable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">Taxable</FormLabel>
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
              <Button type="submit" disabled={isPending}>
                {isEditing ? "Save Changes" : "Create Component"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
