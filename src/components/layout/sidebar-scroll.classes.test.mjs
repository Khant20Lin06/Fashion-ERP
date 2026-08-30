import test from "node:test"
import assert from "node:assert/strict"

import { buildSidebarScrollRegionClassName } from "./sidebar-scroll.classes.ts"

test("sidebar scroll regions reuse the dark scrollbar styling for sidebar navigation", () => {
  const className = buildSidebarScrollRegionClassName()

  assert.match(className, /\boverflow-y-auto\b/)
  assert.match(className, /\[scrollbar-color:var\(--color-sidebar-border\)_transparent\]/)
  assert.match(className, /\[scrollbar-width:auto\]/)
  assert.match(className, /\[&::-webkit-scrollbar\]:w-2\.5/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:rounded-full/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:bg-sidebar-border/)
  assert.match(className, /\[&::-webkit-scrollbar-track\]:bg-transparent/)
})

test("sidebar scroll regions preserve caller classes", () => {
  const className = buildSidebarScrollRegionClassName("px-2 py-4")

  assert.match(className, /\bpx-2\b/)
  assert.match(className, /\bpy-4\b/)
})
