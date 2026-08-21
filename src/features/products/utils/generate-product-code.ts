/**
 * Frontend-side product code generation.
 *
 * The backend has no product-numbering sequence equivalent to Sale/PO
 * numbers (no `company_product_counters` table, no service method) — code
 * is a plain required, pattern-validated column
 * (`^[A-Z0-9_-]+$`, see erp-pos fashion api CreateProductDto). Generation
 * therefore happens here, not server-side.
 *
 * Format mirrors the backend's own SAL-{year}-{sequence} convention
 * (src/modules/sales/utils/sale-number.ts) as closely as a client can
 * without a shared counter: PRD-{year}-{random suffix}. A random suffix
 * (not a client-side counter) is used because only the backend's unique
 * constraint can arbitrate a real collision across concurrent clients —
 * this generator only needs a low enough collision probability to make
 * retry-on-409 rare in practice (see mapProductFormToCreatePayload).
 */

const CODE_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ" // no I/O — avoids 1/0 confusion

function randomSuffix(length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return result
}

export function generateProductCode(): string {
  const year = new Date().getFullYear()
  return `PRD-${year}-${randomSuffix(6)}`
}
