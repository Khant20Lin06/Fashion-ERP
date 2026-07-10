import { Badge } from "@/components/ui/badge"

type SKUPreviewProps = {
  sku: string
  isDuplicate?: boolean
  isChecking?: boolean
}

/** Read-only SKU display used next to the SKU generator/override input. */
export function SKUPreview({ sku, isDuplicate, isChecking }: SKUPreviewProps) {
  return (
    <div className="flex items-center gap-2">
      <code className="rounded-md border bg-muted px-2 py-1 font-mono text-sm">{sku || "—"}</code>
      {isChecking && (
        <Badge variant="secondary" className="text-xs">
          Checking…
        </Badge>
      )}
      {!isChecking && isDuplicate && (
        <Badge variant="destructive" className="text-xs">
          Duplicate SKU
        </Badge>
      )}
      {!isChecking && isDuplicate === false && (
        <Badge variant="outline" className="text-xs text-success">
          Available
        </Badge>
      )}
    </div>
  )
}
