import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Shift } from "@/features/hr/types"

type ShiftCardProps = {
  shift: Shift
  onClick?: () => void
}

/** Shift configuration card — Name, time range, break, working days, grace period. */
export function ShiftCard({ shift, onClick }: ShiftCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : undefined} onClick={onClick}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Clock className="size-4" />
          </div>
          <div>
            <p className="font-medium">{shift.name}</p>
            <p className="text-xs text-muted-foreground">
              {shift.startTime} - {shift.endTime}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {shift.workingDays.map((day) => (
            <Badge key={day} variant="outline" className="text-xs">
              {day}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Break: {shift.breakMinutes} min</span>
          <span>Grace: {shift.gracePeriodMinutes} min</span>
        </div>
      </CardContent>
    </Card>
  )
}
