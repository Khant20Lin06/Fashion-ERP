import { verifySession } from "@/features/auth/api/dal"
import { MainLayout } from "@/components/layout/MainLayout"

/**
 * Every route under this group is protected. `proxy.ts` already performed an
 * optimistic redirect for unauthenticated requests, but per Next.js's own
 * guidance we re-verify here too (Layouts don't re-run on client-side
 * navigation, so this check matters most on the initial server render of
 * this segment) — Proxy is a fast first line, this is the real gate.
 */
export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await verifySession()

  return <MainLayout>{children}</MainLayout>
}
