"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { useSecuritySettings, useUpdateSecuritySettings } from "../hooks/useSettings"
import { securitySettingsFormSchema, type SecuritySettingsFormValues } from "../schemas/settings.schema"

/** Login Security settings — Password Policy, Session Timeout, 2FA, Login Attempts, IP Restriction. */
export function SecuritySettingsForm() {
  const { data: settings, isLoading } = useSecuritySettings()

  if (isLoading || !settings) {
    return <Skeleton className="h-96 w-full" />
  }

  return <SecuritySettingsFormContent settings={settings} key={JSON.stringify(settings)} />
}

function SecuritySettingsFormContent({ settings }: { settings: SecuritySettingsFormValues }) {
  const updateSettings = useUpdateSecuritySettings()

  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsFormSchema),
    defaultValues: settings,
  })

  function onSubmit(values: SecuritySettingsFormValues) {
    updateSettings.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <SettingsSection title="Password Policy" description="Requirements enforced when users set a password.">
          <FormField
            control={form.control}
            name="passwordPolicy.minLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Length</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={4}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordPolicy.expiryDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password Expiry (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordPolicy.requireUppercase"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Require Uppercase Letter</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="passwordPolicy.requireNumber"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Require Number</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          <FormField
            control={form.control}
            name="passwordPolicy.requireSymbol"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Require Symbol</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </SettingsSection>

        <SettingsSection title="Login Security">
          <FormField
            control={form.control}
            name="sessionTimeoutMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Session Timeout (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxLoginAttempts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Login Attempts</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twoFactorEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Two-Factor Authentication (2FA)</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </SettingsSection>

        <SettingsSection title="Access Control">
          <FormField
            control={form.control}
            name="ipRestrictionEnabled"
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">IP Restriction</span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </SettingsSection>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateSettings.isPending}>
            Save Security Settings
          </Button>
        </div>
      </form>
    </Form>
  )
}
