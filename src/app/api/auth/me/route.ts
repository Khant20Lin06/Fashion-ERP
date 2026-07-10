import { NextResponse } from "next/server"
import { getSessionCookie } from "@/lib/session"
import type { AuthUser } from "@/types/user"

/**
 * GET /api/auth/me
 * Returns the current user derived from the session cookie, for client-side
 * rehydration (AuthProvider) on full page loads / hard refreshes.
 */
export async function GET() {
  const session = await getSessionCookie()

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  // In production this would call fetchCurrentUser(session token) against the
  // real backend. Since our mock login never talks to a real backend, we
  // reconstruct a minimal user from the session payload here instead.
  const user: AuthUser = {
    id: session.userId,
    name: "Demo Owner",
    email: "owner@example.com",
    role: session.role,
    branchId: "br_main",
    branchName: "Main Branch",
    permissions: [{ module: "*", actions: ["view", "create", "edit", "delete", "approve", "export", "manage"] }],
  }

  return NextResponse.json({ user })
}
