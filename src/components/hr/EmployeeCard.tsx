import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmployeeAvatar } from "./EmployeeAvatar"
import type { Employee, EmployeeStatus } from "@/features/hr/types"

const statusVariant: Record<EmployeeStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  on_leave: "secondary",
  suspended: "outline",
  terminated: "destructive",
}

type EmployeeCardProps = {
  employee: Employee
  onClick?: () => void
}

/** Employee summary card — used in grid views and mobile-stacked employee lists. */
export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  return (
    <Card className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : undefined} onClick={onClick}>
      <CardContent className="flex items-start gap-3">
        <EmployeeAvatar name={employee.name} photoUrl={employee.photoUrl} size="lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{employee.name}</p>
            <Badge variant={statusVariant[employee.status]} className="shrink-0 capitalize">
              {employee.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{employee.employeeCode}</p>
          <p className="text-xs text-muted-foreground">
            {employee.designation} · {employee.departmentName}
          </p>
          <p className="text-xs text-muted-foreground">{employee.branchName}</p>
        </div>
      </CardContent>
    </Card>
  )
}
