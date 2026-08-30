"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEmployees } from "../hooks/useEmployees"
import type { Employee } from "../types"

type EmployeeSelectorProps = {
  value: string | undefined
  onChange: (employeeId: string | undefined) => void
  placeholder?: string
  employees?: Employee[]
}

/** Dropdown for selecting an employee - used by ESS preview and HR filters. */
export function EmployeeSelector({
  value,
  onChange,
  placeholder = "Select employee",
  employees: providedEmployees,
}: EmployeeSelectorProps) {
  const { data: fetchedEmployees } = useEmployees()
  const employees = providedEmployees ?? fetchedEmployees

  return (
    <Select value={value ?? ""} onValueChange={(v) => onChange(v || undefined)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(employees ?? []).map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            {employee.name} - {employee.designation}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
