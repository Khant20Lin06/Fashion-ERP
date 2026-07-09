# Customer Relationship Management (CRM) — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [14-crm.md](../deliverables/14-crm.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers the Lead-to-Opportunity process — everything before a Sales Order exists, per `14-crm.md`'s own scope boundary. **Pipeline stages are configurable per CRM Manager** (`14-crm.md` §10) — this document specifies the Kanban/Table mechanics generically rather than hardcoding a fixed stage list, since the exact stage names are tenant configuration, not fixed UI content.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > CRM
↓
Page Header (Title + Toolbar)
↓
CRM Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Leads · Accounts · Contacts · Opportunities (Kanban, default) · Activities · Tasks · Meetings · Emails · Forecast · Analytics
```

---

## 2. Page Header & Toolbar

```
CRM                                                    [+ New Lead] [+ New Opportunity]
340 open opportunities · ฿8.2M pipeline value

[🔍 Search lead, account, contact…]  [Owner ▾] [Stage ▾] [Source ▾] [Filters ▾] [Saved Views ▾]
```

---

## 3. CRM Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Leads · Qualified Leads · Opportunities · Active Customers · Follow-ups Due · Conversion Rate · Win Rate · Lost Deals · Customer Satisfaction · Customer Lifetime Value.

- **Follow-ups Due** card is the Sales Executive's literal daily worklist — clicking opens Activities/Tasks pre-filtered to "due today," consistent with the KPI-card-as-navigation rule established since the Dashboard module
- Win Rate / Lost Deals shown as a paired two-line stat (not two separate cards) for the same at-a-glance trade-off reasoning used in Promotions' Revenue/Cost pairing

---

## 4. Lead Management

**Lead List:** Lead ID, Name/Company, Source (badge: Website/Referral/Walk-in Inquiry/Trade Show/Cold Outreach/etc.), Lead Score (numeral + small colored bar, `color-error`→`color-warning`→`color-success` gradient by score band), Qualification Status (badge: New/Contacted/Qualified/Disqualified), Owner (avatar), Created Date.

Row overflow `⋮`: View, Edit, **Convert to Opportunity**, Merge (shown only when Duplicate Detection has flagged a match, §4.1), Disqualify. Bulk-action bar: `[Bulk Assign] [Bulk Status Update] [Bulk Email] [Export]`.

**Lead Detail** (drill-in): header (Name/Company, Score, Status badge, Owner) → tabs: Overview (contact info, notes, tags, attachments) · Activities (§8) · Related Opportunities. **Lead Conversion** button (Primary, prominent in the header) opens the Conversion dialog (§11) — the one-action promotion into Account+Contact+Opportunity per the spec's rule.

### 4.1 Duplicate Detection
A non-blocking banner appears on Lead List/Detail when a fuzzy-match is found: `⚠ Possible duplicate: "John Smith, ABC Corp" (created 3 days ago) — [View] [Merge]`. Never auto-merges; always surfaces as a suggestion.

---

## 5. Accounts & Contacts Tabs

**Accounts:** table (Account Name, Type [Individual/Corporate/Organization/Business], Industry/Category, Owner, Total Opportunities, Lifetime Value, Credit Profile status badge, Branch). Account Detail reuses the Customer 360 Summary-Header-+-Tabs pattern (same component family as [10-customers-ui.md](10-customers-ui.md) §7), with CRM-specific tabs added: Contacts (§5 below), Opportunities (filtered to this Account), Activities, Account Hierarchy (for parent/subsidiary relationships — a simple indented tree if populated).

**Contacts:** table (Name, Job Title, Account, Phone, Email, Primary Contact toggle indicator). A Contact Detail drawer (Right Panel) shows Relationship History — every Activity/Meeting/Call/Email logged against this specific person, not just their parent Account.

---

## 6. Opportunity Management & Sales Pipeline

**Kanban view** (default for the Opportunities tab): one column per configured pipeline stage (tenant-configurable, default set per `14-crm.md` §10 — New Lead → Qualified → Proposal → Negotiation → Verbal Approval → Contract → Won/Lost, or a simplified variant per organization). Each column header shows stage name + count + total value.

**Opportunity card** (Kanban):
```
┌─────────────────┐
│ ABC Corp — Uniform Order│
│ ฿240,000                │
│ [avatar] Priya S.        │
│ 12 days in stage  ⚠      │  (warning icon if exceeding stall threshold)
└─────────────────┘
```

- Drag-and-drop between columns; dropping triggers stage-entry automation where configured (e.g., moving to "Proposal" auto-generates a Sales Quotation draft, per `14-crm.md` §3's handoff — a toast confirms "Quotation draft created")
- Dropping into a backward stage or "Lost" **requires** the Win/Loss Reason picker (modal) before the drag commits — the card visually "snaps back" to its origin column if the reason dialog is cancelled
- **List view** toggle (top-right of the tab): identical data as a sortable/filterable enterprise table — Opportunity Name, Account, Stage (badge), Value, Probability, Expected Close Date, Owner, Next Action

**Opportunity Detail** (drill-in, from either view): header (Name, Stage badge, Value, Probability %) → tabs: Overview (Products under consideration — read from Product Management, Competitors, Sales Team, **Next Action** — always-visible required field, styled prominently since a blank Next Action is itself a stalled-deal signal) · Activities (§8) · Quotations (linked Sales Quotations) · Documents.

---

## 7. Forecast Tab

Expected Revenue (large stat) → Forecast by Salesperson / Branch / Product Category / Month (4 selectable chart views via segmented control, one rendered at a time rather than 4 simultaneous charts) → **Forecast Accuracy** trend (forecasted vs. actual Won revenue per period, framed constructively — a caption reads "Forecast accuracy has improved 8% this quarter" rather than a bare number that could read as a scorecard against any individual).

---

## 8. Customer Activities (Shared Component, used across Lead/Account/Contact/Opportunity Detail)

Unified Activity feed: Calls, Meetings, Emails, SMS, Notes logged together chronologically, filterable by type via chip toggles. "+ Log Activity" button opens a type-picker → inline compact form (matching Customers UI's "Log a Call" pattern exactly, reused not rebuilt).

**Meetings** get a slightly richer inline card within the feed: date/time, Online Meeting Link (clickable), Participants (avatar stack), Agenda preview, and — once past — Meeting Notes + any Follow-up Actions created directly from it (shown as linked Task chips).

---

## 9. Task Management Tab

List View / **Calendar View** toggle. List: Task, Priority (badge: Low/Normal/Urgent — Urgent in `color-error`), Due Date, Assignee, Status (Open/In Progress/Completed/Overdue — Overdue auto-highlighted `color-error` row background tint). Filter chips: Upcoming / Overdue / Assigned to Me / Completed.

Calendar View: month/week toggle, tasks plotted by due date, color-coded by Priority — same calendar component pattern as Marketing Automation's Campaign Calendar, reused for a different content type.

---

## 10. Communication History Tab

Same unified aggregator pattern as Customers UI's Communication tab and Marketing's Communication History — Email Timeline, SMS Timeline, Call Logs, Chat Logs merged chronologically, plus a distinct **Internal Notes** sub-section (never customer-facing, visually separated with a `color-warning`-tinted "Internal only" label) and Attachments as a separate filterable file-grid view of the same conversation thread.

---

## 11. Dialogs

| Dialog | Contents |
|---|---|
| **Create Lead** | Compact form: Name, Company, Source, Owner (defaults to current user) |
| **Edit Lead** | Same fields, pre-filled |
| **Convert Lead** | Preview showing what will be created — new Account card, new Contact card, new Opportunity card (each editable inline before confirming) — a single "Convert" action creates all three atomically per the spec's rule |
| **Create Opportunity** | Account (searchable select, "+ New Account" inline), Name, Value, Stage, Expected Close Date, Products (multi-select from Product Management) |
| **Schedule Meeting** | Date/time, Online Link toggle (auto-generates or manual paste), Location, Participants (internal + external Contact picker), Agenda |
| **Assign Salesperson** | Searchable user picker, applicable to single or bulk-selected Leads/Opportunities |
| **Delete Confirmation** | Reserved for Leads with zero linked Opportunity/Activity history — records with any history use Archive instead |

---

## 12. Search Experience

Instant Search (Lead/Account/Contact/Opportunity name) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 13. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`; Kanban card lift (`elevation-0→1`) on hover |
| Focus | 2px `color-focus` ring throughout |
| Selection | Checkbox multi-select on List tabs, Shift/Ctrl-click |
| Keyboard Navigation | Tab through form fields, table cell arrow-key traversal |
| Drag & Drop Pipeline | Kanban stage transitions (§6) — **keyboard-operable alternative required**: each card carries a "Move to stage…" menu (visible on focus, not only hover) as the non-drag path, consistent with the accessibility rule established for every other drag-and-drop surface in the platform |
| Context Menu | Right-click a Lead/Opportunity row: View, Edit, Convert/Assign, Archive |
| Quick Actions | "Log Activity" and "Convert to Opportunity" kept always-visible (not buried in overflow) on Lead rows, given their high frequency for Business Development staff |

