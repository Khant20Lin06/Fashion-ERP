# Product Detail Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md)
**Consumed by:** Inventory, Purchase, Sales, Reports, Promotions, AI Analytics
**Scope note:** This is the single-product 360° workspace. List/Create/Bulk/Import belong to **05-product-management.md**; this page is reached only via row-click/"View" from that List (05 §16).

---

## 1. Module Objective

One screen where a user can View, Edit, Analyze, Track, Manage, Audit, and Monitor every aspect of a single product — without navigating away to piece together pricing from one module, stock from another, and history from a third.

---

## 2. Target Users & Permissions

Inherits the field-level permission model from [05-product-management.md](05-product-management.md) §2: Super Admin/Owner/Product Manager (full edit across all tabs), Branch Manager (edit branch pricing/stock only), Inventory Manager (edit Inventory tab only), Purchasing Officer (edit Suppliers/Cost Price only), Warehouse Staff (read-only), Marketing Team (edit Media/Overview tags/SEO only). Tabs a role cannot act on remain visible (read-only) rather than hidden, since cross-functional visibility (e.g., Purchasing seeing Sales History) is itself valuable — only the Audit Log tab is fully hidden from non-management roles.

---

## 3. Page Layout

Standard app shell ([02-navigation.md](02-navigation.md) §2):

```
Top Header → Sidebar → Breadcrumb (Dashboard > Products > Product List > [Product Name])
↓
Product Summary Header (§4) — sticky on scroll, condenses to a slim bar
↓
Product Tabs (§6) — sticky beneath the Summary Header
↓
Content Area (tab-specific, §7–§20)
```

The Summary Header condensing on scroll (full → slim, showing just image thumbnail + name + status + Quick Actions) keeps identity and key actions reachable while a user works deep in a tab (e.g., scrolling through Sales History) without permanently consuming vertical space.

---

## 4. Product Summary Header

Left: Primary Image (80px thumbnail) → Product Name (Headline) + SKU + Barcode + QR Code (small icon, click to enlarge/print) → Brand · Category · Collection · Season (metadata row, Body Small) → Status badge.

Right: Current Price (Retail, largest) with Cost Price shown secondarily to roles permitted to see it → Current Stock / Reserved Stock / Available Stock (three-part stat, Available emphasized) → Warehouse · Supplier (compact) → Created Date · Updated Date (Caption, muted).

All fields here are read summaries pulled live from their owning tab (§9–§10) — never independently editable in the header itself, avoiding two places to edit the same value.

---

## 5. Quick Actions

Header-anchored action cluster: Edit Product · Duplicate · Archive · Publish/Unpublish · Deactivate · Print Label · Generate Barcode · Generate QR · Export · Delete.

- **Edit Product** opens the same multi-step form used in Create ([05-product-management.md](05-product-management.md) §6), pre-filled — one form definition for both flows, not a separate "edit mode" UI.
- **Duplicate** clones all fields except SKU/Barcode (regenerated) and resets Status to Draft — useful for near-identical seasonal reissues.
- **Delete** is restricted per the Bulk Delete rule (05 §13) — only available (not just disabled) when the product has zero transaction history; otherwise the action is replaced by **Archive** entirely, so a user is never shown a control that will just error out.
- All actions role-filtered per §2 and require the Confirmation Dialog pattern (Design System §14) for Archive/Delete/Deactivate.

---

## 6. Product Tabs

Overview · Variants · Inventory · Pricing · Media · Suppliers · Purchase History · Sales History · Transfers · Adjustments · Returns · Promotions · Analytics · Activity Timeline · Audit Log · Documents · Settings.

Rendered as the standard Tabs component ([02-navigation.md](02-navigation.md) §6); given the count (17), tabs overflow into a "More ▾" menu beyond the 8–9 that fit the header width, with the most-used (Overview, Variants, Inventory, Pricing, Sales History) always in the visible set regardless of role. Last-visited tab persists per product per session, consistent with the Navigation module's tab-memory rule.

---

## 7. Overview Tab

