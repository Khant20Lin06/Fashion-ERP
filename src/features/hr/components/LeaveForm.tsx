"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useEmployees } from "../hooks/useEmployees"
import { useCreateLeaveRequest, useLeaveTypeOptions } from "../hooks/useLeave"
import { leaveRequestFormSchema, type LeaveRequestFormValues } from "../schemas/leave.schema"

const today = "2026-08-25"

/** Leave Request form - submit against the live leave-types catalog. */
export function LeaveForm({
  onSubmitted,
  fixedEmployeeId,
  fixedEmployeeName,
}: {
  onSubmitted?: () => void
  fixedEmployeeId?: string
  fixedEmployeeName?: string
}) {
  const { data: employees } = useEmployees()
  const { data: leaveTypeOptions, isLoading: leaveTypesLoading, isError: leaveTypesError } = useLeaveTypeOptions()
  const createLeave = useCreateLeaveRequest()
  const resolvedEmployeeName =
    fixedEmployeeName ?? employees?.find((employee) => employee.id === fixedEmployeeId)?.name ?? ""

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      employeeId: fixedEmployeeId ?? "",
      type: "",
      startDate: today,
      endDate: today,
      reason: "",
      attachmentFilename: "",
    },
  })

  useEffect(() => {
    if (form.getValues("type")) return
    const firstType = leaveTypeOptions?.[0]?.code
    if (firstType) {
      form.setValue("type", firstType, { shouldValidate: true })
    }
  }, [form, leaveTypeOptions])

  useEffect(() => {
    form.setValue("employeeId", fixedEmployeeId ?? "", { shouldValidate: !!fixedEmployeeId })
  }, [fixedEmployeeId, form])

  function resetForm() {
    form.reset({
      employeeId: fixedEmployeeId ?? "",
      type: leaveTypeOptions?.[0]?.code ?? "",
      startDate: today,
      endDate: today,
      reason: "",
      attachmentFilename: "",
    })
  }

  function onSubmit(values: LeaveRequestFormValues) {
    createLeave.mutate(values, {
      onSuccess: () => {
        resetForm()
        onSubmitted?.()
      },
    })
  }

  const noLeaveTypesConfigured = !leaveTypesLoading && !leaveTypesError && (leaveTypeOptions?.length ?? 0) === 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Request</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  {fixedEmployeeId ? (
                    <FormControl>
                      <Input value={resolvedEmployeeName} disabled readOnly />
                    </FormControl>
                  ) : (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(employees ?? []).map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={leaveTypesLoading || noLeaveTypesConfigured}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={leaveTypesLoading ? "Loading leave types..." : "Select leave type"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(leaveTypeOptions ?? []).map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {leaveTypesError ? (
                    <p className="text-xs text-destructive">Couldn't load leave types.</p>
                  ) : noLeaveTypesConfigured ? (
                    <p className="text-xs text-destructive">
                      No active leave types are configured. Ask an admin to create or activate a leave type first.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for leave..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachmentFilename"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Attachment (optional)</FormLabel>
                  <FormControl>
                    <Input type="file" onChange={(event) => field.onChange(event.target.files?.[0]?.name ?? "")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createLeave.isPending || leaveTypesLoading || noLeaveTypesConfigured}>
            Submit Request
          </Button>
        </div>
      </form>
    </Form>
  )
}
