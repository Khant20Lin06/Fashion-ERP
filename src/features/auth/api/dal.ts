import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { getSessionCookie } from "@/lib/session"
import type { SessionPayload } from "@/lib/session"

/**
 * Data Access Layer — the single place server-side code verifies a session.
 * Every Server Component/Action/Route Handler that needs to know "is this
 * user authenticated, and who are they" calls verifySession(), never reads
 * the session cookie directly. Memoized per-request via React's cache().
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSessionCookie()

  if (!session?.userId) {
    redirect("/login")
  }

  return session
})

/** Non-redirecting variant, for optional-auth contexts (e.g. public pages that adapt if logged in). */
export const getOptionalSession = cache(async (): Promise<SessionPayload | null> => {
  return getSessionCookie()
})
