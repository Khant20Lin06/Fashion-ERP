# Inventory Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [07-inventory.md](../deliverables/07-inventory.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers the Stock List, Inventory Dashboard, Stock Movement ledger, Transfer/Adjustment/Cycle Count flows, per `07-inventory.md`'s module structure. Warehouse Management (§6 there) and Batch/Serial Tracking (§12) get concise coverage here since their primary interaction surfaces (configuration forms, lookup panels) reuse patterns already fully specified elsewhere in this UI set.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Inventory
↓
Page Header (Title + Toolbar)
↓
Inventory Dashboard (KPI strip, collapsible)
↓
Filter Bar (Warehouse/Branch selectors prominent, left-most)
↓
Stock List (Table / Card / Compact view)
```

Secondary nav (Tabs, per Navigation §6) beneath the Page Header for: **Stock List** (default) · **Warehouses** · **Movement Ledger** · **Transfers** · **Adjustments** · **Cycle Count** · **Reservations** · **Valuation** — this module's IA is tab-organized rather than a single flat list, given the breadth established in `07-inventory.md` §3.

---

## 2. Page Header & Toolbar

```
Inventory                                        [Import] [Export] [+ Stock Adjustment ▾]
Real-time stock across 4 warehouses, 12 branches                                (▾ opens: Adjustment / Transfer / Receive)

