import "server-only"
import { env } from "@/config/env"
import type { AuthUser, Permission } from "@/types/user"

type SafeUserResponse = {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  status: string
}

type MyPermissionsResponse = {
  roleCodes: string[]
  permissionCodes: string[]
}

type BackendRequestOptions = {
  method?: "GET" | "POST"
  body?: string
  cookieHeader?: string | null
  authCookie?: string | null
}

// Maps every real backend action word (the final dot-segment of a
// permission code, e.g. "read" from "sales.read" or "apply" from
// "sales.discount.apply" — see erp-pos fashion api
// src/database/seeds/rbac.seed.ts's full action vocabulary) onto the
// frontend's closed 7-value Permission.actions set. Previously several
// real actions (assign/remove/unassign/post/confirm/calculate/finalize/
// manage/redeem/chat/ingest/apply) had no entry and were silently
// dropped by the `?? "skip"` fallback below — meaning a user who only
// held one of those permissions on a resource would appear to have NO
// access to it at all in the frontend's derived permission set, even
// though the backend would correctly authorize their real requests.
const ACTION_MAP: Record<
  string,
  Permission["actions"][number] | "skip"
> = {
  read: "view",
  create: "create",
  update: "edit",
  delete: "delete",
  approve: "approve",
  export: "export",
  activate: "manage",
  deactivate: "manage",
  lock: "manage",
  unlock: "manage",
  reject: "approve",
  cancel: "approve",
  assign: "edit",
  remove: "delete",
  unassign: "delete",
  post: "approve",
  confirm: "approve",
  calculate: "approve",
  finalize: "approve",
  manage: "manage",
  redeem: "create",
  chat: "create",
  ingest: "create",
  apply: "approve",
}

export function buildBackendUrl(path: string): string {
  return `${env.NEXT_PUBLIC_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Extracts a single cookie's `name=value` pair (no attributes) from a list
 * of raw Set-Cookie header strings, matched by cookie name. The backend now
 * sets two cookies on login (access token + refresh token) — never assume
 * "the Set-Cookie header" is singular, or index [0] silently grabs the
 * wrong one depending on header order.
 */
export function extractCookieByName(
  setCookieHeaders: string[],
  cookieName: string
): string | null {
  const match = setCookieHeaders.find((c) => c.startsWith(`${cookieName}=`))
  return match?.split(";", 1)[0] ?? null
}

/** @deprecated single-cookie convenience wrapper kept for call sites not yet updated to multi-cookie login/refresh */
export function extractAuthCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null
  return setCookieHeader.split(";", 1)[0] ?? null
}

export async function fetchBackendJson<T>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<{ data: T; setCookieHeaders: string[] }> {
  const headers = new Headers({ Accept: "application/json" })

  if (options.body) {
    headers.set("Content-Type", "application/json")
  }

  const cookies = [options.cookieHeader, options.authCookie].filter(Boolean)
  if (cookies.length > 0) {
    headers.set("Cookie", cookies.join("; "))
  }

  const response = await fetch(buildBackendUrl(path), {
    method: options.method ?? "GET",
    headers,
    body: options.body,
    cache: "no-store",
  })

  if (!response.ok) {
    const error = new Error(`Backend request failed: ${response.status}`)
    ;(error as Error & { status?: number }).status = response.status
    throw error
  }

  return {
    data: (await response.json()) as T,
    // getSetCookie() (not .get("set-cookie")) is required whenever more than
    // one Set-Cookie header may be present — .get() comma-joins every
    // Set-Cookie value into one invalid header string, silently corrupting
    // both cookies rather than just picking one.
    setCookieHeaders: response.headers.getSetCookie(),
  }
}

/**
 * Exchanges a still-valid refresh-token cookie for a new access token (and a
 * rotated refresh token), server-side. Used by Route Handlers that need to
 * silently extend a session on the user's behalf — e.g. /api/auth/me on a
 * page load where the 15-minute access token has expired but the 30-day
 * refresh token hasn't. Throws (status 401) if the refresh token is
 * missing, expired, or already revoked/rotated — the caller should treat
 * that identically to "not authenticated."
 */
export async function refreshBackendSession(
  cookieHeader: string | null
): Promise<{ setCookieHeaders: string[] }> {
  const { setCookieHeaders } = await fetchBackendJson<{ success: true }>("/auth/refresh", {
    method: "POST",
    cookieHeader,
  })
  return { setCookieHeaders }
}

export async function fetchBackendAuthUser(cookieHeader: string | null): Promise<AuthUser> {
  const [{ data: user }, { data: permissions }] = await Promise.all([
    fetchBackendJson<SafeUserResponse>("/auth/me", { cookieHeader }),
    fetchBackendJson<MyPermissionsResponse>("/auth/me/permissions", { cookieHeader }),
  ])

  return toAuthUser(user, permissions)
}

function toAuthUser(user: SafeUserResponse, permissions: MyPermissionsResponse): AuthUser {
  const name = user.displayName || [user.firstName, user.lastName].filter(Boolean).join(" ")
  const role = permissions.roleCodes[0]?.toLowerCase() ?? "business_owner"

  return {
    id: user.id,
    name,
    email: user.email,
    role: role as AuthUser["role"],
    permissions: toPermissions(permissions.permissionCodes, permissions.roleCodes),
  }
}

function toPermissions(permissionCodes: string[], roleCodes: string[]): Permission[] {
  if (roleCodes.includes("SUPER_ADMIN")) {
    return [
      {
        module: "*",
        actions: ["view", "create", "edit", "delete", "approve", "export", "manage"],
      },
    ]
  }

  const grouped = new Map<string, Set<Permission["actions"][number]>>()

  for (const code of permissionCodes) {
    const parts = code.split(".")
    if (parts.length < 2) continue

    const rawAction = parts.pop() ?? ""
    const action = ACTION_MAP[rawAction] ?? "skip"
    if (action === "skip") continue

    const moduleKey = parts[0] ?? "misc"
    if (!grouped.has(moduleKey)) {
      grouped.set(moduleKey, new Set())
    }
    grouped.get(moduleKey)?.add(action)
  }

  return Array.from(grouped.entries()).map(([moduleKey, actions]) => ({
    module: moduleKey,
    actions: Array.from(actions),
  }))
}
