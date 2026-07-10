import axios from "axios"
import { env } from "@/config/env"
import { attachInterceptors } from "./interceptors"

/**
 * Shared Axios instance for all client-side API calls.
 * `withCredentials: true` ensures the httpOnly session cookie set by our
 * `/api/auth/*` Route Handlers is sent with every request automatically —
 * there is no manual token attachment anywhere in feature code.
 */
export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
})

attachInterceptors(apiClient)
