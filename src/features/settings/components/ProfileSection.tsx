"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { UserAvatar } from "@/components/admin/UserAvatar"
import { useAuthStore } from "@/stores/auth.store"
import { useUpdateProfile } from "../hooks/useAccount"
import { profileFormSchema, type ProfileFormValues } from "../schemas/profile.schema"

/** Profile section — name, email, avatar, and read-only role/branch info. */
export function ProfileSection() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  })

  if (!user) return null

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values)
  }

  return (
    <SettingsSection title="Profile" description="Your personal account details.">
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name} photoUrl={user.avatarUrl} size="lg" />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {user.role.replace(/_/g, " ")}
          </Badge>
          {user.branchName && <Badge variant="outline">{user.branchName}</Badge>}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={updateProfile.isPending}>
              Save Profile
            </Button>
          </div>
        </form>
      </Form>
    </SettingsSection>
  )
}
