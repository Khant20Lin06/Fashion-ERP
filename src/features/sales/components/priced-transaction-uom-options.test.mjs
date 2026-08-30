import test from "node:test"
import assert from "node:assert/strict"

import {
  resolvePricedTransactionUomOptions,
} from "./priced-transaction-uom-options.ts"

test("keeps only UOM options that have an active price row for the selected variant and date", () => {
  const options = [
    { value: "uom-pcs", label: "Piece", factor: 1, isBase: true },
    { value: "uom-pack6", label: "Pack of 6", factor: 6, isBase: false },
  ]

  const priceListItems = [
    {
      id: "pli-retail-pcs",
      priceListId: "price-list-retail",
      productVariantId: "variant-1",
      companyId: "company-1",
      uomId: "uom-pcs",
      price: 12,
      validFrom: "2026-01-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "pli-other-variant-pack6",
      priceListId: "price-list-retail",
      productVariantId: "variant-2",
      companyId: "company-1",
      uomId: "uom-pack6",
      price: 60,
      validFrom: "2026-01-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]

  const pricedOptions = resolvePricedTransactionUomOptions({
    options,
    priceListItems,
    productVariantId: "variant-1",
    transactionDate: "2026-08-29T09:00:00.000Z",
  })

  assert.deepEqual(pricedOptions, [options[0]])
})

test("ignores inactive, expired, and future price rows when filtering UOM options", () => {
  const options = [
    { value: "uom-pcs", label: "Piece", factor: 1, isBase: true },
    { value: "uom-pack6", label: "Pack of 6", factor: 6, isBase: false },
  ]

  const priceListItems = [
    {
      id: "pli-inactive-pack6",
      priceListId: "price-list-retail",
      productVariantId: "variant-1",
      companyId: "company-1",
      uomId: "uom-pack6",
      price: 72,
      validFrom: "2026-01-01T00:00:00.000Z",
      status: "INACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "pli-expired-pack6",
      priceListId: "price-list-retail",
      productVariantId: "variant-1",
      companyId: "company-1",
      uomId: "uom-pack6",
      price: 72,
      validFrom: "2026-01-01T00:00:00.000Z",
      validTo: "2026-08-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "pli-future-pack6",
      priceListId: "price-list-retail",
      productVariantId: "variant-1",
      companyId: "company-1",
      uomId: "uom-pack6",
      price: 72,
      validFrom: "2026-09-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "pli-active-base",
      priceListId: "price-list-retail",
      productVariantId: "variant-1",
      companyId: "company-1",
      uomId: "uom-pcs",
      price: 12,
      validFrom: "2026-01-01T00:00:00.000Z",
      status: "ACTIVE",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]

  const pricedOptions = resolvePricedTransactionUomOptions({
    options,
    priceListItems,
    productVariantId: "variant-1",
    transactionDate: "2026-08-29T09:00:00.000Z",
  })

  assert.deepEqual(pricedOptions, [options[0]])
})
