"use client"

import { BarChart3 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSidebarStore } from "@/stores/sidebar.store"
import { useFilteredNavigation } from "@/hooks/use-filtered-navigation"
import { navigationTree } from "@/config/navigation"
import { NavTree } from "./NavTree"

/** Full-screen drawer navigation for tablet/mobile breakpoints. */
export function MobileSidebar() {
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)
  const items = useFilteredNavigation(navigationTree)

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetHeader className="h-16 flex-row items-center gap-2 border-b border-sidebar-border px-4">
          <BarChart3 className="size-6 text-sidebar-primary" />
          <SheetTitle className="text-sidebar-foreground">Fashion ERP</SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-2 py-4" onClick={() => setMobileOpen(false)}>
          <NavTree items={items} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}
