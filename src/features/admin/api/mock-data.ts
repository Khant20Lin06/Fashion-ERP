import type {
  ActiveSession,
  ActivityEntry,
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
  LoginHistoryEntry,
  ModuleStatus,
  Role,
  RolePermissions,
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
    name: "Myanmar Fashion Co.",
    taxId: "MM-TAX-10293",
    currency: "MMK",
    fiscalYearStart: "04-01",
    address: "No. 45, Pyay Road, Yangon, Myanmar",
    status: "active",
  },
  {
    id: "co-2",
    name: "Thailand Fashion Co.",
    taxId: "TH-TAX-58211",
    currency: "THB",
    fiscalYearStart: "01-01",
    address: "88 Sukhumvit Rd, Bangkok, Thailand",
    status: "active",
    parentId: "co-1",
  },
  {
    id: "co-3",
    name: "Singapore Fashion Co.",
    taxId: "SG-TAX-77410",
    currency: "SGD",
    fiscalYearStart: "01-01",
    address: "1 Orchard Road, Singapore",
    status: "active",
    parentId: "co-1",
  },
]

// --- Branches ---

export const mockBranches: Branch[] = [
  {
    id: "br-1",
    name: "Head Office",
    code: "HO-YGN",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    type: "head_office",
    address: "No. 45, Pyay Road, Yangon",
    managerId: "usr-1",
    managerName: "Aung Min Thu",
    status: "active",
  },
  {
    id: "br-2",
    name: "Junction Square Store",
    code: "RT-JS01",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    type: "retail_store",
    address: "Junction Square, Kamayut, Yangon",
    managerId: "usr-3",
    managerName: "Su Myat Noe",
    warehouseId: "wh-1",
    warehouseName: "Yangon Central Warehouse",
    status: "active",
  },
  {
    id: "br-3",
    name: "Yangon Central Warehouse",
    code: "WH-YGN01",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    type: "warehouse",
    address: "Industrial Zone 3, Hlaing Tharyar, Yangon",
    status: "active",
  },
  {
    id: "br-4",
    name: "Myaing Outlet",
    code: "OT-MYG01",
    companyId: "co-1",
    companyName: "Myanmar Fashion Co.",
    type: "outlet",
    address: "Bogyoke Market Annex, Yangon",
    status: "active",
  },
  {
    id: "br-5",
    name: "Siam Paragon Store",
    code: "RT-BKK01",
    companyId: "co-2",
    companyName: "Thailand Fashion Co.",
    type: "retail_store",
    address: "Siam Paragon, Bangkok",
    status: "active",
  },
  {
    id: "br-6",
    name: "Orchard Central Store",
    code: "RT-SGP01",
    companyId: "co-3",
    companyName: "Singapore Fashion Co.",
    type: "retail_store",
    address: "Orchard Central, Singapore",
    status: "active",
  },
]

// --- Roles ---

export const mockRoles: Role[] = [
  { id: "role-1", name: "Super Admin", description: "Full system access across all companies and branches.", permissionGroups: ["all"], userCount: 2, status: "active", isSystem: true },
  { id: "role-2", name: "Company Admin", description: "Administrative access scoped to a single company.", permissionGroups: ["users", "settings", "reports"], userCount: 3, status: "active", isSystem: true },
  { id: "role-3", name: "Store Manager", description: "Manages daily store operations, staff, and sales.", permissionGroups: ["sales", "inventory", "hr"], userCount: 8, status: "active", isSystem: false },
  { id: "role-4", name: "Cashier", description: "Processes sales transactions at the point of sale.", permissionGroups: ["pos"], userCount: 24, status: "active", isSystem: false },
  { id: "role-5", name: "Inventory Manager", description: "Manages stock levels, transfers, and warehouse operations.", permissionGroups: ["inventory", "purchase"], userCount: 6, status: "active", isSystem: false },
  { id: "role-6", name: "Accountant", description: "Manages ledgers, payments, and financial reporting.", permissionGroups: ["accounting"], userCount: 4, status: "active", isSystem: false },
  { id: "role-7", name: "HR Manager", description: "Manages employees, attendance, and payroll.", permissionGroups: ["hr"], userCount: 3, status: "active", isSystem: false },
  { id: "role-8", name: "Employee", description: "Basic self-service access only.", permissionGroups: ["ess"], userCount: 62, status: "active", isSystem: true },
]

