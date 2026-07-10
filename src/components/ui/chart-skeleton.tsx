import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return <Skeleton className="w-full rounded-md" style={{ height }} />
}
