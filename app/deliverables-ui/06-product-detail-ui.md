# Product Detail — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [06-product-detail.md](../deliverables/06-product-detail.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** `06-product-detail.md` §6 defines 17 tabs (Overview, Variants, Inventory, Pricing, Media, Suppliers, Purchase History, Sales History, Transfers, Adjustments, Returns, Promotions, Analytics, Activity Timeline, Audit Log, Documents, Settings). This UI prompt names a 9-tab subset — that subset is given the fullest pixel-level treatment below, and the remaining 8 tabs (Media retitled "Images" here, Suppliers, Transfers, Adjustments, Returns, Promotions, Analytics, Audit Log, Settings) are specified at the same rigor but more concisely, since tab count/structure is fixed business architecture from the approved spec, not something the UI phase may trim.

---

## 1. Screen Anatomy

```
Top Header (64px) → Sidebar (264px) → Breadcrumb: Dashboard > Products > Product List > Denim Jacket
↓
Product Summary Header (sticky, condenses on scroll)
↓
Tabs Bar (sticky beneath Summary Header)
↓
Tab Content Area (12-col grid within content region)
```

Content region margin `space-6`; the Summary Header + Tabs together form a persistent `elevation-1` band once page content scrolls beneath them, per `06-product-detail.md` §3.

---

## 2. Product Summary Header

**Full state (top of page):**
```
┌──────┐  Denim Jacket — Classic Fit               [● Published]        [Edit] [⋮]
│ Image │  SKU: DJ-001   Barcode: 8901234567890 [QR icon]
│ 80px  │  Levi's · Outerwear · Fall/Winter 2025
└──────┘                                                        ฿1,350          142 / 8 / 134
                                                                  Retail Price    Total/Reserved/Available
                                                                                  Warehouse: Main · Supplier: Levi's Co.
                                                                                  Created: Jan 3, 2025 · Updated: 2h ago
```

- Left cluster: 80px thumbnail (`radius-md`) → Name (`type-headline`) + Status badge inline → SKU/Barcode row (`type-body-small`, Roboto Mono for SKU/Barcode, small QR icon button opens an enlarge/print popover) → Brand · Category · Collection · Season metadata row (`type-caption`, `color-text-secondary`, `·` separators)
- Right cluster: Retail Price (`type-title`) with Cost Price shown beneath in `type-caption` only to roles permitted (per field-level permission rule) → three-part stock stat (Total/Reserved/Available, Available in bold `color-text-primary`, others `color-text-secondary`) → Warehouse/Supplier compact line → Created/Updated dates
- **Quick Actions row** (top-right): Edit (Primary, Outlined variant) + `⋮` overflow (Duplicate, Archive, Publish/Unpublish, Deactivate, Print Label, Generate Barcode, Generate QR, Export, Delete) — Delete only enabled if zero transaction history, per the spec's rule

**Condensed state (on scroll):** collapses to a 56px slim bar — 32px thumbnail + Name + Status badge + the same Quick Actions cluster, everything else hidden until scrolled back to top.

---

## 3. Tabs Bar

Standard Tabs component (Design System §15), underline-indicator style. Full 17-tab order: **Overview · Variants · Inventory · Pricing · Media (Images) · Suppliers · Purchase History · Sales History · Transfers · Adjustments · Returns · Promotions · Analytics · Activity Timeline · Audit Log · Documents · Settings.**

- First 5–6 tabs visible inline (width-dependent); remainder collapse into a "More ▾" dropdown at the end of the tab strip
- Always-visible regardless of overflow: **Overview, Variants, Inventory, Pricing, Sales History** (the platform's most-visited tabs per the spec's own priority rule)
- Last-visited tab persists per product per session (returning to this product later reopens the same tab)
- Audit Log tab is entirely omitted from the strip for roles without management access (never shown-disabled)

---

## 4. Overview Tab

Two-column layout (8-col + 4-col within the 12-col grid):

