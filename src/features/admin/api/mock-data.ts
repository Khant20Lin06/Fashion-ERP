import type {
  ActiveSession,
  AdminAuditEntry,
  AdminKpis,
  AdminNotification,
  AdminUser,
  Branch,
  BackupRecord,
  Company,
  GeneralSettings,
  Integration,
  LocalizationSettings,
  ModuleStatus,
  Permission,
  Role,
  SecurityEvent,
  SecuritySettings,
  SystemActivityPoint,
  Workflow,
} from "../types"

const now = Date.now()
const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString()
const hoursAgo = (n: number) => new Date(now - n * 3600000).toISOString()
const minutesAgo = (n: number) => new Date(now - n * 60000).toISOString()

// --- Companies ---

export const mockCompanies: Company[] = [
  {
    id: "co-1",
    code: "MMFASHION",
    name: "Myanmar Fashion Co.",
    status: "active",
    baseCurrency: "MMK",
    timezone: "Asia/Yangon",
    country: "Myanmar",
    phone: "",
    email: "",
    address: "No. 45, Pyay Road, Yangon, Myanmar",
  },
  {
    id: "co-2",
    code: "THFASHION",
    name: "Thailand Fashion Co.",
    status: "active",
    baseCurrency: "THB",
    timezone: "Asia/Bangkok",
    country: "Thailand",
    phone: "",
    email: "",
    address: "88 Sukhumvit Rd, Bangkok, Thailand",
  },
  {
    id: "co-3",
    code: "SGFASHION",
    name: "Singapore Fashion Co.",
    status: "active",
    baseCurrency: "SGD",
    timezone: "Asia/Singapore",
    country: "Singapore",
    phone: "",
    email: "",
    address: "1 Orchard Road, Singapore",
  },
]

// --- Branches ---

export const mockBranches: Branch[] = [
  {
    id: "br-1",
    code: "HO-YGN",
    name: "Head Office",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    status: "active",
    phone: "",
    email: "",
    address: "No. 45, Pyay Road, Yangon",
    timezone: "Asia/Yangon",
  },
  {
    id: "br-2",
    code: "RT-JS01",
    name: "Junction Square Store",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    status: "active",
    phone: "",
    email: "",
    address: "Junction Square, Kamayut, Yangon",
    timezone: "Asia/Yangon",
  },
  {
    id: "br-3",
    code: "WH-YGN01",
    name: "Yangon Central Warehouse",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    status: "active",
    phone: "",
    email: "",
    address: "Industrial Zone 3, Hlaing Tharyar, Yangon",
    timezone: "Asia/Yangon",
  },
  {
    id: "br-4",
    code: "OT-MYG01",
    name: "Myaing Outlet",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    status: "active",
    phone: "",
    email: "",
    address: "Bogyoke Market Annex, Yangon",
    timezone: "Asia/Yangon",
  },
  {
    id: "br-5",
    code: "RT-BKK01",
    name: "Siam Paragon Store",
    companyId: "co-2",
    companyName: "Thailand Fashion Co.",
    status: "active",
    phone: "",
    email: "",
    address: "Siam Paragon, Bangkok",
    timezone: "Asia/Bangkok",
  },
  {
    id: "br-6",
    code: "RT-SGP01",
    name: "Orchard Central Store",
    companyId: "co-3",
    companyName: "Singapore Fashion Co.",
    status: "active",
    phone: "",
    email: "",
    address: "Orchard Central, Singapore",
    timezone: "Asia/Singapore",
  },
]

// --- Roles ---

