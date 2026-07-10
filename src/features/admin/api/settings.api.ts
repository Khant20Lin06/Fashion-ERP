import { apiClient } from "@/lib/api/client"
import type { BackupRecord, BackupSchedule, GeneralSettings, LocalizationSettings, SecuritySettings } from "../types"
import type { GeneralSettingsFormValues, LocalizationSettingsFormValues, SecuritySettingsFormValues } from "../schemas/settings.schema"
import { mockBackupRecords, mockGeneralSettings, mockLocalizationSettings, mockSecuritySettings } from "./mock-data"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true"

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// --- General & Localization ---

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  if (USE_MOCK) return delay(mockGeneralSettings)
  const { data } = await apiClient.get<GeneralSettings>("/admin/settings/general")
  return data
}

export async function updateGeneralSettings(values: GeneralSettingsFormValues): Promise<GeneralSettings> {
  if (USE_MOCK) return delay(values)
  const { data } = await apiClient.put<GeneralSettings>("/admin/settings/general", values)
  return data
}

export async function fetchLocalizationSettings(): Promise<LocalizationSettings> {
  if (USE_MOCK) return delay(mockLocalizationSettings)
  const { data } = await apiClient.get<LocalizationSettings>("/admin/settings/localization")
  return data
}

export async function updateLocalizationSettings(values: LocalizationSettingsFormValues): Promise<LocalizationSettings> {
  if (USE_MOCK) return delay(values)
  const { data } = await apiClient.put<LocalizationSettings>("/admin/settings/localization", values)
  return data
}

// --- Security Settings ---

export async function fetchSecuritySettings(): Promise<SecuritySettings> {
  if (USE_MOCK) return delay(mockSecuritySettings)
  const { data } = await apiClient.get<SecuritySettings>("/admin/security/settings")
  return data
}

export async function updateSecuritySettings(values: SecuritySettingsFormValues): Promise<SecuritySettings> {
  if (USE_MOCK) return delay({ ...mockSecuritySettings, ...values })
  const { data } = await apiClient.put<SecuritySettings>("/admin/security/settings", values)
  return data
}

// --- Backup ---

export async function fetchBackupRecords(): Promise<BackupRecord[]> {
  if (USE_MOCK) return delay(mockBackupRecords)
  const { data } = await apiClient.get<BackupRecord[]>("/admin/settings/backups")
  return data
}

export async function createBackup(): Promise<BackupRecord> {
  if (USE_MOCK) {
    return delay({
      id: `bkp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sizeMb: 480,
      status: "completed",
      triggeredBy: "Manual",
    })
  }
  const { data } = await apiClient.post<BackupRecord>("/admin/settings/backups")
  return data
}

export async function restoreBackup(id: string): Promise<void> {
  if (USE_MOCK) return delay(undefined)
  await apiClient.post(`/admin/settings/backups/${id}/restore`)
}

export async function updateBackupSchedule(schedule: BackupSchedule): Promise<BackupSchedule> {
  if (USE_MOCK) return delay(schedule)
  const { data } = await apiClient.put<BackupSchedule>("/admin/settings/backups/schedule", schedule)
  return data
}
