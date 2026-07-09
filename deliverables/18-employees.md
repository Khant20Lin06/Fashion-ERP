# Workforce Management (WFM) & Employee Operations Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [17-reports.md](17-reports.md) (all prior modules)
**Consumed by:** POS, Sales, Finance (Payroll/Commission), CRM, Reports, Role & Permission Management
**Scope note:** This module is the master source of employee identity, org structure, scheduling, attendance, and workforce performance. It closes Reports' Employee Reports references (17 §14) and is what "Sales by Employee" (09 §15), CRM's Salesperson Performance (14 §16), and every prior module's "actor" in Activity Timelines/Audit Logs ultimately resolve to as a person record. POS's per-register Shift Management ([04-pos.md](04-pos.md) §14, cash reconciliation) is distinct from this module's Shift Management (§9, work-schedule assignment) — related but not the same concept, clarified in §9.

---

## 1. Module Objective

Manage day-to-day workforce operations — Employee Master Data, Organization Structure, Scheduling, Attendance, Leave, Tasks, Commission, Sales Targets, Analytics — as the authoritative employee record every other module's "employee/user" reference points back to.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, all branches/departments |
| HR Manager | Full CRUD on employee records, org structure, leave policy configuration |
| Branch Manager | Branch-scoped full access — hiring, scheduling, attendance, approvals for their branch |
| Store Manager | Store-scoped, same tier as Branch Manager but store-level |
| Department Manager | Department-scoped read/write within their branch |
| Team Leader | Team-scoped task assignment and attendance visibility, no compensation/commission access |
| Employee | Self-service only (§26) — own profile (limited fields), own schedule, own leave requests, own tasks, own commission/performance summary |

**Sensitive Data Protection (§24):** compensation, commission rates, and personal identification documents are visible only to HR Manager/Owner/Super Admin and the employee themselves — even a Branch Manager scheduling someone does not see their commission rate by default.

---

## 3. Employee Lifecycle

```
Employee Created → Branch Assignment → Department Assignment → Shift Assignment
→ Daily Operations → Performance Tracking → Transfer → Inactive
```

**Transfer** (branch or department change) is a tracked event, not a silent field edit — it preserves the employee's full history at their prior assignment (sales performance, attendance) rather than reassigning historical records to the new location, since "Sales by Employee" and "Sales by Branch" reports (09 §15, 17 §7) must remain historically accurate for periods before the transfer.

---

## 4. Module Structure

```
Employee Dashboard (§5)
↓
Employee Directory (§6) ──→ Employee Profile (§7)
                                    ↓
                    Organization Structure (§8)
                                    ↓
        Shifts (§9) · Attendance Overview (§10) · Leave Requests (§11)
                                    ↓
                    Task Management (§12)
                                    ↓
        Commissions (§13) · Sales Targets (§14)
                                    ↓
                    Employee Analytics (§15)
```

---

## 5. Employee Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Total Employees · Employees by Branch · Employees by Department · Present Today · Absent Today · Late Today · On Leave · Open Tasks · Sales Target Achievement — plus Top Performers (ranked) and Commission Summary.

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15). For an Employee-role viewer, this dashboard's scope narrows automatically to a personal view (their own attendance, tasks, target progress) rather than the org-wide rollup — same components, role-scoped data, consistent with the Dashboard module's role-adaptive principle (03 §2).

---

## 6. Employee Directory

Enterprise data table (Design System §12): Employee ID · Photo · Full Name · Job Title · Department · Branch · Manager · Email · Phone · Employment Status · Shift · Join Date.

Toolbar: Search · Advanced Filter (§16) · Sort · Pagination · Saved Views · Column Visibility · Bulk Actions (§17) · Export — the standard platform table toolbar. Row click → Employee Profile (§7). Compensation/commission fields never appear as directory columns, even for HR — that detail lives strictly within the individual Profile (§7), reducing accidental over-the-shoulder exposure in a list view.

