import { Sidebar } from "./Sidebar"
import { MobileSidebar } from "./MobileSidebar"
import { Header } from "./Header"
import { GlobalSearch } from "@/features/search/components/GlobalSearch"

/**
 * Global enterprise shell:
 *
 * ┌──────────────────────────────────────────┐
 * │ Header                                    │
 * ├───────────┬────────────────────────────────┤
 * │ Sidebar   │        Main Content            │
 * │           │                                │
 * └───────────┴────────────────────────────────┘
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full">
      <Sidebar />
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
      <GlobalSearch />
    </div>
  )
}
