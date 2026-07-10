/**
 * Shared API response envelope types, used across every feature module's api/ layer.
 */

export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ApiError = {
  success: false
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type PaginatedData<T> = {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PaginationParams = {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
