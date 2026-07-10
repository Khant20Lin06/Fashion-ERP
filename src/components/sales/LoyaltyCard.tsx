import { Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/format"
import type { MemberLevel } from "@/features/sales/types"

const levelVariant: Record<MemberLevel, "outline" | "secondary" | "default"> = {
  bronze: "outline",
  silver: "secondary",
  gold: "default",
  platinum: "default",
}

type LoyaltyCardProps = {
  points: number
  memberLevel: MemberLevel
}

/** Compact loyalty points + membership level card — used on the POS customer panel and customer profile. */
export function LoyaltyCard({ points, memberLevel }: LoyaltyCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex items-center justify-between px-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Loyalty Points</p>
          <p className="text-xl font-semibold tabular-nums">{formatNumber(points)}</p>
        </div>
        <Badge variant={levelVariant[memberLevel]} className="gap-1 capitalize">
          <Award className="size-3" />
          {memberLevel}
        </Badge>
      </CardContent>
    </Card>
  )
}
