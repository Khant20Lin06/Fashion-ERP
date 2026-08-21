import axios from "axios"
import { attachInterceptors } from "./interceptors"

/**
 * Shared Axios instance for all client-side API calls.
 *
 * baseURL points at the same-origin `/api/backend/*` proxy (see
 * src/app/api/backend/[...path]/route.ts), not the NestJS backend directly.
 * The backend's auth cookie is set for whichever origin talks to it — since
 * only our own Next.js server ever calls the backend directly, the browser
 * only needs a same-origin cookie (sent automatically via
 * `withCredentials`), which the proxy route forwards server-side.
 */
export const apiClient = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
})

attachInterceptors(apiClient)
