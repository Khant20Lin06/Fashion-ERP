import { NextResponse } from "next/server"
import { buildBackendUrl } from "@/lib/backend-auth"

const BODYLESS_STATUS_CODES = new Set([204, 205, 304])

function getBackendCandidates(backendPath: string): string[] {
  return [buildBackendUrl(backendPath)]
}

async function shouldRetryWithAlternateBackend(
  response: Response,
  attemptIndex: number,
  candidateCount: number
): Promise<boolean> {
  if (attemptIndex >= candidateCount - 1 || response.status !== 404 || process.env.NODE_ENV === "production") {
    return false
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return true
  }

  const body = await response.clone().text()
  return body.includes('"code":"NOT_FOUND"') && /Cannot (GET|POST|PUT|PATCH|DELETE) \/api\/v1\//.test(body)
}

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
  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  const requestBody = hasBody ? await request.text() : undefined
  // axios.post(url, null, config) — the idiomatic "no body" call used by
  // every bodyless action endpoint (confirm/cancel/etc.) — serializes its
  // null payload to the 4-byte JSON literal "null" rather than omitting
  // the body. Forwarding that verbatim with Content-Type: application/json
  // makes the backend's body parser see a non-object JSON value and reject
  // it, even though the caller intended no body at all.
  const shouldForwardBody =
    requestBody !== undefined && requestBody.length > 0 && requestBody !== "null"

  const headers = new Headers()
  const contentType = request.headers.get("content-type")
  if (contentType && shouldForwardBody) headers.set("content-type", contentType)
  const cookie = request.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const requestId = request.headers.get("x-request-id")
  if (requestId) headers.set("x-request-id", requestId)
  headers.set("accept", "application/json")

  let backendResponse: Response | null = null
  let lastError: unknown
  const candidates = getBackendCandidates(backendPath)

  for (let index = 0; index < candidates.length; index += 1) {
    const targetUrl = `${candidates[index]}${incomingUrl.search}`
    try {
      backendResponse = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: shouldForwardBody ? requestBody : undefined,
        cache: "no-store",
        redirect: "manual",
      })
    } catch (error) {
      lastError = error
      if (index < candidates.length - 1) {
        continue
      }
      throw error
    }

    if (!(await shouldRetryWithAlternateBackend(backendResponse, index, candidates.length))) {
      break
    }
  }

  if (!backendResponse) {
    if (lastError) {
      throw lastError
    }
    throw new Error("Backend proxy could not reach any configured backend target.")
  }

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
