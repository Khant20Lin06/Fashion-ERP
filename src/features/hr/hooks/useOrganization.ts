import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createDepartment,
  fetchAnnouncements,
  fetchDepartmentDistribution,
  fetchDepartments,
  fetchHrKpis,
  fetchOrgUnits,
  fetchUpcomingEvents,
  updateDepartment,
  type DepartmentFormValues,
} from "../api/organization.api"

// --- Departments ---

export function useDepartments() {
  return useQuery({ queryKey: ["hr", "departments"], queryFn: fetchDepartments })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: DepartmentFormValues) => createDepartment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "departments"] })
      toast.success("Department created")
    },
    onError: () => toast.error("Failed to create department"),
  })
}

export function useUpdateDepartment(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: DepartmentFormValues) => updateDepartment(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "departments"] })
      toast.success("Department updated")
    },
    onError: () => toast.error("Failed to update department"),
  })
}

// --- Organization Tree ---

export function useOrgUnits() {
  return useQuery({ queryKey: ["hr", "organization"], queryFn: fetchOrgUnits })
}

// --- HR Dashboard ---

export function useHrKpis() {
  return useQuery({ queryKey: ["hr", "kpis"], queryFn: fetchHrKpis })
}

export function useDepartmentDistribution() {
  return useQuery({ queryKey: ["hr", "analytics", "department-distribution"], queryFn: fetchDepartmentDistribution })
}

export function useUpcomingEvents() {
  return useQuery({ queryKey: ["hr", "upcoming-events"], queryFn: fetchUpcomingEvents })
}

// --- Announcements ---

export function useAnnouncements() {
  return useQuery({ queryKey: ["hr", "announcements"], queryFn: fetchAnnouncements })
}
