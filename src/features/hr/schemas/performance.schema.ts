import { z } from "zod"

export const performanceGoalFormSchema = z.object({
  title: z.string().min(1, "Goal title is required"),
  achieved: z.boolean(),
})

export const performanceReviewFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  period: z.enum(["q1", "q2", "q3", "q4", "annual"]),
  goals: z.array(performanceGoalFormSchema).min(1, "At least one goal is required"),
  score: z.number().min(0, "Score must be positive").max(5, "Score must be 5 or less"),
  managerFeedback: z.string().min(1, "Manager feedback is required"),
  comments: z.string().optional(),
})

export type PerformanceReviewFormValues = z.infer<typeof performanceReviewFormSchema>