**Left (8 cols):** Description (rich-text rendered, `type-body`, max-width 80ch per Design System §4's line-length rule) → Tags (chip row) → structured field grid below (2-col sub-grid): Collections, Season, Gender, Age Group, Material, Fabric, Style, Pattern, Care Instructions, Country of Origin.

**Right (4 cols):** SEO Information card (Meta Title, Meta Description, Slug — read/edit fields) → Internal Notes card (`color-warning` left-border accent if notes exist, plain text otherwise).

Every field inline-editable (click-to-edit pattern: field renders as static text until clicked, then becomes an input with Save/Cancel affordances) rather than requiring a full Edit-mode toggle for the whole tab.

---

## 5. Variants Tab

**Toggle row (top):** `Color Matrix` / `Size Matrix` segmented control — switches the grid's row/column grouping axis.

**Variant Matrix grid** (same component instance as Product Management's Create-flow Step 2, per `06-product-detail.md` §8): rows = variant combinations, columns = Thumbnail (32px, click to reassign from gallery) · SKU · Barcode · Price · Stock (inline-editable numeral, stepper on focus) · Status (toggle switch) · trailing overflow (Print Label, Deactivate this variant only).

- Column header for Stock includes a small legend: `color-success` text if healthy, `color-warning` if at/below reorder level, `color-error` if zero
- Multi-select checkboxes → bulk-update mini-bar identical in pattern to Product Management's List bulk-action bar (§5 there)
- "+ Add Variant" button, top-right of the grid, opens the Add Variant dialog (§13)

---

## 6. Inventory Tab

Read-heavy layout (per spec: this tab surfaces state, doesn't move stock):

**Top row (3 stat cards, 4 cols each):** Warehouse Stock breakdown (mini table: warehouse name → qty) · Branch Stock breakdown · Reserved/Incoming/Outgoing Stock (3-line stat card, each line linking to its source — Incoming links to the open PO, Outgoing links to the pending Transfer).

**Below:** Stock Movement ledger — a scrollable table (Timestamp, Type badge [Sale/Return/Transfer/Adjustment/Purchase], Quantity Δ [signed, color-coded + green / − red], Resulting Balance, Reference link, User) — every row's Reference is a clickable deep-link to the source Sale/PO/Transfer/Adjustment record in its owning module.

**Bottom row:** Inventory Valuation (by warehouse/branch, small bar chart) + Stock Aging (bucketed bar chart: 0-30/31-60/61-90/90+ days).

"View in Inventory →" link, top-right of the tab, deep-links to the full Inventory module scoped to this SKU.

---

## 7. Pricing Tab

Field grid (2-col): Cost Price, Retail Price, Wholesale Price, VIP Price, Promotion Price (read-only, sourced from active Promotions — shows "No active promotion" if none), Tax. **Branch Price** rendered as its own mini-table below the grid (Branch name → override price, "+ Add Branch Override" row).

**Margin/Markup card** (right-aligned, 4-col): live-calculated as Cost/Retail are edited — `type-headline` percentage + a small horizontal bar visualizing margin against a configured healthy-range band (`color-success` zone) vs. below-threshold (`color-warning` zone).

**Price History** (collapsed accordion beneath the grid): table of Date / Old Value / New Value / Changed By, expandable to view full history without leaving the tab.

Above-threshold price edits trigger the shared Approval component (modal) before the change commits, per the spec's Approval Workflow rule.

---

## 8. Media Tab ("Images" per this prompt's naming)

**Primary layout:** large image viewer (left, 8 cols) with thumbnail rail beneath (drag-to-reorder, first position badged "Primary") + a right sidebar (4 cols) listing 360°/Video/Size Guide/Documents as expandable sub-sections.

**Main Image / Image Zoom:** click the large viewer image to open a full-screen lightbox with pinch/scroll zoom (desktop: scroll-wheel zoom + drag-to-pan; touch: pinch-to-zoom), close via ✕ or Escape.

**Upload:** dashed-border drop zone (`radius-md`, `color-border` dashed) at the end of the thumbnail rail, accepts drag-and-drop or click-to-browse; shows a per-file upload progress ring during processing, "Optimizing…" caption during compression (per the spec's non-blocking-save rule).

**Variant-specific images:** a small "Assign to variant" action on each thumbnail, opening a compact dropdown of the product's color variants.

---

## 9. Suppliers Tab

Primary Supplier (card: logo/name, Purchase Price, Lead Time, MOQ, Rating stars) → Alternative Suppliers (ranked list below, same card format condensed to rows) → "Create Purchase Order" button pre-filling the Primary Supplier and last Purchase Price, per the spec's direct-action rule.

---

## 10. Purchase History Tab

Standard enterprise table: PO Number, Supplier, Order Date, Expected/Received Date, Quantity, Unit Cost, Status badge (matching Purchase module's own status-badge tokens exactly) — every row deep-links to its Purchase Order detail.

---

## 11. Sales History Tab

**Top:** two side-by-side trend charts (Revenue Trend / Units Sold Trend, 6-col each) with the same time-granularity segmented control used on the Dashboard.

**Below:** Top Branches (ranked bar) + Top Customers (ranked list, avatar + name + amount, linking to Customer 360) side-by-side (6-col each) → Invoices/Orders/Returns table beneath, each row deep-linking to its Sales record.

---

## 12. Transfers Tab

Table: Transfer ID, From, To, Quantity, Status badge (Requested/Approved/Dispatched/In Transit/Received/Cancelled — color progression from `color-text-secondary` through `color-primary` to `color-success`), Date. "Initiate Transfer" button deep-links to Inventory's Transfer flow with this product pre-selected, per the spec's rule against duplicating that form here.

---

## 13. Adjustments Tab

Table: Date, User, Quantity Δ, Reason badge (Damage/Recount/Shrinkage/Correction/Other, color-coded), Before/After quantity, linked Approval record icon (if applicable, opens the historical approval detail in a popover).

---

## 14. Returns Tab

Table: Date, Original Sale reference (link), Quantity, Return Reason badge, Resolution (Refund/Store Credit/Exchange badge), Condition notes.

---

## 15. Promotions Tab

Current Promotions (active cards, countdown badge if time-bound) → Coupons/Bundles/Campaigns this product participates in (compact list) → Promotion History accordion (past campaigns + measured lift where available).

---

## 16. Analytics Tab

12-col grid: Sales Trend + Revenue Trend (6-col each) → Variant Performance / Color Performance / Size Performance (3 ranked mini-bar-charts, 4-col each) → Margin Analysis + Inventory Turnover (6-col each) → bottom strip: ABC Classification badge, Fast/Slow/Dead Stock flag (with tooltip explaining the triggering threshold), Forecast sparkline (sourced from AI Analytics, shown with the platform-wide Confidence indicator per Design Tokens §3/AI Analytics §5's visual distinction rule for AI-sourced figures).

---

## 17. Activity Timeline Tab

Reverse-chronological feed (identical component to every other module's Activity Timeline): actor avatar → plain-language description (bold entity/value names) → relative timestamp. Filter chips for event category (Price Changed, Inventory Changed, Supplier Changed, Status Changed, Promotion Applied, Barcode Printed) above the feed.

---

## 18. Audit Log Tab (Management Roles Only)

Standard enterprise table: User, Action, Timestamp, Old Value, New Value, IP Address, Approval Status (linking to the historical approval record where applicable) — full forensic detail, distinct from the plain-language Activity Timeline per the spec's explicit two-tab rationale.

---

## 19. Documents Tab

Card grid of uploaded documents (file-type icon + filename + upload date + size), grouped by category (Technical Documents, Certificates, Warranty, Manuals) with collapsible section headers. Upload dropzone at the bottom of each category section.

---

## 20. Settings Tab

Field grid: Track Inventory / Track Serial / Track Batch toggles, Tax Class override dropdown, Channel Visibility toggles (POS / E-commerce / Wholesale, per the Hidden-status use case), Automation rules section (e.g., "Auto-reorder when below Reorder Level" toggle + threshold input).

---

## 21. Quick Actions (Detail)

All reachable from the Summary Header's `⋮` overflow (§2): Edit → opens the same Create/Edit stepper from Product Management, pre-filled. Duplicate → clones and opens the new Draft copy directly in Edit mode. Archive/Delete → route through the dialogs in §22. Print Barcode/Label → opens Barcode & Label module's print flow pre-scoped to this product/its variants. Export → single-product export (PDF spec sheet or data export, format picker). Share → generates a scoped read-only link (mirrors the Dashboard's Share pattern).

---

## 22. Dialogs

| Dialog | Contents |
|---|---|
| **Edit Product** | Not a separate dialog — opens the full-page Create/Edit stepper (Product Management UI §10), pre-filled |
| **Upload Images** | Reachable from Media tab's dropzone directly; a modal variant (triggered from Quick Actions) offers the same drag-and-drop zone + a "browse" fallback, feeding directly into the Media tab's gallery |
| **Add Variant** | Attribute-value picker (which new combination to add) → generates the new row directly into the Variants tab's matrix, inline, no separate save step |
| **Delete Confirmation** | Requires typing the product name, per Design System §14's destructive-action rule; only reachable when zero transaction history |
| **Archive Confirmation** | Lightweight single-confirm, reversible |

---

## 23. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`; Summary Header Quick Actions reveal fully on hover if condensed |
| Focus | 2px `color-focus` ring throughout, including inline-editable Overview fields |
| Selection | Variant Matrix multi-select checkboxes, Shift/Ctrl-click range/toggle |
| Keyboard Navigation | Arrow-key tab switching (per Navigation §6's tab keyboard rule), Tab/Shift+Tab through inline-editable fields |
| Context Menu | Right-click a Variant row: Edit, Print Label, Deactivate |
| Drag & Drop Image Upload | Media tab dropzone + thumbnail-rail reordering (§8) |

---

## 24. States

| State | Treatment |
|---|---|
| Loading | Skeleton Summary Header (shape-matched) + skeleton content for whichever tab is active |
| Skeleton | Tab-specific shapes: table skeleton (Purchase/Sales/Transfers/Adjustments/Returns History), form skeleton (Overview/Pricing/Settings), matrix skeleton (Variants), gallery skeleton (Media) |
| Empty Images | Media tab: icon + "No images uploaded" + prominent upload dropzone as the primary call to action (not a separate button) |
| No Variants | Variants tab, Simple product type: "This is a Simple product — no variants to display" — explicitly distinguished from a data-loading problem on a Variable product |
| Offline | Tab content shows last-cached data + staleness badge; edits queue if on a store device, per the spec's offline note |
| Permission Denied | Audit Log tab omitted from the tab strip entirely (§3); other restricted fields render read-only inline with a tooltip |
| Error | Per-tab inline retry — a failed Analytics fetch never blocks Overview/Variants from rendering, per the spec's tab-isolation principle |
| Retry | Consistent retry button + toast, scoped to the failing tab/section only |
| Save Success | Inline-edit fields show a brief `color-success` checkmark flash (`motion-fast`) on successful save; stepper-based Edit flow shows a toast on full-form save |

---

## 25. Responsive Design

| Breakpoint | Summary Header | Tabs | Content |
|---|---|---|---|
| Desktop/Laptop | Full two-column layout (§2) | Full tab bar, overflow beyond ~9 tabs into "More ▾" | Full-width, multi-column grids per tab (e.g., Pricing's side-by-side tiers) |
| Tablet | Condenses to single column, Quick Actions move to overflow menu | Scrollable horizontal tab strip | Single-column content stacking, tables get horizontal scroll |
| Mobile Detail View | Slim sticky header only (thumbnail + name + status) | Tabs become a dropdown selector instead of a strip | Fully stacked, one field-group/table-section per screen |

---

## 26. Accessibility

- Keyboard navigation across tabs (arrow keys, per §23) and within each tab's forms/tables/matrix
- Screen reader labels on icon actions (barcode/QR generate, image reorder, overflow menus)
- Accessible tables in every history tab (`<th scope>`, sort-state announcement)
- Accessible forms in editable tabs (label association, `aria-describedby` errors)
- Visible focus throughout, including the Summary Header's scroll-condensing behavior (condensed elements remain in the accessibility tree, just visually compact — nothing is removed from tab order on condense)
- WCAG AA contrast on all status/badge elements across every tab

---

## 27. Figma Build Notes

- Frame: `ProductDetail/Desktop/1440` with per-tab content frames nested as separate pages/sections for handoff clarity: `ProductDetail/Tab-Overview`, `ProductDetail/Tab-Variants`, etc.
- Summary Header is built as a single Auto Layout component with a `State=Full|Condensed` variant property, not two separate hand-built frames
- Tabs component instances the Design System base Tab bar exactly, with a `More` overflow variant already defined there
- Variant Matrix grid, Stock Movement ledger, and every History table are instances of the base Table component with tab-specific column configuration as component properties — never rebuilt per tab
- Layer naming: `ProductDetail/SummaryHeader/Full`, `ProductDetail/Tabs/Variants/MatrixRow`, `ProductDetail/Tabs/Pricing/MarginCard`, per the `Category/Component/Variant` convention

---

## 28. Developer Handoff Notes

- Edit Product (§21) and Product Management's own Create flow must share one form component/schema — this screen never maintains a second implementation of product field validation, per `06-product-detail.md` §29.
- Variant Matrix (§5) is the identical component instance used in Product Management's Create flow and POS's Variant Picker for stock-availability logic — one source of truth for "is this variant sellable," per the spec's repeated cross-module rule.
- Inventory (§6), Purchase History (§10), Sales History (§11), and Transfers (§12) tabs are read-only views over other modules' own data — implement as linked queries, never denormalized copies, so a correction made in Inventory/Sales/Purchase reflects here immediately without a separate sync step.
- Each tab must be an independently-fetching, independently-erroring unit (§24/§26) — a slow or failed Analytics query must never block Overview from rendering, matching the widget-isolation principle established since the Dashboard module.
- Activity Timeline (§17) and Audit Log (§18) must be generated from the same underlying event log at write time, rendered through two different formatters/permission filters — not two separately maintained logs, per the spec's explicit rule that they must never be able to disagree about what happened.

---

**Next:** 07-inventory-ui.md
