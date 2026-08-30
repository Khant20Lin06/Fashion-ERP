import test from "node:test"
import assert from "node:assert/strict"

import {
  buildCartItemsRegionClassName,
  buildPosNativeScrollRegionClassName,
  buildPosLayoutClassName,
  buildPosPaneClassName,
  buildPosPageClassName,
  buildPosScrollablePaneClassName,
} from "./pos-layout.classes.ts"

test("POS page owns the available main-content height and suppresses outer page scrolling", () => {
  const className = buildPosPageClassName()

  assert.match(className, /\bh-full\b/)
  assert.match(className, /\boverflow-hidden\b/)
})

test("POS layout fills the available desktop height for independent pane scrolling", () => {
  const className = buildPosLayoutClassName()

  assert.match(className, /\blg:h-full\b/)
  assert.doesNotMatch(className, /\bmax-h-\[calc\(100vh-12rem\)\]\b/)
  assert.doesNotMatch(className, /\blg:h-\[calc\(100vh-12rem\)\]\b/)
})

test("POS panes opt into full desktop height while remaining min-height safe", () => {
  const className = buildPosPaneClassName()

  assert.match(className, /\bmin-h-0\b/)
  assert.match(className, /\blg:h-full\b/)
})

test("POS scrollable panes reserve a flex scroll region instead of growing the page", () => {
  const className = buildPosScrollablePaneClassName()

  assert.match(className, /\bflex\b/)
  assert.match(className, /\bmin-h-0\b/)
  assert.match(className, /\bflex-col\b/)
  assert.match(className, /\blg:h-full\b/)
})

test("cart items region always owns the cart body scroll", () => {
  const className = buildCartItemsRegionClassName()

  assert.match(className, /\bmin-h-0\b/)
  assert.match(className, /\bflex-1\b/)
  assert.match(className, /\boverflow-y-auto\b/)
  assert.match(className, /\[scrollbar-color:var\(--color-border\)_transparent\]/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:bg-border/)
})

test("POS native scroll regions reuse the dark scrollbar styling used elsewhere in the app", () => {
  const className = buildPosNativeScrollRegionClassName()

  assert.match(className, /\bmin-h-0\b/)
  assert.match(className, /\boverflow-y-auto\b/)
  assert.match(className, /\[scrollbar-width:auto\]/)
  assert.match(className, /\[&::-webkit-scrollbar\]:w-2\.5/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:rounded-full/)
  assert.match(className, /\[&::-webkit-scrollbar-thumb\]:bg-border/)
  assert.match(className, /\[&::-webkit-scrollbar-track\]:bg-transparent/)
})
