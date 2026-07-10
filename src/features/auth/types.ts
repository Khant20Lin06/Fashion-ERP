import type { AuthUser } from "@/types/user"

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  user: AuthUser
  token: string
}

export type { AuthUser }
