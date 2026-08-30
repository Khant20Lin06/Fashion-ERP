import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  activateEmployee,
  createEmployee,
  deleteEmployee,
  destroyEmployee,
  fetchEmployeeById,
  fetchEmployeeDocuments,
  fetchEmployees,
  terminateEmployee,
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

// Headcount changes affect HR KPIs/analytics (department distribution,
// headcount growth, turnover) too — invalidate the whole "hr" prefix rather
// than just the employees list.

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: EmployeeFormValues) => createEmployee(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr"] })
      toast.success("Employee created")
    },
    onError: (error) => toastApiError(error, "Failed to create employee"),
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: EmployeeFormValues) => updateEmployee(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr"] })
      queryClient.invalidateQueries({ queryKey: ["hr", "employees", id] })
      toast.success("Employee updated")
    },
    onError: (error) => toastApiError(error, "Failed to update employee"),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr"] })
      toast.success("Employee archived")
    },
    onError: (error) => toastApiError(error, "Failed to archive employee"),
  })
}

export function useActivateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => activateEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr"] })
      toast.success("Employee activated")
    },
    onError: (error) => toastApiError(error, "Failed to activate employee"),
  })
}

export function useDestroyEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => destroyEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr"] })
      toast.success("Employee permanently deleted")
    },
    onError: (error) => toastApiError(error, "Failed to permanently delete employee"),
  })
}

export function useTerminateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => terminateEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr"] })
      toast.success("Employee terminated")
    },
    onError: (error) => toastApiError(error, "Failed to terminate employee"),
  })
}
