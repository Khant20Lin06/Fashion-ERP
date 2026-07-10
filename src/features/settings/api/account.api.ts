import { apiClient } from "@/lib/api/client"
import type { ProfileFormValues } from "../schemas/profile.schema"
import type { ChangePasswordFormValues } from "../schemas/password.schema"
import type { AuthUser } from "@/types/user"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function updateProfile(values: ProfileFormValues, currentUser: AuthUser): Promise<AuthUser> {
  if (USE_MOCK) return delay({ ...currentUser, ...values })
  const { data } = await apiClient.put<AuthUser>("/account/profile", values)
  return data
}

export async function changePassword(values: ChangePasswordFormValues): Promise<void> {
  if (USE_MOCK) {
    if (values.currentPassword.length < 4) throw new Error("Current password is incorrect")
    return delay(undefined)
  }
  await apiClient.put("/account/password", values)
}