---

## 14. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table/Kanban (column-shaped skeletons with card-shaped placeholders) |
| Empty CRM | New tenant: icon + "No leads yet" + "Add your first lead" / "Import leads" dual CTAs |
| No Search Results | Distinct — "No results match '[query]'" + Clear filters |
| Offline | Read-only cached view; Activity logging (calls/notes from the field) queues and syncs — Sales Executives frequently log activity from mobile between site visits, per the spec's field-use note |
| Permission Denied | Standard pattern; Territory-based Access (§14 of the spec) restricts by omitting out-of-territory records entirely rather than showing them as denied |
| Validation Error | Inline — a Lead missing an Owner cannot be Qualified (blocked with an inline message); an Opportunity moving to "Won" without Expected Close Date/linked Sales Order is blocked at the drag-drop point with a clear explanation |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation for Lead Conversion (showing the three newly-created records) and Opportunity Won (celebratory but restrained — a brief success animation per Design System §17's non-distracting motion rule) |

---

## 15. Responsive Design

| Breakpoint | Lists / Dashboard | Kanban Pipeline |
|---|---|---|
| Desktop/Laptop | Full tables | Full multi-column Kanban, drag-and-drop |
| Tablet | Priority columns + scroll | Kanban columns become horizontally swipeable; drag-and-drop remains touch-supported |
| Mobile CRM Manager View | Card-per-row stacked lists | Kanban collapses to a single-column, stage-filtered list (select stage from a dropdown) rather than attempting multi-column drag-and-drop |

Field sales use (Sales Executives logging Activities/Meetings from mobile between client visits) is a real, explicitly supported usage pattern — Activity/Task/Meeting logging forms remain fully functional on Mobile even though the Kanban board itself simplifies, per `14-crm.md` §23.

---

## 16. Accessibility

Standard baseline: keyboard navigation, screen reader labels, visible focus, accessible forms, accessible tables, WCAG AA. **Accessible Kanban Board:** every drag-and-drop stage transition has the keyboard-operable "Move to stage…" alternative per §13 — this is a hard requirement, not an enhancement, consistent with the identical rule already established for Promotions' Priority reordering and Marketing's Journey Builder.

---

## 17. Figma Build Notes

- Frame: `CRM/Leads/Desktop/1440`, `CRM/Pipeline/Kanban/Desktop/1440`, `CRM/Pipeline/List/Desktop/1440`
- Kanban card and column are new small components (`Card=Opportunity`, `Column=Stage`) — stage names/colors are component properties, not hardcoded per instance, directly supporting the spec's configurable-stages requirement
- Account Detail's Summary Header instances the same base component/variant (`State=Full|Condensed`) built for Product Detail and Customer 360 — not rebuilt a third time
- Activity feed, Task list, and Communication History reuse the identical components already built for Customers UI and Marketing Automation UI
- Layer naming: `CRM/Pipeline/Kanban/Column-Proposal`, `CRM/Pipeline/Kanban/Card-Opportunity`, `CRM/Leads/Row-Duplicate`, per convention

---

## 18. Developer Handoff Notes

- **Lead Conversion** (§11) must call the exact same Account/Contact/Opportunity creation services used for manual entry — conversion is a convenience wrapper reusing existing validation, never a separate code path, per `14-crm.md` §28.
- **Opportunity→Sales Quotation handoff** (§6's stage-entry automation) must call Sales' existing Quotation creation service ([09-sales.md](../deliverables/09-sales.md) §6) directly, passing Opportunity context — this UI/module never implements its own quoting/pricing logic in parallel, per `14-crm.md` §28.
- **CRM Account and Customers-module Customer** must be the same underlying entity, per `14-crm.md` §28 — this screen's Account records are not a separate table requiring sync; the Account Detail view is simply a CRM-lens rendering of the same Customer record.
- **Kanban stage-transition automation** (§6) should be implemented via the same event-triggered action infrastructure Marketing Automation's Journey Builder uses — reuse that trigger/action pipeline rather than building a second one scoped to CRM.
- **Win/Loss Reason and Lead Source analytics** (§7/Forecast) should feed the same rollup service as Marketing's Revenue Attribution and Sales Analytics, so lead-to-revenue attribution figures are consistent no matter which module a stakeholder checks, per `14-crm.md` §28.

---

**Next:** 15-suppliers-ui.md
