import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createAccount, deleteAccount, fetchAccounts, updateAccount, type AccountFormValues } from "../api/account.api"

export function useAccounts() {
  return useQuery({
    queryKey: ["accounting", "accounts"],
    queryFn: fetchAccounts,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AccountFormValues) => createAccount(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "accounts"] })
      toast.success("Account created")
    },
    onError: () => toast.error("Failed to create account"),
  })
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: AccountFormValues) => updateAccount(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "accounts"] })
      toast.success("Account updated")
    },
    onError: () => toast.error("Failed to update account"),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting", "accounts"] })
      toast.success("Account deleted")
    },
    onError: () => toast.error("Failed to delete account"),
  })
}
