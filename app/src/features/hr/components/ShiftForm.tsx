"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCreateShift, useUpdateShift } from "../hooks/useAttendance"
import type { ShiftFormValues } from "../api/attendance.api"
import type { Shift } from "../types"

const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type ShiftFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift?: Shift
}

/** Create/edit dialog for a Shift — Name, Start/End Time, Break, Working Days, Grace Period. */
export function ShiftFormDialog({ open, onOpenChange, shift }: ShiftFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <ShiftFormDialogContent onOpenChange={onOpenChange} shift={shift} key={shift?.id ?? "new"} />}
      </DialogContent>
    </Dialog>
  )
}

type ShiftFormDialogContentProps = {
  onOpenChange: (open: boolean) => void
  shift?: Shift
}

function ShiftFormDialogContent({ onOpenChange, shift }: ShiftFormDialogContentProps) {
  const createShift = useCreateShift()
  const updateShift = useUpdateShift(shift?.id ?? "")
  const isEditing = !!shift
  const [workingDays, setWorkingDays] = useState<string[]>(shift?.workingDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"])

  const form = useForm<Omit<ShiftFormValues, "workingDays">>({
    defaultValues: {
      name: shift?.name ?? "",
      startTime: shift?.startTime ?? "08:00",
      endTime: shift?.endTime ?? "17:00",
      breakMinutes: shift?.breakMinutes ?? 60,
      gracePeriodMinutes: shift?.gracePeriodMinutes ?? 10,
    },
  })

  function toggleDay(day: string) {
    setWorkingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  function onSubmit(values: Omit<ShiftFormValues, "workingDays">) {
    const payload: ShiftFormValues = { ...values, workingDays }
    const mutation = isEditing ? updateShift : createShift
    mutation.mutate(payload, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Shift" : "New Shift"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Morning Shift" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breakMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Time (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gracePeriodMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grace Period (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Working Days</p>
            <div className="flex flex-wrap gap-1.5">
              {allDays.map((day) => (
                <Badge
                  key={day}
                  variant={workingDays.includes(day) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createShift.isPending || updateShift.isPending}>
              {isEditing ? "Save Changes" : "Create Shift"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