const moduleLabels: { module: string; moduleLabel: string }[] = [
  { module: "product", moduleLabel: "Product" },
  { module: "inventory", moduleLabel: "Inventory" },
  { module: "sales", moduleLabel: "Sales" },
  { module: "purchase", moduleLabel: "Purchase" },
  { module: "accounting", moduleLabel: "Accounting" },
  { module: "hr", moduleLabel: "HR" },
  { module: "reports", moduleLabel: "Reports" },
  { module: "admin", moduleLabel: "Administration" },
]

function buildMatrix(overrides: Record<string, Partial<Record<string, boolean>>>): RolePermissions["matrix"] {
  return moduleLabels.map(({ module, moduleLabel }) => ({
    module,
    moduleLabel,
    actions: {
      view: overrides[module]?.view ?? false,
      create: overrides[module]?.create ?? false,
      edit: overrides[module]?.edit ?? false,
      delete: overrides[module]?.delete ?? false,
      approve: overrides[module]?.approve ?? false,
      export: overrides[module]?.export ?? false,
    },
  }))
}

export const mockRolePermissions: Record<string, RolePermissions> = {
  "role-1": {
    roleId: "role-1",
    matrix: buildMatrix(
      Object.fromEntries(moduleLabels.map(({ module }) => [module, { view: true, create: true, edit: true, delete: true, approve: true, export: true }]))
    ),
  },
  "role-3": {
    roleId: "role-3",
    matrix: buildMatrix({
      product: { view: true, create: true, edit: true },
      inventory: { view: true, create: true, edit: true },
      sales: { view: true, create: true, edit: true, approve: true },
      hr: { view: true },
    }),
  },
  "role-4": {
    roleId: "role-4",
    matrix: buildMatrix({
      sales: { view: true, create: true },
      product: { view: true },
    }),
  },
  "role-6": {
    roleId: "role-6",
    matrix: buildMatrix({
      accounting: { view: true, create: true, edit: true, approve: true, export: true },
      reports: { view: true, export: true },
    }),
  },
}

// --- Users ---

