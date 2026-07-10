"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebarStore } from "@/stores/sidebar.store"
import type { NavItem } from "@/types/navigation"

type NavTreeProps = {
  items: NavItem[]
  collapsed?: boolean
  depth?: number
}

/** Recursive sidebar navigation renderer, shared by Sidebar and MobileSidebar. */
export function NavTree({ items, collapsed = false, depth = 0 }: NavTreeProps) {
  const pathname = usePathname()
  const openMenuKeys = useSidebarStore((s) => s.openMenuKeys)
  const toggleMenu = useSidebarStore((s) => s.toggleMenu)

  // A route can be a prefix-match candidate for more than one sibling at the
  // same level (e.g. both "/dashboard/sales" and "/dashboard/sales/pos" are
  // prefixes of "/dashboard/sales/pos"). Only the item whose href matches the
  // most specifically (longest match, exact match wins outright) should be
  // highlighted — otherwise a parent "Dashboard" link lights up on every one
  // of its siblings' pages. The app root ("/dashboard") is a prefix of every
  // route in the app, so it only ever counts as a match when it's exact.
  const matches = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  const bestMatchHref = items
    .map((item) => item.href)
    .filter((href): href is string => !!href && matches(href))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const key = item.href ?? item.label
        const isActive = !!item.href && item.href === bestMatchHref
        const hasChildren = !!item.children?.length
        const isOpen = openMenuKeys.includes(key) || (hasChildren && item.children!.some((c) => pathname.startsWith(c.href ?? "")))
        const Icon = item.icon

        if (hasChildren) {
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => toggleMenu(key)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  depth > 0 && "pl-8"
                )}
              >
                {Icon && <Icon className="size-4 shrink-0" />}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")}
                    />
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="mt-0.5">
                  <NavTree items={item.children!} depth={depth + 1} />
                </div>
              )}
            </li>
          )
        }

        return (
          <li key={key}>
            <Link
              href={item.href ?? "#"}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                depth > 0 && "pl-8",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" />}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
