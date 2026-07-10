import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decryptSession } from "@/lib/session"
import { env } from "@/config/env"

/**
 * Optimistic route protection (Next.js 16's "Proxy" — the renamed
 * middleware.ts convention). This only reads the signed session cookie
 * (no backend/DB call) and redirects accordingly, per Next.js's own
 * guidance to keep Proxy checks fast since it runs on every matched request.
 *
 * This is NOT the only line of defense: every Server Component/Action/Route
 * Handler that touches real data re-verifies the session via
 * features/auth/api/dal.ts's verifySession(). Proxy just avoids a flash of
 * protected content / an unnecessary round trip for the common case.
 */

const protectedPrefixes = ["/dashboard"]
const authRoutes = ["/login"]

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  const cookie = request.cookies.get(env.SESSION_COOKIE_NAME)?.value
  const session = await decryptSession(cookie)
  const isAuthenticated = Boolean(session?.userId)

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
