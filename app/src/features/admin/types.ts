// --- Users ---

export type AdminUserStatus = "active" | "inactive" | "locked" | "pending"

export type AdminUser = {
  id: string
  name: string
  email: string
  phone: string
  username: string
  avatarUrl?: string
  roleId: string
  roleName: string
  companyId: string
  companyName: string
  branchId: string
  branchName: string
  status: AdminUserStatus
  lastLoginAt?: string
  createdAt: string
}

export type LoginHistoryEntry = {
  id: string
  userId: string
  timestamp: string
  ipAddress: string
  device: string
  location: string
  success: boolean
}

export type ActivityEntry = {
  id: string
  userId: string
  action: string
  module: string
  timestamp: string
}

// --- Roles & Permissions ---

export type RoleStatus = "active" | "inactive"

export type Role = {
  id: string
  name: string
  description: string
  permissionGroups: string[]
  userCount: number
  status: RoleStatus
  isSystem: boolean
}

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve" | "export"

export type PermissionMatrixRow = {
  module: string
  moduleLabel: string
  actions: Record<PermissionAction, boolean>
}

export type RolePermissions = {
  roleId: string
  matrix: PermissionMatrixRow[]
}

export type PermissionScope = "company" | "branch" | "warehouse"

export type UserPermissionOverride = {
  id: string
  userId: string
  module: string
  action: PermissionAction
  granted: boolean
  scope?: PermissionScope
  scopeValue?: string
}

// --- Company & Branch ---

export type CompanyStatus = "active" | "inactive"

export type Company = {
  id: string
  name: string
  logoUrl?: string
  taxId: string
  currency: string
  fiscalYearStart: string
  address: string
  status: CompanyStatus
  parentId?: string
}

export type BranchType = "head_office" | "retail_store" | "warehouse" | "outlet"

export type Branch = {
  id: string
  name: string
  code: string
  companyId: string
  companyName: string
  type: BranchType
  address: string
  managerId?: string
  managerName?: string
  warehouseId?: string
  warehouseName?: string
  status: CompanyStatus
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

export type NotificationType =
  | "system_alert"
  | "approval_request"
  | "stock_alert"
  | "payment_reminder"
  | "leave_request"
  | "security_alert"

export type NotificationChannel = "in_app" | "email" | "sms" | "push"

export type AdminNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  channel: NotificationChannel
  read: boolean
  createdAt: string
}

export type NotificationChannelSettings = {
  channel: NotificationChannel
  enabled: boolean
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