export const mockRoles: Role[] = [
  { id: "role-1", name: "Super Admin", code: "SUPER_ADMIN", description: "Full system access across all companies and branches.", status: "active", isSystemRole: true, permissionCodes: [] },
  { id: "role-2", name: "Company Admin", code: "COMPANY_ADMIN", description: "Administrative access scoped to a single company.", status: "active", isSystemRole: true, permissionCodes: [] },
  { id: "role-3", name: "Store Manager", code: "STORE_MANAGER", description: "Manages daily store operations, staff, and sales.", status: "active", isSystemRole: false, permissionCodes: [] },
  { id: "role-4", name: "Cashier", code: "CASHIER", description: "Processes sales transactions at the point of sale.", status: "active", isSystemRole: false, permissionCodes: [] },
  { id: "role-5", name: "Inventory Manager", code: "INVENTORY_MANAGER", description: "Manages stock levels, transfers, and warehouse operations.", status: "active", isSystemRole: false, permissionCodes: [] },
  { id: "role-6", name: "Accountant", code: "ACCOUNTANT", description: "Manages ledgers, payments, and financial reporting.", status: "active", isSystemRole: false, permissionCodes: [] },
  { id: "role-7", name: "HR Manager", code: "HR_MANAGER", description: "Manages employees, attendance, and payroll.", status: "active", isSystemRole: false, permissionCodes: [] },
  { id: "role-8", name: "Employee", code: "EMPLOYEE", description: "Basic self-service access only.", status: "active", isSystemRole: true, permissionCodes: [] },
]

export const mockPermissions: Permission[] = [
  { id: "perm-1", resource: "products", action: "read", code: "products.read", description: null },
  { id: "perm-2", resource: "products", action: "create", code: "products.create", description: null },
  { id: "perm-3", resource: "sales", action: "read", code: "sales.read", description: null },
  { id: "perm-4", resource: "sales", action: "create", code: "sales.create", description: null },
  { id: "perm-5", resource: "inventory", action: "read", code: "inventory.read", description: null },
  { id: "perm-6", resource: "purchase_orders", action: "read", code: "purchase_orders.read", description: null },
  { id: "perm-7", resource: "accounts", action: "read", code: "accounts.read", description: null },
  { id: "perm-8", resource: "employees", action: "read", code: "employees.read", description: null },
  { id: "perm-9", resource: "users", action: "read", code: "users.read", description: null },
  { id: "perm-10", resource: "roles", action: "read", code: "roles.read", description: null },
]

// --- Users ---

