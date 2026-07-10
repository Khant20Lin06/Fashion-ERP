"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveSessionSection } from "@/features/settings/components/ActiveSessionSection"
import { AppearanceSection } from "@/features/settings/components/AppearanceSection"
import { ChangePasswordSection } from "@/features/settings/components/ChangePasswordSection"
import { LanguageRegionSection } from "@/features/settings/components/LanguageRegionSection"
import { NotificationPreferencesSection } from "@/features/settings/components/NotificationPreferencesSection"
import { ProfileSection } from "@/features/settings/components/ProfileSection"

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal account preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="language">Language & Region</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileSection />
        </TabsContent>
        <TabsContent value="security" className="mt-4 flex flex-col gap-6">
          <ChangePasswordSection />
          <ActiveSessionSection />
        </TabsContent>
        <TabsContent value="appearance" className="mt-4">
          <AppearanceSection />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <NotificationPreferencesSection />
        </TabsContent>
        <TabsContent value="language" className="mt-4">
          <LanguageRegionSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
