export function buildSidebarScrollRegionClassName(className?: string): string {
  return [
    "overflow-y-auto",
    "pr-1",
    "[scrollbar-color:var(--color-sidebar-border)_transparent]",
    "[scrollbar-width:auto]",
    "[&::-webkit-scrollbar]:w-2.5",
    "[&::-webkit-scrollbar-thumb]:rounded-full",
    "[&::-webkit-scrollbar-thumb]:bg-sidebar-border",
    "[&::-webkit-scrollbar-track]:bg-transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ")
}