General Information (Description, editable rich text) · Tags · Collections · Season · Gender · Age Group · Material · Fabric · Style · Pattern · Care Instructions · Country of Origin · SEO Information (meta title/description/slug, relevant for the E-commerce module 23).

This tab mirrors the Basic Info step of the Create form (05 §6) — same fields, same component, rendered in view/inline-edit mode here rather than the stepper context.

---

## 8. Variants Tab

**Variant Matrix** — the same grid component from Create ([05-product-management.md](05-product-management.md) §7), here in its ongoing-management context: Color Matrix / Size Matrix toggle view, per-variant Image, Price, Stock, Barcode, Status, all inline-editable with the live SKU-uniqueness and stock-validation rules from 05 §18.

**Bulk Variant Update** available identically to the Create-flow grid (select rows → apply change), so a manager discontinuing "all Small sizes across colors" doesn't need to return to the Create form to do it.

---

## 9. Inventory Tab

Warehouse Stock · Branch Stock · Reserved Stock · Incoming Stock (from open Purchase Orders, module 08, linked) · Outgoing Stock (pending Transfers, §15) · Safety Stock · Reorder Level · **Stock Movement** (a scrollable ledger — every sale, return, adjustment, transfer affecting this SKU, timestamped, linked to its source transaction) · Inventory Valuation (current stock × cost, by warehouse/branch) · Stock Aging (days-in-stock bucketed, per variant).

This tab is **read-heavy** by design — actual stock-changing operations (adjustments, transfers, receiving) are performed in their owning modules (07-inventory, 08-purchase); this tab surfaces the resulting state and links out ("View in Inventory →") rather than duplicating those write flows, avoiding two places that can move stock for the same SKU.

---

## 10. Pricing Tab

Cost Price · Retail Price · Wholesale Price · VIP Price · Promotion Price (read-only, sourced from active Promotions module 12 rules) · Branch Price (per-branch override table) · Tax · **Price History** (immutable log: date, old value, new value, changed by) · **Margin** and **Markup** (live-calculated, per 05 §9).

Editable fields here write through the same validation as the Create-flow Pricing step (05 §9/§18) — including the below-cost Warning and the Approval Workflow gate for above-threshold changes (05 §23).

---

## 11. Media Tab

Primary Image · Gallery · 360° Images · Videos · Documents (cross-linked with the Documents tab, §20 — uploaded once, categorized there) · Size Guide · Upload · Reorder (drag-and-drop) · Delete.

Identical component and compression/reordering behavior to 05 §8, in-place here rather than within the Create stepper.

---

## 12. Suppliers Tab

Primary Supplier · Alternative Suppliers (ranked list) · Purchase Price (per supplier — may differ from the Cost Price shown in Pricing if multi-sourced) · Lead Time · Minimum Order Quantity · Supplier Rating · Purchase History (condensed — full detail in §14).

Directly informs Purchase Order creation (module 08): initiating a PO for this product from here pre-fills the Primary Supplier and last Purchase Price.

---

## 13. Sales History Tab

Invoices · Orders · Returns · Revenue (trend chart) · Units Sold (trend chart) · Top Branches (ranked) · Top Customers (ranked, links to Customer detail) · Sales Trend (Line chart, with the same time-granularity toggle pattern as Dashboard §7).

Table rows link out to their source Sale/Order record (module 09); this tab is a product-scoped *view* into Sales data, not a duplicate data store.

---

## 14. Purchase History Tab

Purchase Orders · Goods Receipts · Purchase Invoices · Purchase Returns · Supplier Timeline (chronological, cross-supplier if multi-sourced).

Each row links to its source record in the Purchase module (08); statuses (e.g., "Awaiting Receipt," "Partially Received") use the same status badge tokens as that module for consistency.

---

## 15. Transfers Tab

Warehouse Transfers · Branch Transfers · Transfer Timeline · Transfer Status (Pending/In Transit/Received/Cancelled, badge-coded).

