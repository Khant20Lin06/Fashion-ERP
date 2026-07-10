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
import { useCreateDepartment, useUpdateDepartment } from "../hooks/useOrganization"
import { useEmployees } from "../hooks/useEmployees"
import type { DepartmentFormValues } from "../api/organization.api"
import type { Department } from "../types"

type DepartmentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department
}

/** Create/edit dialog for a department — Name, Code, Manager, Status. */
export function DepartmentFormDialog({ open, onOpenChange, department }: DepartmentFormDialogProps) {
  const { data: employees } = useEmployees()
  const createDepartment = useCreateDepartment()
  const updateDepartment = useUpdateDepartment(department?.id ?? "")
  const isEditing = !!department

  const form = useForm<DepartmentFormValues>({
    defaultValues: {
      name: department?.name ?? "",
      code: department?.code ?? "",
      managerId: department?.managerId ?? "",
      status: department?.status ?? "active",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: department?.name ?? "",
        code: department?.code ?? "",
        managerId: department?.managerId ?? "",
        status: department?.status ?? "active",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, department])

  function onSubmit(values: DepartmentFormValues) {
    const mutation = isEditing ? updateDepartment : createDepartment
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Department" : "New Department"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Marketing Department" {...field} />
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
                    <Input placeholder="e.g. MKT" className="font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(employees ?? []).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
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
              <Button type="submit" disabled={createDepartment.isPending || updateDepartment.isPending}>
                {isEditing ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
