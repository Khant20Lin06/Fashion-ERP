import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { PurchaseLineItem } from "@/features/purchase/types"

type PurchaseItemTableProps = {
  items: PurchaseLineItem[]
}

/** Read-only purchase line-item table — used on PO detail, invoice, and receipt review views. */
export function PurchaseItemTable({ items }: PurchaseItemTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Variant</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Unit Cost</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Tax</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <p className="font-medium">{item.productName}</p>
              <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
            </TableCell>
            <TableCell>{[item.color, item.size].filter(Boolean).join(" / ") || "—"}</TableCell>
            <TableCell>{formatNumber(item.quantity)}</TableCell>
            <TableCell>{formatCurrency(item.unitCost)}</TableCell>
            <TableCell>{formatCurrency(item.discount)}</TableCell>
            <TableCell>{formatCurrency(item.tax)}</TableCell>
            <TableCell className="font-medium">{formatCurrency(item.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
