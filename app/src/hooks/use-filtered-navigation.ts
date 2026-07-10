"use client"

import { useMemo } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { hasPermission } from "@/types/user"
import type { NavItem } from "@/types/navigation"

function filterTree(items: NavItem[], check: (item: NavItem) => boolean): NavItem[] {
  return items.reduce<NavItem[]>((acc, item) => {
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
