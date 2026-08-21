"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, PlayCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DataTable,
  ColumnHeader,
  type DataTableColumnDef,
} from "@/components/data-table"
import { WebhookActiveBadge } from "@/components/webhooks/WebhookStatusBadge"
import { useDeleteWebhook, useTestWebhook, useWebhooks } from "../hooks/useWebhooks"
import { WebhookFormDialog } from "./WebhookForm"
import { WebhookSecretDialog } from "./WebhookSecretDialog"
import type { WebhookSubscription, WebhookSubscriptionCreated } from "../types"

/** Webhook Subscription management table — the primary /dashboard/admin/integrations list view. */
export function WebhookTable() {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useWebhooks()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()

  const [editing, setEditing] = useState<WebhookSubscription | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<WebhookSubscription | undefined>(undefined)
  const [createdWebhook, setCreatedWebhook] = useState<WebhookSubscriptionCreated | undefined>(undefined)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)

  function openEdit(webhook: WebhookSubscription) {
    setEditing(webhook)
    setFormOpen(true)
  }

  function handleTest(webhook: WebhookSubscription) {
    testWebhook.mutate(webhook.id, {
      onSuccess: (result) => {
        if (result.status >= 200 && result.status < 300) {
          toast.success(`Test event delivered — endpoint responded ${result.status}`)
        } else {
          toast.warning(`Endpoint responded with status ${result.status}`)
        }
      },
    })
  }

  const columns: DataTableColumnDef<WebhookSubscription>[] = [
    {
      accessorKey: "url",
      header: ({ column }) => <ColumnHeader column={column} title="Endpoint URL" />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("url")}</span>,
    },
    {
      accessorKey: "events",
      header: ({ column }) => <ColumnHeader column={column} title="Events" />,
      cell: ({ row }) => {
        const events = row.getValue<string[]>("events")
        return <span className="font-mono text-xs text-muted-foreground">{events.join(", ")}</span>
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <WebhookActiveBadge isActive={row.getValue("isActive")} />,
    },
    {
      accessorKey: "failureCount",
      header: ({ column }) => <ColumnHeader column={column} title="Failures" />,
      cell: ({ row }) => {
        const count = row.getValue<number>("failureCount")
        return count > 0 ? <span className="text-destructive">{count}</span> : <span>0</span>
      },
    },
    {
      accessorKey: "lastDeliveredAt",
      header: ({ column }) => <ColumnHeader column={column} title="Last Delivered" />,
      cell: ({ row }) => {
        const value = row.getValue<string | null>("lastDeliveredAt")
        return value ? new Date(value).toLocaleString() : <span className="text-muted-foreground">Never</span>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Row actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/integrations/${row.original.id}`)}>
              View Deliveries
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTest(row.original)} disabled={testWebhook.isPending}>
              <PlayCircle /> Send Test Event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(row.original)}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        searchPlaceholder="Search webhooks..."
        exportFilename="webhooks"
        emptyTitle="No webhooks configured"
        emptyDescription="Add a webhook to receive real-time event notifications."
      />

      <WebhookFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(undefined)
        }}
        webhook={editing}
        onCreated={(created) => {
          setCreatedWebhook(created)
          setSecretDialogOpen(true)
        }}
      />

      <WebhookSecretDialog open={secretDialogOpen} onOpenChange={setSecretDialogOpen} webhook={createdWebhook} />

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this webhook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently stop event delivery to <span className="font-mono">{pendingDelete?.url}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteWebhook.mutate(pendingDelete.id)
                setPendingDelete(undefined)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
