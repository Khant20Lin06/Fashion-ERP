import type { AxiosInstance, AxiosError } from "axios"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Attaches request/response interceptors to the shared Axios instance.
 * - Request: no manual Authorization header needed — the JWT lives in an
 *   httpOnly cookie and is sent automatically via `withCredentials`.
 * - Response: normalizes errors and reacts to 401 by clearing client auth state.
 */
export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    // Placeholder for cross-cutting request concerns (request-id, locale header, etc.)
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
      if (error.response?.status === 401) {
        // Session expired or invalid — clear local auth state so the UI
        // reflects logged-out status; route protection is handled by proxy.ts.
        useAuthStore.getState().clearUser()
      }

      const message =
        error.response?.data?.message ??
        error.message ??
        "An unexpected network error occurred."

      return Promise.reject(new Error(message))
    }
  )
}