export const mockUsers: AdminUser[] = [
  { id: "usr-1", name: "Aung Min Thu", email: "aung.minthu@myanmarfashion.com", phone: "+95 9 421 555 001", username: "aungminthu", roleId: "role-1", roleName: "Super Admin", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-1", branchName: "Head Office", status: "active", lastLoginAt: minutesAgo(12), createdAt: daysAgo(720) },
  { id: "usr-2", name: "Nilar Win", email: "nilar.win@myanmarfashion.com", phone: "+95 9 421 555 002", username: "nilarwin", roleId: "role-2", roleName: "Company Admin", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-1", branchName: "Head Office", status: "active", lastLoginAt: hoursAgo(3), createdAt: daysAgo(600) },
  { id: "usr-3", name: "Su Myat Noe", email: "su.myatnoe@myanmarfashion.com", phone: "+95 9 421 555 003", username: "sumyatnoe", roleId: "role-3", roleName: "Store Manager", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-2", branchName: "Junction Square Store", status: "active", lastLoginAt: hoursAgo(1), createdAt: daysAgo(500) },
  { id: "usr-4", name: "Ye Htut", email: "ye.htut@myanmarfashion.com", phone: "+95 9 421 555 004", username: "yehtut", roleId: "role-4", roleName: "Cashier", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-2", branchName: "Junction Square Store", status: "active", lastLoginAt: minutesAgo(45), createdAt: daysAgo(300) },
  { id: "usr-5", name: "Thida Aye", email: "thida.aye@myanmarfashion.com", phone: "+95 9 421 555 005", username: "thidaaye", roleId: "role-5", roleName: "Inventory Manager", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-3", branchName: "Yangon Central Warehouse", status: "active", lastLoginAt: daysAgo(1), createdAt: daysAgo(400) },
  { id: "usr-6", name: "Kyaw Zin Latt", email: "kyaw.zinlatt@myanmarfashion.com", phone: "+95 9 421 555 006", username: "kyawzinlatt", roleId: "role-6", roleName: "Accountant", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-1", branchName: "Head Office", status: "active", lastLoginAt: hoursAgo(6), createdAt: daysAgo(450) },
  { id: "usr-7", name: "Ei Ei Phyo", email: "eiei.phyo@myanmarfashion.com", phone: "+95 9 421 555 007", username: "eieiphyo", roleId: "role-7", roleName: "HR Manager", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-1", branchName: "Head Office", status: "active", lastLoginAt: daysAgo(2), createdAt: daysAgo(380) },
  { id: "usr-8", name: "Zaw Naing", email: "zaw.naing@myanmarfashion.com", phone: "+95 9 421 555 008", username: "zawnaing", roleId: "role-8", roleName: "Employee", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-4", branchName: "Myaing Outlet", status: "inactive", lastLoginAt: daysAgo(30), createdAt: daysAgo(200) },
  { id: "usr-9", name: "Somchai Prasert", email: "somchai.prasert@thailandfashion.com", phone: "+66 8 1234 5678", username: "somchaip", roleId: "role-3", roleName: "Store Manager", companyId: "co-2", companyName: "Thailand Fashion Co.", branchId: "br-5", branchName: "Siam Paragon Store", status: "active", lastLoginAt: hoursAgo(2), createdAt: daysAgo(250) },
  { id: "usr-10", name: "Wei Ling Tan", email: "weiling.tan@singaporefashion.com", phone: "+65 9123 4567", username: "weilingtan", roleId: "role-3", roleName: "Store Manager", companyId: "co-3", companyName: "Singapore Fashion Co.", branchId: "br-6", branchName: "Orchard Central Store", status: "locked", lastLoginAt: daysAgo(10), createdAt: daysAgo(220) },
  { id: "usr-11", name: "Hla Hla Win", email: "hlahla.win@myanmarfashion.com", phone: "+95 9 421 555 011", username: "hlahlawin", roleId: "role-4", roleName: "Cashier", companyId: "co-1", companyName: "Myanmar Fashion Co.", branchId: "br-4", branchName: "Myaing Outlet", status: "pending", createdAt: daysAgo(5) },
]

export const mockLoginHistory: LoginHistoryEntry[] = [
  { id: "lh-1", userId: "usr-1", timestamp: minutesAgo(12), ipAddress: "103.5.20.11", device: "Chrome on Windows", location: "Yangon, Myanmar", success: true },
  { id: "lh-2", userId: "usr-1", timestamp: daysAgo(1), ipAddress: "103.5.20.11", device: "Chrome on Windows", location: "Yangon, Myanmar", success: true },
  { id: "lh-3", userId: "usr-1", timestamp: daysAgo(2), ipAddress: "45.121.88.4", device: "Safari on iPhone", location: "Yangon, Myanmar", success: true },
  { id: "lh-4", userId: "usr-10", timestamp: daysAgo(10), ipAddress: "175.41.22.9", device: "Chrome on macOS", location: "Singapore", success: false },
]

export const mockActivity: ActivityEntry[] = [
  { id: "act-1", userId: "usr-1", action: "Updated system settings", module: "Administration", timestamp: hoursAgo(4) },
  { id: "act-2", userId: "usr-1", action: "Created new user account", module: "User Management", timestamp: daysAgo(1) },
  { id: "act-3", userId: "usr-1", action: "Approved purchase order PO-2049", module: "Purchase", timestamp: daysAgo(2) },
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
  { id: "notif-1", type: "security_alert", title: "Multiple failed login attempts", message: "5 failed login attempts detected for user weilingtan.", channel: "in_app", read: false, createdAt: hoursAgo(1) },
  { id: "notif-2", type: "approval_request", title: "Purchase Order awaiting approval", message: "PO-2051 requires your approval.", channel: "in_app", read: false, createdAt: hoursAgo(3) },
  { id: "notif-3", type: "stock_alert", title: "Low stock warning", message: "Classic White Shirt (M) is below reorder level.", channel: "in_app", read: false, createdAt: hoursAgo(5) },
  { id: "notif-4", type: "payment_reminder", title: "Supplier payment due", message: "Payment to Nike Apparel Co. is due in 2 days.", channel: "email", read: true, createdAt: daysAgo(1) },
  { id: "notif-5", type: "leave_request", title: "Leave request pending", message: "Zaw Naing submitted a leave request.", channel: "in_app", read: true, createdAt: daysAgo(2) },
  { id: "notif-6", type: "system_alert", title: "Scheduled maintenance", message: "System maintenance scheduled for this weekend.", channel: "push", read: true, createdAt: daysAgo(4) },
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
