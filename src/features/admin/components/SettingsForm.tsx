"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useCompanies } from "../hooks/useRoles"
import {
  useGeneralSettings,
  useLocalizationSettings,
  useUpdateGeneralSettings,
  useUpdateLocalizationSettings,
} from "../hooks/useSettings"
import { generalSettingsFormSchema, localizationSettingsFormSchema, type GeneralSettingsFormValues, type LocalizationSettingsFormValues } from "../schemas/settings.schema"

const languageOptions = [
  { value: "en", label: "English" },
  { value: "my", label: "Myanmar (Burmese)" },
  { value: "th", label: "Thai" },
  { value: "zh", label: "Chinese" },
]

const timezoneOptions = ["Asia/Yangon", "Asia/Bangkok", "Asia/Singapore", "UTC"]
const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]
const numberFormatOptions = ["1,234.56", "1.234,56", "1 234.56"]

/** General & Localization settings — System Settings' General/Company/Localization categories. */
export function SettingsForm() {
  const { data: general, isLoading: loadingGeneral } = useGeneralSettings()
  const { data: localization, isLoading: loadingLocalization } = useLocalizationSettings()

  if (loadingGeneral || loadingLocalization || !general || !localization) {
    return <Skeleton className="h-96 w-full" />
  }

  return <SettingsFormContent general={general} localization={localization} key={`${general.systemName}-${localization.language}`} />
}

function SettingsFormContent({
  general,
  localization,
}: {
  general: GeneralSettingsFormValues
  localization: LocalizationSettingsFormValues
}) {
  const { data: companies } = useCompanies()
  const updateGeneral = useUpdateGeneralSettings()
  const updateLocalization = useUpdateLocalizationSettings()

  const generalForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsFormSchema),
    defaultValues: general,
  })

  const localizationForm = useForm<LocalizationSettingsFormValues>({
    resolver: zodResolver(localizationSettingsFormSchema),
    defaultValues: localization,
  })

  return (
    <div className="flex flex-col gap-6">
      <Form {...generalForm}>
        <form onSubmit={generalForm.handleSubmit((values) => updateGeneral.mutate(values))} className="flex flex-col gap-4" noValidate>
          <SettingsSection title="General" description="Core system identity and support details.">
            <FormField
              control={generalForm.control}
              name="systemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={generalForm.control}
              name="supportEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Support Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={generalForm.control}
              name="defaultCompanyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Company</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(companies ?? []).map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsSection>
          <div className="flex justify-end">
            <Button type="submit" disabled={updateGeneral.isPending}>
              Save General Settings
            </Button>
          </div>
        </form>
      </Form>

      <Form {...localizationForm}>
        <form onSubmit={localizationForm.handleSubmit((values) => updateLocalization.mutate(values))} className="flex flex-col gap-4" noValidate>
          <SettingsSection title="Localization" description="Language, timezone, and regional formatting.">
            <FormField
              control={localizationForm.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={localizationForm.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezoneOptions.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={localizationForm.control}
              name="dateFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Format</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dateFormatOptions.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={localizationForm.control}
              name="numberFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number Format</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {numberFormatOptions.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={localizationForm.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MMK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsSection>
          <div className="flex justify-end">
            <Button type="submit" disabled={updateLocalization.isPending}>
              Save Localization Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
