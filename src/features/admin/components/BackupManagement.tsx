"use client"

import { Database, Download, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { useBackupRecords, useCreateBackup, useRestoreBackup } from "../hooks/useSettings"

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  failed: "destructive",
  in_progress: "secondary",
}

/** Backup Management — Create Backup, Restore Backup, Backup History. */
export function BackupManagement() {
  const { data, isLoading } = useBackupRecords()
  const createBackup = useCreateBackup()
  const restoreBackup = useRestoreBackup()

  return (
    <SettingsSection title="Backup Management" description="Create, restore, and review system backups.">
      <div className="flex justify-end">
        <Button onClick={() => createBackup.mutate()} disabled={createBackup.isPending}>
          <Database /> Create Backup
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No backups yet" description="Create your first backup to get started." />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((backup) => (
            <Card key={backup.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{new Date(backup.createdAt).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {backup.sizeMb} MB · Triggered by {backup.triggeredBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[backup.status]} className="capitalize">
                    {backup.status.replace("_", " ")}
                  </Badge>
                  {backup.status === "completed" && (
                    <>
                      <Button variant="ghost" size="icon" aria-label="Download backup">
                        <Download className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Restore backup"
                        onClick={() => restoreBackup.mutate(backup.id)}
                        disabled={restoreBackup.isPending}
                      >
                        <RotateCcw className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </SettingsSection>
  )
}
