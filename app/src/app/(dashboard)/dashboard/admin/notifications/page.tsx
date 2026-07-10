"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationCenter } from "@/features/admin/components/NotificationCenter"
import { NotificationSettings } from "@/features/admin/components/NotificationSettings"

export default function AdminNotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Center</h1>
        <p className="text-sm text-muted-foreground">System alerts, approval requests, and reminders.</p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <NotificationCenter />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
