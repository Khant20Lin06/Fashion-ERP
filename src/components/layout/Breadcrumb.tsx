"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function toTitleCase(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Auto-derives breadcrumb trail from the current pathname. */
export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    return { label: toTitleCase(segment), href, isLast: index === segments.length - 1 }
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <ol className="flex items-center gap-1.5">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            {crumb.isLast ? (
              <span aria-current="page" className={cn("font-medium text-foreground")}>
                {crumb.label}
              </span>
            ) : (
              <>
                <Link href={crumb.href} className="hover:text-foreground hover:underline">
                  {crumb.label}
                </Link>
                <ChevronRight className="size-3.5 shrink-0" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
