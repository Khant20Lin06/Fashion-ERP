import type { AxiosInstance, InternalAxiosRequestConfig } from "axios"
import axios from "axios"
import { useAuthStore } from "@/stores/auth.store"
import { toApiError } from "./errors"

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retried?: boolean }

const REFRESH_PATH = "/auth/refresh"

/**
 * Shared across every concurrent 401 so a burst of simultaneously-failing
 * requests triggers exactly one POST /auth/refresh, not one per request.
 * Cleared once the in-flight attempt settles (success or failure) so the
 * next 401 after that starts a fresh attempt rather than replaying a stale
 * result.
 */
let refreshPromise: Promise<void> | null = null

function isRefreshRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  return typeof config?.url === "string" && config.url.includes(REFRESH_PATH)
}

/**
 * Attaches request/response interceptors to the shared Axios instance.
 * - Request: stamps a per-request x-request-id for tracing across
 *   frontend logs and backend logs/error responses.
 * - Response: normalizes every error into an ApiError (see ./errors.ts).
 *   On 401 from any endpoint other than refresh itself, attempts exactly
 *   one silent token refresh (single-flight across concurrent 401s) and
 *   retries the original request once; if the refresh fails, clears client
 *   auth state and redirects to login exactly as before. 403 is left for
 *   callers to handle (permission-denied UI), since unlike 401 it doesn't
 *   mean the session is invalid.
 */
export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    config.headers.set("x-request-id", crypto.randomUUID())
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const apiError = toApiError(error)
      const config = axios.isAxiosError(error)
        ? (error.config as RetriableRequestConfig | undefined)
        : undefined

      const shouldAttemptRefresh =
        apiError.isUnauthorized &&
        config !== undefined &&
        !config._retried &&
        !isRefreshRequest(config)

      if (!shouldAttemptRefresh) {
        if (apiError.isUnauthorized) {
          redirectToLogin()
        }
        return Promise.reject(apiError)
      }

      config._retried = true

      try {
        // Single-flight: the first 401 in a burst starts the refresh and
        // stores the promise; every other concurrent 401 awaits the same
        // promise instead of issuing its own POST /auth/refresh.
        if (!refreshPromise) {
          refreshPromise = client
            .post(REFRESH_PATH)
            .then(() => undefined)
            .finally(() => {
              refreshPromise = null
            })
        }
        await refreshPromise

        return client.request(config)
      } catch {
        redirectToLogin()
        return Promise.reject(apiError)
      }
    }
  )
}

function redirectToLogin() {
  useAuthStore.getState().clearUser()
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login"
  }
}
