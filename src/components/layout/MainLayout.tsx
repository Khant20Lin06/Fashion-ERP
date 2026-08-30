import { Sidebar } from "./Sidebar"
import { MobileSidebar } from "./MobileSidebar"
import { Header } from "./Header"
import { GlobalSearch } from "@/features/search/components/GlobalSearch"
import { AiAssistantPanel } from "@/features/ai-assistant/components/AiAssistantPanel"
import { RouteGate } from "@/components/feature-gate/RouteGate"
import { buildNativeScrollbarClassName } from "@/components/ui/native-scrollbar.classes"

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
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <Sidebar />
      <MobileSidebar />
      <div className="flex min-w-0 flex-1 flex-col h-svh overflow-hidden">
        <Header />
        <main className={buildNativeScrollbarClassName("flex-1 overflow-x-hidden bg-background p-4 sm:p-6")}>
          <RouteGate>{children}</RouteGate>
        </main>
      </div>
      <GlobalSearch />
      <AiAssistantPanel />
    </div>
  )
}
