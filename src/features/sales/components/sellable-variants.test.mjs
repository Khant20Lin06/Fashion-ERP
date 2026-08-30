import test from "node:test"
import assert from "node:assert/strict"

import {
  filterSellableProducts,
  resolveSellableVariantIds,
} from "./sellable-variants.ts"

test("resolveSellableVariantIds keeps only variants with effective active price rows", () => {
  const variantIds = ["variant-priced", "variant-unpriced"]
  const priceListItems = [
    {
      id: "price-active",
      priceListId: "retail",
      productVariantId: "variant-priced",
      companyId: "company-1",
      uomId: "uom-pcs",
      price: 30,
      validFrom: "2026-01-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "price-expired",
      priceListId: "retail",
      productVariantId: "variant-unpriced",
      companyId: "company-1",
      uomId: "uom-pcs",
      price: 28,
      validFrom: "2026-01-01T00:00:00.000Z",
      validTo: "2026-08-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]

  assert.deepEqual(
    resolveSellableVariantIds(variantIds, priceListItems, "2026-08-29T09:00:00.000Z"),
    new Set(["variant-priced"]),
  )
})

test("filterSellableProducts hides products whose variants have no sellable price rows", () => {
  const products = [
    {
      id: "product-visible",
      name: "Visible Product",
      variants: [
        {
          id: "variant-visible",
          status: "active",
        },
      ],
    },
    {
      id: "product-hidden",
      name: "Hidden Product",
      variants: [
        {
          id: "variant-hidden",
          status: "active",
        },
      ],
    },
  ]

  const priceListItems = [
    {
      id: "price-visible",
      priceListId: "retail",
      productVariantId: "variant-visible",
      companyId: "company-1",
      uomId: "uom-pcs",
      price: 30,
      validFrom: "2026-01-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]

  const visibleProducts = filterSellableProducts(products, priceListItems, "2026-08-29T09:00:00.000Z")

  assert.equal(visibleProducts.length, 1)
  assert.equal(visibleProducts[0]?.id, "product-visible")
})
