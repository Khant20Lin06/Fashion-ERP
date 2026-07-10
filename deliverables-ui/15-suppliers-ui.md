# Supplier & Vendor Relationship Management (VRM) — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [15-suppliers.md](../deliverables/15-suppliers.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers Supplier Dashboard, Supplier List, and the Vendor 360 profile. Per `15-suppliers.md`'s own read/write boundary, Purchase History/Payments/Quality Performance tabs here are *views* into Purchase Management's own records ([08-purchase-ui.md](08-purchase-ui.md)) — this document never re-specifies those flows, only how they're surfaced in supplier-scoped context. This is the third and final entity in the platform to receive the Summary-Header-+-Tabs treatment, alongside Product Detail and Customer 360.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Suppliers
↓
Page Header (Title + Toolbar)
↓
Supplier Dashboard (KPI strip, collapsible)
↓
Filter Bar
↓
Supplier List (Table / Card view)
```

Row click → Vendor 360 (§7), same navigation pattern as Product List → Product Detail and Customer List → Customer 360.

---

## 2. Page Header & Toolbar

```
Suppliers                                             [Import] [Export] [+ New Supplier]
286 suppliers · 14 pending approval

[🔍 Search supplier, code, contact…]  [Status ▾] [Category ▾] [Country ▾] [Filters ▾] [Saved Views ▾]     [⚏][▦]
```

---

## 3. Supplier Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Suppliers · Active Suppliers · Preferred Suppliers · New Suppliers · On Hold Suppliers · Blocked Suppliers · Average Lead Time · Supplier Performance (avg composite score) · Open Purchase Orders · Outstanding Payables.

- Blocked/On Hold Suppliers render in `color-error`/`color-warning` respectively — these are risk-signal cards, not neutral counts
- Outstanding Payables reconciles exactly with Finance's Accounts Payable and Purchase's own Outstanding Amount figure — never independently tallied
- Each card deep-links to the List pre-filtered

---

## 4. Supplier Directory (List)

**Columns:** Supplier Code (Roboto Mono link) · Supplier Name · Company · Contact Person · Email · Phone · Country (small flag icon + name) · Category (badge) · Payment Terms · Currency · Rating (stars, 0–5) · Status (badge: Prospective/Active/Preferred/On Hold/Blocked/Archived).

**Status badge palette:** Prospective (`color-text-secondary`) → Active (`color-success`) → Preferred (`color-primary`, distinguished with a small star accent) → On Hold (`color-warning`) → Blocked (`color-error`) → Archived (neutral).

Row overflow `⋮`: View, Edit, Duplicate, Suspend/Reactivate (context-sensitive label), Archive. Bulk-action bar: `[Bulk Update] [Bulk Approval] [Bulk Assign Category] [Export]` — Bulk Approval applies Vendor Approval (§9) to multiple Prospective suppliers at once, each still individually validated against minimum compliance documentation before approval succeeds.

---

## 5. Supplier Directory — Card View

3-up grid, `space-5` gutters: logo/avatar (48px) + name + status badge (top row), Category + Country (compact caption row), 3-stat row (Open POs / Lead Time / Rating), overflow menu bottom-right — same structural pattern as Customer/Product Card Views, applied to supplier content.

---

## 6. Search Experience

Instant Search (name/code/contact) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 7. Vendor 360 Profile

**Summary Header** (same `State=Full|Condensed` component instance as Product Detail and Customer 360 — the third and final consumer of this base component):

```
[Logo 80px]  Levi's Co.                                       [Edit] [⋮]
             SUP-0142   [● Active]   ★★★★☆ 4.2
             Lead Time: 14 days   On-Time Delivery: 94%   Outstanding: ฿182,000
