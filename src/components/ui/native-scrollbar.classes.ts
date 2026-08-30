function buildScrollbarClassName(thumbClassName: string, colorVariable: string, className?: string): string {
  return [
    "overflow-y-auto",
    "pr-1",
    `[scrollbar-color:${colorVariable}_transparent]`,
    "[scrollbar-width:auto]",
    "[&::-webkit-scrollbar]:w-2.5",
    "[&::-webkit-scrollbar-thumb]:rounded-full",
    thumbClassName,
    "[&::-webkit-scrollbar-track]:bg-transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ")
}

export function buildNativeScrollbarClassName(className?: string): string {
  return buildScrollbarClassName("[&::-webkit-scrollbar-thumb]:bg-border", "var(--color-border)", className)
}

export function buildSidebarScrollbarClassName(className?: string): string {
  return buildScrollbarClassName(
    "[&::-webkit-scrollbar-thumb]:bg-sidebar-border",
    "var(--color-sidebar-border)",
    className,
  )
}
