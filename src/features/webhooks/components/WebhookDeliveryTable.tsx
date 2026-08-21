"use client"

import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { WebhookDeliveryStatusBadge } from "@/components/webhooks/WebhookStatusBadge"
import { useWebhookDeliveries } from "../hooks/useWebhooks"
import type { WebhookDelivery } from "../types"

/** Delivery history for a single webhook subscription — event type, delivery status, attempt count, timestamp. No request secrets or signed payloads are shown, matching the real backend response (WebhookDeliveryResponseDto never includes them). */
export function WebhookDeliveryTable({ webhookId }: { webhookId: string }) {
  const { data, isLoading, isError, refetch } = useWebhookDeliveries(webhookId)

  const columns: DataTableColumnDef<WebhookDelivery>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => <ColumnHeader column={column} title="Date" />,
      cell: ({ row }) => new Date(row.getValue<string>("createdAt")).toLocaleString(),
    },
    {
      accessorKey: "eventType",
      header: ({ column }) => <ColumnHeader column={column} title="Event" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("eventType")}</span>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <WebhookDeliveryStatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "attempt",
      header: ({ column }) => <ColumnHeader column={column} title="Attempts" />,
    },
    {
      accessorKey: "responseStatus",
      header: ({ column }) => <ColumnHeader column={column} title="Response" />,
      cell: ({ row }) => {
        const status = row.getValue<number | null>("responseStatus")
        return status ?? <span className="text-muted-foreground">—</span>
      },
    },
    {
      accessorKey: "errorMessage",
      header: ({ column }) => <ColumnHeader column={column} title="Error" />,
      cell: ({ row }) => {
        const message = row.getValue<string | null>("errorMessage")
        return message ? <span className="text-destructive">{message}</span> : <span className="text-muted-foreground">—</span>
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      searchPlaceholder="Search deliveries..."
      exportFilename="webhook-deliveries"
      emptyTitle="No deliveries yet"
      emptyDescription="Delivery attempts for subscribed events will appear here."
    />
  )
}
