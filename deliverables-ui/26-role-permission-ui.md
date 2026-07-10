# Identity & Access Management (IAM) — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [26-role-permission.md](../deliverables/26-role-permission.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module is the actual authorization system every other module's "Role-Based Permissions," "field-level permission," and "shared Manager Override/Approval component" has assumed exists throughout this entire UI set. The Permission Matrix (§6) is the concrete realization of the Action Permissions (§8 of the spec) every prior module's own permission table has been informally describing since POS's UI spec.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Access Management
↓
Page Header (Title + Toolbar)
↓
Security Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Users (default) · Roles · Permission Matrix · Access Policies · Authentication · Sessions · Security Events · Audit Log
```

---

## 2. Page Header & Toolbar

```
Access Management                                     [Export] [+ Invite User] [+ Create Role]
248 users · 18 roles · 3 pending access requests

[🔍 Search user, role, permission…]  [Role ▾] [Branch ▾] [Status ▾] [Filters ▾]
```

---

## 3. Security Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Users · Active Roles · Permission Groups · Pending Requests · Security Risks · Recent Changes · Failed Access Attempts · Admin Actions · (plus, per the spec's own dashboard) Online Users · Expired Passwords.

- Failed Access Attempts / Security Risks render in `color-error` — these are the two cards a Security Administrator scans first
- Pending Requests deep-links to the Permission Request Workflow queue (§10)

---

## 4. Users Tab

**Columns:** Avatar + Name · Email/Phone · Role (badge, may show multiple if the user holds several) · Branch · Department · Status (Active/Invited/Deactivated/Locked badge) · Last Login (relative + tooltip exact) · MFA Status (small icon indicator).

Row overflow `⋮`: View, Edit, Assign Role, Reset Password, Force Logout, Deactivate. Bulk-action bar: `[Bulk Role Assignment] [Bulk Permission Update] [Bulk Deactivation] [Export]`.

**User Detail** (drill-in): header (Avatar, Name, Status badge, Role badges) → tabs: Overview (contact info, linked Employee record if one exists — per the spec's User↔Employee distinct-entity rule, shown as "View Employee Profile →" rather than duplicated fields) · Roles & Permissions (assigned roles, effective permission summary) · Sessions (this user's active sessions, §9) · Access History (login/permission-change log scoped to this user).

**Invite User:** compact form (Email, Role, Branch) → sends a time-limited setup link, per the spec's invitation flow — distinct from **Create User** (direct entry for offline-onboarded staff without email access), both reachable from the same "+ Invite User" split-button.

---

## 5. Roles Tab & Role Hierarchy

**Role List:** Role Name, Description, Users Assigned (count, tap to see list), Permission Level (a compact summary badge, e.g., "Full Access" / "Branch-Scoped" / "Custom"), Created Date, Status (System/Custom badge — System roles show a small lock icon indicating they can't be deleted, only cloned).

Row overflow `⋮`: View, Edit, Duplicate, Archive (System roles: View/Duplicate only, Edit/Archive disabled with a tooltip explaining why).

**Role Hierarchy (Tree View / Organization View toggle):** expandable tree — a Custom Role shows its Parent Role (the System Role it extends) with a visual "inherits from" connector; expanding reveals exactly which permissions are inherited (greyed, non-editable at this level) vs. explicitly overridden (highlighted `color-primary`, editable) — making Permission Inheritance visually legible rather than an invisible backend concept.

**Create/Edit Role:** Name, Description, "Extend from" (Role select, optional — choosing one pre-populates the Permission Matrix below with that role's settings as a starting point, per Role Cloning) → the full Permission Matrix (§6) scoped to this role → Save.

---

## 6. Permission Matrix

The centerpiece screen — a genuinely large table, given the spec's Module × Action structure:

```
                    View   Create  Edit   Delete  Approve  Export  Manage
