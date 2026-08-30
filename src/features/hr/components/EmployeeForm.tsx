"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type UseFormSetError, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toApiError } from "@/lib/api/errors"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { employeeFormSchema, type EmployeeFormValues } from "../schemas/employee.schema"
import { useCreateEmployee, useUpdateEmployee } from "../hooks/useEmployees"
import { useBranches, useDepartments, useDesignations } from "../hooks/useOrganization"
import type { Employee } from "../types"

type EmployeeFormProps = {
  employee?: Employee
}

const NO_DESIGNATION_VALUE = "__none__"

function applyEmployeeMutationErrors(
  error: unknown,
  setError: UseFormSetError<EmployeeFormValues>,
): string | null {
  const apiError = toApiError(error)
  const message = apiError.message.toLowerCase()

  if (message.includes("employee code already exists")) {
    setError("employeeCode", { type: "server", message: "This employee ID is already in use." })
    return null
  }

  if (message.includes("branchid")) {
    setError("branchId", { type: "server", message: "Please choose a valid branch." })
    return null
  }

  if (message.includes("departmentid")) {
    setError("departmentId", { type: "server", message: "Please choose a valid department." })
    return null
  }

  if (message.includes("designationid")) {
    setError("designationId", { type: "server", message: "Please choose a valid designation." })
    return null
  }

  if (message.includes("assignment dates overlap")) {
    setError("joiningDate", { type: "server", message: "Joining date overlaps an existing assignment." })
    return null
  }

  return apiError.message
}

export function EmployeeForm({ employee }: EmployeeFormProps) {
  const router = useRouter()
  const isEditing = !!employee
  const { data: departments } = useDepartments()
  const { data: designations } = useDesignations()
  const { data: branches } = useBranches()
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee(employee?.id ?? "")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: employee?.name ?? "",
      dateOfBirth: employee?.dateOfBirth ?? "",
      phone: employee?.phone ?? "",
      email: employee?.email ?? "",
      address: employee?.address ?? "",
      employeeCode: employee?.employeeCode ?? "",
      departmentId: employee?.departmentId ?? "",
      designationId: employee?.designationId ?? "",
      branchId: employee?.branchId ?? "",
      joiningDate: employee?.joiningDate ? employee.joiningDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    },
  })

  async function onSubmit(values: EmployeeFormValues) {
    form.clearErrors()
    setSubmitError(null)
    const mutation = isEditing ? updateEmployee : createEmployee
    try {
      await mutation.mutateAsync(values)
      router.push("/dashboard/hr/employees")
    } catch (error) {
      setSubmitError(applyEmployeeMutationErrors(error, form.setError))
    }
  }

  const isPending = createEmployee.isPending || updateEmployee.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input placeholder="Phone number" {...field} />
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
                    <Input type="email" placeholder="name@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. EMP-0008" className="font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joiningDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(departments ?? []).map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
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
              name="designationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <Select
                    value={field.value || NO_DESIGNATION_VALUE}
                    onValueChange={(value) => field.onChange(value === NO_DESIGNATION_VALUE ? "" : value)}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select designation (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_DESIGNATION_VALUE}>No designation yet</SelectItem>
                      {(designations ?? []).map((designation) => (
                        <SelectItem key={designation.id} value={designation.id}>
                          {designation.name}
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
              name="branchId"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Branch</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(branches ?? []).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing ? (
                    <p className="text-xs text-muted-foreground">
                      Branch transfer is handled in a separate workflow.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/hr/employees")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : null}
              {isEditing ? "Save Changes" : "Create Employee"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
