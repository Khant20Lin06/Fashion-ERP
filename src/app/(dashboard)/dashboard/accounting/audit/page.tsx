import { AuditLogTable } from "@/features/accounting/components/AuditLogTable"

export const metadata = {
  title: "Audit Log · Fashion ERP/POS",
}

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">A complete history of every accounting action.</p>
      </div>

      <AuditLogTable />
    </div>
  )
}
