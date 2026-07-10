# Workforce Management & Employee Operations — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [18-employees.md](../deliverables/18-employees.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Per `18-employees.md` §9, this module's Shift Management (work-schedule assignment) is **distinct** from POS's per-register Shift ([02-pos-ui.md](02-pos-ui.md) §2 status pill / §6 shift close) — this document's Shifts tab covers rostering only, never register cash-reconciliation. Compensation/commission fields carry the same masked-with-audit-logged-reveal treatment as Customer/Supplier PII, restricted to HR/Owner/self per the spec's Sensitive Data Protection rule.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Employees
↓
Page Header (Title + Toolbar)
↓
Employee Dashboard (KPI strip, collapsible)
↓
Filter Bar
↓
Employee Directory (Table / Card view)
```

Secondary tabs beneath Page Header, alongside Directory: **Directory** (default) · **Organization Structure** · **Shifts** · **Attendance** · **Leave** · **Tasks** · **Commissions** · **Sales Targets** · **Analytics**.

---

## 2. Page Header & Toolbar

```
Employees                                             [Import] [Export] [+ New Employee]
248 employees · 12 on leave today

[🔍 Search name, ID, phone…]  [Department ▾] [Branch ▾] [Status ▾] [Filters ▾] [Saved Views ▾]     [⚏][▦]
```

---

## 3. Employee Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Employees · Active Employees · New Employees · Inactive Employees · Departments · Branch Distribution · Attendance Rate · Leave Requests (pending) · Employee Performance (avg score) · Upcoming Birthdays.

- For an **Employee-role viewer**, this dashboard automatically narrows to a personal view (own attendance/tasks/target progress) rather than the org-wide rollup — same component, role-scoped data, consistent with the Dashboard module's role-adaptive principle
- Leave Requests (pending) and Upcoming Birthdays cards deep-link into Leave (§7) and a birthday-filtered Directory view respectively

---

## 4. Employee Directory

**Columns:** Avatar + Employee ID · Full Name (linked) · Department · Position/Job Title · Branch · Email · Phone · Employment Status (badge: Active/On Leave/Inactive/Terminated) · Join Date · Manager (avatar) · Shift (badge, work-schedule name — e.g., "Morning A").

**Compensation/commission never appear as directory columns** — not even as a hideable option — per the spec's rule that this data stays strictly within the individual Profile, reducing accidental over-the-shoulder exposure in a list view.

Row overflow `⋮`: View, Edit, Assign Shift, Assign Department, Deactivate. Bulk-action bar: `[Bulk Shift Assignment] [Bulk Department Assignment] [Bulk Status Update] [Export]` — no Bulk Delete offered anywhere in this module; Status→Inactive is the only decommissioning path, preserving historical attendance/sales/commission records intact.

---

## 5. Employee Profile

**Summary Header** (same base component as Product Detail/Customer 360/Vendor 360, fourth consumer):

```
[Photo 80px]  Nina Larsson                                    [Edit] [⋮]
              EMP-00214   Cashier · Downtown Branch   [● Active]
              +66 89 123 4567 · nina@company.com
