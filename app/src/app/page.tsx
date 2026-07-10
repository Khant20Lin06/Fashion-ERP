import { redirect } from "next/navigation"
import { getOptionalSession } from "@/features/auth/api/dal"

export default async function RootPage() {
  const session = await getOptionalSession()
  redirect(session ? "/dashboard" : "/login")
}
