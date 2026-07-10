import { z } from "zod"

export const generalSettingsFormSchema = z.object({
  systemName: z.string().min(1, "System name is required"),
  supportEmail: z.email("Enter a valid email address"),
  defaultCompanyId: z.string().min(1, "Default company is required"),
})

export type GeneralSettingsFormValues = z.infer<typeof generalSettingsFormSchema>

export const localizationSettingsFormSchema = z.object({
  language: z.string().min(1, "Language is required"),
  timezone: z.string().min(1, "Timezone is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  numberFormat: z.string().min(1, "Number format is required"),
  currency: z.string().min(1, "Currency is required"),
})

export type LocalizationSettingsFormValues = z.infer<typeof localizationSettingsFormSchema>

export const passwordPolicyFormSchema = z.object({
  minLength: z.number().min(4, "Minimum length must be at least 4"),
  requireUppercase: z.boolean(),
  requireNumber: z.boolean(),
  requireSymbol: z.boolean(),
  expiryDays: z.number().min(0, "Expiry days must be positive"),
})

export const securitySettingsFormSchema = z.object({
  passwordPolicy: passwordPolicyFormSchema,
  sessionTimeoutMinutes: z.number().min(1, "Session timeout must be positive"),
  twoFactorEnabled: z.boolean(),
  maxLoginAttempts: z.number().min(1, "Max login attempts must be positive"),
  ipRestrictionEnabled: z.boolean(),
})

export type SecuritySettingsFormValues = z.infer<typeof securitySettingsFormSchema>
