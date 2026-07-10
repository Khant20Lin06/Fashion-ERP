import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createEmployee,
  deleteEmployee,
  fetchEmployeeById,
  fetchEmployeeDocuments,
  fetchEmployees,
  updateEmployee,
} from "../api/employee.api"
import type { EmployeeFormValues } from "../schemas/employee.schema"

export function useEmployees() {
  return useQuery({
    queryKey: ["hr", "employees"],
    queryFn: fetchEmployees,
  })
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ["hr", "employees", id],
    queryFn: () => fetchEmployeeById(id as string),
    enabled: !!id,
  })
}

export function useEmployeeDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["hr", "employees", employeeId, "documents"],
    queryFn: () => fetchEmployeeDocuments(employeeId as string),
    enabled: !!employeeId,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: EmployeeFormValues) => createEmployee(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "employees"] })
      toast.success("Employee created")
    },
    onError: () => toast.error("Failed to create employee"),
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: EmployeeFormValues) => updateEmployee(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "employees"] })
      queryClient.invalidateQueries({ queryKey: ["hr", "employees", id] })
      toast.success("Employee updated")
    },
    onError: () => toast.error("Failed to update employee"),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "employees"] })
      toast.success("Employee deleted")
    },
    onError: () => toast.error("Failed to delete employee"),
  })
}
