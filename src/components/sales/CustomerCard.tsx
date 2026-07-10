import { Award, Mail, Phone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { Customer, MemberLevel } from "@/features/sales/types"

const levelVariant: Record<MemberLevel, "outline" | "secondary" | "default"> = {
  bronze: "outline",
  silver: "secondary",
  gold: "default",
  platinum: "default",
}

type CustomerCardProps = {
  customer: Customer
  onClick?: () => void
}

/** Customer summary card — used in grid views and quick-lookup panels. */
export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : undefined} onClick={onClick}>
      <CardContent className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{customer.name}</p>
            {customer.loyaltyMember && (
              <Badge variant={levelVariant[customer.memberLevel]} className="shrink-0 gap-1 capitalize">
                <Award className="size-3" />
                {customer.memberLevel}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3" />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span>
              Spent: <span className="font-medium">{formatCurrency(customer.totalSpending)}</span>
            </span>
            {customer.loyaltyMember && (
              <span className="text-muted-foreground">{formatNumber(customer.loyaltyPoints)} pts</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
