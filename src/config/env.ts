/**
 * Centralized, validated environment configuration.
 * Never read `process.env` directly elsewhere in the app — import from here.
 */
import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000/api"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Fashion ERP/POS"),
  // Defaults to mock mode: no real ERP backend exists yet, so if this flag
  // isn't explicitly set to "false" in the deployment environment, fall back
  // to the in-memory mock data layer instead of failing every request.
  NEXT_PUBLIC_USE_MOCK_AUTH: z
    .string()
    .default("true")
    .transform((value) => value !== "false"),
  SESSION_COOKIE_NAME: z.string().default("erp_session"),
  SESSION_SECRET: z.string().min(1).default("dev-only-insecure-secret-change-me"),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_USE_MOCK_AUTH: process.env.NEXT_PUBLIC_USE_MOCK_AUTH,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
})

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors)
  throw new Error("Invalid environment configuration. Check your .env file.")
}

export const env = parsed.data
