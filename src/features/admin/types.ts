// --- Users ---
// Real UserStatus (backend, exact enum): ACTIVE | INACTIVE | SUSPENDED |
// LOCKED. UserResponseDto has no phone/username/role/company/branch field
// at all — those are separate concerns (Employee record, UserRole
// assignment, UserCompany/UserBranch membership), joined in here for
// display, never invented.
export type AdminUserStatus = "active" | "inactive" | "suspended" | "locked"

export type AdminUser = {
  id: string
  name: string
  email: string
  status: AdminUserStatus
  isEmailVerified: boolean
  roleNames: string[]
  companyNames: string[]
  lastLoginAt: string | null
  createdAt: string
}

// --- Roles & Permissions ---
// Real RoleStatus (backend, exact enum): ACTIVE | INACTIVE. Roles are
// global (no companyId on the Role entity) and permission-gated only —
// no DataScope/company-context applies to role CRUD itself.
export type RoleStatus = "active" | "inactive"

export type Role = {
  id: string
  name: string
  code: string
  description: string
  status: RoleStatus
  isSystemRole: boolean
  permissionCodes: string[]
}

// A real, backend-seeded permission row (GET /permissions) — resource and
// action are free-form strings backed by actual rows, not a closed
// frontend-invented action set.
export type Permission = {
  id: string
  resource: string
  action: string
  code: string
  description: string | null
}

// --- Company & Branch ---
// Real CompanyStatus/BranchStatus (backend, exact enum): ACTIVE | INACTIVE
// for both. CompanyResponseDto/BranchResponseDto have no taxId,
// fiscalYearStart, logoUrl, parentId, type, managerId, or warehouseId field
// — none of those exist on the real entities.
export type CompanyStatus = "active" | "inactive"

export type Company = {
  id: string
  code: string
  name: string
  status: CompanyStatus
  baseCurrency: string
  timezone: string
  country: string
  phone: string
  email: string
  address: string
}

export type Branch = {
  id: string
  code: string
  name: string
  companyId: string
  companyName: string
  status: CompanyStatus
  phone: string
  email: string
  address: string
  timezone: string
}

// --- Workflow ---

export type WorkflowStatus = "draft" | "pending" | "approved" | "rejected" | "completed"

export type WorkflowNodeType = "trigger" | "condition" | "approval" | "action" | "notification"

export type WorkflowNode = {
  id: string
  type: WorkflowNodeType
  label: string
  x: number
  y: number
}

export type WorkflowEdge = {
  id: string
  source: string
  target: string
}

export type Workflow = {
  id: string
  name: string
  description: string
  module: string
  status: WorkflowStatus
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  updatedAt: string
}

// --- Notifications ---
// Real NotificationChannel (backend, exact enum): IN_APP only — email/SMS/
// push are explicitly documented as unimplemented. Real notifications are
// company-level, not per-user (Notification.userId is always null, by
// locked design) — every notification with `notifications.read` for a
// company is visible to everyone in it, there is no per-user targeting.
// `eventType` is a free-form string set by the originating event (e.g.
// "payment.confirmed"), not a closed frontend-invented type set. There is
// no bulk "mark all read" endpoint — only one-at-a-time.
export type AdminNotification = {
  id: string
  eventType: string
  title: string
  body: string
  read: boolean
  readAt: string | null
  createdAt: string
}

// --- Audit ---

export type AuditAction = "create" | "update" | "delete" | "approve" | "login" | "logout"

export type AdminAuditEntry = {
  id: string
  user: string
  action: AuditAction
  module: string
  record: string
  oldValue?: string
  newValue?: string
  ipAddress: string
  companyName: string
  timestamp: string
}

export type AuditFilters = {
  dateFrom?: string
  dateTo?: string
  user?: string
  module?: string
  action?: AuditAction
  companyId?: string
}

// --- Integrations ---

export type IntegrationCategory =
  | "payment_gateway"
  | "accounting_api"
  | "hr_system"
  | "barcode_scanner"
  | "ecommerce_platform"
  | "mobile_app_api"

export type IntegrationStatus = "connected" | "disconnected" | "error"

export type Integration = {
  id: string
  name: string
  category: IntegrationCategory
  description: string
  status: IntegrationStatus
  apiKey?: string
  endpoint?: string
  lastSyncAt?: string
}

// --- Security ---

export type SecurityEvent = {
  id: string
  type: "failed_login" | "account_locked" | "password_changed" | "suspicious_activity" | "ip_blocked"
  user: string
  description: string
  ipAddress: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

export type ActiveSession = {
  id: string
  userId: string
  userName: string
  device: string
  ipAddress: string
  location: string
  lastActiveAt: string
}

export type PasswordPolicy = {
  minLength: number
  requireUppercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
  expiryDays: number
}

export type SecuritySettings = {
  passwordPolicy: PasswordPolicy
  sessionTimeoutMinutes: number
  twoFactorEnabled: boolean
  maxLoginAttempts: number
  ipRestrictionEnabled: boolean
  allowedIpRanges: string[]
}

// --- System Settings ---

export type LocalizationSettings = {
  language: string
  timezone: string
  dateFormat: string
  numberFormat: string
  currency: string
}

export type GeneralSettings = {
  systemName: string
  supportEmail: string
  defaultCompanyId: string
}

export type BackupRecord = {
  id: string
  createdAt: string
  sizeMb: number
  status: "completed" | "failed" | "in_progress"
  triggeredBy: string
}

export type BackupSchedule = {
  frequency: "daily" | "weekly" | "monthly"
  time: string
  retentionDays: number
}

// --- Admin Dashboard ---

export type AdminKpis = {
  activeUsers: number
  onlineNow: number
  companies: number
  branches: number
  securityEventsToday: number
}

export type SystemActivityPoint = {
  id: string
  actor: string
  description: string
  module: string
  timestamp: string
}

export type ModuleStatus = {
  module: string
  status: "operational" | "degraded" | "down"
  uptimePercent: number
}

export type AdminFilters = {
  search?: string
  status?: string
  role?: string
  company?: string
}
