import { DiscountRuleList } from "@/features/sales/components/DiscountRuleList"

export const metadata = {
  title: "Discounts · Fashion ERP/POS",
}

export default function DiscountsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Discount Management</h1>
        <p className="text-sm text-muted-foreground">
          Product, Category, Customer, and Campaign discount rules applied across POS and orders.
        </p>
      </div>

      <DiscountRuleList />
    </div>
  )
}
