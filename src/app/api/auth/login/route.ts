import { NextResponse } from "next/server"
import { loginSchema } from "@/features/auth/schemas/login.schema"
import { loginRequest } from "@/features/auth/api/auth.api"
import { createSessionCookie } from "@/lib/session"
import type { AuthUser } from "@/types/user"

/**
 * POST /api/auth/login
 *
 * This Route Handler is the only place the httpOnly session cookie is set —
 * client code can never set httpOnly cookies directly, which is why login
 * goes through this server route instead of calling the backend from the browser.
 *
 * Flow: validate input -> call external ERP auth API -> sign our own short-lived
 * session cookie -> return the user object (safe subset) to the client.
 */
export async function POST(request: Request) {
  const body = await request.json()
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid credentials format", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { email, password } = parsed.data

  try {
    let user: AuthUser

    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true") {
      // Development fallback so the scaffold is runnable before a real backend
      // exists. Remove this branch once NEXT_PUBLIC_API_BASE_URL points at a
      // live ERP auth service.
      user = mockAuthenticate(email, password)
    } else {
      const result = await loginRequest({ email, password })
      user = result.user
    }

    await createSessionCookie(user.id, user.role)

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
  }
}

function mockAuthenticate(email: string, password: string): AuthUser {
  if (password.length < 4) {
    throw new Error("Invalid credentials")
  }

  return {
    id: "usr_demo_001",
    name: "Demo Owner",
    email,
    role: "business_owner",
    branchId: "br_main",
    branchName: "Main Branch",
    permissions: [{ module: "*", actions: ["view", "create", "edit", "delete", "approve", "export", "manage"] }],
  }
}
