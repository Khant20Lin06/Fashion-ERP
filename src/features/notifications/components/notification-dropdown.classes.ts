export function buildNotificationDropdownScrollAreaClassName(className?: string): string {
  return ["h-[min(24rem,calc(100vh-8rem))]", className].filter(Boolean).join(" ")
}
