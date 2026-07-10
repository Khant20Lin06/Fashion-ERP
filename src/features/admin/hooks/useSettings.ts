import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createBackup,
  fetchBackupRecords,
  fetchGeneralSettings,
  fetchLocalizationSettings,
  fetchSecuritySettings,
  restoreBackup,
  updateBackupSchedule,
  updateGeneralSettings,
  updateLocalizationSettings,
  updateSecuritySettings,
} from "../api/settings.api"
import {
  fetchActiveSessions,
  fetchAdminKpis,
  fetchAuditEntries,
  fetchModuleStatuses,
  fetchNotifications,
  fetchSecurityEvents,
  fetchSystemActivity,
  markAllNotificationsRead,
  markNotificationRead,
  revokeSession,
} from "../api/audit.api"
import {
  disconnectIntegration,
  fetchIntegrations,
  syncIntegration,
  updateIntegration,
} from "../api/integration.api"
import type { GeneralSettingsFormValues, LocalizationSettingsFormValues, SecuritySettingsFormValues } from "../schemas/settings.schema"
import type { AuditFilters, BackupSchedule } from "../types"

// --- Admin Dashboard ---

export function useAdminKpis() {
  return useQuery({ queryKey: ["admin", "dashboard", "kpis"], queryFn: fetchAdminKpis })
}

export function useSystemActivity() {
  return useQuery({ queryKey: ["admin", "dashboard", "activity"], queryFn: fetchSystemActivity })
}

export function useModuleStatuses() {
  return useQuery({ queryKey: ["admin", "dashboard", "module-status"], queryFn: fetchModuleStatuses })
}

// --- General & Localization Settings ---

export function useGeneralSettings() {
  return useQuery({ queryKey: ["admin", "settings", "general"], queryFn: fetchGeneralSettings })
}

export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: GeneralSettingsFormValues) => updateGeneralSettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "general"] })
      toast.success("General settings saved")
    },
    onError: () => toast.error("Failed to save general settings"),
  })
}

export function useLocalizationSettings() {
  return useQuery({ queryKey: ["admin", "settings", "localization"], queryFn: fetchLocalizationSettings })
}

export function useUpdateLocalizationSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: LocalizationSettingsFormValues) => updateLocalizationSettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "localization"] })
      toast.success("Localization settings saved")
    },
    onError: () => toast.error("Failed to save localization settings"),
  })
}

// --- Backup ---

export function useBackupRecords() {
  return useQuery({ queryKey: ["admin", "settings", "backups"], queryFn: fetchBackupRecords })
}

export function useCreateBackup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => createBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", "backups"] })
      toast.success("Backup created")
    },
    onError: () => toast.error("Failed to create backup"),
  })
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (id: string) => restoreBackup(id),
    onSuccess: () => toast.success("Backup restored"),
    onError: () => toast.error("Failed to restore backup"),
  })
}

export function useUpdateBackupSchedule() {
  return useMutation({
    mutationFn: (schedule: BackupSchedule) => updateBackupSchedule(schedule),
    onSuccess: () => toast.success("Backup schedule updated"),
    onError: () => toast.error("Failed to update backup schedule"),
  })
}

// --- Security Settings ---

export function useSecuritySettings() {
  return useQuery({ queryKey: ["admin", "security", "settings"], queryFn: fetchSecuritySettings })
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: SecuritySettingsFormValues) => updateSecuritySettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "security", "settings"] })
      toast.success("Security settings saved")
    },
    onError: () => toast.error("Failed to save security settings"),
  })
}

export function useSecurityEvents() {
  return useQuery({ queryKey: ["admin", "security", "events"], queryFn: fetchSecurityEvents })
}

export function useActiveSessions() {
  return useQuery({ queryKey: ["admin", "security", "sessions"], queryFn: fetchActiveSessions })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "security", "sessions"] })
      toast.success("Session revoked")
    },
    onError: () => toast.error("Failed to revoke session"),
  })
}

// --- Audit ---

export function useAuditEntries(filters?: AuditFilters) {
  return useQuery({
    queryKey: ["admin", "audit", filters],
    queryFn: () => fetchAuditEntries(filters),
  })
}

// --- Notifications ---

export function useNotifications() {
  return useQuery({ queryKey: ["admin", "notifications"], queryFn: fetchNotifications })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] })
      toast.success("All notifications marked as read")
    },
  })
}

// --- Integrations ---

export function useIntegrations() {
  return useQuery({ queryKey: ["admin", "integrations"], queryFn: fetchIntegrations })
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: { apiKey?: string; endpoint?: string } }) =>
      updateIntegration(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] })
      toast.success("Integration configured")
    },
    onError: () => toast.error("Failed to configure integration"),
  })
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => disconnectIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] })
      toast.success("Integration disconnected")
    },
  })
}

export function useSyncIntegration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => syncIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] })
      toast.success("Integration synced")
    },
    onError: () => toast.error("Failed to sync integration"),
  })
}
