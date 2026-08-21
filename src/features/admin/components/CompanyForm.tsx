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
      code: company?.code ?? "",
      name: company?.name ?? "",
      baseCurrency: company?.baseCurrency ?? "USD",
      timezone: company?.timezone ?? "",
      country: company?.country ?? "",
      phone: company?.phone ?? "",
      email: company?.email ?? "",
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MMFASHION" className="font-mono" {...field} disabled={isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MMK" className="uppercase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Asia/Yangon" {...field} />
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
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
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
