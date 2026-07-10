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
import { Badge } from "@/components/ui/badge"
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

const availableGroups = ["all", "users", "settings", "reports", "sales", "pos", "inventory", "purchase", "accounting", "hr", "ess"]

type RoleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role
}

/** Create/edit dialog for a Role — Role Name, Description, Permission Groups, Status. */
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
      description: role?.description ?? "",
      permissionGroups: role?.permissionGroups ?? [],
      status: role?.status ?? "active",
    },
  })

  const selectedGroups = form.watch("permissionGroups")

  function toggleGroup(group: string) {
    const current = form.getValues("permissionGroups")
    form.setValue(
      "permissionGroups",
      current.includes(group) ? current.filter((g) => g !== group) : [...current, group],
      { shouldValidate: true }
    )
  }

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
                  <Input placeholder="e.g. Store Manager" {...field} disabled={role?.isSystem} />
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
          <FormItem>
            <FormLabel>Permission Groups</FormLabel>
            <div className="flex flex-wrap gap-1.5">
              {availableGroups.map((group) => (
                <Badge
                  key={group}
                  variant={selectedGroups.includes(group) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleGroup(group)}
                >
                  {group}
                </Badge>
              ))}
            </div>
            <FormMessage>{form.formState.errors.permissionGroups?.message}</FormMessage>
          </FormItem>
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
