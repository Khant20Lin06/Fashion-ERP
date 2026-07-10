"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionStatus } from "@/components/accounting/TransactionStatus"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useJournalEntries, useUpdateJournalEntryStatus } from "../hooks/useLedger"
import type { JournalStatus } from "../types"

const nextStatus: Partial<Record<JournalStatus, JournalStatus>> = {
  draft: "submitted",
  submitted: "approved",
  approved: "posted",
}

const nextStatusLabel: Partial<Record<JournalStatus, string>> = {
  draft: "Submit",
  submitted: "Approve",
  approved: "Post",
}

/** Journal Entry workflow list: Draft -> Submitted -> Approved -> Posted. */
export function JournalEntryList() {
  const { data, isLoading, isError, refetch } = useJournalEntries()
  const { mutate: updateStatus, isPending } = useUpdateJournalEntryStatus()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load journal entries." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No journal entries" description="Create a journal entry to see it here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((entry) => {
        const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0)
        const upcoming = nextStatus[entry.status]
        return (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{entry.reference}</p>
                  <TransactionStatus status={entry.status} />
                </div>
                <p className="text-sm">{entry.description}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.lines.length} line(s) · {formatCurrency(totalDebit)} · {entry.createdBy} · {formatRelativeTime(entry.createdAt)}
                </p>
              </div>
              {upcoming && (
                <Button size="sm" onClick={() => updateStatus({ id: entry.id, status: upcoming })} disabled={isPending}>
                  {nextStatusLabel[entry.status]}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
