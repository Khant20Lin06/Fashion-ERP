import { NextResponse } from "next/server"
import { deleteSessionCookie } from "@/lib/session"
import { env } from "@/config/env"
import { fetchBackendJson } from "@/lib/backend-auth"

export async function POST(request: Request) {
  let setCookieHeaders: string[] = []

  if (!env.NEXT_PUBLIC_USE_MOCK_AUTH) {
    try {
      // Forwards the browser's own cookie header, which includes the
      // refresh-token cookie (Path=/, see backend auth.config.ts) — the
      // backend reads it directly to revoke the refresh session server-side.
      const result = await fetchBackendJson<{ success: true }>("/auth/logout", {
        method: "POST",
        cookieHeader: request.headers.get("cookie"),
      })
      setCookieHeaders = result.setCookieHeaders
    } catch {
      // Best-effort cleanup: clear the local optimistic session cookie even if
      // the backend cookie is already missing or the logout call fails.
    }
  }

  await deleteSessionCookie()

  const response = NextResponse.json({ success: true })
  for (const setCookieHeader of setCookieHeaders) {
    response.headers.append("set-cookie", setCookieHeader)
  }
  return response
}
