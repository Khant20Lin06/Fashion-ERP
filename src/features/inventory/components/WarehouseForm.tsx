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
import { useBranches, useCreateWarehouse, useUpdateWarehouse } from "../hooks/useWarehouse"
import type { WarehouseFormValues } from "../api/warehouse.api"
import type { Warehouse } from "../types"

type WarehouseFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse?: Warehouse
}

/** Create/edit dialog for a warehouse — name, code, branch, address, manager, contact, status. */
export function WarehouseFormDialog({ open, onOpenChange, warehouse }: WarehouseFormDialogProps) {
  const { data: branches } = useBranches()
  const createWarehouse = useCreateWarehouse()
  const updateWarehouse = useUpdateWarehouse(warehouse?.id ?? "")
  const isEditing = !!warehouse

  const form = useForm<WarehouseFormValues>({
    defaultValues: {
      name: warehouse?.name ?? "",
      code: warehouse?.code ?? "",
      branchId: warehouse?.branchId ?? "",
      address: warehouse?.address ?? "",
      manager: warehouse?.manager ?? "",
      contact: warehouse?.contact ?? "",
      status: warehouse?.status ?? "active",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: warehouse?.name ?? "",
        code: warehouse?.code ?? "",
        branchId: warehouse?.branchId ?? "",
        address: warehouse?.address ?? "",
        manager: warehouse?.manager ?? "",
        contact: warehouse?.contact ?? "",
        status: warehouse?.status ?? "active",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, warehouse])

  function onSubmit(values: WarehouseFormValues) {
    const mutation = isEditing ? updateWarehouse : createWarehouse
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Yangon Warehouse" {...field} />
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
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. YGN-01" className="font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(branches ?? []).map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <Input placeholder="Manager name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <FormLabel className="font-normal">Active</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value === "active"}
                      onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWarehouse.isPending || updateWarehouse.isPending}>
                {isEditing ? "Save Changes" : "Create Warehouse"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