---

## 7. Employee Profile

Structurally consistent with Customer 360 (10 §7) and Vendor 360 (15 §7) — Summary Header + Tabs, the same reused pattern a fourth time.

**Summary Header:** Photo · Full Name · Employee ID · Job Title · Branch/Department · Employment Status badge.

**Tabs:** Overview (Basic Information, Contact Information, Emergency Contact, Manager, Job Position) · Schedule (Assigned Shift, §9) · Attendance (§10, personal history) · Leave (§11, personal requests/balance) · Tasks (Assigned Tasks, §12) · Performance (Sales Performance, Commission Summary — §13/§14, visible per §2's sensitivity rules) · Documents (contracts, ID copies, certifications — §26) · Notes (HR-internal, restricted visibility).

---

## 8. Organization Structure

Company → Region → Branch → Department → Team → Reporting Manager — visualized as an **Organization Tree View** (expandable hierarchy diagram, distinct from a table, since reporting-line structure is inherently graph-shaped).

This hierarchy is what Territory-based Access in CRM ([14-crm.md](14-crm.md) §25) and branch/region scoping throughout the platform (Sales, Inventory, Finance row-level security) ultimately reference — one org-structure source, consumed for access-scoping everywhere else.

---

## 9. Shift Management (Work Schedule)

Morning/Evening/Night/Custom Shifts · Weekly Rotation · Flexible Shifts · **Shift Calendar** (visual, per branch/department) · Shift Assignment · **Shift Swap Approval** (an employee-initiated swap request between two employees, requiring manager sign-off before it takes effect).

**Distinct from POS's Shift Management ([04-pos.md](04-pos.md) §14):** POS's shift is a *register session* (cash float open/close, tied to a specific terminal and cash reconciliation) — this module's shift is a *work schedule assignment* (which hours an employee is rostered to work, independent of whether they're on a register the whole time). They're related — a Cashier's rostered shift here should generally align with when they open a POS shift there — but are not the same record; a Store Manager working a shift without ever touching a register still has a Shift Management (here) entry with no corresponding POS Shift.

---

## 10. Attendance Overview

Present · Absent · Late · Early Leave · Overtime · Missing Check-in — **Attendance Calendar** (month-grid view, color-coded by status) and **Attendance Summary** (aggregate per employee/period).

Check-in/check-out methods are configured per Advanced Enterprise Features (§26: Geo-fenced, QR, Biometric) — this section displays the resulting attendance record regardless of capture method, so the Overview itself doesn't change shape based on which check-in technology a branch has deployed.

---

## 11. Leave Requests

Annual Leave · Sick Leave · Emergency Leave · Unpaid Leave · Half-day Leave — **Approval Workflow** (reuses the shared Manager Override/Approval component pattern established across every prior module, parameterized for leave-request context) · **Leave Balance Overview** (remaining entitlement per type, visible to the employee and their manager, decremented automatically on approval, restored automatically on a later-cancelled/rejected request).

---

## 12. Task Management

Create Task · Assign Task · Priority · Due Date · Recurring Task · Checklist · Comments · Attachments · Task Status.

Structurally identical to CRM's Task Management ([14-crm.md](14-crm.md) §12) and the Design System's general Task component pattern — the same task entity/component is reused here for operational (non-sales) task assignment (e.g., "restock the front display," "complete quarterly training module") rather than a second task implementation.

---

## 13. Commission Management

Sales Commission · Product Commission · Category Commission · Branch Commission · Manual Adjustment (with reason, requiring approval above a threshold per §24) · Commission History.

Commission calculation reads Sales by Employee data ([09-sales.md](09-sales.md) §15) as its base input, applying the configured commission rules (rate per category/product/branch) — this module defines the rule and computes the resulting payable amount; it does not re-record the underlying sale, which remains owned by Sales/POS. Commission Summary feeds directly into Finance's Payroll processing (16, cross-module) as a calculated line item.

---

