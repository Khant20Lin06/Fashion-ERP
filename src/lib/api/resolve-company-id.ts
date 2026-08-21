import { apiClient } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"
import type { AuthUser } from "@/types/user"

type CompanyMembership = {
  id: string
  userId: string
  companyId: string
  status: "ACTIVE" | "INACTIVE"
  isPrimary: boolean
  createdAt: string
}

type AuthMeResponse = {
  user: AuthUser | null
}

let cachedCompanyId: string | undefined
let cachedForUserId: string | undefined

/**
 * Resolves the active companyId from the authenticated user's own
 * membership — never "the first company that exists in the system"
 * (backend GET /companies lists every company visible under the caller's
 * DataScope, which for an ALL-scope user is every company that has ever
 * existed; index 0 of that list has no relationship to which company the
 * user actually belongs to or intends to operate in).
 *
 * Source of truth: GET /users/:userId/companies →
 * CompanyMembershipResponseDto[]{status, isPrimary}. Resolution order:
 *   1. the ACTIVE membership with isPrimary=true
 *   2. if exactly one ACTIVE membership exists, that one (nothing to
 *      choose between)
 *   3. otherwise: ambiguous — more than one ACTIVE membership and none
 *      marked primary. Throws rather than guessing; this is a real "which
 *      company?" question with no UI to answer it yet (a company-switcher
 *      is out of this phase's scope — see Phase 3 report), so silently
 *      picking one would misattribute data exactly like the index-0 bug
 *      this replaces.
 *
 * Cached per userId (not globally) so a different signed-in user after
 * logout/login doesn't reuse a stale resolution.
 */
export async function resolveCompanyId(specifiedId?: string): Promise<string> {
  if (specifiedId) return specifiedId

  const userId = await resolveCurrentUserId()

  if (cachedCompanyId && cachedForUserId === userId) return cachedCompanyId

  const { data } = await fetchCompanyMemberships(userId)
  const active = data.filter((m) => m.status === "ACTIVE")

  const primary = active.find((m) => m.isPrimary)
  const resolved = primary ?? (active.length === 1 ? active[0] : undefined)

  if (!resolved) {
    if (active.length === 0) {
      throw new Error("You are not assigned to any company. Contact an administrator.")
    }
    throw new Error(
      "You belong to multiple companies and none is set as primary. Please contact an administrator to set a primary company."
    )
  }

  cachedCompanyId = resolved.companyId
  cachedForUserId = userId
  return resolved.companyId
}

export function clearCachedCompanyId(): void {
  cachedCompanyId = undefined
  cachedForUserId = undefined
}

/**
 * Same resolution/caching as resolveCompanyId, but swallows failures and
 * returns undefined instead of throwing — for call sites that treat
 * companyId as an optional query param rather than a hard requirement
 * (the backend falls back to DataScope resolution when it's omitted).
 */
export async function tryResolveCompanyId(specifiedId?: string): Promise<string | undefined> {
  try {
    return await resolveCompanyId(specifiedId)
  } catch {
    return undefined
  }
}

async function fetchCompanyMemberships(userId: string): Promise<{ data: CompanyMembership[] }> {
  try {
    return await apiClient.get<CompanyMembership[]>(`/users/${userId}/companies`)
  } catch (error) {
    if ((error as { response?: { status?: number } })?.response?.status !== 403) {
      throw error
    }

    const refreshedUserId = await syncUserFromSession()
    if (!refreshedUserId || refreshedUserId === userId) {
      throw error
    }

    clearCachedCompanyId()
    return apiClient.get<CompanyMembership[]>(`/users/${refreshedUserId}/companies`)
  }
}

async function resolveCurrentUserId(): Promise<string> {
  const existingUserId = useAuthStore.getState().user?.id
  if (existingUserId) return existingUserId

  const refreshedUserId = await syncUserFromSession()
  if (refreshedUserId) return refreshedUserId

  throw new Error("Not signed in. Please log in again.")
}

async function syncUserFromSession(): Promise<string | undefined> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    useAuthStore.getState().clearUser()
    return undefined
  }

  const data = (await response.json()) as AuthMeResponse
  if (!data.user) {
    useAuthStore.getState().clearUser()
    return undefined
  }

  useAuthStore.getState().setUser(data.user)
  return data.user.id
}
