import { Building2, Mail, MapPin, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import type { Supplier } from "@/features/purchase/types"

type SupplierCardProps = {
  supplier: Supplier
  onClick?: () => void
}

/** Supplier summary card — used in grid views and the Top Suppliers dashboard widget. */
export function SupplierCard({ supplier, onClick }: SupplierCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : undefined} onClick={onClick}>
      <CardContent className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{supplier.name}</p>
            <Badge variant={supplier.status === "active" ? "default" : "outline"} className="shrink-0">
              {supplier.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{supplier.code}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3" />
            <span className="truncate">{supplier.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3" />
            <span>{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span>{supplier.country}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-sm">
            <span>
              Purchased: <span className="font-medium">{formatCurrency(supplier.totalPurchase)}</span>
            </span>
            {supplier.outstanding > 0 && (
              <span className="text-warning">Owed: {formatCurrency(supplier.outstanding)}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
