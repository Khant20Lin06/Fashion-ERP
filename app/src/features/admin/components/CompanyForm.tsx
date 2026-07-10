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
import { useCreateCompany, useUpdateCompany } from "../hooks/useRoles"
import { companyFormSchema, type CompanyFormValues } from "../schemas/role.schema"
import type { Company } from "../types"

type CompanyFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company
}

/** Create/edit dialog for a Company — Name, Tax ID, Currency, Fiscal Year, Address, Status. */
export function CompanyFormDialog({ open, onOpenChange, company }: CompanyFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <CompanyFormDialogContent onOpenChange={onOpenChange} company={company} key={company?.id ?? "new"} />}
      </DialogContent>
    </Dialog>
  )
}

function CompanyFormDialogContent({ onOpenChange, company }: { onOpenChange: (open: boolean) => void; company?: Company }) {
  const isEditing = !!company
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany(company?.id ?? "")

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: company?.name ?? "",
      taxId: company?.taxId ?? "",
      currency: company?.currency ?? "USD",
      fiscalYearStart: company?.fiscalYearStart ?? "01-01",
      address: company?.address ?? "",
      status: company?.status ?? "active",
    },
  })

  function onSubmit(values: CompanyFormValues) {
    const mutation = isEditing ? updateCompany : createCompany
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Company" : "New Company"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Myanmar Fashion Co." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Input placeholder="e.g. MMK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fiscalYearStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal Year Start (MM-DD)</FormLabel>
                  <FormControl>
                    <Input placeholder="04-01" {...field} />
                  </FormControl>
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
            <Button type="submit" disabled={createCompany.isPending || updateCompany.isPending}>
              {isEditing ? "Save Changes" : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
