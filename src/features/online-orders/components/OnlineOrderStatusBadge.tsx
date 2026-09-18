import { Badge } from "@/components/ui/badge"
import type { OnlineOrderStatus } from "../types"

export function OnlineOrderStatusBadge({ status }: { status: OnlineOrderStatus }) {
  const formatStatus = (s: string) => {
    switch (s) {
      case "PENDING_REVIEW": return "Pending Review"
      case "ON_MY_WAY": return "On My Way"
      default:
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    }
  }

  const getVariant = (s: OnlineOrderStatus) => {
    switch (s) {
      case "PENDING_REVIEW":
        return "secondary" // Gray/Yellowish depending on theme
      case "CONFIRMED":
      case "PACKED":
        return "default" // Primary color
      case "ON_MY_WAY":
        return "outline"
      case "DELIVERED":
        return "success" // Requires a success variant in Badge, or we can use custom classes
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getClasses = (s: OnlineOrderStatus) => {
    switch (s) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400"
      default:
        return ""
    }
  }

  return (
    <Badge variant={getVariant(status) as any} className={getClasses(status)}>
      {formatStatus(status)}
    </Badge>
  )
}
