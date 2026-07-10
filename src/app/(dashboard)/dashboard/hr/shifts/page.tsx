"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ShiftCard } from "@/components/hr/ShiftCard"
import { ShiftFormDialog } from "@/features/hr/components/ShiftForm"
import { useShifts } from "@/features/hr/hooks/useAttendance"
import type { Shift } from "@/features/hr/types"

export default function ShiftsPage() {
  const { data, isLoading, isError, refetch } = useShifts()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | undefined>(undefined)

  function openCreate() {
    setEditingShift(undefined)
    setDialogOpen(true)
  }

  function openEdit(shift: Shift) {
    setEditingShift(shift)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Shift Management</h1>
          <p className="text-sm text-muted-foreground">Configure work shifts, hours, and grace periods.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Add Shift
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="Couldn't load shifts." onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No shifts configured" description="Create your first shift to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} onClick={() => openEdit(shift)} />
          ))}
        </div>
      )}

      <ShiftFormDialog open={dialogOpen} onOpenChange={setDialogOpen} shift={editingShift} />
    </div>
  )
}
