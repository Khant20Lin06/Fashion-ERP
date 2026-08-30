"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { resolveCompanyId } from "@/lib/api/resolve-company-id"
import { resolveCompanyCurrency } from "@/lib/api/resolve-company-currency"
import {
  priceListFormSchema,
  type PriceListFormInput,
  type PriceListFormValues,
} from "../schemas/product.schema"
import { useCreatePriceList, useUpdatePriceList } from "../hooks/usePriceLists"
import type { PriceList } from "../types"

type PriceListFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  priceList?: PriceList
}

export function PriceListFormDialog({
  open,
  onOpenChange,
  priceList,
}: PriceListFormDialogProps) {
  const isEditing = !!priceList
  const createPriceList = useCreatePriceList()
  const updatePriceList = useUpdatePriceList(priceList?.id ?? "")

  const form = useForm<PriceListFormInput, unknown, PriceListFormValues>({
    resolver: zodResolver(priceListFormSchema),
    defaultValues: {
      code: priceList?.code ?? "",
      name: priceList?.name ?? "",
      description: priceList?.description ?? "",
      currency: priceList?.currency ?? "USD",
      isActive: priceList?.status !== "INACTIVE",
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      code: priceList?.code ?? "",
      name: priceList?.name ?? "",
      description: priceList?.description ?? "",
      currency: priceList?.currency ?? "USD",
      isActive: priceList?.status !== "INACTIVE",
    })

    if (!priceList) {
      void (async () => {
        try {
          const companyId = await resolveCompanyId()
          const currency = await resolveCompanyCurrency(companyId)
          form.setValue("currency", currency.toUpperCase())
        } catch {
          form.setValue("currency", "USD")
        }
      })()
    }
  }, [form, open, priceList])

  function onSubmit(values: PriceListFormValues) {
    const mutation = isEditing ? updatePriceList : createPriceList
    mutation.mutate(values, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Price List" : "New Price List"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. RETAIL"
                        {...field}
                        value={(field.value ?? "") as string}
                        disabled={isEditing}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                      />
                    </FormControl>
                    {isEditing ? (
                      <p className="text-xs text-muted-foreground">Code is fixed after creation to preserve downstream references.</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="USD"
                        {...field}
                        value={(field.value ?? "") as string}
                        disabled={isEditing}
                        maxLength={3}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                      />
                    </FormControl>
                    {isEditing ? (
                      <p className="text-xs text-muted-foreground">Currency is locked after creation by the backend contract.</p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Retail Selling Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Who should use this price list and when?"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={createPriceList.isPending || updatePriceList.isPending}>
                {isEditing ? "Save Changes" : "Create Price List"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
