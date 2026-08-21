import { apiClient } from "@/lib/api/client"
import { env } from "@/config/env"
import type { ProfileFormValues } from "../schemas/profile.schema"
import type { ChangePasswordFormValues } from "../schemas/password.schema"
import type { AuthUser } from "@/types/user"

const USE_MOCK = env.NEXT_PUBLIC_USE_MOCK_AUTH

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// There is no /account/profile or /account/password endpoint on the
// backend — those paths always 404'd. Generic settings (/settings/*) are
// company/branch/system/user key-value preferences, NOT profile fields.
// The real endpoints are:
//   - PATCH /users/:id  (firstName/lastName/displayName — no email; email
//     changes are deliberately not exposed here, see backend UpdateUserDto)
//   - POST /auth/change-password (currentPassword/newPassword)

type BackendUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  status: string
  isEmailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export async function updateProfile(values: ProfileFormValues, currentUser: AuthUser): Promise<AuthUser> {
  if (USE_MOCK) return delay({ ...currentUser, ...values })

  const [firstName, ...rest] = values.name.trim().split(" ")
  const lastName = rest.join(" ") || "-"

  const { data } = await apiClient.patch<BackendUser>(`/users/${currentUser.id}`, {
    firstName: firstName || values.name,
    lastName,
    displayName: values.name,
  })

  // email is not returned by this endpoint's editable fields — the backend
  // has no email-change route, so we keep the caller's existing email
  // rather than silently dropping it from the returned AuthUser.
  return {
    ...currentUser,
    name: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
    email: currentUser.email,
  }
}

export async function changePassword(values: ChangePasswordFormValues): Promise<void> {
  if (USE_MOCK) {
    if (values.currentPassword.length < 4) throw new Error("Current password is incorrect")
    return delay(undefined)
  }
  await apiClient.post("/auth/change-password", {
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  })
}
