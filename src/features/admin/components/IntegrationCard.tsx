"use client"

import {
  CreditCard,
  Landmark,
  Plug,
  ScanBarcode,
  ShoppingBag,
  Smartphone,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRelativeTime } from "@/lib/format"
import { useSyncIntegration } from "../hooks/useSettings"
import type { Integration, IntegrationCategory } from "../types"

const categoryIcon: Record<IntegrationCategory, typeof Plug> = {
  payment_gateway: CreditCard,
  accounting_api: Landmark,
  hr_system: Users,
  barcode_scanner: ScanBarcode,
  ecommerce_platform: ShoppingBag,
  mobile_app_api: Smartphone,
}

const statusVariant: Record<Integration["status"], "default" | "secondary" | "outline" | "destructive"> = {
  connected: "default",
  disconnected: "outline",
  error: "destructive",
}

type IntegrationCardProps = {
  integration: Integration
  onConfigure: (integration: Integration) => void
}

/** Integration card — Payment Gateway/Accounting API/HR System/Barcode Scanner/E-commerce/Mobile App API. */
export function IntegrationCard({ integration, onConfigure }: IntegrationCardProps) {
  const Icon = categoryIcon[integration.category]
  const syncIntegration = useSyncIntegration()

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <Badge variant={statusVariant[integration.status]} className="mt-1 capitalize">
              {integration.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{integration.description}</p>
        <p className="text-xs text-muted-foreground">
          Last Sync: {integration.lastSyncAt ? formatRelativeTime(integration.lastSyncAt) : "Never"}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onConfigure(integration)}>
            Configure
          </Button>
          {integration.status === "connected" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncIntegration.mutate(integration.id)}
              disabled={syncIntegration.isPending}
            >
              Sync Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
