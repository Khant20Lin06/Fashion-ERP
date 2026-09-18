import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import {
  createCustomer,
  createCustomerNote,
  deleteCustomer,
  fetchCustomerAnalytics,
  fetchCustomerById,
  fetchCustomerNotes,
  fetchCustomers,
  updateCustomer,
} from "../api/customer.api"
import type { CustomerFormValues } from "../schemas/customer.schema"

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => fetchCustomers(),
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => fetchCustomerById(id as string),
    enabled: !!id,
  })
}

export function useCustomerAnalytics(id: string | undefined) {
  return useQuery({
    queryKey: ["customers", id, "analytics"],
    queryFn: () => fetchCustomerAnalytics(id as string),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CustomerFormValues) => createCustomer(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer created")
    },
    onError: (error) => toastApiError(error, "Failed to create customer"),
  })
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: CustomerFormValues) => updateCustomer(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      queryClient.invalidateQueries({ queryKey: ["customers", id] })
      toast.success("Customer updated")
    },
    onError: (error) => toastApiError(error, "Failed to update customer"),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success("Customer deleted")
    },
    onError: (error) => toastApiError(error, "Failed to delete customer"),
  })
}

export function useCustomerNotes(customerId: string | undefined) {
  return useQuery({
    queryKey: ["customers", customerId, "notes"],
    queryFn: () => fetchCustomerNotes(customerId as string),
    enabled: !!customerId,
  })
}

export function useCreateCustomerNote(customerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string; noteType?: string }) =>
      createCustomerNote(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", customerId, "notes"] })
      toast.success("Note added")
    },
    onError: (error) => toastApiError(error, "Failed to add note"),
  })
}
