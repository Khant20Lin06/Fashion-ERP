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
import {
  brandFormSchema,
  type BrandFormInput,
  type BrandFormValues,
} from "../schemas/product.schema"
import { useCreateBrand, useUpdateBrand } from "../hooks/useBrands"
import type { Brand } from "../types"

type BrandFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand?: Brand
}

/** Create/edit dialog for a brand — name, logo, country, description, status. */
export function BrandFormDialog({ open, onOpenChange, brand }: BrandFormDialogProps) {
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand(brand?.id ?? "")
  const isEditing = !!brand

  const form = useForm<BrandFormInput, unknown, BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      code: brand?.code ?? "",
      name: brand?.name ?? "",
      country: brand?.country ?? "",
      description: brand?.description ?? "",
      isActive: brand?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        code: brand?.code ?? "",
        name: brand?.name ?? "",
        country: brand?.country ?? "",
        description: brand?.description ?? "",
        isActive: brand?.isActive ?? true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, brand])

  function onSubmit(values: BrandFormValues) {
    const mutation = isEditing ? updateBrand : createBrand
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Brand" : "New Brand"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. NIKE"
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                      readOnly={isEditing}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {isEditing
                      ? "Brand code cannot be changed after creation."
                      : "Optional. Leave blank to auto-generate. Use uppercase letters, numbers, - and _ only."}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nike" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. USA" {...field} />
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
                    <Textarea placeholder="Brief brand description…" rows={3} {...field} />
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
              <Button type="submit" disabled={createBrand.isPending || updateBrand.isPending}>
                {isEditing ? "Save Changes" : "Create Brand"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
