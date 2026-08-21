import { Check } from "lucide-react"

/** Payment status indicator. Real backend Payments are created already
 * CONFIRMED (D14, LOCKED) — there is no Created/Approved/Reconciled
 * multi-stage lifecycle to progress through, so this shows a single
 * completed state rather than implying stages that will never occur. */
export function PaymentTimeline() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex size-5 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
        <Check className="size-3" />
      </div>
      <span className="font-medium text-foreground">Confirmed</span>
    </div>
  )
}
