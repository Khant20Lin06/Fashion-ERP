"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  supplierFormSchema,
  type SupplierFormInput,
  type SupplierFormValues,
} from "../schemas/supplier.schema"
import { useCreateSupplier, useSupplierPaymentTerms, useUpdateSupplier } from "../hooks/useSuppliers"
import type { Supplier } from "../types"

type SupplierFormProps = {
  supplier?: Supplier
}

const EMPTY_PAYMENT_TERM = "__none__"

/** Supplier create/edit form aligned to the real backend contract. */
export function SupplierForm({ supplier }: SupplierFormProps) {
  const router = useRouter()
  const isEditing = !!supplier
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier(supplier?.id ?? "")
  const { data: paymentTerms } = useSupplierPaymentTerms()

  const form = useForm<SupplierFormInput, unknown, SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier?.name ?? "",
      code: supplier?.code ?? "",
      type: supplier?.type ?? "manufacturer",
      status: supplier?.status ?? "active",
      contactPerson: supplier?.contactPerson ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      paymentTermId: supplier?.paymentTermId ?? "",
      creditDays: supplier?.creditDays ?? 0,
      openingBalanceAmount: (supplier?.openingBalance ?? 0).toFixed(2),
      notes: supplier?.notes ?? "",
    },
  })

  const paymentTermId = form.watch("paymentTermId")
  const creditDays = form.watch("creditDays")
  const selectedPaymentTerm = (paymentTerms ?? []).find((term) => term.id === paymentTermId)

  useEffect(() => {
    const nextCreditDays = selectedPaymentTerm ? selectedPaymentTerm.dueDays : 0
    if (creditDays === nextCreditDays) return
    form.setValue("creditDays", nextCreditDays, { shouldDirty: true })
  }, [creditDays, form, selectedPaymentTerm])

  function onSubmit(values: SupplierFormValues) {
    const mutation = isEditing ? updateSupplier : createSupplier
    mutation.mutate(values, { onSuccess: () => router.push("/dashboard/purchase/suppliers") })
  }

  const isPending = createSupplier.isPending || updateSupplier.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jakarta Batik & Silk Studio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SUP-JAKARTA-BATIK"
                      className="font-mono"
                      disabled={isEditing}
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  {isEditing ? (
                    <FormDescription>Supplier code cannot be changed after creation.</FormDescription>
                  ) : (
                    <FormDescription>
                      Optional. Leave blank to auto-generate. Use uppercase letters, numbers, - and _ only.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Status changes are applied through the backend activate/deactivate/block routes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Supplier Type</FormLabel>
              <div className="flex h-10 items-center rounded-lg border bg-muted px-3 text-sm text-muted-foreground">
                Manufacturer
              </div>
              <FormDescription>The current backend does not persist a custom supplier type.</FormDescription>
            </FormItem>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@company.com" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty if the supplier has no email address yet.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="paymentTermId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Term</FormLabel>
                  <Select
                    value={field.value || EMPTY_PAYMENT_TERM}
                    onValueChange={(value) => field.onChange(value === EMPTY_PAYMENT_TERM ? "" : value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select payment term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EMPTY_PAYMENT_TERM}>No payment term</SelectItem>
                      {(paymentTerms ?? []).map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedPaymentTerm
                      ? `Payment is due in ${selectedPaymentTerm.dueDays} day${selectedPaymentTerm.dueDays === 1 ? "" : "s"}.`
                      : "Choose when payment becomes due for this supplier."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creditDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={3650}
                      step={1}
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormDescription>How many days this supplier extends payment to your company.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="openingBalanceAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Initial payable balance stored on the supplier master record.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Internal notes about this supplier..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/purchase/suppliers")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : null}
            {isEditing ? "Save Changes" : "Create Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
