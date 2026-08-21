"use client"

import { useMemo } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { hasPermission } from "@/types/user"
import type { NavItem } from "@/types/navigation"

function filterTree(items: NavItem[], check: (item: NavItem) => boolean): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
    // BACKEND GAP routes never appear in navigation, regardless of
    // permission — see src/config/release-scope.ts. "partial" and "ready"
    // (the default) both remain visible: hiding a partial page would throw
    // away its real, working sections.
    if (item.releaseStatus === "backend-gap" || item.releaseStatus === "out-of-scope") {
      return acc
    }

    const children = item.children ? filterTree(item.children, check) : undefined
    const isVisible = item.module ? check(item) : true
    const hasVisibleChildren = children && children.length > 0

    if (isVisible || hasVisibleChildren) {
      acc.push({ ...item, children })
    }

    return acc
  }, [])
}

/** Returns the navigation tree filtered to items the current user may see. */
export function useFilteredNavigation(tree: NavItem[]): NavItem[] {
  const user = useAuthStore((s) => s.user)

  return useMemo(
    () =>
      filterTree(tree, (item) =>
        hasPermission(user, item.module!, item.requiredAction ?? "view")
      ),
    [tree, user]
  )
}
