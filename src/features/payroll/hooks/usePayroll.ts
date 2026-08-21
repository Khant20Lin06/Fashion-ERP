import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createEmployeeCompensation,
  fetchEmployeeCompensation,
  type CreateEmployeeCompensationInput,
} from "../api/compensation.api"
import {
  createPayrollComponent,
  deletePayrollComponent,
  fetchPayrollComponents,
  setPayrollComponentActive,
  updatePayrollComponent,
  type CreatePayrollComponentInput,
  type UpdatePayrollComponentInput,
} from "../api/component.api"
import {
  fetchPayrollConfiguration,
  upsertPayrollConfiguration,
  type UpsertPayrollConfigurationInput,
} from "../api/configuration.api"
import {
  cancelPayrollPeriod,
  createPayrollPeriod,
  fetchPayrollPeriodById,
  fetchPayrollPeriods,
  type CreatePayrollPeriodInput,
} from "../api/period.api"
import {
  calculatePayrollRun,
  cancelPayrollRun,
  createPayrollRun,
  finalizePayrollRun,
  fetchPayrollRunById,
  fetchPayrollRunEmployeeDetail,
  fetchPayrollRunEmployees,
  fetchPayrollRuns,
} from "../api/run.api"

// --- Employee Compensation ---
// Append-only — no useUpdateEmployeeCompensation hook, since the real
// backend has no update/delete endpoint for this resource.

export function useEmployeeCompensation(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "compensation", employeeId],
    queryFn: () => fetchEmployeeCompensation(employeeId as string),
    enabled: !!employeeId,
  })
}

export function useCreateEmployeeCompensation(employeeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CreateEmployeeCompensationInput) => createEmployeeCompensation(employeeId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "compensation", employeeId] })
      toast.success("Compensation record added")
    },
    onError: (error) => toastApiError(error, "Failed to add compensation record"),
  })
}

// --- Payroll Components ---

export function usePayrollComponents() {
  return useQuery({ queryKey: ["payroll", "components"], queryFn: fetchPayrollComponents })
}

export function useCreatePayrollComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CreatePayrollComponentInput) => createPayrollComponent(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "components"] })
      toast.success("Payroll component created")
    },
    onError: (error) => toastApiError(error, "Failed to create payroll component"),
  })
}

export function useUpdatePayrollComponent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UpdatePayrollComponentInput) => updatePayrollComponent(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "components"] })
      toast.success("Payroll component updated")
    },
    onError: (error) => toastApiError(error, "Failed to update payroll component"),
  })
}

export function useSetPayrollComponentActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setPayrollComponentActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "components"] })
      toast.success("Payroll component updated")
    },
    onError: (error) => toastApiError(error, "Failed to update payroll component"),
  })
}

export function useDeletePayrollComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePayrollComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "components"] })
      toast.success("Payroll component deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete payroll component"),
  })
}

// --- Payroll Configuration ---

export function usePayrollConfiguration() {
  return useQuery({ queryKey: ["payroll", "configuration"], queryFn: fetchPayrollConfiguration })
}

export function useUpsertPayrollConfiguration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UpsertPayrollConfigurationInput) => upsertPayrollConfiguration(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "configuration"] })
      toast.success("Payroll configuration saved")
    },
    onError: (error) => toastApiError(error, "Failed to save payroll configuration"),
  })
}

// --- Payroll Periods ---

export function usePayrollPeriods() {
  return useQuery({ queryKey: ["payroll", "periods"], queryFn: fetchPayrollPeriods })
}

export function usePayrollPeriod(id: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "periods", id],
    queryFn: () => fetchPayrollPeriodById(id as string),
    enabled: !!id,
  })
}

export function useCreatePayrollPeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CreatePayrollPeriodInput) => createPayrollPeriod(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "periods"] })
      toast.success("Payroll period created")
    },
    onError: (error) => toastApiError(error, "Failed to create payroll period"),
  })
}

export function useCancelPayrollPeriod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelPayrollPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "periods"] })
      toast.success("Payroll period cancelled")
    },
    onError: (error) => toastApiError(error, "Failed to cancel payroll period"),
  })
}

// --- Payroll Runs ---

export function usePayrollRuns() {
  return useQuery({ queryKey: ["payroll", "runs"], queryFn: fetchPayrollRuns })
}

export function usePayrollRun(id: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "runs", id],
    queryFn: () => fetchPayrollRunById(id as string),
    enabled: !!id,
  })
}

export function usePayrollRunEmployees(runId: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "runs", runId, "employees"],
    queryFn: () => fetchPayrollRunEmployees(runId as string),
    enabled: !!runId,
  })
}

export function usePayrollRunEmployeeDetail(runId: string | undefined, employeeId: string | undefined) {
  return useQuery({
    queryKey: ["payroll", "runs", runId, "employees", employeeId],
    queryFn: () => fetchPayrollRunEmployeeDetail(runId as string, employeeId as string),
    enabled: !!runId && !!employeeId,
  })
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payrollPeriodId: string) => createPayrollRun(payrollPeriodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll", "runs"] })
      queryClient.invalidateQueries({ queryKey: ["payroll", "periods"] })
      toast.success("Payroll run created")
    },
    onError: (error) => toastApiError(error, "Failed to create payroll run"),
  })
}

function invalidateRun(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  queryClient.invalidateQueries({ queryKey: ["payroll", "runs"] })
  queryClient.invalidateQueries({ queryKey: ["payroll", "runs", id] })
  queryClient.invalidateQueries({ queryKey: ["payroll", "runs", id, "employees"] })
  queryClient.invalidateQueries({ queryKey: ["payroll", "periods"] })
}

export function useCalculatePayrollRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => calculatePayrollRun(id),
    onSuccess: (run) => {
      invalidateRun(queryClient, run.id)
      toast.success("Payroll run calculated")
    },
    onError: (error) => toastApiError(error, "Failed to calculate payroll run"),
  })
}

export function useFinalizePayrollRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => finalizePayrollRun(id),
    onSuccess: (run) => {
      invalidateRun(queryClient, run.id)
      toast.success("Payroll run finalized")
    },
    onError: (error) => toastApiError(error, "Failed to finalize payroll run"),
  })
}

export function useCancelPayrollRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelPayrollRun(id),
    onSuccess: (run) => {
      invalidateRun(queryClient, run.id)
      toast.success("Payroll run cancelled")
    },
    onError: (error) => toastApiError(error, "Failed to cancel payroll run"),
  })
}
