import test from "node:test"
import assert from "node:assert/strict"

import { clampPriceListItemsLimit } from "./price-list-query-limit.ts"

test("clampPriceListItemsLimit caps requests at the backend max", () => {
  assert.equal(clampPriceListItemsLimit(1000), 100)
})

test("clampPriceListItemsLimit keeps valid smaller limits", () => {
  assert.equal(clampPriceListItemsLimit(25), 25)
})

test("clampPriceListItemsLimit falls back to the backend max when omitted", () => {
  assert.equal(clampPriceListItemsLimit(undefined), 100)
})
