# Inventory & Warehouse Management Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md)
**Consumed by:** POS (stock validation), Purchase, Sales, Reports, AI Analytics, Mobile Manager
**Scope note:** This module is the canonical write-owner of all stock-affecting operations. [06-product-detail.md](06-product-detail.md)'s Inventory/Transfers/Adjustments tabs are read-only *views* into records created here — this module never duplicates product-identity fields (name, SKU catalog, pricing), which remain owned by 05/06.

---

## 1. Module Objective

The single source of truth for every unit of stock, everywhere, at every moment — multi-warehouse, multi-branch, real-time, offline-tolerant, and fully auditable. If a number here disagrees with what a cashier sees at a register or what a warehouse worker counts on a shelf, that discrepancy must be traceable to a specific movement record, never a mystery.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, all warehouses/branches, valuation method configuration |
| Branch Manager | Full access scoped to their branch; can request transfers, approve branch-level adjustments |
| Warehouse Manager | Full access scoped to their warehouse(s); approves transfers/adjustments up to threshold |
| Inventory Controller | Cross-location read; create adjustments/cycle counts; no valuation method changes |
| Warehouse Staff | Execute counts, receive transfers, scan-based movement entry; no adjustment approval |
| Purchasing Officer | Read stock levels/replenishment suggestions; initiates PO from Reorder Suggestions (§14) |
| Store Manager | Branch-scoped read/write, same tier as Branch Manager but store-level only |

All write actions are additionally scoped by assigned warehouse/branch (row-level security) regardless of role tier — a Warehouse Manager for Warehouse A cannot adjust Warehouse B's stock even though the role technically permits adjustments.

---

## 3. Module Structure

```
Inventory Dashboard (§4)
↓
Stock List (§5) ──→ Warehouse Management (§6)
               ──→ Stock Movement (§7, read ledger)
               ──→ Stock Transfer (§8)
               ──→ Stock Adjustment (§9)
               ──→ Cycle Count (§10)
               ──→ Reservations (§11)
               ──→ Batch & Serial Tracking (§12)
               ──→ Inventory Valuation (§13)
               ──→ Inventory Reports (→ module 17, cross-reference)
```

---

## 4. Inventory Dashboard

Module landing page, lightweight header pattern (Dashboard §4): KPI cards — Total Inventory Value, Available Stock, Reserved Stock, Incoming Stock, Outgoing Stock, Low Stock count, Out of Stock count, Overstock count, Dead Stock count — plus Fast Moving / Slow Moving ranked mini-lists, Inventory Turnover trend, and Warehouse Utilization (gauge per warehouse).

Reuses the KPI Card and chart components verbatim from [03-dashboard.md](03-dashboard.md) §6/§15 — this is a module-scoped analytics view, not a new widget system. Filterable by Warehouse/Branch/Date Range (Dashboard §5 filter pattern).

---

## 5. Stock List

Enterprise data table (Design System §12): Product · Variant · SKU · Barcode · Warehouse · Branch · Available Qty · Reserved Qty · Incoming Qty · Outgoing Qty · Safety Stock · Reorder Level · Status (In Stock/Low/Out/Overstock badge) · Last Updated.

