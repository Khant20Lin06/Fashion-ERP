"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployees } from "../hooks/useEmployees"

type EmployeeSelectorProps = {
  value: string | undefined
  onChange: (employeeId: string | undefined) => void
  placeholder?: string
}

/** Dropdown for selecting an employee — used by Employee Self Service to pick "who am I". */
export function EmployeeSelector({ value, onChange, placeholder = "Select employee" }: EmployeeSelectorProps) {
  const { data: employees } = useEmployees()

  return (
    <Select value={value ?? ""} onValueChange={(v) => onChange(v || undefined)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(employees ?? []).map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.name} — {employee.designation}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
