"use client"

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateAttributeOption, useUpdateAttributeOption } from "../hooks/useAttributes"
import { attributeOptionFormSchema, type AttributeOptionFormValues } from "../schemas/product.schema"
import type { AttributeKind, AttributeOption } from "../types"

type AttributeOptionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: AttributeKind
  option?: AttributeOption
}

const kindLabel: Record<AttributeKind, string> = {
  size: "Size",
  color: "Color",
  style: "Style",
  material: "Material",
}

/** Create/edit dialog for a Size or Color attribute option. */
export function AttributeOptionFormDialog({ open, onOpenChange, kind, option }: AttributeOptionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <AttributeOptionFormDialogContent
            onOpenChange={onOpenChange}
            kind={kind}
            option={option}
            key={option?.id ?? "new"}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function AttributeOptionFormDialogContent({
  onOpenChange,
  kind,
  option,
}: {
  onOpenChange: (open: boolean) => void
  kind: AttributeKind
  option?: AttributeOption
}) {
  const isEditing = !!option
  const createOption = useCreateAttributeOption(kind)
  const updateOption = useUpdateAttributeOption(option?.id ?? "", kind)

  const form = useForm<AttributeOptionFormValues>({
    resolver: zodResolver(attributeOptionFormSchema),
    defaultValues: {
      value: option?.value ?? "",
      swatch: option?.swatch ?? "",
    },
  })

  function onSubmit(values: AttributeOptionFormValues) {
    const mutation = isEditing ? updateOption : createOption
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? `Edit ${kindLabel[kind]}` : `New ${kindLabel[kind]}`}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{kindLabel[kind]} Name</FormLabel>
                <FormControl>
                  <Input placeholder={kind === "size" ? "e.g. XL" : "e.g. Navy Blue"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {kind === "color" && (
            <FormField
              control={form.control}
              name="swatch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Swatch Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input type="color" className="h-9 w-14 p-1" value={field.value || "#000000"} onChange={field.onChange} />
                      <Input placeholder="#000000" value={field.value ?? ""} onChange={field.onChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOption.isPending || updateOption.isPending}>
              {isEditing ? "Save Changes" : `Add ${kindLabel[kind]}`}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
