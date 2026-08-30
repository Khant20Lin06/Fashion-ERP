import test from "node:test"
import assert from "node:assert/strict"

import {
  hasVisibleCategory,
  resolveVisiblePosCategories,
} from "./pos-category-options.ts"

const categories = [
  { id: "cat-all", name: "All Parent", parentId: null, isActive: true },
  { id: "cat-mens", name: "Men's Apparel", parentId: "cat-all", isActive: true },
  { id: "cat-outerwear", name: "Outerwear & Jackets", parentId: "cat-all", isActive: true },
  { id: "cat-inactive", name: "Inactive", parentId: "cat-all", isActive: false },
]

const products = [
  {
    id: "product-1",
    categoryName: "Men's Apparel",
    variants: [{ id: "variant-priced", status: "active" }],
  },
  {
    id: "product-2",
    categoryName: "Outerwear & Jackets",
    variants: [{ id: "variant-unpriced", status: "active" }],
  },
]

const priceListItems = [
  {
    id: "price-1",
    priceListId: "wholesale",
    productVariantId: "variant-priced",
    companyId: "company-1",
    uomId: "uom-pack6",
    price: 120,
    validFrom: "2026-01-01T00:00:00.000Z",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
]

test("resolveVisiblePosCategories keeps only active leaf categories with sellable products", () => {
  const visibleCategories = resolveVisiblePosCategories(
    categories,
    products,
    priceListItems,
    "2026-08-29T09:00:00.000Z",
  )

  assert.deepEqual(
    visibleCategories.map((category) => category.name),
    ["Men's Apparel"],
  )
})

test("hasVisibleCategory returns false when a selected chip is no longer sellable", () => {
  const visibleCategories = resolveVisiblePosCategories(
    categories,
    products,
    priceListItems,
    "2026-08-29T09:00:00.000Z",
  )

  assert.equal(hasVisibleCategory("Outerwear & Jackets", visibleCategories), false)
  assert.equal(hasVisibleCategory("Men's Apparel", visibleCategories), true)
  assert.equal(hasVisibleCategory(undefined, visibleCategories), true)
})
