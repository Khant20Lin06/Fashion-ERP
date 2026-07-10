import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createUser,
  deleteUser,
  fetchLoginHistory,
  fetchUser,
  fetchUserActivity,
  fetchUsers,
  updateUser,
} from "../api/users.api"
import type { UserFormValues } from "../schemas/user.schema"

export function useUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: fetchUsers })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => fetchUser(id as string),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UserFormValues) => createUser(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User created")
    },
    onError: () => toast.error("Failed to create user"),
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: UserFormValues) => updateUser(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User updated")
    },
    onError: () => toast.error("Failed to update user"),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast.success("User deleted")
    },
    onError: () => toast.error("Failed to delete user"),
  })
}

export function useLoginHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId, "login-history"],
    queryFn: () => fetchLoginHistory(userId as string),
    enabled: !!userId,
  })
}

export function useUserActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId, "activity"],
    queryFn: () => fetchUserActivity(userId as string),
    enabled: !!userId,
  })
}
