"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useCreatePerformanceReview } from "../hooks/usePayroll"
import { performanceReviewFormSchema, type PerformanceReviewFormValues } from "../schemas/performance.schema"
import type { ReviewPeriod } from "../types"

const periodOptions: { value: ReviewPeriod; label: string }[] = [
  { value: "q1", label: "Q1" },
  { value: "q2", label: "Q2" },
  { value: "q3", label: "Q3" },
  { value: "q4", label: "Q4" },
  { value: "annual", label: "Annual" },
]

const emptyValues: PerformanceReviewFormValues = {
  employeeId: "",
  period: "q1",
  goals: [{ title: "", achieved: false }],
  score: 0,
  managerFeedback: "",
  comments: "",
}

/** Performance Review form — Goals, Rating (score), and Manager Feedback. */
export function PerformanceReviewForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { data: employees } = useEmployees()
  const createReview = useCreatePerformanceReview()

  const form = useForm<PerformanceReviewFormValues>({
    resolver: zodResolver(performanceReviewFormSchema),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "goals" })

  function onSubmit(values: PerformanceReviewFormValues) {
    createReview.mutate(values, {
      onSuccess: () => {
        form.reset(emptyValues)
        onSubmitted?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Review</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employee" />
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
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Period</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {periodOptions.map((option) => (
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
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0–5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      step={0.1}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goals</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name={`goals.${index}.achieved`}
                  render={({ field: checkboxField }) => (
                    <Checkbox checked={checkboxField.value} onCheckedChange={(value) => checkboxField.onChange(!!value)} />
                  )}
                />
                <FormField
                  control={form.control}
                  name={`goals.${index}.title`}
                  render={({ field: titleField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Goal description" {...titleField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => append({ title: "", achieved: false })}>
              Add Goal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feedback</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="managerFeedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Overall performance feedback…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createReview.isPending}>
            Save Review
          </Button>
        </div>
      </form>
    </Form>
  )
}
