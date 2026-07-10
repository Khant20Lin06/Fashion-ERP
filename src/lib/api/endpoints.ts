/**
 * Centralized API endpoint path registry.
 * Feature modules import from here rather than hardcoding path strings,
 * so a backend route rename touches one file, not every feature.
 */

export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
  },
  products: {
    list: "/products",
    detail: (id: string) => `/products/${id}`,
  },
} as const
