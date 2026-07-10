import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { TableSkeleton } from "@/components/ui/table-skeleton"

export type ReportTableColumn<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
}

type ReportTableProps<T> = {
  columns: ReportTableColumn<T>[]
  data: T[] | undefined
  isLoading?: boolean
  getRowKey: (row: T) => string
}

/** Generic report detail table — used across Sales/Inventory/Purchase/Product report pages. */
export function ReportTable<T>({ columns, data, isLoading, getRowKey }: ReportTableProps<T>) {
  if (isLoading) return <TableSkeleton rows={6} columns={columns.length} />

  if (!data || data.length === 0) {
    return <EmptyState title="No data available" description="Try changing your filters." />
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.key}>{col.cell(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
