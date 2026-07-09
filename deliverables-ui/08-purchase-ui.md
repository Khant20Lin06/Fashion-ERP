# Purchase Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [08-purchase.md](../deliverables/08-purchase.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers Purchase Dashboard, Purchase Order List/Detail/Workflow, Goods Receipt, and the Supplier Panel surfaced in-context. RFQ/Quotation Comparison (optional path per `08-purchase.md` §3) and standalone Supplier records get concise coverage here — full Supplier 360 UI belongs to a dedicated Suppliers UI module; this document covers only the Supplier Panel as it appears embedded within a PO.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Purchase
↓
Page Header (Title + Toolbar)
↓
Purchase Dashboard (KPI strip, collapsible)
↓
Filter Bar
↓
Purchase Order List
```

Secondary tabs beneath Page Header: **Purchase Orders** (default) · **Purchase Requests** · **RFQ** · **Goods Receipts** · **Purchase Invoices** · **Supplier Returns** · **Analytics**.

---

## 2. Page Header & Toolbar

```
Purchase                                              [Import] [Export] [+ New Purchase Order]
248 open orders · ฿1.2M outstanding

[🔍 Search PO#, supplier…]  [Supplier ▾] [Warehouse ▾] [Branch ▾] [Status ▾] [Filters ▾] [Saved Views ▾]
```

---

## 3. Purchase Dashboard (Collapsible KPI Strip)

8 KPI cards (condensed variant): Total Purchase Orders · Pending Orders · Approved Orders · Received Orders · Cancelled Orders · Outstanding Amount · Monthly Purchase Value · Average Lead Time.

- Pending/Overdue-adjacent cards deep-link to the List pre-filtered
- Outstanding Amount reconciles exactly with Finance's Accounts Payable figure (per `08-purchase.md` §13/§16 cross-reference) — never an independently computed number

---

## 4. Purchase Order List

**Columns:** PO Number (Roboto Mono link) · Supplier (name + small logo) · Order Date · Expected Delivery · Warehouse · Branch · Total Amount (right-aligned, tabular-nums) · Payment Status (badge) · Delivery Status (badge) · Approval Status (badge) · Created By (avatar) · Last Updated.

**Status badge palettes:**
- Approval: Draft (`color-text-secondary`) → Pending Approval (`color-warning`) → Approved (`color-success`) → Rejected (`color-error`)
- Delivery: Not Started → Partial Delivery (`color-warning`) → Complete Delivery (`color-success`)
- Payment: Unpaid (`color-error`) → Partially Paid (`color-warning`) → Paid (`color-success`) → Overdue (`color-error`, bold)

Row overflow `⋮`: View, Edit (disabled if Issued — see §6), Duplicate, Print, Cancel. Bulk-action bar (on selection): `[Bulk Approve] [Bulk Print] [Bulk Export] [Bulk Cancel]` — Bulk Approve respects segregation-of-duties, excluding any PO the approving user themselves created (shown grayed within the selection with a tooltip explaining the exclusion, per `08-purchase.md` §18/§2).

---

## 5. Purchase Order Detail

**Header band:** PO Number (`type-headline`) + Approval/Delivery/Payment status badges inline → Supplier name (linked to Supplier Panel, §9) → Created By/Date → Quick Actions: Edit · Duplicate · Print · Cancel · **Issue PO** (Primary button, prominent, only shown while status = Draft).

**Two-column body (8 + 4 cols):**

**Left (8 cols):**
- Supplier Information card (compact — company, contact, terms; "View full profile →" opens the Supplier Panel)
- Billing Details / Shipping Details (two side-by-side sub-cards, 4 cols each within the left column)
- **Line Items table:** Product (thumbnail + name + variant), Quantity, Unit Cost, Discount, Tax, Line Total — editable while Draft, read-only once Issued (per the Document Locking rule, `08-purchase.md` §10/§25) with an "Amend" button appearing instead of inline edit affordances once Issued
- Totals summary row beneath the table: Subtotal / Discount / Tax / **Grand Total** (`type-headline`)
- Notes (rich text) · Attachments (file chip list + drag-and-drop upload zone)

**Right (4 cols):**
- Approval Timeline card (vertical stepper: Draft → Submitted → Approved/Rejected → Issued, each stage showing actor + timestamp, current stage highlighted `color-primary`)
- Goods Receipt Progress card (once Issued): line-item receipt progress bars (Received Qty / Ordered Qty per line, aggregate at top)
- Related Documents links: linked Purchase Invoice(s), linked Goods Receipt(s), linked Supplier Return(s) if any

---

## 6. Purchase Workflow UI

**Create/Edit Purchase Order:** full-page form (not modal), reusing the same Line Items table component as Detail's editable state. Header fields: Supplier (searchable select, "+ New Supplier" inline option), Warehouse, Branch, Expected Delivery (date picker), Terms (dropdown). Footer: `Save as Draft` · `Submit for Approval` (Primary) — the latter disabled until required fields + at least one line item are present.

**Submit for Approval:** transitions status, shows a confirmation toast, and — if the requesting user has direct approval authority within their own threshold — offers an inline "Approve now" shortcut rather than forcing a context switch, while still respecting segregation-of-duties (this shortcut never appears if the user is also the PO's creator above the auto-approval threshold).

**Approval Timeline** (§5's right-panel card) is the single canonical approval-history display, reused identically wherever a PO's approval state needs showing (List row expansion, Detail page, Notification deep-link).

**Reject with Reason:** dialog — required reason textarea → "Reject" button (Danger variant) → PO returns to Draft, editable by the original requester, reason visible in the Approval Timeline.

**Cancel Purchase Order:** Confirmation Dialog, standard destructive-action pattern; blocked (button disabled, tooltip explains) if any Goods Receipt already exists against this PO — cancellation must happen before physical receipt, per the spec's rule.

**Duplicate Purchase Order:** clones line items/supplier/terms into a new Draft, opens directly in Edit mode.

**Document Amendment:** once Issued, editing any locked field opens an "Amend Purchase Order" side-panel — shows old vs. new value per changed field, requires a reason, and posts as a new tracked revision (visible in a "Revision History" accordion on the Detail page) rather than a silent overwrite.

---

## 7. Goods Receipt UI

**Receive Goods screen** (reached from an Issued PO's "Receive Goods" action): full-page or large modal, line-items table with columns: Product/Variant, Ordered Qty, **Received Qty** (editable, defaults to remaining balance), Accepted Qty, Rejected Qty, Warehouse Assignment (per-line dropdown, defaults to PO's warehouse).

- **Barcode Scanning:** a scan-input field at the top of the screen auto-matches and increments the corresponding line's Received Qty — same interaction pattern as Inventory's Cycle Count and POS's barcode field
- **Over-receipt** (Received > Ordered beyond tolerance): the line highlights `color-warning`, requires an inline approval note before the receipt can be submitted
- **Partial vs. Full Receipt:** status auto-determines from the aggregate Received Qty across all lines — no manual toggle needed; a summary banner reads "Partial Receipt — 3 of 5 lines complete" or "Full Receipt — all lines complete"

**Quality Inspection (optional step, per line, if the product category requires it):** Pass / Fail / Conditional Approval segmented control per line → Photos upload (thumbnail grid) → Inspection Notes → Inspector (auto-filled, current user). Fail routes that line's Rejected Qty into the Supplier Return flow automatically (a callout appears: "2 units will be routed to Supplier Return").

**Damaged Items / Backorder Items:** surfaced as filtered views of the same Line Items table — Damaged = Rejected Qty > 0 rows, Backorder = Ordered − Received remaining rows, both accessible via tab-like toggle chips above the table rather than separate screens.

Submit action: "Complete Receipt" (Primary, disabled until every line has a disposition) — writes the Accepted Qty into Inventory's Stock Movement ledger per the spec's single-integration-point rule (never a separate stock-write path from this screen).

---

## 8. Supplier Panel (Embedded)

Slide-in Right Panel drawer (triggered from PO Detail's "View full profile →" or the Supplier column): Supplier Profile (logo, name, category, rating stars) → Contact Details → Credit Terms → Outstanding Balance (large stat, linking to Finance's AP view) → Purchase History (condensed table, last 5 POs) → Performance Score (composite gauge: on-time delivery %, quality pass rate, price competitiveness — the same figure Suppliers' own Vendor 360 displays, never recalculated here).

"View full Supplier profile →" footer link deep-links out to the dedicated Suppliers module for the complete Vendor 360 record.

---

## 9. Search Experience

Instant Search (PO#/Supplier name) · Advanced Search (structured query) · Saved Searches · Recent Searches · Filter Chips — identical component set reused from Product Management/Inventory's Search Experience.

---

## 10. Dialogs

| Dialog | Contents |
|---|---|
| **Create Purchase Order** | Not a modal — full-page form per §6 |
| **Edit Purchase Order** | Same full-page form, pre-filled; locked-field Amendment side-panel if Issued |
| **Receive Goods** | Full-page per §7 (large enough to warrant its own page rather than a modal) |
| **Supplier Selection** | Searchable list modal, triggered from the PO form's Supplier field — search + "+ New Supplier" inline quick-create |
| **Approval Request** | The shared Manager Approval component (PIN/badge or in-app Approve/Reject), requester context shown |
| **Reject Confirmation** | Per §6 |
| **Cancel Confirmation** | Standard Confirmation Dialog, disabled state explained per §6 |
| **Import Purchase Orders** | Same 3-step pattern (template → preview → validation) as Product Management's Import |
| **Export Purchase Orders** | Format + scope + column picker |

---

## 11. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring throughout, including Line Items table cells |
| Selection | Checkbox multi-select on List, Shift/Ctrl-click |
| Keyboard Navigation | Arrow-key cell traversal in Line Items table; Tab through form fields; Enter on a search result selects it |
| Context Menu | Right-click a List row: View, Edit, Duplicate, Print |
| Drag & Drop Attachments | Detail page's Attachments section accepts drag-and-drop file upload directly onto the drop zone |

---

## 12. States

| State | Treatment |
|---|---|
| Loading | Skeleton table rows / skeleton KPI cards / skeleton Detail page sections |
| Skeleton | Shape-matched per active view |
| Empty Purchase Orders | New tenant: icon + "No purchase orders yet" + "Create Purchase Request" CTA |
| No Search Results | Distinct — "No orders match '[query]'" + Clear filters |
| Approval Success | Toast + Approval Timeline updates live (no page refresh needed) |
| Approval Failed | Inline error on the Approve action if a segregation-of-duties or budget-limit check rejects it server-side — clear message ("You cannot approve a PO you created") rather than a generic failure |
| Offline | Read-only cached view; write actions (Approval, Receipt via handheld scanner) queue and sync, consistent with Inventory's offline model |
| Sync Pending | Pending-count badge near sync icon |
| Permission Denied | Standard pattern; Approve action hidden (not shown-disabled) for users without approval authority at all, shown-disabled-with-explanation for users who have authority but are blocked by segregation-of-duties on this specific PO |
| Validation Error | Inline field-adjacent errors on Create/Edit form (missing Warehouse blocks Issue, per spec) |
| Server Error | Inline retry, per-section isolation on Detail page (a failed Goods Receipt Progress fetch never blocks Line Items from displaying) |
| Retry | Consistent retry affordance |

---

## 13. Responsive Design

| Breakpoint | List / Dashboard | PO Form / Goods Receipt |
|---|---|---|
| Desktop/Laptop | Full table, side-by-side Detail layout | Full multi-step form, side-by-side line-item entry |
| Tablet | Priority columns + scroll | Full-width form; **Goods Receipt is the primary tablet flow** (warehouse receiving dock), 48px touch targets |
| Mobile Purchase View | Card-per-row stacked list | Sequential step screens; Goods Receipt prioritizes barcode-scan entry over manual typing |

---

## 14. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels (especially Goods Receipt's scan-driven controls), accessible forms (PO/Receipt/Inspection entry), accessible tables (all lists, Line Items), accessible dialogs (Approval, Reject, Cancel), WCAG AA contrast on all status badges across Approval/Delivery/Payment/Inspection states.

---

## 15. Figma Build Notes

- Frame: `Purchase/List/Desktop/1440`, `Purchase/Detail/Desktop/1440`, `Purchase/GoodsReceipt/Tablet/1024`
- PO List row, Line Items table, and Approval Timeline stepper are instances of base Table/Stepper components with Purchase-specific configuration — never rebuilt
- Approval Timeline's vertical stepper variant reuses the same Stepper base component as the horizontal Create-flow steppers elsewhere in the platform, oriented vertically via a component property, not a separate implementation
- Layer naming: `Purchase/List/Row-PendingApproval`, `Purchase/Detail/LineItems/Row`, `Purchase/GoodsReceipt/ScanInput`, per convention

---

## 16. Developer Handoff Notes

- Goods Receipt's "Complete Receipt" action must write Accepted Quantity into Inventory's existing Stock Movement ledger ([07-inventory.md](../deliverables/07-inventory.md) §7) via that module's shared write service — this screen never decrements/increments stock directly, per `08-purchase.md` §11/§27's single-integration-point rule.
- Segregation-of-duties (Bulk Approve exclusion, §4; Approval Failed messaging, §12) must be enforced server-side at the approval-transition endpoint — the UI's grayed-out/disabled treatment is a courtesy preview of a rule the server independently and always re-checks, per `08-purchase.md` §25/§27.
- Document Amendment (§6) must model the PO as an immutable revision history (original + amendments), never an in-place edit of Issued fields — mirroring the Price History pattern from Product Management.
- Three-way match validation (PO vs. Goods Receipt vs. Invoice, referenced in `08-purchase.md` §13) should be a reusable service this screen and the Purchase Invoice screen both call, not duplicated matching logic.
- Supplier Performance Score (§8) must be the identical computed figure Suppliers' own Vendor 360 and Purchase's Quotation Comparison display — this embedded panel reads from that one shared metrics service, never recalculating independently.

---

**Next:** 09-sales-ui.md
