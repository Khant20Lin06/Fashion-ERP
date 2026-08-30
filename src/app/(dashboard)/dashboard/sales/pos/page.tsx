import { POSLayout } from "@/features/sales/components/POSLayout"
import { buildPosPageClassName } from "@/features/sales/components/pos-layout.classes"

export const metadata = {
  title: "POS · Fashion ERP/POS",
}

export default function POSPage() {
  return (
    <div className={buildPosPageClassName()}>
      <POSLayout />
    </div>
  )
}
