import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FinancePaymentStatus } from "../types"

const stages: { status: FinancePaymentStatus; label: string }[] = [
  { status: "created", label: "Created" },
  { status: "approved", label: "Approved" },
  { status: "paid", label: "Paid" },
  { status: "reconciled", label: "Reconciled" },
]

const stageIndex: Record<FinancePaymentStatus, number> = { created: 0, approved: 1, paid: 2, reconciled: 3 }

type PaymentTimelineProps = {
  status: FinancePaymentStatus
}

/** Payment lifecycle timeline — Created -> Approved -> Paid -> Reconciled. */
export function PaymentTimeline({ status }: PaymentTimelineProps) {
  const currentIndex = stageIndex[status]

  return (
    <div className="flex items-center">
      {stages.map((stage, index) => {
        const isComplete = index <= currentIndex
        const isLast = index === stages.length - 1
        return (
          <div key={stage.status} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs font-medium",
                  isComplete ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="size-3.5" /> : index + 1}
              </div>
              <span className={cn("text-xs", isComplete ? "font-medium text-foreground" : "text-muted-foreground")}>
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn("mx-2 h-0.5 flex-1", index < currentIndex ? "bg-primary" : "bg-muted-foreground/30")} />
            )}
          </div>
        )
      })}
    </div>
  )
}
