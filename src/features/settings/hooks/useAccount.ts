import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth.store"
import { changePassword, updateProfile } from "../api/account.api"
import type { ProfileFormValues } from "../schemas/profile.schema"
import type { ChangePasswordFormValues } from "../schemas/password.schema"

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (values: ProfileFormValues) => updateProfile(values, user!),
    onSuccess: (updated) => {
      setUser(updated)
      toast.success("Profile updated")
    },
    onError: () => toast.error("Failed to update profile"),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) => changePassword(values),
    onSuccess: () => toast.success("Password changed"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to change password"),
  })
}
