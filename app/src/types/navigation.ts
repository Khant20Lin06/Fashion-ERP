import type { LucideIcon } from "lucide-react"
import type { Permission } from "./user"

export type NavItem = {
  label: string
  href?: string
  icon?: LucideIcon
  /** Module key checked against the current user's permissions for visibility. */
  module?: string
  requiredAction?: Permission["actions"][number]
  children?: NavItem[]
}