[🔍 Search product, SKU, barcode…]  [Warehouse ▾] [Branch ▾] [Filters ▾] [Saved Views ▾]     [⚏][▦][☰]
```

- "+ Stock Adjustment" is a split/dropdown button (Design System §10) — default action is Stock Adjustment, dropdown reveals Transfer and Receive as alternates, avoiding three separate primary buttons competing for attention
- Warehouse/Branch selectors are pinned first in the filter row (left of the generic Filters dropdown) given their structural importance to every subsequent view on this screen

---

## 3. Inventory Dashboard (Collapsible KPI Strip)

10 KPI cards (condensed variant, 88px height, per Dashboard-UI's precedent): Total Products · Total Stock · Available Stock · Reserved Stock · Incoming Stock · Low Stock · Out of Stock · Inventory Value · Damaged Items · Returned Items.

- Low Stock / Out of Stock / Damaged Items cards render their numeral in `color-warning`/`color-error`/`color-error` respectively (value itself, not just trend — consistent with the Dashboard module's stock-alert color rule)
- Each card deep-links to the Stock List below, pre-filtered to that status
- Horizontal scroll on narrower widths, same interaction pattern as the Dashboard module's KPI row

---

## 4. Stock List — Table View (Default)

**Row granularity: one row per SKU-variant per location** (per `07-inventory.md` §5 — distinct from Product Management's per-product rollup).

**Default columns:** Product (thumbnail + name, 2-line clamp) · Variant (color/size chip) · SKU · Warehouse · Branch · Available Qty (right-aligned, tabular-nums, color-coded) · Reserved Qty · Incoming Qty · Reorder Level · Status (badge) · Last Updated.

**Columns available via menu:** Barcode, Unit Cost, Inventory Value, Outgoing Qty, Safety Stock.

**Row anatomy:**
```
☐  [img]  Denim Jacket          Blue/M     DJ-001-BLU-M   Main WH    Branch 3   142      8        20        50    [● Healthy]   2h ago   ⋮
```

- Status badge: `● Healthy` (`color-success`), `● Low Stock` (`color-warning`), `● Out of Stock` (`color-error`), `● Overstock` (`color-info`)
- Row overflow `⋮`: View in Product Detail, Adjust Stock, Transfer, View Movement History
- Row click opens a **Right Panel drawer** (Navigation §2's Right Panel pattern), not a full page navigation — quick-reference stock detail for this location; drawer footer includes "View full product →" deep-linking to Product Detail's Inventory tab

**Toolbar row:** bulk-select checkbox · Column visibility · Density toggle · Export · Print.

**Bulk-action bar** (on selection): `✓ N selected` → `[Bulk Adjust] [Bulk Transfer] [Bulk Warehouse Assignment] [Export]` → `[Clear]`.

---

## 5. Stock List — Card & Compact Views

**Card View:** 4-up grid, each card showing thumbnail, product name, variant chip, warehouse/branch, Available Qty (large, color-coded), status badge, overflow menu — mirrors Product Management's Card View anatomy for visual consistency across the platform's list screens.

**Compact View:** 36px dense rows, columns limited to Product/Variant/Location/Available/Status — the primary view for Warehouse Staff triaging a long location list quickly.

---

## 6. Warehouses Tab

**Warehouse List** (table): Name, Location, Type (Main/Branch/Transit/Virtual — badge), Manager, Capacity Utilization (inline progress bar, color-coded by fill %), Status.

**Warehouse Detail** (drill-in, reuses the Product Detail's Summary-Header-+-Tabs pattern at a smaller scale): Overview / Zones / Bins / Staff / Capacity / Activity sub-tabs. Zones rendered as an expandable tree (Zone → Bins), Capacity as a large radial gauge + per-Zone breakdown bars.

"+ Create Warehouse" button opens a form dialog: Name, Location, Type, Manager assignment, initial Zone configuration (optional, skippable for bin-less operation per the spec's flexibility rule).

---

## 7. Movement Ledger Tab

Read-only, append-only table (per `07-inventory.md` §7's immutability rule — no edit/delete affordance anywhere on this screen):

| Timestamp | Type | Product/Variant | Location | Reference | Qty Δ | Balance | User |
|---|---|---|---|---|---|---|---|

- **Type** badge: Purchase Receipt / Sales Issue / Return / Transfer / Adjustment / Production / Damage / Loss / Found Stock / Manual Entry — each a distinct color-coded chip from the platform's neutral badge palette (not overloading Success/Warning/Error semantics onto what's simply a category label)
- **Qty Δ:** signed, `color-success` green for positive, `color-error` red for negative, Roboto Mono tabular-nums
- **Reference:** clickable deep-link to the source document (Sale, PO, Transfer, Adjustment record)
- Filterable by all standard dimensions (§9); exportable; no bulk actions (nothing here is meant to be bulk-edited, only viewed/exported)

---

## 8. Transfers Tab

**List view:** Transfer ID, From → To (with a small directional arrow icon between location chips), Line item count, Status badge (Requested/Approved/Dispatched/In Transit/Received/Cancelled — progressive color: neutral → `color-info` → `color-primary` → `color-success`), Requested By, Date.

**Transfer Detail / Create Transfer (Stepper, full-page or large modal):**

`1 Request` → `2 Approval` → `3 Dispatch` → `4 Receiving`

- **Step 1 — Request:** Source location, Destination location (two Dropdowns side-by-side with the directional arrow between), Line Items table (Product search-to-add row, Quantity per line), Notes.
- **Step 2 — Approval:** read-only summary + Approve/Reject action (shared Approval component) — only rendered for users in the approver role; requesters see a "Pending Approval" status card instead
- **Step 3 — Dispatch:** Line items with a "Dispatched Qty" column (defaults to requested, editable for partial dispatch), "Mark as Dispatched" button — decrements origin stock and flags destination as in-transit
- **Step 4 — Receiving:** Line items with "Received Qty" column (barcode-scan-driven entry supported — a scan field at the top of the step auto-increments the matching line's Received Qty), any variance auto-generates a linked Adjustment (shown inline as a callout: "Variance detected — will create a Damage/Loss adjustment")

Cancel only available before Step 3 completes, per the spec's rule against silent post-dispatch cancellation.

---

## 9. Adjustments Tab

**List view:** Date, Product/Variant, Location, Qty Δ, Reason badge (Damage/Expired/Lost/Found/Shrinkage/Correction/Other), User, Approval Status badge (Auto-Applied / Pending Approval / Approved).

**Create Adjustment (dialog):** Product/Variant search-select → Location → Increase/Decrease toggle → Quantity input → Reason dropdown (required) → Notes → live preview "New balance will be: 134" → Submit button label changes to "Submit for Approval" if the entered value/quantity exceeds the configured self-apply threshold, otherwise "Apply Adjustment" — the button label itself communicates which path will occur before the user commits.

---

## 10. Cycle Count Tab

**Count List:** Count ID, Type badge (Scheduled/Random/Blind/Full/Partial), Location scope, Status (In Progress/Pending Review/Completed), Variance % (color-coded), Date.

**Count Execution screen** (tablet/handheld-optimized, the primary device context per the spec's warehouse-floor note): full-screen, minimal chrome —

```
Count: Main WH — Zone A                          [Pause] [Finish Count]
Progress: 42 / 68 items counted