Read view into the transfer records this SKU/variant appears in; initiating a new transfer deep-links to the Inventory module's Transfer flow (07) with this product pre-selected, rather than duplicating that form here.

---

## 16. Adjustments Tab

Stock Adjustment history specific to this product: date, adjusting user, quantity delta, reason (Damage, Recount, Theft/Shrinkage, Correction, Other), before/after quantity, linked Manager Override/approval record where applicable (mirrors the audit rigor of [04-pos.md](04-pos.md) §24).

---

## 17. Returns Tab

Customer returns processed for this product/variant: date, original sale reference, quantity, Return Reason (per [04-pos.md](04-pos.md) §13's fixed reason set), resolution (Refund/Store Credit/Exchange), condition notes. Feeds directly into the Fast/Slow/Dead Stock and quality signals surfaced in the Analytics tab (§18).

---

## 18. Promotions Tab

Current Promotions (active, with countdown where time-bound) · Coupons (applicable) · Bundles (this product is a member of) · Campaigns (marketing module 13 cross-reference) · Member Pricing rules · Promotion History (past campaigns this product participated in, with resulting lift where measurable).

Read-only relative to promotion *configuration* (owned by module 12) — this tab shows "what's currently affecting this product's price/visibility," configuration itself happens in Promotions.

---

## 19. Analytics Tab

Sales Trend · Revenue Trend · Variant Performance (which color/size combinations sell best — a ranked mini-table) · Color Performance · Size Performance · Margin Analysis · Inventory Turnover · **ABC Analysis** (this product's classification — A/B/C revenue-contribution tier) · Fast Moving / Slow Moving / Dead Stock flag (with the threshold that triggered the classification, shown in a tooltip) · Forecast (projected demand, next period — sourced from AI Analytics module 25, surfaced here read-only).

Reuses the chart components and shared palette from Design System §3.2/§15 and Dashboard §15 — no new chart type introduced for this tab.

---

## 20. Activity Timeline & Audit Log

**Activity Timeline** (all roles per §2): human-readable event stream — Created, Updated, Price Changed, Inventory Changed, Supplier Changed, Status Changed, Promotion Applied, Barcode Printed — each with actor, relative timestamp, and a plain-language description (e.g., "Nina L. changed Retail Price from ฿1,200 to ฿1,350").

**Audit Log** (management roles only, hidden per §2): the same events at full forensic detail — User, Action, Timestamp, Old Value, New Value, IP Address (if available), Approval Status (linking to the Manager Override/Approval Workflow record where the change required one, per 05 §23).

These are deliberately two separate tabs, not one collapsed view: the Timeline is for everyday context ("who touched this recently"), the Audit Log is for compliance/investigation — conflating them would either clutter the everyday view with IP addresses or strip the forensic view of its precision.

---

## 21. Documents Tab

Technical Documents · Certificates (e.g., material/safety compliance) · Warranty · Images (reference copies, distinct from the sellable Media gallery) · Manuals · PDF Files.

Upload/delete permissions follow §2; documents here are internal/compliance-facing, whereas Media (§11) is customer/sales-facing — kept as separate tabs so a certificate PDF never accidentally surfaces in a customer-facing product gallery.

---

## 22. Settings Tab

Product-level configuration that doesn't fit elsewhere: Track Inventory / Track Serial / Track Batch toggles (mirrors 05 §10, editable ongoing here), Tax Class override, channel visibility toggles (POS / E-commerce / Wholesale — supports the Hidden status use case from 05 §12), and any product-specific automation rules (e.g., "auto-reorder when below Reorder Level").

---

## 23. Validation

Inherits the full rule set from [05-product-management.md](05-product-management.md) §18 (Duplicate SKU/Barcode, Missing Price/Category, Invalid Variant, Negative Stock) — enforced identically here since Edit uses the same form component as Create. Additionally: Missing Supplier blocks Purchase Order auto-suggestion (not Publish) since a product can legitimately publish before a supplier relationship is finalized (e.g., existing stock, discontinued sourcing).

---

## 24. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton Summary Header + skeleton tab content matching the active tab's real layout |
| Skeleton | Tab-specific shapes (table skeleton for Sales History, form skeleton for Overview, matrix skeleton for Variants) |
| No Product Found | Full-page state (not a tab-level one): icon + "Product not found or has been removed" + "Back to Product List" |
| No Variants | Empty state within the Variants tab: "This is a Simple product — no variants to display" (distinguished from "Variable product with a data-loading issue") |
| No Sales History | "No sales recorded yet" — neutral, not an error, common for newly published items |
| No Purchase History | Same neutral treatment |
| Offline | Tab content shows last-cached data with a staleness badge; edit actions queue per the offline pattern (POS §15) if the user is on a store device |
| Permission Denied | Audit Log tab omitted entirely (§2); other restricted fields render read-only inline rather than blocking the tab |
| Server Error | Per-tab inline retry (Design System §17) — a failure loading Analytics never blocks Overview/Variants from displaying |
| Retry | Consistent retry button + toast pattern across all tabs |

---

## 25. Responsive Design

| Breakpoint | Summary Header | Tabs | Content |
|---|---|---|---|
| Desktop/Laptop | Full two-column layout (§4) | Full tab bar, overflow beyond ~9 | Full-width tab content, multi-column where applicable (e.g., Pricing tiers side-by-side) |
| Tablet | Condenses to single column, Quick Actions move to overflow menu | Scrollable tab strip | Single-column content, tables get horizontal scroll |
| Mobile | Slim sticky header only (image thumbnail + name + status) | Tabs become a dropdown selector instead of a strip | Fully stacked, one field-group/table-section per screen |

---

## 26. Accessibility

Standard baseline (Design System §20): keyboard navigation across tabs (arrow keys) and within each tab's forms/tables, screen-reader labels for icon actions (barcode/QR generate, image reorder), accessible tables in every history tab (proper header scope, sortable-state announcement), accessible forms in editable tabs (label association, `aria-describedby` errors), visible focus throughout, WCAG AA contrast on all status/badge elements. The Summary Header's scroll-condensing behavior does not remove any element from the accessibility tree — condensed elements remain reachable, just visually compact.

---

## 27. Performance

Tabs lazy-load their content on first activation (not all 17 tabs' data fetched on page load) — Overview and Variants (the two most-visited) preload eagerly; the rest fetch on-demand with their own skeleton (§24). Sales/Purchase History tables virtualize rows for high-volume products. Fast tab switching is preserved by caching each tab's fetched data for the session, so returning to a previously-visited tab doesn't re-fetch unless data is explicitly stale (e.g., after an edit elsewhere).

---

## 28. Security

Inherits [05-product-management.md](05-product-management.md) §23 in full: field-level Role Permission, Approval Workflow for above-threshold price changes, immutable Audit Log (§20 here), Delete Confirmation, and Sensitive Action Confirmation for Publish/Deactivate. The Audit Log tab itself additionally enforces access logging — viewing another user's change history is itself an auditable action for compliance-sensitive deployments.

---

## 29. Developer Implementation Notes

- Edit Product (§5) and the Create form (05 §6) must share one form component/schema — this page never maintains a second implementation of product field validation.
- Variant Matrix (§8) is the identical component instance used in Create (05 §7) and POS's Variant Picker (04 §7) for stock-availability logic — one source of truth for "is this variant sellable."
- Each tab should be an independently-fetching, independently-erroring unit (§24/§27) — a slow or failed Analytics query must never block Overview from rendering, matching the Dashboard module's widget-isolation principle (03 §21).
- Stock Movement (§9), Sales History (§13), Purchase History (§14), and Transfers (§15) are all *views* over other modules' data — implement as read-only linked queries, not denormalized copies, so a correction made in Inventory/Sales/Purchase is reflected here immediately without a separate sync step.
- Activity Timeline vs. Audit Log (§20) should be generated from the same underlying event log at write time, rendered through two different formatters/permission filters — not two separately maintained logs, to guarantee they never disagree about what happened.

---

**Next:** 07-inventory.md
