"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackupManagement } from "@/features/admin/components/BackupManagement"
import { SettingsForm } from "@/features/admin/components/SettingsForm"

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground">General, localization, and backup configuration.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General & Localization</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4">
          <SettingsForm />
        </TabsContent>
        <TabsContent value="backup" className="mt-4">
          <BackupManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
