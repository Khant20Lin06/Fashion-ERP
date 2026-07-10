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
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompanies, useCreateBranch, useUpdateBranch } from "../hooks/useRoles"
import { branchFormSchema, type BranchFormValues } from "../schemas/role.schema"
import type { Branch } from "../types"

const typeOptions = [
  { value: "head_office", label: "Head Office" },
  { value: "retail_store", label: "Retail Store" },
  { value: "warehouse", label: "Warehouse" },
  { value: "outlet", label: "Outlet" },
] as const

type BranchFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch?: Branch
}

/** Create/edit dialog for a Branch — Name, Code, Company, Type, Address, Manager, Status. */
export function BranchFormDialog({ open, onOpenChange, branch }: BranchFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <BranchFormDialogContent onOpenChange={onOpenChange} branch={branch} key={branch?.id ?? "new"} />}
      </DialogContent>
    </Dialog>
  )
}

function BranchFormDialogContent({ onOpenChange, branch }: { onOpenChange: (open: boolean) => void; branch?: Branch }) {
  const isEditing = !!branch
  const { data: companies } = useCompanies()
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch(branch?.id ?? "")

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: branch?.name ?? "",
      code: branch?.code ?? "",
      companyId: branch?.companyId ?? "",
      type: branch?.type ?? "retail_store",
      address: branch?.address ?? "",
      managerId: branch?.managerId ?? "",
      warehouseId: branch?.warehouseId ?? "",
      status: branch?.status ?? "active",
    },
  })

  function onSubmit(values: BranchFormValues) {
    const mutation = isEditing ? updateBranch : createBranch
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Branch" : "New Branch"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Junction Square Store" {...field} />
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
                    <Input placeholder="e.g. RT-JS01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(companies ?? []).map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBranch.isPending || updateBranch.isPending}>
              {isEditing ? "Save Changes" : "Create Branch"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