## 14. Sales Targets

Daily/Weekly/Monthly/Quarterly/Annual Target · Target Achievement (% progress, live-updating against actual sales) · **Leaderboard** (ranked view across a team/branch, opt-in/configurable since not every organization wants competitive visibility into colleagues' performance).

Target Achievement is the same figure surfacing on the Dashboard's "Sales Target Achievement" KPI (§5) and the business-wide Dashboard's equivalent widget (03 §2's Store Manager view) — one computed progress value, multiple display surfaces.

---

## 15. Employee Analytics

Attendance Trend · Sales Performance · Task Completion Rate · Commission Earned · Target Achievement · Branch Comparison · Department Performance.

Reuses Dashboard/Sales Analytics chart components (03 §15, 09 §15) — this is the source data Reports' Employee Reports (17 §14) surfaces at the cross-functional level; Sales Performance here must reconcile exactly with Sales by Employee (09 §15) and CRM's Salesperson Performance (14 §16), consistent with the "one metrics service, multiple surfaces" principle applied throughout.

---

## 16. Search & Filter

Employee · Department · Branch · Manager · Shift · Status · Attendance Status · Date Range — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 17. Bulk Operations

Bulk Import · Bulk Export · Bulk Shift Assignment · Bulk Department Assignment · Bulk Status Update — same preview-before-commit rule as every other bulk action platform-wide. No Bulk Delete is offered for employees (consistent with the platform-wide Archive-over-Delete principle) — Bulk Status Update to Inactive is the equivalent, preserving historical attendance/sales/commission records intact.

---

## 18. Activity Timeline

Employee Created · Department Changed · Branch Changed · Shift Assigned · Attendance Updated · Leave Approved · Task Completed · Commission Updated — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 19. Audit Log

User · Action · Timestamp · Old Value · New Value · Reference Document — generated from the same event stream as §18, restricted to HR/management roles, with Compensation/Commission-rate changes specifically always logged regardless of amount (no minor-change exemption), given their sensitivity.

---

## 20. Validation

| Rule | Behavior |
|---|---|
| Duplicate Employee ID | Hard-blocked — Employee ID is a unique key |
| Duplicate Email / Duplicate Phone | Soft warning, consistent with Customers'/Suppliers' equivalent rules |
| Invalid Department | Blocked — must reference an active node in Organization Structure (§8) |
| Invalid Shift | Blocked — must reference a configured Shift type (§9) |
| Leave Balance | Hard-blocked if a request exceeds remaining entitlement (§11), unless an HR override explicitly grants an exception (logged as a Sensitive Action) |
| Manager Assignment | Blocked if it would create a circular reporting relationship (A reports to B who reports to A) |

---

## 21. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table (Directory) / skeleton Summary Header + tab content (Profile) |
| Skeleton | Shape-matched per view |
| No Employees | New tenant: icon + "No employees yet" + "Add your first employee" / "Import employees" CTAs |
| No Attendance | Neutral, common for a newly created employee before their first scheduled shift |
| No Tasks | Neutral, distinct from an error |
| Offline | Store-device use (a Store Manager checking attendance/approving leave from a tablet) shows cached data with staleness indicator; check-in/check-out (§10) queues offline per the same pattern established for POS (04 §15), critical since attendance capture often happens at the exact point of a shift start regardless of connectivity |
| Permission Denied | Standard Navigation §19 pattern; Compensation/Commission fields masked per §2 rather than the whole profile hidden |
| Server Error | Inline retry, per-tab isolation on the Profile (mirrors Product Detail §24) |
| Retry | Consistent retry affordance throughout |

---

## 22. Responsive Design

| Breakpoint | Directory / Org Structure | Mobile (Managers & Employees) |
|---|---|---|
| Desktop/Laptop | Full table, full org tree | N/A |
| Tablet | Priority columns + scroll, org tree remains pan/zoomable | Manager approvals (leave, shift swap) fully supported |
| Mobile | Card-per-employee stacked list | **Explicitly supported per the prompt's own note** — Employees use Mobile for self-service (check attendance, request leave, view schedule/tasks, per §26's ESS); Managers use it for approvals and quick attendance checks. Full Directory management and Organization Structure editing remain Desktop/Tablet-oriented |

---

## 23. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (Profile/Leave/Task entry), accessible tables (Directory, Attendance, Commission History), WCAG AA compliance. The Organization Tree View (§8) requires a keyboard-operable alternative to visual pan/zoom navigation (e.g., a linked breadcrumb-style drill path through the hierarchy).

---

## 24. Security

Role Permission per §2. **Manager Approval:** the shared Approval component pattern applied to Leave Requests (§11), Shift Swaps (§9), and Commission Manual Adjustments (§13). **Sensitive Data Protection:** Compensation, commission rates, and personal identification/emergency-contact details are restricted per §2's rule, masked-with-audit-logged-reveal consistent with the PII pattern established for Customers (10 §24) and extended here to employee data. **Audit Trail:** immutable, per §19. **Employee Self-Service Access:** scoped strictly to one's own record (§26) — an Employee-role user cannot view another employee's profile, attendance, or commission data even read-only.

---

## 25. Performance

Optimized for large employee databases: Directory virtualizes rows, search is server-side indexed, server-side pagination throughout, consistent with every other back-office module's performance approach.

---

## 26. Advanced Enterprise Features

**Employee Self-Service (ESS)** and **Manager Self-Service (MSS)** — the two access modes underlying §2's permission model, formalized as distinct portals/views. **Geo-fenced Attendance** (check-in only permitted within a branch's defined radius) · **QR Attendance** (scan a branch-posted code, reusing the platform's existing QR/barcode scan interaction pattern from POS §5) · Biometric Device Integration · Task Templates (reusable checklists for recurring operational tasks, §12) · Skill Matrix (competency tracking, relevant for assigning specialized tasks or identifying training needs) · Training Records · Certification Tracking (with expiry alerts, mirroring Suppliers' Compliance Document Expiry Alerts, 15 §12) · Uniform & Asset Assignment (tracking company property issued to an employee — distinct from Finance's Fixed Assets, 16 §14, which tracks the asset's financial lifecycle; this tracks *who currently holds it*) · Employee Transfer (§3's formalized workflow) · Succession Planning (Basic) · AI Shift Recommendation · AI Workforce Forecast.

Additive/opt-in per the platform-wide principle — a small retailer runs Directory/Shifts/Attendance/Leave/Tasks/Commission without ever engaging Biometric/Geo-fencing/Succession Planning.

---

## 27. Developer Implementation Notes

- Commission calculation (§13) must read Sales/POS's existing transaction data (09 §15, 04) as input, never re-recording sale details locally — this module owns the commission *rule and computed payable amount* only, maintaining the read/write ownership discipline established since Product Detail/Inventory.
- POS Shift ([04-pos.md](04-pos.md) §14) and this module's Shift Management (§9) should be modeled as related-but-distinct entities with an optional link (a POS shift references the employee's rostered Shift Management entry, not the reverse) — conflating them would break for any role (e.g., Store Manager) that has a work schedule but doesn't necessarily operate a register.
- Organization Structure (§8) should be the single hierarchy table that CRM's Territory-based Access (14 §25) and every other module's branch/region row-level security scoping reads from — not a separately maintained org chart per consuming module.
- Sensitive Data Protection (§24) for compensation/commission fields should be enforced at the API/query layer, not merely hidden in the UI, consistent with the PII-masking enforcement standard established for Customers (10 §27) and Finance (16 §27).
- Transfer (§3) must preserve historical attribution — sales/attendance/commission records prior to a branch/department change retain their original branch/department reference, never retroactively reassigned to the employee's current location, so historical reports remain accurate for the period they describe.

---

**Next:** 19-multi-branch.md
