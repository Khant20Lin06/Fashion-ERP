import { z } from "zod"

export const profileFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.email("Enter a valid email address"),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
