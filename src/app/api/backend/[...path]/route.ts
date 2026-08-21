import { NextResponse } from "next/server"
import { buildBackendUrl } from "@/lib/backend-auth"

const BODYLESS_STATUS_CODES = new Set([204, 205, 304])

/**
 * Catch-all proxy for every client-side `apiClient` call.
 *
 * The backend sets its auth cookie for whichever origin issued the request
 * that triggered `Set-Cookie`. Route Handlers run in the Next.js server
 * process, so a request to this route forwards the browser's own cookies
 * (sent same-origin, since the browser calls this route on `localhost:3000`)
 * straight through to the backend over a plain server-to-server fetch —
 * no cookie ever needs to be valid across the frontend/backend port boundary.
 *
 * `apiClient` (src/lib/api/client.ts) points its baseURL here instead of at
 * the backend directly.
 */

async function handle(request: Request, path: string[]) {
  const backendPath = `/${path.join("/")}`
  const incomingUrl = new URL(request.url)
  const targetUrl = `${buildBackendUrl(backendPath)}${incomingUrl.search}`
  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  const requestBody = hasBody ? await request.text() : undefined
  const shouldForwardBody = requestBody !== undefined && requestBody.length > 0

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType && shouldForwardBody) headers.set("content-type", contentType)
  const cookie = request.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const requestId = request.headers.get("x-request-id")
  if (requestId) headers.set("x-request-id", requestId)
  headers.set("accept", "application/json")

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: shouldForwardBody ? requestBody : undefined,
    cache: "no-store",
    redirect: "manual",
  })

  const responseHeaders = new Headers()
  const responseContentType = backendResponse.headers.get("content-type")
  if (responseContentType) responseHeaders.set("content-type", responseContentType)
  for (const setCookie of backendResponse.headers.getSetCookie?.() ?? []) {
    responseHeaders.append("set-cookie", setCookie)
  }

  if (BODYLESS_STATUS_CODES.has(backendResponse.status)) {
    responseHeaders.delete("content-type")
    return new NextResponse(null, {
      status: backendResponse.status,
      headers: responseHeaders,
    })
  }

  const body = await backendResponse.arrayBuffer()
  return new NextResponse(body, {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

async function route(request: Request, context: RouteContext) {
  const { path } = await context.params
  return handle(request, path)
}

export const GET = route
export const POST = route
export const PUT = route
export const PATCH = route
export const DELETE = route
