import test from "node:test"
import assert from "node:assert/strict"

import { buildScrollAreaRootClassName } from "./scroll-area.classes.ts"

test("buildScrollAreaRootClassName keeps the root clipped", () => {
  assert.match(buildScrollAreaRootClassName(), /\boverflow-hidden\b/)
})

test("buildScrollAreaRootClassName preserves caller classes", () => {
  const className = buildScrollAreaRootClassName("max-h-96")
  assert.match(className, /\brelative\b/)
  assert.match(className, /\boverflow-hidden\b/)
  assert.match(className, /\bmax-h-96\b/)
})
