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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreatePayrollPeriod } from "../hooks/usePayroll"

type PayrollPeriodFormValues = {
  name: string
  startDate: string
  endDate: string
  payDate: string
}

type PayrollPeriodFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Create dialog for a Payroll Period. No edit — periods are immutable
 * once created; only cancellation is supported (see PayrollPeriodList).
 * The real backend rejects a duplicate exact (startDate, endDate) pair
 * for the company with 409 Conflict, and requires payDate >= endDate. */
export function PayrollPeriodFormDialog({ open, onOpenChange }: PayrollPeriodFormDialogProps) {
  const createPeriod = useCreatePayrollPeriod()

  const form = useForm<PayrollPeriodFormValues>({
    defaultValues: { name: "", startDate: "", endDate: "", payDate: "" },
  })

  function onSubmit(values: PayrollPeriodFormValues) {
    createPeriod.mutate(values, {
      onSuccess: () => {
        form.reset({ name: "", startDate: "", endDate: "", payDate: "" })
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Payroll Period</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. February 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                rules={{ required: "End date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payDate"
              rules={{ required: "Pay date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pay Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPeriod.isPending}>
                Create Period
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
