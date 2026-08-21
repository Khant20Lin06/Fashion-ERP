import { isAxiosError, type AxiosError } from "axios"
import { toast } from "sonner"
import type { ApiErrorBody, ApiErrorCode } from "@/types/api"

/**
 * Normalized error for every failed API call. Thrown by the response
 * interceptor in place of the raw AxiosError, so callers (React Query
 * onError, try/catch) get a consistent shape regardless of failure mode.
 * Still an `Error` subclass — existing `error.message` usage keeps working.
 */
export class ApiError extends Error {
  readonly statusCode: number
  readonly code: ApiErrorCode
  readonly requestId?: string
  readonly path?: string

  constructor(params: {
    message: string
    statusCode: number
    code: ApiErrorCode
    requestId?: string
    path?: string
  }) {
    super(params.message)
    this.name = "ApiError"
    this.statusCode = params.statusCode
    this.code = params.code
    this.requestId = params.requestId
    this.path = params.path
  }

  get isUnauthorized() {
    return this.statusCode === 401
  }
  get isForbidden() {
    return this.statusCode === 403
  }
  get isNotFound() {
    return this.statusCode === 404
  }
  get isConflict() {
    return this.statusCode === 409
  }
  get isValidation() {
    return this.statusCode === 400 || this.statusCode === 422
  }
  get isRateLimited() {
    return this.statusCode === 429
  }
  get isServerError() {
    return this.statusCode >= 500
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: "Some information you entered isn't valid.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "The requested resource couldn't be found.",
  409: "This conflicts with existing data.",
  422: "Some information you entered isn't valid.",
  429: "Too many requests. Please slow down and try again.",
  500: "Something went wrong on our end. Please try again.",
}

function codeForStatus(status: number, backendCode?: string): ApiErrorCode {
  const known: ApiErrorCode[] = [
    "VALIDATION_ERROR",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
    "CONFLICT",
    "UNPROCESSABLE_ENTITY",
    "RATE_LIMITED",
    "INTERNAL_ERROR",
  ]
  if (backendCode && (known as string[]).includes(backendCode)) {
    return backendCode as ApiErrorCode
  }
  switch (status) {
    case 400:
      return "VALIDATION_ERROR"
    case 401:
      return "UNAUTHORIZED"
    case 403:
      return "FORBIDDEN"
    case 404:
      return "NOT_FOUND"
    case 409:
      return "CONFLICT"
    case 422:
      return "UNPROCESSABLE_ENTITY"
    case 429:
      return "RATE_LIMITED"
    default:
      return status >= 500 ? "INTERNAL_ERROR" : "UNKNOWN_ERROR"
  }
}

/** Converts any AxiosError (or unknown thrown value) into a normalized ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<Partial<ApiErrorBody>>
    const response = axiosError.response

    if (!response) {
      // Request never reached the server: network failure, timeout, CORS, DNS, offline.
      return new ApiError({
        message: "Unable to reach the server. Check your connection and try again.",
        statusCode: 0,
        code: "NETWORK_ERROR",
      })
    }

    const body = response.data
    const status = response.status
    return new ApiError({
      message: body?.message ?? DEFAULT_MESSAGES[status] ?? "An unexpected error occurred.",
      statusCode: status,
      code: codeForStatus(status, body?.code),
      requestId: body?.requestId,
      path: body?.path,
    })
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message,
      statusCode: 0,
      code: "UNKNOWN_ERROR",
    })
  }

  return new ApiError({
    message: "An unexpected error occurred.",
    statusCode: 0,
    code: "UNKNOWN_ERROR",
  })
}

/**
 * Standard mutation `onError` toast: shows the real backend message (e.g.
 * validation detail, conflict reason, permission denial) instead of a
 * generic "Failed to X" string. Falls back to `fallbackMessage` only when
 * the error carries no usable message at all.
 */
export function toastApiError(error: unknown, fallbackMessage: string): void {
  const apiError = toApiError(error)
  toast.error(apiError.message || fallbackMessage)
}
