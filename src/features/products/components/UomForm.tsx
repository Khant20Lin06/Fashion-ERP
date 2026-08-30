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
import { uomFormSchema, type UomFormInput, type UomFormValues } from "../schemas/product.schema"
import { useCreateUom, useUpdateUom } from "../hooks/useUoms"
import type { Uom } from "../types"

type UomFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom?: Uom
}

const categories = [
  { value: "COUNT", label: "Count" },
  { value: "WEIGHT", label: "Weight" },
  { value: "VOLUME", label: "Volume" },
  { value: "LENGTH", label: "Length" },
  { value: "AREA", label: "Area" },
] as const

export function UomFormDialog({ open, onOpenChange, uom }: UomFormDialogProps) {
  const isEditing = !!uom
  const createUom = useCreateUom()
  const updateUom = useUpdateUom(uom?.id ?? "")

  const form = useForm<UomFormInput, unknown, UomFormValues>({
    resolver: zodResolver(uomFormSchema),
    defaultValues: {
      code: uom?.code ?? "",
      name: uom?.name ?? "",
      symbol: uom?.symbol ?? "",
      category: uom?.category ?? "COUNT",
      decimalPlaces: uom?.decimalPlaces ?? 0,
      isActive: uom?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        code: uom?.code ?? "",
        name: uom?.name ?? "",
        symbol: uom?.symbol ?? "",
        category: uom?.category ?? "COUNT",
        decimalPlaces: uom?.decimalPlaces ?? 0,
        isActive: uom?.isActive ?? true,
      })
    }
  }, [form, open, uom])

  function onSubmit(values: UomFormValues) {
    const mutation = isEditing ? updateUom : createUom
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit UOM" : "New UOM"}</DialogTitle>
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
                        placeholder="e.g. PCS"
                        {...field}
                        value={(field.value ?? "") as string}
                        onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. pcs" {...field} value={field.value ?? ""} />
                    </FormControl>
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
                    <Input placeholder="e.g. Pieces" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
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
                name="decimalPlaces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decimal Places</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={6}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              <Button type="submit" disabled={createUom.isPending || updateUom.isPending}>
                {isEditing ? "Save Changes" : "Create UOM"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