export const mockUsers: AdminUser[] = [
  { id: "usr-1", name: "Aung Min Thu", email: "aung.minthu@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["Super Admin"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: minutesAgo(12), createdAt: daysAgo(720) },
  { id: "usr-2", name: "Nilar Win", email: "nilar.win@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["Company Admin"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: hoursAgo(3), createdAt: daysAgo(600) },
  { id: "usr-3", name: "Su Myat Noe", email: "su.myatnoe@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["Store Manager"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: hoursAgo(1), createdAt: daysAgo(500) },
  { id: "usr-4", name: "Ye Htut", email: "ye.htut@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["Cashier"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: minutesAgo(45), createdAt: daysAgo(300) },
  { id: "usr-5", name: "Thida Aye", email: "thida.aye@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["Inventory Manager"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: daysAgo(1), createdAt: daysAgo(400) },
  { id: "usr-6", name: "Kyaw Zin Latt", email: "kyaw.zinlatt@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["Accountant"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: hoursAgo(6), createdAt: daysAgo(450) },
  { id: "usr-7", name: "Ei Ei Phyo", email: "eiei.phyo@myanmarfashion.com", status: "active", isEmailVerified: true, roleNames: ["HR Manager"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: daysAgo(2), createdAt: daysAgo(380) },
  { id: "usr-8", name: "Zaw Naing", email: "zaw.naing@myanmarfashion.com", status: "inactive", isEmailVerified: true, roleNames: ["Employee"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: daysAgo(30), createdAt: daysAgo(200) },
  { id: "usr-9", name: "Somchai Prasert", email: "somchai.prasert@thailandfashion.com", status: "active", isEmailVerified: true, roleNames: ["Store Manager"], companyNames: ["Thailand Fashion Co."], lastLoginAt: hoursAgo(2), createdAt: daysAgo(250) },
  { id: "usr-10", name: "Wei Ling Tan", email: "weiling.tan@singaporefashion.com", status: "locked", isEmailVerified: true, roleNames: ["Store Manager"], companyNames: ["Singapore Fashion Co."], lastLoginAt: daysAgo(10), createdAt: daysAgo(220) },
  { id: "usr-11", name: "Hla Hla Win", email: "hlahla.win@myanmarfashion.com", status: "inactive", isEmailVerified: false, roleNames: ["Cashier"], companyNames: ["Myanmar Fashion Co."], lastLoginAt: null, createdAt: daysAgo(5) },
]

// --- Workflows ---

export const mockWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Purchase Order Approval",
    description: "Two-step approval for purchase orders above threshold.",
    module: "purchase",
    status: "completed",
    updatedAt: daysAgo(3),
    nodes: [
      { id: "n-1", type: "trigger", label: "Create PO", x: 40, y: 120 },
      { id: "n-2", type: "approval", label: "Manager Approval", x: 280, y: 120 },
      { id: "n-3", type: "approval", label: "Finance Approval", x: 520, y: 120 },
      { id: "n-4", type: "action", label: "Purchase Completed", x: 760, y: 120 },
    ],
    edges: [
      { id: "e-1", source: "n-1", target: "n-2" },
      { id: "e-2", source: "n-2", target: "n-3" },
      { id: "e-3", source: "n-3", target: "n-4" },
    ],
  },
  {
    id: "wf-2",
    name: "Leave Request Workflow",
    description: "Employee leave request routed through manager and HR approval.",
    module: "hr",
    status: "approved",
    updatedAt: daysAgo(7),
    nodes: [
      { id: "n-1", type: "trigger", label: "Employee Request", x: 40, y: 120 },
      { id: "n-2", type: "approval", label: "Manager Approval", x: 280, y: 120 },
      { id: "n-3", type: "approval", label: "HR Approval", x: 520, y: 120 },
      { id: "n-4", type: "notification", label: "Notify Employee", x: 760, y: 120 },
    ],
    edges: [
      { id: "e-1", source: "n-1", target: "n-2" },
      { id: "e-2", source: "n-2", target: "n-3" },
      { id: "e-3", source: "n-3", target: "n-4" },
    ],
  },
  {
    id: "wf-3",
    name: "Expense Reimbursement",
    description: "Draft workflow being configured for expense claims.",
    module: "accounting",
    status: "draft",
    updatedAt: daysAgo(1),
    nodes: [
      { id: "n-1", type: "trigger", label: "Submit Expense", x: 40, y: 120 },
      { id: "n-2", type: "condition", label: "Amount > $500?", x: 280, y: 120 },
      { id: "n-3", type: "approval", label: "Finance Approval", x: 520, y: 120 },
    ],
    edges: [
      { id: "e-1", source: "n-1", target: "n-2" },
      { id: "e-2", source: "n-2", target: "n-3" },
    ],
  },
]

// --- Notifications ---

export const mockNotifications: AdminNotification[] = [
  { id: "notif-1", eventType: "payment.confirmed", title: "Payment confirmed", body: "A payment of $2,000 was confirmed for PO-2051.", read: false, readAt: null, createdAt: hoursAgo(1) },
  { id: "notif-2", eventType: "payment.confirmed", title: "Payment confirmed", body: "A payment of $480 was confirmed for PMT-2026-0071.", read: false, readAt: null, createdAt: hoursAgo(3) },
  { id: "notif-3", eventType: "payment.confirmed", title: "Payment confirmed", body: "A payment of $1,150 was confirmed for SINV-2026-1195.", read: true, readAt: daysAgo(1), createdAt: daysAgo(1) },
]

// --- Audit ---

export const mockAdminAuditEntries: AdminAuditEntry[] = [
  { id: "aud-1", user: "Aung Min Thu", action: "update", module: "Product", record: "Classic White Shirt", oldValue: "$50", newValue: "$60", ipAddress: "103.5.20.11", companyName: "Myanmar Fashion Co.", timestamp: hoursAgo(2) },
  { id: "aud-2", user: "Nilar Win", action: "create", module: "User Management", record: "usr-11 (Hla Hla Win)", ipAddress: "103.5.20.12", companyName: "Myanmar Fashion Co.", timestamp: daysAgo(5) },
  { id: "aud-3", user: "Su Myat Noe", action: "approve", module: "Purchase", record: "PO-2049", ipAddress: "103.5.20.40", companyName: "Myanmar Fashion Co.", timestamp: daysAgo(2) },
  { id: "aud-4", user: "Kyaw Zin Latt", action: "update", module: "Accounting", record: "Journal Entry JE-0088", oldValue: "Draft", newValue: "Posted", ipAddress: "103.5.20.55", companyName: "Myanmar Fashion Co.", timestamp: daysAgo(1) },
  { id: "aud-5", user: "System", action: "login", module: "Authentication", record: "usr-10 (Wei Ling Tan)", ipAddress: "175.41.22.9", companyName: "Singapore Fashion Co.", timestamp: daysAgo(10) },
  { id: "aud-6", user: "Ei Ei Phyo", action: "delete", module: "HR", record: "Announcement: Old Notice", ipAddress: "103.5.20.61", companyName: "Myanmar Fashion Co.", timestamp: daysAgo(6) },
]

// --- Integrations ---

export const mockIntegrations: Integration[] = [
  { id: "int-1", name: "Stripe Payment Gateway", category: "payment_gateway", description: "Process card payments for online and in-store sales.", status: "connected", apiKey: "pk_live_••••••••4821", endpoint: "https://api.stripe.com/v1", lastSyncAt: minutesAgo(30) },
  { id: "int-2", name: "QuickBooks Accounting", category: "accounting_api", description: "Sync ledger entries and invoices with QuickBooks.", status: "connected", endpoint: "https://api.quickbooks.com/v3", lastSyncAt: hoursAgo(4) },
  { id: "int-3", name: "BambooHR", category: "hr_system", description: "Sync employee records with BambooHR.", status: "disconnected" },
  { id: "int-4", name: "Zebra Barcode Scanner", category: "barcode_scanner", description: "Hardware integration for warehouse barcode scanning.", status: "connected", lastSyncAt: hoursAgo(1) },
  { id: "int-5", name: "Shopify Storefront", category: "ecommerce_platform", description: "Sync product catalog and orders with Shopify.", status: "error", endpoint: "https://api.shopify.com/admin", lastSyncAt: daysAgo(2) },
  { id: "int-6", name: "Mobile App API", category: "mobile_app_api", description: "REST API powering the customer-facing mobile app.", status: "connected", endpoint: "https://api.fashionerp.com/mobile/v1", lastSyncAt: minutesAgo(10) },
]

// --- Security ---

export const mockSecurityEvents: SecurityEvent[] = [
  { id: "sec-1", type: "failed_login", user: "weilingtan", description: "5 consecutive failed login attempts.", ipAddress: "175.41.22.9", timestamp: hoursAgo(1), severity: "high" },
  { id: "sec-2", type: "account_locked", user: "weilingtan", description: "Account locked after repeated failed logins.", ipAddress: "175.41.22.9", timestamp: hoursAgo(1), severity: "high" },
  { id: "sec-3", type: "password_changed", user: "kyawzinlatt", description: "Password changed successfully.", ipAddress: "103.5.20.55", timestamp: daysAgo(3), severity: "low" },
  { id: "sec-4", type: "suspicious_activity", user: "zawnaing", description: "Login attempt from unrecognized device.", ipAddress: "203.144.12.5", timestamp: daysAgo(1), severity: "medium" },
  { id: "sec-5", type: "ip_blocked", user: "unknown", description: "Blocked repeated login attempts from unknown IP.", ipAddress: "91.203.5.12", timestamp: daysAgo(4), severity: "high" },
]

export const mockActiveSessions: ActiveSession[] = [
  { id: "sess-1", userId: "usr-1", userName: "Aung Min Thu", device: "Chrome on Windows", ipAddress: "103.5.20.11", location: "Yangon, Myanmar", lastActiveAt: minutesAgo(2) },
  { id: "sess-2", userId: "usr-3", userName: "Su Myat Noe", device: "Chrome on Android", ipAddress: "103.5.20.40", location: "Yangon, Myanmar", lastActiveAt: minutesAgo(15) },
  { id: "sess-3", userId: "usr-9", userName: "Somchai Prasert", device: "Safari on macOS", ipAddress: "1.46.88.20", location: "Bangkok, Thailand", lastActiveAt: hoursAgo(2) },
]

export const mockSecuritySettings: SecuritySettings = {
  passwordPolicy: { minLength: 8, requireUppercase: true, requireNumber: true, requireSymbol: false, expiryDays: 90 },
  sessionTimeoutMinutes: 30,
  twoFactorEnabled: true,
  maxLoginAttempts: 5,
  ipRestrictionEnabled: false,
  allowedIpRanges: [],
}

// --- System Settings ---

export const mockGeneralSettings: GeneralSettings = {
  systemName: "Fashion ERP/POS",
  supportEmail: "support@fashionerp.com",
  defaultCompanyId: "co-1",
}

export const mockLocalizationSettings: LocalizationSettings = {
  language: "en",
  timezone: "Asia/Yangon",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "1,234.56",
  currency: "MMK",
}

export const mockBackupRecords: BackupRecord[] = [
  { id: "bkp-1", createdAt: hoursAgo(6), sizeMb: 482, status: "completed", triggeredBy: "Scheduled" },
  { id: "bkp-2", createdAt: daysAgo(1), sizeMb: 478, status: "completed", triggeredBy: "Scheduled" },
  { id: "bkp-3", createdAt: daysAgo(2), sizeMb: 475, status: "completed", triggeredBy: "Aung Min Thu" },
  { id: "bkp-4", createdAt: daysAgo(3), sizeMb: 0, status: "failed", triggeredBy: "Scheduled" },
]

// --- Admin Dashboard ---

export const adminKpis: AdminKpis = {
  activeUsers: 2450,
  onlineNow: 186,
  companies: 12,
  branches: 85,
  securityEventsToday: 5,
}

export const systemActivity: SystemActivityPoint[] = [
  { id: "sa-1", actor: "Aung Min Thu", description: "Updated system settings", module: "Administration", timestamp: hoursAgo(4) },
  { id: "sa-2", actor: "Nilar Win", description: "Created new user account", module: "User Management", timestamp: daysAgo(1) },
  { id: "sa-3", actor: "Su Myat Noe", description: "Approved purchase order PO-2049", module: "Purchase", timestamp: daysAgo(2) },
  { id: "sa-4", actor: "Kyaw Zin Latt", description: "Posted journal entry JE-0088", module: "Accounting", timestamp: daysAgo(1) },
  { id: "sa-5", actor: "System", description: "Nightly backup completed", module: "System", timestamp: hoursAgo(6) },
]

export const moduleStatuses: ModuleStatus[] = [
  { module: "Sales & POS", status: "operational", uptimePercent: 99.98 },
  { module: "Inventory", status: "operational", uptimePercent: 99.95 },
  { module: "Accounting", status: "operational", uptimePercent: 99.9 },
  { module: "HR", status: "operational", uptimePercent: 99.97 },
  { module: "Integrations", status: "degraded", uptimePercent: 97.2 },
  { module: "Reports & BI", status: "operational", uptimePercent: 99.92 },
]
