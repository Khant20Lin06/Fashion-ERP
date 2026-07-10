import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { LoginRequest, LoginResponse } from "../types"
import type { AuthUser } from "@/types/user"

/**
 * Calls to the external ERP authentication API.
 * These run server-side (invoked from our own /api/auth/* Route Handlers),
 * which is why they talk to the backend directly rather than through the
 * client-side apiClient's cookie-based session — at this point no session
 * cookie exists yet for login.
 */

export async function loginRequest(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(endpoints.auth.login, payload)
  return data
}

export async function fetchCurrentUser(sessionToken: string): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>(endpoints.auth.me, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  })
  return data
}
