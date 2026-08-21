import { NextResponse } from "next/server"
import { deleteSessionCookie, getSessionCookie } from "@/lib/session"
import type { AuthUser } from "@/types/user"
import { env } from "@/config/env"
import { fetchBackendAuthUser, refreshBackendSession } from "@/lib/backend-auth"

/**
 * GET /api/auth/me
 * Returns the current user derived from the session cookie, for client-side
 * rehydration (AuthProvider) on full page loads / hard refreshes.
 *
 * On a 401 (the 15-minute access token has expired, which is routine on
 * this path — the app's own session cookie lives far longer), attempts one
 * silent refresh before giving up, so a page reload doesn't force a
 * re-login every time the access token happens to have expired since the
 * last request.
 */
export async function GET(request: Request) {
  const session = await getSessionCookie()

  if (!session) {
    return NextResponse.json({ user: null })
  }

  if (!env.NEXT_PUBLIC_USE_MOCK_AUTH) {
    const cookieHeader = request.headers.get("cookie")
    try {
      const user = await fetchBackendAuthUser(cookieHeader)
      return NextResponse.json({ user })
    } catch (err: unknown) {
      if (!isUnauthorized(err)) {
        return NextResponse.json(
          { message: "Couldn't verify the current session right now.", user: null },
          { status: 502 }
        )
      }

      try {
        const { setCookieHeaders } = await refreshBackendSession(cookieHeader)
        const refreshedCookieHeader = mergeCookieHeader(cookieHeader, setCookieHeaders)
        const user = await fetchBackendAuthUser(refreshedCookieHeader)

        const response = NextResponse.json({ user })
        for (const setCookieHeader of setCookieHeaders) {
          response.headers.append("set-cookie", setCookieHeader)
        }
        return response
      } catch {
        // Refresh token is also missing/expired/revoked — genuinely logged
        // out. Clear our session cookie so proxy.ts redirects cleanly to
        // /login instead of looping with 401 errors.
        await deleteSessionCookie()
        const response = NextResponse.json({ user: null }, { status: 401 })
        response.cookies.delete(env.SESSION_COOKIE_NAME)
        return response
      }
    }
  }

  // In production this would call fetchCurrentUser(session token) against the
  // real backend. Since our mock login never talks to a real backend, we
  // reconstruct a minimal user from the session payload here instead.
  const user: AuthUser = {
    id: session.userId,
    name: "Demo Owner",
    email: "owner@example.com",
    // Mock sessions may be created without an explicit role (see
    // createSessionCookie's optional `role` param); fall back to a sane
    // default so this stays valid AuthUser data instead of `undefined`.
    role: session.role ?? "business_owner",
    branchId: "br_main",
    branchName: "Main Branch",
    permissions: [{ module: "*", actions: ["view", "create", "edit", "delete", "approve", "export", "manage"] }],
  }

  return NextResponse.json({ user })
}

function isUnauthorized(err: unknown): boolean {
  return (err as { status?: number })?.status === 401
}

/**
 * Builds the Cookie header for the immediate retry after a refresh: starts
 * from the browser's original cookie header, then overwrites just the
 * access-token cookie with the one just minted by refreshBackendSession
 * (extracting `name=value` from each raw Set-Cookie string). The browser
 * itself won't see the new cookies until this response's Set-Cookie headers
 * reach it — this retry happens before that, in the same request.
 */
function mergeCookieHeader(
  originalCookieHeader: string | null,
  setCookieHeaders: string[]
): string {
  const existing = new Map<string, string>()
  for (const pair of (originalCookieHeader ?? "").split(";")) {
    const [name, ...rest] = pair.trim().split("=")
    if (name) existing.set(name, rest.join("="))
  }

  for (const setCookieHeader of setCookieHeaders) {
    const [pair] = setCookieHeader.split(";")
    const [name, ...rest] = pair.trim().split("=")
    if (name) existing.set(name, rest.join("="))
  }

  return Array.from(existing.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}
