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
import { useCreateRole, useUpdateRole } from "../hooks/useRoles"
import { roleFormSchema, type RoleFormValues } from "../schemas/role.schema"
import type { Role } from "../types"

type RoleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role
}

/** Create/edit dialog for a Role — Name, Code, Description, Status.
 * Permission assignment happens separately via the Permission Matrix
 * screen (PUT /roles/:id/permissions), not on this form — the real backend
 * has no combined create-with-permissions endpoint. */
export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <RoleFormDialogContent onOpenChange={onOpenChange} role={role} key={role?.id ?? "new"} />}
      </DialogContent>
    </Dialog>
  )
}

function RoleFormDialogContent({ onOpenChange, role }: { onOpenChange: (open: boolean) => void; role?: Role }) {
  const isEditing = !!role
  const createRole = useCreateRole()
  const updateRole = useUpdateRole(role?.id ?? "")

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name ?? "",
      code: role?.code ?? "",
      description: role?.description ?? "",
      status: role?.status ?? "active",
    },
  })

  function onSubmit(values: RoleFormValues) {
    const mutation = isEditing ? updateRole : createRole
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Role" : "New Role"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Store Manager" {...field} disabled={role?.isSystemRole} />
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
                  <Input placeholder="e.g. STORE_MANAGER" className="font-mono uppercase" {...field} disabled={isEditing} />
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
                  <Textarea placeholder="What this role can do…" rows={2} {...field} />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRole.isPending || updateRole.isPending}>
              {isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
