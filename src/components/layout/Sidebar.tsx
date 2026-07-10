"use client"

import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "@/stores/sidebar.store"
import { useFilteredNavigation } from "@/hooks/use-filtered-navigation"
import { navigationTree } from "@/config/navigation"
import { NavTree } from "./NavTree"

/** Desktop/laptop persistent sidebar — collapsible, permission-filtered, with nested navigation. */
export function Sidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)
  const items = useFilteredNavigation(navigationTree)

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
        isCollapsed ? "w-18" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2 font-semibold text-sidebar-foreground">
          <BarChart3 className="size-6 shrink-0 text-sidebar-primary" />
          {!isCollapsed && <span className="truncate">Fashion ERP</span>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <NavTree items={items} collapsed={isCollapsed} />
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-start gap-3 px-3"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}