[Scan or search item…]

Denim Jacket — Blue/M          Expected: 20     [Counted: __]  ← focused, large numeric input
```

- Barcode scan auto-populates the item row and focuses the Counted input
- **Blind Count mode:** Expected quantity is hidden entirely during entry (shown only in the post-count Variance Report) — a distinct UI mode toggle set at count creation, not a per-item hide
- Large touch targets (48px+, matching POS's touch-target exception) throughout this specific screen given its handheld/tablet primary context

**Variance Report (post-count):** table of Product/Variant, Expected, Counted, Variance (qty + %, color-coded), flagged rows (variance beyond threshold) highlighted with a `color-warning` left-border. "Approve & Post Adjustments" button (shared Approval component gate) converts each variance line into a linked Adjustment.

---

## 11. Reservations Tab

Table: Product/Variant, Location, Reserved Qty, Source (badge: Sales Order/POS Hold/Online Order/Customer Order/Transfer/Production, each linking to its source record), Expiry (countdown or date), Status. No manual "release" action needed in most rows — a "Release Reservation" quick action is available for exception handling (e.g., a stuck/orphaned reservation), opening a confirmation dialog before releasing back to Available.

---

## 12. Valuation Tab

Summary cards (Inventory Value by Warehouse/Branch/Category, drill-down bar charts) → Valuation Method indicator (FIFO/Weighted Average/Standard Cost, read-only display — changed only in Settings) → Cost History table → exportable Valuation Report button.

---

## 13. Low Stock Management (Surfaced within Stock List filter + a dedicated view)

Accessible via the "Low Stock" KPI card (§3) or a dedicated filter preset. Adds two extra columns when this filter is active: **Reorder Suggestion** (suggested quantity) and a row-level **"Create PO"** / **"Create Transfer"** quick-action pair (per `07-inventory.md` §14's actionable-suggestion rule) — replacing the standard overflow menu's generic actions with these two direct, high-frequency ones for this specific filtered context.

---

## 14. Dialogs

| Dialog | Contents |
|---|---|
| **Stock Adjustment** | Per §9 — same content whether opened from the tab's "+ Create" or a row's quick action, pre-filled with context when triggered from a row |
| **Stock Transfer** | Opens the full Stepper (§8) as a large modal or navigates to a dedicated page — same component either way |
| **Inventory Count** | Count creation form: Type, Location scope, Scheduled date (if applicable), Blind Count toggle → "Start Count" launches the Execution screen (§10) |
| **Reservation** | Manual reservation creation (rare, exception path): Product/Variant, Quantity, Source reason, Expiry |
| **Release Reservation** | Single confirm: "Release 5 units back to Available Stock?" |
| **Import Inventory** | Same 3-step pattern as Product Management's Import (template → preview → validation report), scoped to initial stock load |
| **Export Inventory** | Format + scope + column picker, same pattern as Product Management's Export |
| **Delete Confirmation** | Reserved for Warehouse deletion only (blocked entirely while stock remains assigned, per the spec's hard validation — dialog explains this rather than allowing the attempt) |

---

## 15. Search Experience

Instant Search (debounced, matches product/SKU/barcode) · **Barcode Search** (dedicated scan-input mode, same interaction as POS's barcode field — auto-submits on scan-terminator) · Advanced Search (structured query builder) · Recent/Saved Searches · Filter Chips — identical component set to Product Management's Search Experience, reused rather than rebuilt.

---

## 16. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring |
| Selection | Checkbox multi-select, Shift/Ctrl-click |
| Keyboard Navigation | Arrow-key cell traversal in tables; Tab through Stepper/dialog fields |
| Context Menu | Right-click a Stock List row: Adjust, Transfer, View Movement History |
| Multi Select | Bulk-action bar per §4 |
| Drag & Drop | Not used for stock operations (deliberately — reordering/dragging stock quantities would be error-prone for a financially significant number); used only for Warehouse Zone/Bin tree reorganization in Warehouse Detail (§6) |

---

## 17. States

| State | Treatment |
|---|---|
| Loading | Skeleton table rows / skeleton KPI cards |
| Skeleton | Shape-matched per active view |
| Empty Inventory | New warehouse/branch: icon + "No stock recorded yet" + "Receive Stock" / "Bulk Import" dual CTAs |
| No Search Results | Distinct from Empty Inventory — "No items match '[query]'" + Clear filters |
| Offline | Store-device views (Branch/Store Manager checking stock) show cached data + staleness banner; write actions (adjustments, transfer receiving) queue and sync, consistent with POS's offline model |
| Sync Pending | Small pending-count badge near the page's sync/refresh icon |
| Permission Denied | Standard pattern; Valuation method configuration hidden entirely for non-Owner/Admin roles |
| Validation Error | Inline, field-adjacent — e.g., Adjustment quantity that would push stock negative is hard-blocked at the field with an inline error, never a submit-time surprise |
| Server Error | Inline retry, per-tab isolation (a failed Valuation fetch never blocks the Stock List) |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves (adjustment applied); a dedicated Success Dialog for Transfer completion and Cycle Count posting, given their downstream stock-affecting significance |

---

## 18. Responsive Design

| Breakpoint | Stock List / Movement Ledger | Transfer / Adjustment / Count Forms |
|---|---|---|
| Desktop/Laptop | Full table, all columns via visibility toggle | Full Stepper, side-by-side line-item entry |
| Tablet | Priority columns + horizontal scroll | Full-width Stepper, 48px touch targets — **primary form factor for Warehouse Staff floor work**, per the spec's explicit tablet-first note for Cycle Count/Transfer Receiving |
| Mobile Inventory View | Card-per-row stacked list | Sequential step screens, barcode-scan entry prioritized over manual typing |

---

## 19. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels on scan-driven controls, accessible tables (`<th scope>`, sort-state announcement) across Stock List/Movement Ledger/Variance Reports, accessible forms (Transfer/Adjustment/Count entry — labeled, `aria-describedby` errors), WCAG AA contrast on all status badges (stock health, transfer status, count variance severity).

---

## 20. Figma Build Notes

- Frame: `Inventory/StockList/Desktop/1440`, `Inventory/Transfer/Step1-Request`, `Inventory/CycleCount/Execution-Tablet`, per screen/step
- Stock List row, Movement Ledger row, and every dialog are instances of the base Table Row / Dialog components with Inventory-specific column/field configuration — never rebuilt
- Cycle Count Execution screen is a distinct, minimal-chrome frame variant (no Sidebar/Top Header) given its handheld/floor-work context — same underlying app shell components, configured to `Chrome=Minimal`
- Layer naming: `Inventory/StockList/Row-LowStock`, `Inventory/Transfer/Stepper/Step3-Dispatch`, `Inventory/CycleCount/VarianceReport/Row-Flagged`, per convention

---

## 21. Developer Handoff Notes

- Every screen here reads/writes through Inventory's single append-only Stock Movement ledger and the derived-value Available Stock formula (`On-Hand − Reserved`) specified in `07-inventory.md` §7/§26 — no UI state here should locally compute or cache a stock balance independently of that source.
- Reservation expiry (§11) is a background process; this UI never needs a "check and expire" client-side timer — it simply reflects whatever state the server reports.
- Cycle Count's Blind Count mode (§10) must genuinely withhold Expected quantity from the client payload during entry, not just visually hide a value already present in the DOM — a client-side-only hide would be trivially defeatable and undermine the whole point of blind counting.
- Transfer's Step 3→4 variance-to-Adjustment linkage (§8) and Cycle Count's Variance Report→Adjustment linkage (§10) both write through the same Adjustment-creation service used by the standalone Adjustments tab (§9) — never a parallel adjustment-creation path for these two triggering contexts.
- Negative-stock prevention (§17's Validation Error) must be enforced server-side at the transaction-write layer, not only as this UI's client-side field validation — per `07-inventory.md` §18/§26's explicit warning about concurrent writes from POS, Transfers, and this module simultaneously.

---

**Next:** 08-purchase-ui.md