```

- `⋮` overflow: Suspend, Blacklist (Compliance Officer/Owner only — Sensitive Action Confirmation required), Archive, Export, **Create Purchase Order** (Primary-weight shortcut, pre-fills this supplier)
- Outstanding Balance in `color-warning` if non-zero, omitted from the stat row if zero (same rule as Customer 360's Outstanding Balance treatment)

**Tabs:** Overview · Contracts · Purchase History · Quality Performance · Payments · Compliance · Risk Assessment · Analytics — 8 tabs, matching Customer 360's tab count, fitting inline without overflow at Desktop width.

### 7.1 Overview Tab
Two-column (8+4): Left — Company Information, Primary Contact, Multiple Contacts (card list, each with role/phone/email), Supported Brands/Categories (chip list), Lead Time, Preferred Warehouse/Branch. Right — Bank Information card (masked by default: `••••1234`, reveal icon requiring re-authentication or a logged confirmation click) + Tax Information card (same masking treatment) + Internal Notes (`color-warning` accent if flagged).

### 7.2 Contracts Tab
Card list: Contract Name, Type (Purchase Contract/Blanket Agreement/Pricing Agreement badge), Start/End Date, Status (Active/Expiring Soon/Expired badge — Expiring Soon triggers when within the configured renewal-reminder window, shown with a `color-warning` accent and countdown), Attachments count. Drill-in shows the full agreement terms + a **Version History** accordion (old vs. new per amendment, mirroring the exact pattern used for Purchase Order Amendments and Product Pricing History). "+ New Contract" opens a form dialog with an Approval Workflow gate before activation.

### 7.3 Purchase History Tab (Read View)
Standard enterprise table: PO Number, Order Date, Expected/Received Date, Line Items count, Total Amount, Status badge (matching Purchase module's own status tokens exactly) — every row deep-links to its full record in [08-purchase-ui.md](08-purchase-ui.md). Average Purchase Value / Purchase Frequency / Top Products shown as three compact stat cards above the table.

### 7.4 Quality Performance Tab (Read View + Corrective Actions)
Inspection Pass Rate / Fail Rate (donut, two-segment) → Rejected Items / Replacement Rate / Defect Rate (stat row) → Quality Trend (line chart) → **Corrective Actions** list (the one write surface on this tab): Action description, Initiated By, Status (Open/In Progress/Resolved badge), Due Date — "+ New Corrective Action" button (Quality Manager only) opens a form: linked quality-failure reference, action plan, target resolution date.

### 7.5 Payments Tab (Read View)
Outstanding Balance / Paid Amount / Credit Limit (from supplier) as a 3-stat row → Payment History table → **Early Payment Discounts** callout card (e.g., "2/10 Net 30 — save ฿3,640 by paying before Jun 12") surfaced prominently since it's a real, time-sensitive savings opportunity per the spec's rule.

### 7.6 Compliance Tab
Document card grid, grouped by category (Business License, Tax Registration, Certificates, Insurance, Factory Audit), each card showing document thumbnail/icon, upload date, **Expiry status badge** (Valid/Expiring Soon/Expired — Expired renders with a prominent `color-error` banner at the top of the tab if any mandatory document has lapsed: "⚠ Business License expired — new Purchase Orders require Procurement Manager override"). Upload dropzone per category section.

### 7.7 Risk Assessment Tab
Risk Score (composite gauge, 0–100, color zones matching the platform's gauge token convention) → Financial / Delivery / Quality / Compliance Risk (4 sub-scores, small radar/spider chart or 4 mini-gauges) → Risk Trend (line, improving/stable/worsening) → **Blacklist / Watchlist status** (prominent banner if either is active — Blacklist in `color-error` blocking styling, Watchlist in `color-warning` advisory styling) → Risk history log.

### 7.8 Analytics Tab
Per-supplier view of the same Supplier Analytics metric set: Purchase Spend trend, Lead Time trend, Delivery Performance, Quality Performance, Cost Trend, Price Variance (vs. contract pricing), Contract Utilization, and a **Supplier Comparison** launcher button (opens the multi-supplier comparison view, reusing the exact component from Purchase's Quotation Comparison).

---

## 8. Purchase History / Payments / Quality — Cross-Reference Note

Consistent with Product Detail's Inventory tab and every other read-view tab across this platform: these three tabs render live data from Purchase Management ([08-purchase-ui.md](08-purchase-ui.md)) via linked queries. No write affordance exists on any of these tabs except Quality Performance's Corrective Actions (§7.4) — a deliberate, singular exception the spec calls out explicitly.

---

## 9. Approval Workflow UI

**Vendor Approval:** reached from a Prospective supplier's profile — a prominent banner at the top of the Overview tab: `This supplier is Prospective — complete required compliance documents to enable approval.` Once minimum documents are uploaded (§7.6), an "Approve Supplier" button activates (Primary, Procurement Manager+ only). Approval opens a confirmation summary (which documents were verified, any notes) before committing.

**Supplier Verification:** folded into the same Vendor Approval flow — not a separate screen.

**Supplier Suspension:** Confirmation Dialog (reason required) — Suspended suppliers block new PO creation platform-wide (enforced in Purchase's PO creation flow, this screen surfaces the resulting status).

**Reactivation:** single-confirm dialog from a Suspended supplier's Quick Actions.

**Approval Timeline:** the same vertical-Stepper component instance used for Purchase Order's Approval Timeline and Sales Order's Status Timeline — configured with Supplier-specific stages (Prospective → Qualification → Approved → Active), not a separately built stepper.

---

## 10. Dialogs

| Dialog | Contents |
|---|---|
| **Create Supplier** | Compact form: Company Name, Contact Person, Email/Phone, Category, Country — full profile completed later on the Vendor 360 |
| **Edit Supplier** | Full field set, pre-filled |
| **Supplier Approval** | Per §9 |
| **Upload Documents** | Category picker + drag-and-drop dropzone + Expiry Date field per document |
| **Add Contract** | Per §7.2 |
| **Merge Supplier** | Same before/after preview pattern as Customer Merge — explicit confirmation, reversible undo-window notice |
| **Delete Confirmation** | Never offered for Suppliers with any RFQ/Quotation/PO history (which is nearly all of them) — Archive is the only path; the Delete action itself is omitted from the UI rather than shown-disabled, per the spec's stricter-than-usual rule here |

---

## 11. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring, including inline-editable Overview fields and masked-field reveal icons |
| Selection | Checkbox multi-select on List, Shift/Ctrl-click |
| Keyboard Navigation | Arrow-key tab switching on Vendor 360, Tab through inline-editable fields |
| Context Menu | Right-click a List row: View, Edit, Create PO, Archive |
| Quick Actions | "Create Purchase Order" kept always-visible on Supplier rows/profile (not buried in overflow), mirroring the "New Sale" precedent from Customers UI |

---

## 12. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table (List) / skeleton Summary Header + tab content (Vendor 360) |
| Empty Suppliers | New tenant: icon + "No suppliers yet" + "Add your first supplier" CTA — this state additionally blocks Purchase Order creation elsewhere in the platform until at least one supplier exists |
| No Search Results | Distinct — "No suppliers match '[query]'" + Clear filters |
| Offline | Read-only cached view; edits queue, relevant mainly for Quality Manager field visits (factory audit on a tablet) |
| Permission Denied | Standard pattern; Bank/Tax fields masked per §7.1 rather than the whole record hidden |
| Validation Error | Inline — Vendor Approval blocked with a specific missing-document list (not a generic "cannot approve") |
| Server Error | Inline retry, per-tab isolation on the Vendor 360 |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation dialog for Vendor Approval and Blacklist actions given their downstream significance |

---

## 13. Responsive Design

| Breakpoint | List | Vendor 360 |
|---|---|---|
| Desktop/Laptop | Full table, 3-up Card view | Full two-column Summary Header + full tab bar |
| Tablet | Priority columns + scroll, 2-up Card view | Condensed header, scrollable tab strip — **primary form factor for Quality Manager factory-audit field work**, per the spec's explicit note |
| Mobile Procurement View | Card-per-supplier stacked list | Slim sticky header, tabs become a dropdown selector |

---

## 14. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels (Bank/Tax PII-reveal toggles, Compliance expiry alerts), accessible forms (Contract/Compliance document entry), accessible tables (Purchase History, Payment History), WCAG AA contrast on all status/risk/rating badges — Blacklist/Watchlist banners specifically verified for contrast at both their advisory (Watchlist, Warning) and blocking (Blacklist, Error) severity levels.

---

## 15. Figma Build Notes

- Frame: `Suppliers/List/Desktop/1440`, `Suppliers/Vendor360/Desktop/1440` with per-tab nested frames
- Summary Header instances the same base component (`State=Full|Condensed`) as Product Detail and Customer 360 — the third consumer, still not rebuilt
- Rating stars component reused from wherever it's first defined in the base Design System (a small 5-star input/display variant) — not redrawn here
- Risk Assessment's gauge/radar visualization reuses the platform's gauge chart tokens (`chart-gauge-track`/`chart-gauge-fill`) established in Design Tokens §16
- Layer naming: `Suppliers/List/Row-OnHold`, `Suppliers/Vendor360/Tabs/Compliance/DocumentCard-Expired`, `Suppliers/Vendor360/Tabs/RiskAssessment/Gauge`, per convention

---

## 16. Developer Handoff Notes

- Purchase History (§7.3), Quality Performance (§7.4 excluding Corrective Actions), and Payments (§7.5) tabs must be read-only *views* querying Purchase Management's own tables filtered by supplier — this screen never duplicates that transactional data, per `15-suppliers.md` §26.
- Supplier Performance/Rating (§3/§7.8) must be one computed metrics service, consumed by this screen's Analytics tab, Purchase's Quotation Comparison recommendation, and Inventory's Replenishment supplier suggestions — never three independently calculated scores, per `15-suppliers.md` §26.
- Blacklist/Watchlist status (§7.7) must be enforced server-side at PO creation in Purchase, not merely displayed as a UI banner here — this screen's banner is a reflection of that server-side gate, not the gate itself.
- Pricing Agreements (§7.2) should be checked automatically by Purchase Order creation as the default price source for a given supplier+product combination — this UI's Contract tab is where that agreement is configured, Purchase's PO form is where it's consulted.
- Document Expiry Alerts (§7.6) should subscribe to the same notification infrastructure Inventory and Purchase already use, per `15-suppliers.md` §26 — not a bespoke supplier-specific alert channel.

---

**Next:** 16-finance-ui.md
