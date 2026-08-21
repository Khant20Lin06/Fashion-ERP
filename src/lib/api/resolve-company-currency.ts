import { apiClient } from "@/lib/api/client"

let cachedCurrency: string | undefined
let cachedForCompanyId: string | undefined

/**
 * Resolves the authoritative transaction currency for a company —
 * Company.baseCurrency, via GET /companies/:id — never a hardcoded literal.
 * Falls back to "USD" only if the lookup itself fails, since every create
 * endpoint that accepts `currency` requires a non-empty 3-letter code and
 * has no server-side default to fall back to; this is a display/request
 * fallback of last resort, not a claim that the company's real currency is
 * USD. Cached per companyId.
 */
export async function resolveCompanyCurrency(companyId: string): Promise<string> {
  if (cachedCurrency && cachedForCompanyId === companyId) return cachedCurrency

  try {
    const { data } = await apiClient.get<{ baseCurrency: string }>(`/companies/${companyId}`)
    if (data.baseCurrency) {
      cachedCurrency = data.baseCurrency
      cachedForCompanyId = companyId
      return data.baseCurrency
    }
  } catch {
    // fall through to the last-resort default below
  }

  return "USD"
}

export function clearCachedCompanyCurrency(): void {
  cachedCurrency = undefined
  cachedForCompanyId = undefined
}
