import test from "node:test"
import assert from "node:assert/strict"

import { buildNotificationDropdownScrollAreaClassName } from "./notification-dropdown.classes.ts"

test("notification dropdown scroll area uses a real height instead of only a max height", () => {
  const className = buildNotificationDropdownScrollAreaClassName()

  assert.equal(className, "h-[min(24rem,calc(100vh-8rem))]")
  assert.doesNotMatch(className, /\bmax-h-96\b/)
})

test("notification dropdown scroll area preserves extra caller classes", () => {
  const className = buildNotificationDropdownScrollAreaClassName("border-t")

  assert.match(className, /\bborder-t\b/)
})
