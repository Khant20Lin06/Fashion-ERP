"use client"

import { Cake, CalendarClock, PartyPopper, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useUpcomingEvents } from "../hooks/useOrganization"
import type { UpcomingEvent } from "../types"

const iconByType: Record<UpcomingEvent["type"], typeof Cake> = {
  birthday: Cake,
  holiday: CalendarClock,
  anniversary: PartyPopper,
  review: Star,
}

/** Upcoming Events widget — birthdays, holidays, anniversaries, review deadlines. */
export function UpcomingEventsCard() {
  const { data, isLoading } = useUpcomingEvents()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : !data || data.length === 0 ? (
          <EmptyState title="No upcoming events" description="Events will appear here as they're scheduled." />
        ) : (
          data.map((event) => {
            const Icon = iconByType[event.type]
            return (
              <div key={event.id} className="flex items-center gap-3 text-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(event.date)}</p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
