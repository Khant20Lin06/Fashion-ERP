import test from "node:test"
import assert from "node:assert/strict"

import {
  buildNativeScrollbarClassName,
  buildSidebarScrollbarClassName,
} from "./native-scrollbar.classes.ts"

test("buildNativeScrollbarClassName returns the dark app scrollbar tokens", () => {
  const className = buildNativeScrollbarClassName()

  assert.match(className, /\boverflow-y-auto\b/)
  assert.match(className, /\[scrollbar-color:var\(--color-border\)_transparent\]/)
  assert.match(className, /\[scrollbar-width:auto\]/)
  assert.match(className, /\[&::-webkit-scrollbar\]:w-2\.5/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:rounded-full/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:bg-border/)
  assert.match(className, /\[&::-webkit-scrollbar-track\]:bg-transparent/)
})

test("buildSidebarScrollbarClassName uses sidebar palette tokens", () => {
  const className = buildSidebarScrollbarClassName()

  assert.match(className, /\boverflow-y-auto\b/)
  assert.match(className, /\[scrollbar-color:var\(--color-sidebar-border\)_transparent\]/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:bg-sidebar-border/)
})

test("native scrollbar helpers preserve caller classes", () => {
  const className = buildNativeScrollbarClassName("flex-1")

  assert.match(className, /\bflex-1\b/)
})
