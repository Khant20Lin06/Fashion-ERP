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
import { useCreateEmployeeCompensation } from "../hooks/usePayroll"

type EmployeeCompensationFormValues = {
  effectiveFrom: string
  baseSalary: string
  currency: string
}

type EmployeeCompensationFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
}

/** Append-only compensation record. There is no edit/delete — a salary
 * change is a new record with a later effectiveFrom, never an overwrite
 * of history a finalized payroll run may have calculated against. */
export function EmployeeCompensationFormDialog({ open, onOpenChange, employeeId }: EmployeeCompensationFormDialogProps) {
  const createCompensation = useCreateEmployeeCompensation(employeeId)

  const form = useForm<EmployeeCompensationFormValues>({
    defaultValues: { effectiveFrom: "", baseSalary: "", currency: "USD" },
  })

  function onSubmit(values: EmployeeCompensationFormValues) {
    createCompensation.mutate(values, {
      onSuccess: () => {
        form.reset({ effectiveFrom: "", baseSalary: "", currency: "USD" })
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Compensation Record</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="effectiveFrom"
              rules={{ required: "Effective date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseSalary"
              rules={{ required: "Base salary is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              rules={{ required: "Currency is required", pattern: { value: /^[A-Z]{3}$/, message: "Use a 3-letter ISO code, e.g. USD" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCompensation.isPending}>
                Add Record
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
