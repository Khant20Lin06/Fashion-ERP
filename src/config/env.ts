/**
 * Centralized, validated environment configuration.
 * Never read `process.env` directly elsewhere in the app — import from here.
 */
import { z } from "zod"

function normalizeApiBaseUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, "")
  if (trimmed.endsWith("/api")) {
    return `${trimmed}/v1`
  }
  return trimmed
}

const INSECURE_SESSION_SECRET_DEFAULT = "dev-only-insecure-secret-change-me"

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:4000/api/v1")
    .transform(normalizeApiBaseUrl),
  NEXT_PUBLIC_APP_NAME: z.string().default("Fashion ERP/POS"),
  // Defaults to mock mode: no real ERP backend exists yet, so if this flag
  // isn't explicitly set to "false" in the deployment environment, fall back
  // to the in-memory mock data layer instead of failing every request.
  // PRODUCTION SAFETY: this default is deliberately unsafe for a real
  // deployment — see the production guard below, which fails startup rather
  // than letting a production build silently run against fake data.
  NEXT_PUBLIC_USE_MOCK_AUTH: z
    .string()
    .default("true")
    .transform((value) => value !== "false"),
  SESSION_COOKIE_NAME: z.string().default("erp_session"),
  SESSION_SECRET: z.string().min(1).default(INSECURE_SESSION_SECRET_DEFAULT),
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

/**
 * Production safety guard — fail startup rather than silently run a real
 * deployment against fake data or with a publicly-known cookie-signing
 * secret. Both of these are safe, expected defaults in development (no
 * backend configured yet / no reason to generate a real secret locally),
 * but either one reaching a production process is a deployment
 * misconfiguration, not a valid state to keep running in.
 */
if (process.env.NODE_ENV === "production") {
  const productionErrors: string[] = []
  if (parsed.data.NEXT_PUBLIC_USE_MOCK_AUTH) {
    productionErrors.push(
      "NEXT_PUBLIC_USE_MOCK_AUTH is enabled (or unset) in a production build — set NEXT_PUBLIC_USE_MOCK_AUTH=false to run against the real backend."
    )
  }
  if (parsed.data.SESSION_SECRET === INSECURE_SESSION_SECRET_DEFAULT) {
    productionErrors.push(
      "SESSION_SECRET is missing or using the insecure development default in a production build — set a real, random SESSION_SECRET (openssl rand -base64 32)."
    )
  }
  if (productionErrors.length > 0) {
    throw new Error(`Refusing to start in production with unsafe configuration:\n${productionErrors.join("\n")}`)
  }
}

export const env = parsed.data
