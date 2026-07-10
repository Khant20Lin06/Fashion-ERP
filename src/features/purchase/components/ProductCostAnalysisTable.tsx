import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ProductCostPoint } from "../types"

type ProductCostAnalysisTableProps = {
  data: ProductCostPoint[]
}

/** Previous vs Current cost, cost change %, and supplier comparison per product. */
export function ProductCostAnalysisTable({ data }: ProductCostAnalysisTableProps) {
  if (data.length === 0) {
    return <EmptyState title="No cost data" description="Product cost history will appear here once available." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Previous Cost</TableHead>
          <TableHead>Current Cost</TableHead>
          <TableHead>Cost Change</TableHead>
          <TableHead>Supplier</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((point) => (
          <TableRow key={point.productName}>
            <TableCell className="font-medium">{point.productName}</TableCell>
            <TableCell>{formatCurrency(point.previousCost)}</TableCell>
            <TableCell>{formatCurrency(point.currentCost)}</TableCell>
            <TableCell className={point.costChangePercent > 0 ? "text-destructive" : point.costChangePercent < 0 ? "text-success" : ""}>
              {point.costChangePercent > 0 ? "+" : ""}
              {formatPercent(point.costChangePercent)}
            </TableCell>
            <TableCell className="text-muted-foreground">{point.supplierName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
