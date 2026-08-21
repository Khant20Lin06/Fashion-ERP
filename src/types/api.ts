/**
 * Shared API response/error shapes, matching the backend contract exactly
 * (see erp-pos fashion api: src/common/filters/http-exception.filter.ts and
 * src/shared/dto/pagination.dto.ts). Feature api/ layers should type their
 * responses against these rather than inventing ad-hoc shapes.
 */

export type PaginationMeta = {
  page: number
  limit: number
  total: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type PaginationParams = {
  page?: number
  limit?: number
  sort?: string
  order?: "ASC" | "DESC"
}

/** Error envelope returned by the backend's GlobalExceptionFilter on every non-2xx response. */
export type ApiErrorBody = {
  success: false
  statusCode: number
  code: string
  message: string
  path?: string
  timestamp?: string
  requestId?: string
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR"