Dashboard            ✓                                        ✓
POS                  ✓      ✓       ✓                          
Products             ✓      ✓       ✓       ✓                 ✓       ✓
Inventory            ✓              ✓                ✓         ✓
Purchase             ✓      ✓       ✓                ✓         ✓
Sales                ✓      ✓       ✓                ✓         ✓
Customers            ✓      ✓       ✓                          ✓
Loyalty              ✓                                          
Marketing                                                       
CRM                  ✓      ✓       ✓                          
Finance                                                          
Reports              ✓                                ✓         
Employees            ✓                                          
Branches             ✓                                          
Settings                                                         
```

- Each cell is a checkbox (or a 3-state toggle where a **Field-level Security** exception exists — Granted/Denied/Partial, the last opening a small popover listing which specific fields are restricted, e.g., Product's "Edit" access excluding Cost Price)
- **Row header (Module name) click** toggles the entire row (grant/revoke all actions for that module) with a confirming micro-interaction, for fast bulk configuration
- **Column header (Action name) click** shows a tooltip explaining what that action governs platform-wide (e.g., "Approve — determines eligibility as an approver in the shared Manager Override component used across POS, Purchase, Sales, and more") — directly surfacing the spec's cross-cutting significance of this one column
- Matrix is sticky-header (both row and column) given its size, with the module list itself searchable/filterable via a field above the table
- **Unsaved changes** in the matrix show a persistent bottom bar: "Unsaved changes to 3 permissions" + Save/Discard — the matrix never auto-saves per-cell, since a batch of related permission changes should commit together

---

## 7. Access Policies Tab (Branch/Data Visibility)

**Branch Permission:** a simpler control than the full Matrix — per role or per user, a radio choice: **All Branches** / **Selected Branches** (opens a multi-select branch picker) / **Restricted** (explicit deny list, rare exception case) — separately configurable for Warehouse Access, Store Access, and Regional Access using the identical control pattern.

**Data Visibility Rules:** Data Scope (Own Records Only / Team / Branch / All), Record Visibility exceptions (e.g., "Can view but not edit records outside assigned branch"), Department Restriction, Personal Data Access (the PII-masking toggle referenced across Customers/Suppliers/Employees UI — granting a role the "reveal" capability for masked fields).

These policies render as readable rule rows (same sentence-style pattern established in Settings UI's Business Rules) rather than a second raw permission table, since Access Policies are fewer and more consequential than the granular Matrix and benefit from being human-readable at a glance.

---

## 8. Approval Authority (within Access Policies or a dedicated sub-section)

Table: User/Role, Approval Type (Purchase/Discount/Refund/Payment badge), Limit Amount, Approval Level (Single/Matrix/Dual), Status. This is the per-person/per-role view of the same Approval Configuration values Settings UI's own Business Rules/Approval Configuration sections define platform-wide (§6/§7 there) — this tab shows "who specifically has what limit," Settings shows "what the limits are structurally." Row click opens a limit-editing panel identical in pattern to Settings' Approval Configuration.

---

## 9. Sessions Tab

Table: User, Device, Location (approximate, from IP), Login Time, Last Activity, Status (Active/Idle badge). Row action: **Force Logout** (single confirm, immediately invalidates that session across all its clients). A "Force Logout All" bulk action for a specific user (e.g., after a suspected credential compromise) is available from the User Detail view (§4) rather than this general list, since it's a higher-stakes, user-specific action.

**Concurrent Session Limits** configuration (if enabled) shown as a simple numeric setting per role, alongside Trusted Devices management.

---

## 10. Permission Request Workflow

Queue view: Requester, Requested Access (Module/Action or Temporary elevated role), Reason, Status (Pending/Approved/Rejected/Expired badge), Requested Date. Approve/Reject as the shared Approval component. **Temporary Access** grants show an Expiry countdown badge and auto-revert once expired — this is the UI realization of Just-in-Time Access from the spec's advanced features, with the expiry always visible, never a silent background timer the requester can't see.

"Request Access" (available to any user from their own Profile) opens a compact form: Module/Action needed, Reason, Duration (if temporary) — routes into this same queue.

---

## 11. Security Events Tab

Table: Event Type (Login Success/Failure, Permission Change, Role Change, Password Reset, MFA Enrollment, Account Lock, Suspicious Activity — icon + label), User, Timestamp, IP Address, Details (expandable). **Suspicious Activity** rows get a distinct `color-error` left-border accent and cannot be bulk-dismissed without individual acknowledgment, per the spec's non-bulk-dismissible rule for this category — every other row supports standard bulk actions, this one deliberately doesn't.

---

## 12. Security Audit Tab

Enterprise table: User, Action, Module, Permission Changed, Previous Value, New Value, Date, IP Address — the platform's most foundational Audit Log, held to the strictest retention standard (exceeding even Finance's own Audit Log), per the spec's framing that this is the record consulted first in any security incident investigation. Read-accessible to Compliance Officer/Auditor-tier roles without any edit capability, across all periods, no exceptions.

---

## 13. Search Experience

Global Search (users/roles/permissions) · Role Search · User Search · Permission Search (searches within the Matrix itself — typing "Cost Price" jumps to and highlights that field-level exception wherever it's configured) · Recent Searches.

---

## 14. Dialogs

| Dialog | Contents |
|---|---|
| **Create Role** | Per §5 |
| **Assign Permission** | Single-permission-cell editing shortcut (an alternative entry into the Matrix, §6, for a quick one-off change without opening the full grid) |
| **Assign User** | Searchable user picker, applicable to single or bulk role assignment |
| **Confirm Permission Change** | Shown for structurally significant changes (removing a widely-held permission, changing a System Role's base configuration) — old vs. new summary before committing |
| **Delete Role** | Only offered for Custom Roles with zero currently-assigned users; System Roles have no Delete option at all (§5) |

---

## 15. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/cell `color-hover`; Matrix column-header hover reveals its explanatory tooltip (§6) |
| Focus | 2px `color-focus` ring throughout, including individual Matrix cells |
| Selection | Checkbox multi-select on Users/Roles lists |
| Keyboard Navigation | Full arrow-key traversal within the Permission Matrix (a genuinely large grid that must be keyboard-navigable cell-to-cell, not just tab-through) |
| Expand/Collapse Tree | Role Hierarchy (§5) — click or Enter/Space toggles children |
| Permission Toggle | Matrix cell click toggles Granted/Denied; a modifier-click (or long-press on touch) opens the field-level exception popover directly |
| Bulk Permission Update | Row/column header click (§6), or the Bulk Permission Update dialog for cross-role changes |

---

## 16. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table/matrix per Design System §17 |
| Empty Roles | Not applicable post-setup (System Roles ship as defaults); relevant only to the Custom Roles sub-list before any are created |
| No Permission Found | Permission Search (§13) yielding nothing: "No permissions match '[query]'" |
| Access Denied | This module's own Access Denied is the most consequential instance platform-wide — it's the mechanism enforcing every other module's Access Denied state; shown per the standard pattern but with no partial-view fallback (binary, not masked) |
| Validation Error | Inline — e.g., a Role Conflict violating configured Segregation of Duties blocked at assignment with a specific explanation, not a generic rejection |
| Save Failed | Distinct from generic Server Error — Matrix save failures show exactly which cell(s) failed to persist |
| Save Success | Toast; Matrix's unsaved-changes bar (§6) clears on successful save |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance, rate-limited per the spec's brute-force protection where relevant (e.g., failed login lookups) |

---

## 17. Responsive Design

| Breakpoint | Full IAM Console | Mobile Security View |
|---|---|---|
| Desktop/Laptop | Full tables, full Permission Matrix editor | N/A |
| Tablet | Priority columns + scroll | Most viewing/basic actions supported |
| Mobile Security View | Card-per-row stacked lists | **Admin Essentials** — a Security Administrator reviewing a Security Event or force-logging-out a compromised session from a phone; deep Role/Permission Matrix design remains Desktop/Tablet-oriented |

---

## 18. Accessibility

Standard baseline: keyboard navigation, screen reader labels, accessible forms, WCAG AA. **Accessible Tables:** the Permission Matrix specifically requires proper `<th scope>` on both row and column headers (a genuine two-axis header table), with each cell's state announced clearly ("Products, Delete: Granted") to screen readers — critical given how information-dense this specific table is. Given this module is almost entirely form/table-based configuration, it carries a comparably lighter accessibility surface than data-visualization-heavy modules, but with the same rigor applied throughout — particularly important here since assistive-technology users must be able to manage their own account security (password reset, MFA enrollment) without barriers.

---

## 19. Figma Build Notes

- Frame: `IAM/Users/Desktop/1440`, `IAM/PermissionMatrix/Desktop/1440`, `IAM/RoleHierarchy/TreeView`
- The Permission Matrix is a new, large table component (`ModuleRow × ActionColumn` grid) — not the standard enterprise list-table component reused elsewhere; it's a genuinely distinct grid pattern built once for this screen
- Role badge, Status badges (User/Role/Session) reuse the platform's standard Badge component with new variant values specific to this module
- Layer naming: `IAM/PermissionMatrix/Cell-Granted`, `IAM/RoleHierarchy/TreeNode-CustomRole`, `IAM/SecurityEvents/Row-Suspicious`, per convention

---

## 20. Developer Handoff Notes

- Permission evaluation must be a single shared authorization service every module's API layer calls before executing any action — this UI configures that service's data, it does not implement authorization logic itself, per `26-role-permission.md` §26.
- The Matrix's **Approve** column (§6) is the actual source of truth the platform-wide shared Manager Override/Approval component checks to determine approver eligibility — every one of the 20+ modules referencing "shared Approval component" throughout this UI set reads from what's configured here.
- User (this module) and Employee ([18-employees-ui.md](18-employees-ui.md)) must remain two linked-but-distinct entities per §4 — a User without an Employee record (Supplier/Customer Portal logins) must render correctly here, not as a broken edge case.
- Fast Permission Evaluation is the single most performance-critical requirement in the backend this UI configures — every API call platform-wide passes through a permission check first; this UI's own Matrix save action must trigger immediate cache invalidation, not a delayed propagation window.
- Session/token invalidation (Force Logout, §9) must propagate immediately across every client (web back-office, Mobile Manager, POS terminal, Customer/Supplier Portal) — this UI's single "Force Logout" action must terminate all active sessions for that identity everywhere, not just the session visible in this table.

---

**Next:** 27-api-webhook-ui.md
