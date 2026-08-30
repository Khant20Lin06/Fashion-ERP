import type { AuthUser } from "@/types/user"
import type { Employee } from "../types"

function normalize(value: string | undefined | null): string {
  return value?.trim().replace(/\s+/g, " ").toLowerCase() ?? ""
}

export function resolveEmployeeForUser(
  user: AuthUser | null | undefined,
  employees: Employee[] | undefined,
): Employee | undefined {
  if (!user || !employees?.length) return undefined

  const byUserId = employees.find((employee) => employee.userId === user.id)
  if (byUserId) return byUserId

  const email = normalize(user.email)
  if (email) {
    const emailMatches = employees.filter((employee) => normalize(employee.email) === email)
    if (emailMatches.length === 1) return emailMatches[0]
  }

  const name = normalize(user.name)
  if (name) {
    const nameMatches = employees.filter((employee) => normalize(employee.name) === name)
    if (nameMatches.length === 1) return nameMatches[0]
  }

  return undefined
}

export function isOwnLeaveRequest(
  actor: AuthUser | null | undefined,
  leaveEmployeeId: string,
  employees: Employee[] | undefined,
): boolean {
  if (!actor) return false

  const leaveEmployee = employees?.find((employee) => employee.id === leaveEmployeeId)
  if (leaveEmployee?.userId === actor.id) {
    return true
  }

  return resolveEmployeeForUser(actor, employees)?.id === leaveEmployeeId
}

export function canPreviewEssAsEmployee(user: AuthUser | null | undefined): boolean {
  if (!user) return false

  return [
    "hr_manager",
    "system_administrator",
    "super_admin",
    "business_owner",
    "developer",
  ].includes(user.role)
}
