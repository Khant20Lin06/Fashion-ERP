"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveSessionsList } from "@/features/admin/components/ActiveSessionsList"
import { SecurityDashboard } from "@/features/admin/components/SecurityDashboard"
import { SecurityEventFeed } from "@/features/admin/components/SecurityEventFeed"
import { SecuritySettingsForm } from "@/features/admin/components/SecuritySettingsForm"

export default function AdminSecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security Management</h1>
        <p className="text-sm text-muted-foreground">Login security, access control, and system-wide security events.</p>
      </div>

      <SecurityDashboard />

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="settings">Login Security</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="mt-4">
          <SecurityEventFeed />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <ActiveSessionsList />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SecuritySettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
