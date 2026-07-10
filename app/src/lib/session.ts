import "server-only"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { env } from "@/config/env"
import type { AuthUser } from "@/types/user"

/**
 * Server-only session management.
 *
 * The actual authentication happens against the external ERP backend
 * (see features/auth/api) — that API returns a signed JWT. We re-wrap the
 * minimal session payload (userId, role) in our own short-lived signed
 * cookie so that `proxy.ts` can do a fast, DB-free optimistic auth check
 * on every request without calling the backend. The full user object is
 * fetched server-side via the Data Access Layer (features/auth/api/dal.ts)
 * whenever a page actually needs it.
 */

export type SessionPayload = {
  userId: string
  role: AuthUser["role"]
  expiresAt: number
}

const encodedKey = new TextEncoder().encode(env.SESSION_SECRET)
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodedKey)
}

export async function decryptSession(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSessionCookie(userId: string, role: AuthUser["role"]) {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const session = await encryptSession({ userId, role, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set(env.SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  })
}

export async function getSessionCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(env.SESSION_COOKIE_NAME)?.value
  return decryptSession(raw)
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(env.SESSION_COOKIE_NAME)
}