- **Row granularity:** one row per SKU-variant **per location** (a product stocked in 3 warehouses + 5 branches appears as up to 8 rows) — distinct from Product Management's List (05 §5), which rolls up to one row per product. Stock List is the operational, location-aware view; Product List is the catalog view.
- Toolbar: Search · Advanced Filter (§18) · Sorting · Pagination · Column Visibility · Saved Views · Bulk Actions (§17) · Export · Print — identical toolbar pattern to every other enterprise table in this platform.
- Row click opens a location-scoped stock detail drawer (Navigation §2's Right Panel) — not a full page navigation, since this is a quick-reference lookup; "View full product →" deep-links to [06-product-detail.md](06-product-detail.md) Inventory tab for the complete picture.

---

## 6. Warehouse Management

Warehouse List (table: name, location, type, manager, capacity utilization %, status) → Warehouse Detail (tabs: Overview, Zones, Bins, Staff, Capacity, Activity) → Create/Edit Warehouse → Archive Warehouse.

- **Warehouse Capacity:** overall utilization gauge plus per-Zone breakdown.
- **Warehouse Zones:** logical subdivisions (Receiving, Storage, Picking, Returns) — configurable per warehouse, used to organize Bins.
- **Warehouse Bins:** granular location codes (e.g., `A-04-B2`) assignable to specific SKU/variant stock — supports pick-list generation and physical audit accuracy; optional for smaller operations (a warehouse can operate bin-less with zone-level tracking only).
- **Warehouse Manager Assignment:** ties into the role-scoping rule in §2 — assigning a manager here is what grants their write scope.
- **Archive Warehouse:** blocked while any stock (available or reserved) remains assigned — must be zeroed out (transferred elsewhere) first; this is a hard validation, not a warning, since archiving a warehouse with live stock would orphan it.

---

## 7. Stock Movement (Ledger)

The immutable, append-only record of every stock-affecting event: Purchase Receipt · Sales Issue · Return · Transfer · Adjustment · Production · Damage · Loss · Found Stock · Manual Entry.

Each entry: Reference Number (links to source document — PO number, Sale ID, Transfer ID, Adjustment ID) · User · Timestamp · Reason · Source location · Destination location · Quantity delta · Resulting balance.

- This ledger is **read-only by nature** — no movement is ever edited or deleted after creation; a correction is itself a new movement (a reversing or adjusting entry) with a reference back to what it corrects. This is what makes §20's Audit Log trustworthy.
- Filterable/searchable table (§18), exportable, and the canonical data source that [06-product-detail.md](06-product-detail.md) §9's "Stock Movement" tab queries by product/variant.

---

## 8. Stock Transfer

Supports all four directions: Warehouse→Warehouse, Branch→Branch, Warehouse→Branch, Branch→Warehouse.

**Workflow (Stepper pattern, Navigation §15):** Transfer Request (origin, destination, line items + quantities, requested-by) → **Transfer Approval** (destination or overseeing manager approves — configurable per org, e.g., inter-warehouse transfers may auto-approve while branch-initiated requests need Branch Manager sign-off) → **Transfer Dispatch** (origin marks as shipped, decrements origin Available Stock, increments an "in-transit" state — not yet added to destination) → **Transfer Receiving** (destination confirms receipt, quantities reconciled against dispatched amounts — a Damage/Loss variance here creates a linked Adjustment, §9) → complete.

- **Transfer Cancellation:** permitted only before Dispatch; once dispatched, a discrepancy must be resolved via receiving-variance (above), never a silent cancel, since stock has physically left the origin.
- **Transfer Tracking:** status badge (Requested/Approved/Dispatched/In Transit/Received/Cancelled) visible on the Transfer List and cross-linked from [06-product-detail.md](06-product-detail.md) §15.
- This is the canonical write-owner that Product Detail's Transfers tab and the Dashboard's "Upcoming Deliveries" widget both read from.

---

## 9. Stock Adjustment

Increase Stock · Decrease Stock · Inventory Correction, with Reason required from a fixed set: Damage · Expired · Lost · Found · Shrinkage · Correction · Other.

- **Adjustment Approval:** adjustments below a configurable quantity/value threshold self-apply (e.g., Warehouse Staff correcting a 1-unit miscount); above threshold requires Manager/Warehouse Manager approval — mirrors the Manager Override pattern established in [04-pos.md](04-pos.md) §24, reused here rather than reinvented.
- **Adjustment History:** every adjustment is a Stock Movement entry (§7) by construction — there is no separate adjustment data store, only a specialized creation form that writes to the same ledger.
- This is the canonical write-owner for [06-product-detail.md](06-product-detail.md) §16's Adjustments tab.

---

## 10. Cycle Count

Scheduled Count (recurring, e.g., monthly per zone) · Random Count (system-selected sample, statistically weighted toward high-value/high-velocity SKUs) · Blind Count (counter doesn't see expected system quantity while counting, reduces bias toward confirming the existing number) · Full Count (entire warehouse/branch) · Partial Count (zone/category-scoped).

**Workflow:** Count scheduled/initiated → count sheet generated (by zone/bin if configured, §6) → Warehouse Staff enters counted quantities (barcode-scan-driven where possible) → system generates a **Variance Report** (expected vs. counted, flagged by variance % and value) → **Approval Workflow** (variances above threshold require Inventory Controller/Manager review before the count posts as adjustments) → on approval, each variance line becomes a Stock Adjustment (§9) with Reason="Correction," linked to the Count ID.

**Count History:** archive of past counts with variance trends over time — a location with recurring high variance is itself a signal surfaced in Analytics (§15) as a shrinkage/process risk.

---

## 11. Inventory Reservation

Reserved Qty is held against: Sales Orders · POS Hold (linked to [04-pos.md](04-pos.md) §18's Hold Sale) · Online Orders (E-commerce module 23) · Customer Orders (special/custom orders) · Transfers (in-transit stock is reserved at destination once dispatched) · Production (composite/bundle component consumption, 05 §6).

Display per reservation: Reserved Qty · Reservation Source (which of the above, with a link to the source record) · Reservation Expiry (e.g., a POS Hold auto-releases after a configurable idle period; an Online Order reservation releases if payment isn't captured within a window).

- Reservation expiry is a background process, not a manual task — expired reservations automatically release back to Available Stock with a Stock Movement entry (Reason: "Reservation Released"), visible in the Activity Timeline (§19).
- This is what POS's Available Stock figure and Product Detail's "Reserved Stock" stat both read from — one reservation engine, multiple consumers.

---

## 12. Batch & Serial Tracking

Batch Number (lot-level tracking — relevant for cosmetics/accessories lines with expiry, less common for core apparel but supported per-product via the Track Batch toggle, 05 §10) · Serial Number (unit-level tracking for high-value items, e.g., designer bags, watches) · Manufacturing Date · Expiry Date · Warranty (linked to Serial).

- **Batch History / Serial History:** full movement trail scoped to a specific batch/serial, reusing the Stock Movement ledger (§7) filtered to that identifier.
- **Batch Transfer:** transfers (§8) carry batch/serial identity through — a transferred unit doesn't lose its traceability.
- **Serial Lookup:** dedicated quick-search (by serial number) surfaced in both this module and as a POS Stock Check mode (04 §18) for warranty/authenticity verification at the register.
- Expiring batches feed the Inventory Alerts (§16) "Expiring Stock" category.

---

## 13. Inventory Valuation

Supported methods: FIFO · Weighted Average · Standard Cost — selected at the company level (Super Admin/Owner only, §2), applied consistently across all locations for reporting integrity (mixing valuation methods across branches would make consolidated financial reporting meaningless).

Display: Inventory Value (by warehouse/branch/category, drill-down) · Cost History (tied to Purchase receipts, module 08) · Margin (Value at cost vs. potential retail value) · Valuation Report (exportable, feeds Finance module 16's balance sheet inventory line).

Valuation recalculates on every Purchase Receipt, Adjustment, and Transfer — never a manual nightly batch as the only source, since Finance may need an accurate up-to-the-minute figure (e.g., for an intra-month audit).

---

## 14. Replenishment

Reorder Suggestions (any SKU-location below Reorder Level, ranked by urgency = days-of-stock-remaining) · Safety Stock Alerts · Purchase Recommendations (suggested quantity based on reorder-to-max logic or AI forecast) · Inter-Branch Transfer Suggestions (when Branch A is low but Branch B has surplus — suggests a transfer instead of a new purchase, cost-optimal) · AI Demand Forecast Integration (module 25, surfaced here as the suggested-quantity basis rather than a static reorder formula alone).

Each suggestion has a direct action: "Create Purchase Order" (pre-fills module 08 with supplier from [06-product-detail.md](06-product-detail.md) §12's Primary Supplier) or "Create Transfer Request" (§8, pre-filled) — suggestions are actionable, not just informational.

---

## 15. Inventory Analytics

Stock Aging · ABC Analysis (revenue-contribution tiering) · XYZ Analysis (demand-variability tiering, pairs with ABC for a combined ABC-XYZ matrix view) · Inventory Turnover · Fast Moving / Slow Moving / Dead Stock · Shrinkage Analysis (aggregates Adjustment Reason="Shrinkage"/"Loss"/"Damage" over time, by location — surfaces process/loss-prevention risk) · Warehouse Performance (throughput, count accuracy from §10's history, utilization) · Branch Comparison.

Same chart/table components as Dashboard (§15) and Product Detail's Analytics tab (06 §19) — this module's Analytics is the cross-product, cross-location rollup; Product Detail's is the single-product drill-down.

---

## 16. Inventory Alerts

Generated for: Low Stock · Out of Stock · Negative Stock (should never occur given §18's validation — its presence is itself a data-integrity alert, escalated distinctly from a normal low-stock alert) · Overstock · Expiring Stock (§12) · Damaged Stock · Transfer Delays (a Transfer stuck In Transit past expected duration) · Inventory Discrepancies (unresolved Cycle Count variances, §10).

Feeds the Notification Center (Navigation §13, Inventory category) and the Dashboard's Alert Center (03 §14) — alerts are generated once, centrally, and surfaced in both places, not duplicated logic per surface.

---

## 17. Bulk Operations

Bulk Adjustment (multi-SKU, single Reason, e.g., a warehouse-wide damage event) · Bulk Transfer (multi-line transfer request, §8) · Bulk Status Update · Bulk Warehouse Assignment (reassigning a set of SKUs' default warehouse) · Bulk Export · Bulk Import (initial stock load for a new warehouse/branch launch).

Follows the same preview-before-commit and async-for-large-sets rules established in [05-product-management.md](05-product-management.md) §13 — every bulk action shows exactly what will change before applying, and bulk adjustments above the approval threshold (§9) still route through approval even in bulk, not bypass it.

---

## 18. Search & Filter

Warehouse · Branch · Category · Brand · Supplier · Product · Variant · Batch · Serial · Status · Date Range · Stock Level (range/preset). Same combinable filter+chip+Saved View pattern as [05-product-management.md](05-product-management.md) §15, applied to the Stock List (§5) and Stock Movement ledger (§7).

**Validation note (shared with 06 §23):** the system enforces stock can never go negative at the write layer (hard block, not a warning) — this is what makes the "Negative Stock" alert (§16) a true anomaly signal rather than routine noise.

---

## 19. Activity Timeline

Human-readable event stream, module-wide (not product-scoped like 06 §20's Timeline): Stock Received · Stock Sold · Transfer Completed · Adjustment Approved · Reservation Created · Reservation Released · Inventory Count (completed) · Warehouse Changes.

Same component and generation pattern as every other Activity Timeline in the platform (Dashboard §13, Product Detail §20) — filterable by location/category, links out to the source record.

---

## 20. Audit Log

User · Action · Old Value · New Value · Timestamp · Reference Document · Approval Status. Generated from the same event stream as §19 (per the shared-source rule established in [06-product-detail.md](06-product-detail.md) §29), rendered at full forensic detail, restricted to management roles per §2.

---

## 21. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table (Stock List/Movement) or skeleton KPI cards (Dashboard) |
| Skeleton | Shape-matched per view, per Design System §17 |
| No Inventory | New warehouse/branch with zero stock: icon + "No stock recorded yet" + "Receive stock" / "Bulk Import" CTAs |
| No Warehouse | First-time setup: "No warehouses configured" + "Create your first warehouse" CTA — blocks most of the module until at least one exists, since stock cannot exist without a location |
| No Transfers | Neutral empty state, common in small single-location operations — not an error |
| Offline | Store-level inventory views (relevant to Branch/Store Manager on a store device) show last-synced data with staleness indicator, consistent with POS's offline model (04 §15); write actions queue and sync |
| Permission Denied | Standard Navigation §19 pattern; Audit Log additionally fully hidden per §2 |
| Server Error | Inline retry, per-widget isolation on the Dashboard (mirrors 03 §16) |
| Sync Failed | Distinct from generic Server Error — surfaces via the same Sync Status treatment as POS (04 §15), since inventory sync failures directly risk oversell |
| Retry | Consistent retry affordance across all of the above |

---

## 22. Responsive Design

| Breakpoint | Stock List / Movement Ledger | Transfer / Adjustment / Count Forms |
|---|---|---|
| Desktop/Laptop | Full table, all columns available via visibility toggle | Full Stepper, side-by-side line-item entry |
| Tablet | Priority columns + horizontal scroll (Design System §19) — this is the primary form factor for Warehouse Staff doing counts/receiving on the floor | Full-width Stepper, large touch targets (matches POS's 48px touch rule, 04 §22) since counting/receiving happens on handheld devices |
| Mobile | Card-per-row stacked list | Sequential step-by-step screens, barcode-scan-driven entry prioritized over manual typing |

Cycle Count (§10) and Transfer Receiving (§8) are explicitly touch/handheld-optimized flows — warehouse floor work mirrors the POS module's tablet-first justification.

---

## 23. Accessibility

Standard baseline (Design System §20): keyboard navigation, visible focus, accessible tables (Stock List, Movement Ledger, Variance Reports all use proper header scope + sort-state announcement), accessible forms (Transfer/Adjustment/Count entry — labeled fields, `aria-describedby` errors), screen reader labels on all icon/scan-driven controls, WCAG AA contrast on all status badges (In Stock/Low/Out/Overstock, Transfer status, Count variance severity).

---

## 24. Security

Role Permission and location-scoping per §2. **Approval Workflow** reused consistently across Adjustments (§9), Cycle Count variances (§10), and Bulk Adjustments (§17) — one shared approval component, per the pattern established in POS (04 §24) and Product Management (05 §23). **Inventory Lock:** a location/SKU can be temporarily locked (no movements permitted) during an active Full Cycle Count to prevent concurrent sales/transfers from corrupting the count — POS and Transfer flows must respect this lock and surface a clear "Stock count in progress" message rather than silently failing. **Audit Trail:** immutable per §20. **Sensitive Action Confirmation:** required for Warehouse Archive, valuation method changes, and any Bulk Adjustment/Transfer.

---

## 25. Performance

Designed for millions of stock transactions and large warehouse networks: Stock Movement ledger (§7) is append-only and indexed by SKU/location/date for fast lookup without scanning full history. Stock List (§5) and Movement Ledger virtualize rows (windowed rendering, consistent with 05 §22). Reorder Suggestions (§14) and Analytics (§15) aggregate via precomputed/incrementally-updated rollups rather than full-table scans on every dashboard load. Filtering (§18) is server-side indexed, matching the back-office search approach established in Product Management (05 §22) rather than POS's client-cache approach, since Inventory prioritizes always-current data over offline browsing depth.

---

## 26. Developer Implementation Notes

- Stock Movement (§7) is the single append-only ledger table underlying Purchase Receipts, Sales Issues, Returns, Transfers, Adjustments, and Cycle Count corrections — every other "history" view in this module and in Product Detail (06) is a filtered query over this one table, never a separate write path.
- Available Stock is a derived value (`On-Hand − Reserved`), never stored redundantly — Reservation (§11) and Movement (§7) are the only two write surfaces that affect it, preventing drift between what POS shows and what this module shows.
- Transfer (§8) and Adjustment (§9) approval thresholds, and Cycle Count variance thresholds (§10), should read from one shared "approval rules" config, consistent with the reusable Manager Override component pattern from [04-pos.md](04-pos.md) §24 — new threshold types shouldn't require new approval UI.
- Reservation expiry (§11) must run as a reliable background job independent of any user session — an idle POS Hold or abandoned online cart must release stock even if no one ever reopens that screen.
- Negative-stock prevention (§18) belongs at the data-write layer (transaction-level check), not only in UI validation — client-side checks are a UX nicety, the hard guarantee must be server-enforced given concurrent writes from POS, Transfers, and this module simultaneously.

---

**Next:** 08-purchase.md