```

`⋮` overflow: Assign Shift, Assign Department, Transfer (opens the formal Transfer workflow, §5.1), Deactivate.

**Tabs:** Overview · Schedule · Attendance · Leave · Tasks · Performance · Documents · Notes — 8 tabs, fits inline without overflow.

### 5.1 Overview Tab
Two-column (8+4): Left — Basic Information, Contact Information, Emergency Contact, Manager, Job Position (all inline-editable per role permission). Right — Skills card (chip list) + Notes (HR-internal, restricted visibility, `color-warning` accent if flagged).

**Transfer action** (from `⋮`): opens a dedicated dialog — New Branch/Department (searchable selects) + Effective Date + reason — explicitly **not** a silent field edit; confirms that historical attendance/sales/commission records will retain their original branch/department reference, shown as an informational note in the dialog itself so the acting HR Manager understands the preservation behavior.

### 5.2 Schedule Tab (Work-Schedule Shift Assignment — Distinct from POS Shift)
Weekly calendar grid (7-day × time-block view): Assigned Shift blocks (Morning/Evening/Night/Custom, color-coded by shift type) placed on the days this employee works. "Shift Swap Request" indicator (small icon on a day) if the employee has an active swap request pending Manager approval. **Shift Calendar** (branch-level view, accessible via a "View Branch Schedule" link) shows all employees' shifts side-by-side for coverage planning.

A caption beneath the calendar clarifies: *"This is Nina's work schedule. Her POS register sessions are tracked separately in POS Shift History."* — a small but deliberate disambiguation given the two concepts share the word "shift."

### 5.3 Attendance Tab
**Attendance Calendar** (month grid, color-coded: Present=`color-success`, Absent=`color-error`, Late=`color-warning`, Early Leave=`color-warning` lighter tint, Overtime=`color-info` badge overlay, Missing Check-in=`color-error` with a "?" icon) → **Attendance Summary** stat row (Present/Absent/Late counts, Overtime hours total) beneath.

### 5.4 Leave Tab
**Leave Balance** card (per type: Annual/Sick/Emergency/Unpaid/Half-day — remaining entitlement as a small progress ring or bar) → **Leave Request** list (Date Range, Type, Status badge [Pending/Approved/Rejected], Approver) → "+ Request Leave" button (available on the employee's own profile when viewed by themselves, or by a manager submitting on their behalf).

### 5.5 Tasks Tab
Same Task component reused from CRM UI ([14-crm-ui.md](14-crm-ui.md) §9): Task, Priority, Due Date, Status — filterable by Assigned to Me/Overdue/Completed.

### 5.6 Performance Tab
Performance Review history (accordion, one entry per review cycle) → Goals (progress bars per goal) → KPI Tracking (relevant metrics — Sales Performance for Cashiers/Sales Associates, Task Completion Rate for others) → Feedback log → **Employee Rating** (star or numeric score) → **Recognition** (badges/kudos received, shown as a small trophy-icon chip row) — Commission Summary and Sales Performance figures here are **masked per §0's rule**, visible only to HR Manager/Owner/the employee themselves; a Branch Manager scheduling this person does not see compensation detail by default.

### 5.7 Documents Tab
Card grid: contracts, ID copies, certifications — grouped by category, upload dropzone per section, same pattern as Product Detail's Documents tab.

### 5.8 Notes Tab
HR-internal free-text notes, restricted visibility (HR Manager/Owner only) — distinct from the Overview tab's general Notes field.

---

## 6. Organization Structure Tab

**Tree View** (default) / **Chart View** toggle:

- **Tree View:** expandable indented list — Company → Region → Branch → Department → Team → Reporting Manager, each node showing member count, click-to-expand
- **Chart View:** visual org chart (boxes connected by lines, standard org-chart layout algorithm) — better for presenting reporting lines at a glance; supports pan/zoom for large organizations

Clicking any person node opens their Employee Profile (§5) directly.

---

## 7. Shifts Tab (Program-Wide Schedule Management)

Distinct from Profile's per-employee Schedule tab (§5.2) — this is the **admin console** for configuring shift types and viewing branch-wide coverage:

**Shift Types list:** Morning/Evening/Night/Custom, each with start/end time, color swatch, assigned employee count.

**Shift Calendar** (branch-scoped, week view): every employee's assigned shift plotted as a colored block in a grid (rows=employees, columns=days) — the coverage-planning view a Store Manager uses when building next week's roster. Drag a shift block to reassign (with the keyboard-operable "Reassign shift…" menu alternative per the platform's drag-and-drop accessibility rule).

**Shift Swap Approval** queue: Requester, Requested Swap Partner, Date, Status — Approve/Reject as the shared Approval component.

---

## 8. Attendance Tab (Program-Wide)

Branch-scoped Attendance Overview: Present/Absent/Late/Early Leave/Overtime/Missing Check-in counts (KPI-card row) → filterable Attendance table (Employee, Date, Check-in/out times, Status, Hours Worked) → **Attendance Reports** export action.

Check-in/check-out method (Geo-fenced/QR/Biometric, per Settings configuration) doesn't change this tab's shape — it displays the resulting record regardless of capture method, per the spec's rule.

---

## 9. Leave Tab (Program-Wide)

**Leave Approval queue** (the primary admin view): Employee, Leave Type, Date Range, Balance Remaining (shown so the approver has context), Status — Approve/Reject inline (shared Approval component). **Leave Calendar** (team/branch view, month grid) shows everyone's approved leave plotted together — critical for a manager avoiding double-booking an already-thin-staffed day. **Leave History** as a filterable table beneath.

---

## 10. Commissions Tab

**Access-restricted per §0's rule** — visible only to HR Manager/Finance Manager/Owner (a Branch Manager sees this tab omitted from the tab strip entirely, not shown-disabled).

Table: Employee, Commission Type (Sales/Product/Category/Branch badge), Period, Base Sales, Commission Rate, Commission Earned, Status (Calculated/Approved/Paid). Manual Adjustment action (with required reason, routes through Approval above threshold). "Commission History" drill-in per employee shows a running ledger, feeding directly into Finance's Payroll processing.

---

## 11. Sales Targets Tab

Target configuration (Daily/Weekly/Monthly/Quarterly/Annual, per employee/team/branch) → **Target Achievement** progress bars (live-updating against actual sales) → **Leaderboard** (ranked list, opt-in/configurable — a toggle in Settings determines whether this is visible platform-wide or only to management, per the spec's note that not every organization wants competitive visibility into colleagues' performance).

---

## 12. Analytics Tab

Attendance Trend · Sales Performance · Task Completion Rate · Commission Earned (masked per §0) · Target Achievement · Branch Comparison · Department Performance — standard chart components, reusing Dashboard/Sales Analytics visualizations.

---

## 13. Dialogs

| Dialog | Contents |
|---|---|
| **Create Employee** | Compact form: Name, Employee ID (auto-suggested), Department, Position, Branch, Manager, Contact — full profile completed on the Profile page |
| **Edit Employee** | Full field set, pre-filled |
| **Assign Department** | Searchable Department select, applicable to single or bulk-selected employees |
| **Assign Shift** | Shift Type select + Effective Date, single or bulk |
| **Approve Leave** | The shared Approval component, showing Leave Balance context per §9 |
| **Assign Permission** | Deep-links to the IAM module's Role assignment (this dialog is a shortcut into that system, not a parallel permission store) |
| **Delete Confirmation** | Not offered — Deactivate (Status→Inactive) is the only path, per §4's rule |

---

## 14. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring, including inline-editable Overview fields |
| Selection | Checkbox multi-select on Directory, Shift/Ctrl-click |
| Keyboard Navigation | Arrow-key tab switching on Employee Profile, Tab through inline-editable fields |
| Context Menu | Right-click a Directory row: View, Edit, Assign Shift, Deactivate |
| Quick Actions | "Approve Leave" kept always-visible on pending Leave rows (not buried in overflow), given how time-sensitive leave decisions are for daily staffing |

---

## 15. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table (Directory) / skeleton Summary Header + tab content (Profile) |
| Empty Employee Data | New tenant: icon + "No employees yet" + "Add your first employee" / "Import employees" dual CTAs |
| No Search Results | Distinct — "No employees match '[query]'" + Clear filters |
| Offline | Store-device use (Store Manager checking attendance/approving leave from a tablet) shows cached data + staleness banner; check-in/check-out queues offline per the same pattern as POS, since attendance capture often happens at the exact point of a shift start regardless of connectivity |
| Permission Denied | Standard pattern; Compensation/Commission fields masked per §0 rather than the whole profile hidden; Commissions tab omitted entirely for unauthorized roles |
| Validation Error | Inline — Leave Balance exceeded blocks the request at the field (§5.4), Manager Assignment blocked if it would create a circular reporting relationship |
| Server Error | Inline retry, per-tab isolation on the Profile |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation for Leave Approval and Transfer given their downstream significance |

---

## 16. Responsive Design

| Breakpoint | Directory / Org Structure | Mobile Employee View |
|---|---|---|
| Desktop/Laptop | Full table, full org tree/chart | N/A |
| Tablet | Priority columns + scroll, org tree remains pan/zoomable | Manager approvals (leave, shift swap) fully supported |
| Mobile Employee View | Card-per-employee stacked list | **Explicitly supported** — Employees use Mobile for self-service (check attendance, request leave, view schedule/tasks); Managers use it for approvals and quick attendance checks. Full Directory management and Organization Structure editing remain Desktop/Tablet-oriented |

---

## 17. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (Profile/Leave/Task entry), accessible tables (Directory, Attendance, Commission History), WCAG AA compliance. The **Organization Tree/Chart View** (§6) requires a keyboard-operable alternative to visual pan/zoom navigation (e.g., a linked breadcrumb-style drill path through the hierarchy).

---

## 18. Figma Build Notes

- Frame: `Employees/Directory/Desktop/1440`, `Employees/Profile/Desktop/1440` with per-tab nested frames, `Employees/OrgStructure/ChartView`
- Summary Header instances the same base component (`State=Full|Condensed`) as Product Detail, Customer 360, and Vendor 360 — fourth consumer, still not rebuilt
- Attendance Calendar reuses the month-grid calendar component pattern already established for Marketing Automation's Campaign Calendar and CRM's Task Calendar View, configured for attendance-status color-coding instead
- Layer naming: `Employees/Directory/Row-OnLeave`, `Employees/Profile/Tabs/Attendance/CalendarDay-Late`, `Employees/Shifts/Calendar/Block-Morning`, per convention

---

## 19. Developer Handoff Notes

- Commission calculation (§10) must read Sales/POS's existing transaction data as input, never re-recording sale details locally — this module owns the commission rule and computed payable amount only, per `18-employees.md` §27.
- POS Shift ([02-pos-ui.md](02-pos-ui.md)) and this module's Shift Management (§5.2/§7) are related-but-distinct entities with an optional link (a POS shift references the employee's rostered Shift Management entry, not the reverse) — this distinction must be preserved in the data model, not just this UI's copy, per `18-employees.md` §27.
- Organization Structure (§6) must be the single hierarchy table CRM's Territory-based Access and every other module's branch/region row-level security reads from — not a separately maintained org chart per consuming module.
- Sensitive Data Protection (§0/§10/§4) for compensation/commission fields must be enforced at the API/query layer, not merely hidden in this UI, per `18-employees.md` §27.
- Transfer (§5.1) must preserve historical attribution — sales/attendance/commission records prior to a branch/department change retain their original branch/department reference, never retroactively reassigned, so historical reports remain accurate for the period they describe.

---

**Next:** 19-multi-branch-ui.md
