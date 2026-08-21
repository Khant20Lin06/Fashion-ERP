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
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "../schemas/product.schema"
import { useCategories, useCreateCategory, useUpdateCategory } from "../hooks/useCategories"
import type { Category } from "../types"

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  defaultParentId?: string
}

/** Create/edit dialog for a category — parent selection, active status. */
export function CategoryFormDialog({ open, onOpenChange, category, defaultParentId }: CategoryFormDialogProps) {
  const { data: categories } = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(category?.id ?? "")
  const isEditing = !!category

  const form = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      code: category?.code ?? "",
      name: category?.name ?? "",
      parentId: category?.parentId ?? defaultParentId ?? null,
      isActive: category?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        code: category?.code ?? "",
        name: category?.name ?? "",
        parentId: category?.parentId ?? defaultParentId ?? null,
        isActive: category?.isActive ?? true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category])

  function onSubmit(values: CategoryFormValues) {
    const mutation = isEditing ? updateCategory : createCategory
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. MEN_SHIRTS"
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                      readOnly={isEditing}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {isEditing
                      ? "Category code cannot be changed after creation."
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
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Shirts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="None (top-level)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (top-level)</SelectItem>
                      {(categories ?? [])
                        .filter((c) => c.id !== category?.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
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
              <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                {isEditing ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
