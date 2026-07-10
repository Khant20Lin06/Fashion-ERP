"use client"

import { CheckCircle2, Circle, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { usePerformanceReviews } from "../hooks/usePayroll"

const periodLabel: Record<string, string> = {
  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",
  annual: "Annual",
}

/** Performance review list — Goals, Rating, and Manager Feedback per employee. */
export function PerformanceReviewList() {
  const { data: reviews, isLoading } = usePerformanceReviews()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return <EmptyState title="No performance reviews" description="Reviews will appear here once submitted." />
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-base">{review.employeeName}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {periodLabel[review.period]} Review · {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="size-3.5 fill-current" />
              {review.score.toFixed(1)} / 5
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              {review.goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2 text-sm">
                  {goal.achieved ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                  <span className={goal.achieved ? undefined : "text-muted-foreground"}>{goal.title}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{review.managerFeedback}</p>
            {review.comments && <p className="text-sm italic text-muted-foreground">{review.comments}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
