import test from "node:test"
import assert from "node:assert/strict"

import { collectPaginatedRows } from "./collect-paginated-rows.ts"

test("collectPaginatedRows keeps fetching until the reported total is loaded", async () => {
  const pageCalls = []

  const rows = await collectPaginatedRows({
    limit: 1000,
    fetchPage: async (page, limit) => {
      pageCalls.push([page, limit])

      if (page === 1) {
        return {
          rows: Array.from({ length: 1000 }, (_, index) => `row-${index + 1}`),
          meta: { page: 1, limit, total: 1100 },
        }
      }

      return {
        rows: Array.from({ length: 100 }, (_, index) => `row-${index + 1001}`),
        meta: { page: 2, limit, total: 1100 },
      }
    },
  })

  assert.equal(rows.length, 1100)
  assert.deepEqual(pageCalls, [
    [1, 1000],
    [2, 1000],
  ])
})

test("collectPaginatedRows stops when a page returns fewer rows than the limit", async () => {
  const pageCalls = []

  const rows = await collectPaginatedRows({
    limit: 1000,
    fetchPage: async (page, limit) => {
      pageCalls.push([page, limit])
      return {
        rows: Array.from({ length: 250 }, (_, index) => `row-${index + 1}`),
        meta: { page, limit, total: 250 },
      }
    },
  })

  assert.equal(rows.length, 250)
  assert.deepEqual(pageCalls, [[1, 1000]])
})

test("collectPaginatedRows deduplicates rows that overlap across unstable page boundaries", async () => {
  const rows = await collectPaginatedRows({
    limit: 2,
    keyOf: (row) => row.id,
    fetchPage: async (page) => {
      if (page === 1) {
        return {
          rows: [
            { id: "row-1", value: "A" },
            { id: "row-2", value: "B" },
          ],
          meta: { page: 1, limit: 2, total: 3 },
        }
      }

      return {
        rows: [
          { id: "row-2", value: "B" },
          { id: "row-3", value: "C" },
        ],
        meta: { page: 2, limit: 2, total: 3 },
      }
    },
  })

  assert.deepEqual(rows, [
    { id: "row-1", value: "A" },
    { id: "row-2", value: "B" },
    { id: "row-3", value: "C" },
  ])
})
