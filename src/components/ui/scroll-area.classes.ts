export function buildScrollAreaRootClassName(className?: string): string {
  return ["relative", "overflow-hidden", className].filter(Boolean).join(" ")
}
