import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { toastApiError } from "@/lib/api/errors"
import { createAccount, fetchAccounts, updateAccount, type AccountFormValues } from "../api/account.api"

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
    onError: (error) => toastApiError(error, "Failed to create account"),
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
    onError: (error) => toastApiError(error, "Failed to update account"),
  })
}

// No useDeleteAccount hook: the real backend exposes no DELETE
// /accounts/{id} route (GET/POST/PATCH only — see AccountsController) —
// deleting a GL account isn't a supported server-side operation.
