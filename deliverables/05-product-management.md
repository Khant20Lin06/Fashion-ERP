# Product Management Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md)
**Consumed by:** 06-product-detail.md (single-product deep view), Inventory, Purchase, Sales, Reports, E-commerce, AI Analytics, Barcode/Label, Mobile Manager
**Scope note:** This module owns the multi-product surfaces — Dashboard, List, Create/Edit, Bulk Operations, Import/Export. The single-product tabbed workspace (Overview/Variants/Inventory/Pricing/etc.) is defined in **06-product-detail.md**; §16 below is a summary only.

---

## 1. Module Objective

The single source of truth for every product across fashion retail, wholesale, multi-branch, multi-warehouse, and franchise operations, and the foundation every downstream module reads from. Nothing about a product (name, SKU, variant, price, stock rule) is ever entered a second time in another module — they reference this one.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full CRUD, bulk operations, import/export, all statuses |
| Product Manager | Full CRUD, bulk operations, import/export |
| Branch Manager | Read all; edit branch-specific pricing/stock settings only |
| Inventory Manager | Read all; edit Inventory Settings tab fields; no pricing edit |
| Purchasing Officer | Read all; edit Supplier/Cost Price fields; no retail pricing edit |
| Warehouse Staff | Read only (product identification for receiving/picking) |
| Marketing Team | Read all; edit Tags, SEO, Media, Related Products only |

Field-level permission (not just page-level) is required — e.g., a Purchasing Officer opening a product form sees Cost Price and Supplier fields as editable, while Retail/Member/VIP Price fields render read-only with a tooltip explaining why.

---

## 3. Product Workflow

```
Product Creation → Variant Configuration → Pricing → Inventory Assignment
→ Barcode Generation → Publishing → Selling → Reporting → Archive
```

This lifecycle drives the Status model (§12) — a product cannot reach **Published** without passing validation (§18) at each prior stage (e.g., no SKU collision, at least one price tier set, at least one variant with stock assigned or explicit "sell without tracking" flag).

---

## 4. Page Layout / Information Architecture

```
Product Dashboard (module-level KPIs — catalog health, not business KPIs from 03)
↓
Product List (§5) ──→ Create Product (§6) / Edit Product
                  ──→ Product Detail (→ 06-product-detail.md)
                  ──→ Bulk Operations (§13)
                  ──→ Import / Export (§14)
                  ──→ Archive (filtered List view, status=Archived)
```

**Product Dashboard** (landing page for this module, inherits the lightweight header pattern from [03-dashboard.md](03-dashboard.md) §4): KPI cards — Total Products, Active/Published, Draft, Low Stock SKUs, Out of Stock SKUs, Pending Approval — plus a "Recently Updated" activity strip. This is a catalog-health view, distinct from the business-wide Dashboard module; it exists so a Product Manager's first screen answers "is my catalog in good shape" without navigating to Inventory or Reports.

---

## 5. Product List

Standard enterprise data table (Design System §12), scoped to Products.

**Columns** (all toggleable via Column Visibility, sensible defaults below): Image (thumbnail) · Name · SKU · Barcode · Brand · Category · Collection · Season · Color · Size · Selling Price · Cost Price · Available Stock · Reserved Stock · Warehouse · Branch · Status (badge) · Created Date · Updated Date.

**Default visible set** (avoids overwhelming density on first load): Image, Name, SKU, Brand, Category, Selling Price, Available Stock, Status, Updated Date — remaining columns available via the Columns menu, since Color/Size/Warehouse only make sense once a user is filtering to that granularity.

**Row representation note:** a row here represents a **product** (parent), not a variant — Available Stock shows an aggregate across all variants with an expandable row (Design System §12) to reveal the per-variant breakdown inline without leaving the list. This avoids a 100,000-product catalog rendering as a multi-million-row variant table by default.

**Toolbar:** Search (name/SKU/barcode) · Sort · Advanced Filter (§15) · Saved Views (named filter+column+sort presets, e.g., "Low Stock Denim," shareable across the team or private) · Bulk Selection · Bulk Actions (§13) · Export · Print · Pagination (10/25/50/100 + jump-to-page, per Design System §12).

---

## 6. Product Creation

**Product Type selector** (first decision in the Create flow, determines which subsequent steps/fields appear): Simple · Variable · Bundle · Composite · Service · Digital · Gift Card.

- **Simple:** no variant matrix, direct SKU/price/stock.
- **Variable:** proceeds to Variant Configuration (§7) — the dominant type for fashion (color × size).
- **Bundle:** references 2+ existing products, bundle-level price overrides component sum.
- **Composite:** built from component SKUs with a bill-of-materials relationship (e.g., a "gift set" that decrements component stock, distinct from Bundle's simpler grouping).
- **Service:** no physical stock tracking (e.g., alterations, personalization).
- **Digital:** no physical stock, no shipping-relevant fields (e.g., a downloadable style guide, gift-card-adjacent).
- **Gift Card:** fixed or open-value, no variants, integrates with POS payment methods ([04-pos.md](04-pos.md) §11).

**Creation is a multi-step form (Stepper component, Navigation §15)**, not one long scroll: **1. Basic Info** (Name, Short Name, Description, Brand, Category, Subcategory, Collection, Season, Gender, Age Group, Material, Fabric, Pattern, Style, Country of Origin, Supplier, Tax Class, Tags) → **2. Variants** (§7, skipped for Simple/Service/Digital/Gift Card) → **3. Pricing** (§9) → **4. Inventory** (§10) → **5. Media** (§8) → **6. Review & Publish**.

- Each step validates independently (§18) before advancing; a user can save as **Draft** from any step and resume later — the product exists in the system (searchable, editable) from the moment Basic Info is saved, at Draft status.
- SKU/Barcode can be auto-generated (per house numbering scheme, §11) or manually entered — manual entry validates uniqueness live (debounced check) rather than on final submit, so a collision is caught in step 1, not step 6.

---

## 7. Product Variants (Variant Configuration Step)

Unlimited attribute dimensions: Color, Size, Fit, Length, Material, Pattern, Style, etc.

**Matrix builder interaction:** user selects which dimensions apply (e.g., Color + Size), then defines the value set per dimension (e.g., Color: Black, Navy, Olive; Size: S, M, L, XL) — the system generates the full cross-product matrix (3×4 = 12 variant rows) as an editable grid, not 12 individual forms.

Each generated variant row supports inline edit of: SKU (auto-suggested from parent SKU + attribute codes, e.g., `DJ-001-BLK-M`), Barcode (auto-generate or manual), Price (defaults to parent price, overridable per variant), Cost, Stock (initial quantity), Weight, Image (assign from the Media gallery, §8, or upload variant-specific), Status (a single variant can be Inactive while its siblings remain Published — e.g., discontinuing just the XL in a color).

**Bulk Variant Update** available directly in this grid (select rows → apply price/status change) — this is the local, in-context version of the module-level Bulk Operations (§13).

---

## 8. Product Media

Primary Image (required to Publish) · Gallery Images (unlimited, drag-to-reorder) · 360° Images (sequence upload, auto-stitched preview) · Videos (upload or external link) · Size Guide (image or structured table, reusable across products sharing a size system) · Product Documents (§20 in 06, e.g., care/certification — surfaced here for upload, filed there for reference).

- **Image reordering:** drag-and-drop grid, first position = Primary (or explicit "Set as Primary" action).
- **Image compression:** automatic on upload (client-side pre-compression + server-side optimization), with a visible "Optimizing…" transient state — never blocks the rest of the form from being saved while media processes.
- Variant-specific images (§7) pull from this same gallery — a color variant typically maps to one gallery image rather than requiring a fully separate upload.

---

## 9. Pricing

Tiers: Cost Price · Retail Price · Wholesale Price · Member Price · VIP Price · Promotion Price (read-only here, managed in Promotions module 12 — shown for visibility) · Branch Price (override for specific branches, e.g., a flagship-only higher price).

- **Currency:** set at company level, overridable per branch for multi-country operations.
- **Tax Inclusive / Exclusive:** toggle affects how entered prices are interpreted and displayed throughout POS/Sales — set at product level with a company-wide default.
- **Price History:** immutable log (date, old value, new value, changed-by) — visible here and duplicated into the Audit Log (06 §19) for the full-detail view.
- **Margin/Markup** auto-calculated and displayed live as Cost/Retail are entered (Retail Price field shows a live "42% margin" helper text) — surfaces pricing mistakes (e.g., a price entered below cost) as an inline Warning before save, not after.

---

## 10. Inventory Settings (Assignment Step)

Warehouse (multi-select, a product can stock in several) · Branch (which branches sell it) · Initial Stock (per warehouse/branch/variant) · Reorder Level · Minimum Stock · Maximum Stock · Safety Stock · Reserved Stock (read-only, system-managed) · Track Inventory (toggle — off for Service/Digital types) · Track Serial Number (for high-value items) · Track Batch (for expiry/lot-relevant goods, less common in fashion but supported for cosmetics/accessories lines).

This step only *assigns* initial settings; ongoing stock movement, transfers, and adjustments are owned by the Inventory module (07) and surfaced read-only in Product Detail (06 §9) — this module never duplicates that operational logic.

---

## 11. Barcode & Label

Auto Barcode (sequential or attribute-encoded, per configurable house scheme) · Manual Barcode (with live uniqueness validation) · QR Code (auto-generated, encodes SKU + a deep link into the product's Product Detail page for staff scanning) · Price Label / Shelf Label (template-based, pulls live price/name/barcode) · Bulk Label Printing (from List selection or a dedicated queue — full template and print-layout detail lives in module 22-barcode-label.md; this module surfaces the trigger action only).

---

## 12. Product Status

Draft → Published → Inactive → Archived → Discontinued → Out of Stock → Coming Soon → Hidden.

| Status | Meaning | Visible in POS/E-commerce? |
|---|---|---|
| Draft | Incomplete, being built | No |
| Published | Live, sellable | Yes |
| Coming Soon | Published metadata, not yet sellable | Yes (browse-only, "Notify me") |
| Out of Stock | Published, zero available stock | Yes (grayed, per POS §6) |
| Inactive | Temporarily paused (e.g., quality hold) | No |
| Hidden | Published data, deliberately excluded from customer-facing channels (e.g., B2B-only SKU) | POS yes / E-commerce no |
| Discontinued | Being phased out, sellable until stock exhausted, not reordered | Yes, until stock = 0 |
| Archived | Retired, historical record only | No |

Status changes follow the workflow (§3) — e.g., Draft→Published is blocked until validation (§18) passes; any status change writes to the Activity Timeline (06 §18).

---

## 13. Bulk Operations

Triggered from List selection (Navigation §15's bulk-action bar pattern): Bulk Update (any shared field) · Bulk Delete (hard delete, restricted — see rule below) · Bulk Price Update (fixed amount, percentage, or formula-based, e.g., "cost + 40%") · Bulk Status Update · Bulk Category Change · Bulk Brand Change · Bulk Image Upload (matched by SKU in a zip/CSV manifest) · Bulk Barcode Generation.

- Every bulk action shows a **preview/confirmation step** listing exactly which N products/variants will change and how, before committing — never a silent mass write.
- **Bulk Delete is restricted to Super Admin/Owner** and only permitted on products with zero sales history; any product with transaction history offers **Bulk Archive** instead (consistent with the Archive-over-Delete rule in [02-navigation.md](02-navigation.md) §16), preserving reporting integrity.
- Large bulk operations (>500 items) process asynchronously with a progress indicator and a completion notification (Notification Center, Navigation §13) rather than blocking the UI.

---

## 14. Import / Export

Formats: CSV · Excel · JSON.

**Import flow:** Template Download (pre-formatted with required/optional columns and example rows) → file upload → **Import Preview** (parsed table showing what will be created vs. updated, matched by SKU) → **Validation Report** (inline, row-level errors: duplicate SKU, missing required field, invalid category reference — each row individually fixable in the preview or excludable from the import) → confirm → async processing (per §13) → completion summary (N created, N updated, N skipped, downloadable error log for skipped rows).

**Export:** Export Selected (from List selection) or Export Filtered (respects current table filters, §15) — same three formats, async for large sets with a download-ready notification.

---

## 15. Search & Filter

Global Search (name/SKU/barcode, matches the header Global Search per Navigation §9) plus Advanced Filter panel: Brand · Category · Supplier · Collection · Season · Gender · Color · Size · Warehouse · Branch · Status · Stock Level (range or preset: In Stock/Low/Out) · Price Range · Created Date · Updated Date.

Filters combine with AND logic across categories, OR logic within a multi-select category (e.g., Color=Black OR Navy, AND Category=Outerwear) — displayed as removable chips, with the combination savable as a Saved View (§5).

---

## 16. Product Detail (Cross-Reference)

Clicking any product row navigates to the full single-product workspace defined in **06-product-detail.md** — Overview, Variants, Inventory, Pricing, Media, Suppliers, Purchase History, Sales History, Transfers, Adjustments, Audit Log, Activity Timeline, and more, each as a dedicated tab. This module (05) does not redefine that page; the List (§5) is its entry point via row click or the row-action "View" (Navigation §16).

---

## 17. Related Products

Configured from the product form (typically an Overview/Media-adjacent field) or bulk-suggested by the system based on co-purchase data: Related Products · Cross-Sell · Upsell · Frequently Bought Together (system-suggested from Sales History, manually confirmable) · Recommended Products.

These associations feed POS's Quick Add suggestions, E-commerce (module 23) product pages, and AI Analytics (module 25) — configured once here, consumed everywhere.

---

## 18. Validation

| Rule | Behavior |
|---|---|
| Duplicate SKU | Blocked at entry, live debounced check (§6), not just on submit |
| Duplicate Barcode | Same as SKU — live check, since barcode collisions break POS scanning |
| Missing Price | Blocks Draft→Published transition; allowed to save as Draft |
| Missing Category | Blocks Publish; required for reporting/navigation integrity |
| Invalid Variant | Blocks Publish if any generated variant is missing SKU or has negative/undefined stock without explicit "sell without tracking" |
| Negative Stock | Hard-blocked at the field level (min=0 validation), never just a warning |
| Duplicate Product Name | Soft warning only (names can legitimately repeat across brands/seasons), not blocked |

---

## 19. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table rows (List) / skeleton form sections (Create/Edit) |
| No Products (new tenant) | Empty state: icon + "No products yet" + "Add your first product" / "Import products" CTAs |
| No Search Results | "No products match '[query]'" + "Clear filters" action, distinct from the above per Design System §17 |
| Import Failed | Per-row validation report (§14) rather than an all-or-nothing failure message |
| Export Failed | Toast + Retry; if partially generated, offers the partial file with a clear caveat |
| Permission Denied | Field-level (§2) renders read-only with tooltip; page-level renders the standard Navigation §19 permission-denied pattern |
| Server Error | Inline retry per Design System §17 pattern |
| Offline Mode | List/Detail show last-cached data with a staleness indicator; Create/Edit forms queue saves per the offline pattern established in POS (§15), since Branch Managers may edit products from a store device |

---

## 20. Responsive Design

| Breakpoint | List | Create/Edit Form |
|---|---|---|
| Desktop/Laptop | Full table, all toolbar actions inline | Full multi-step form, side-by-side field groups |
| Tablet | Priority columns + horizontal scroll (Design System §19) | Stepper remains, single-column field groups |
| Mobile | Card-per-product stacked list (image, name, SKU, price, stock, status) | Full-screen step-by-step, one field group per screen with sticky Next/Back |

---

## 21. Accessibility

Standard platform baseline (Design System §20, Navigation §19): keyboard navigation through table and multi-step form, screen-reader labels on all icon actions (barcode generate, image upload/reorder), accessible forms (labeled fields, `aria-describedby` errors), accessible tables (`scope`, sort-state announcement), visible focus throughout the Stepper and Variant Matrix grid, WCAG AA contrast on all status badges.

---

## 22. Performance

- List virtualizes rows (windowed rendering) to handle 100,000+ products without scroll degradation, consistent with the POS catalog approach ([04-pos.md](04-pos.md) §25).
- Search hits a server-side indexed query for the List (unlike POS's client-side cache — back-office search prioritizes always-fresh data over offline capability).
- Variant Matrix generation (§7) computes client-side for typical combinations (≤200 variants); larger matrices (rare, e.g., a 20-color × 15-size run) generate server-side with a progress indicator.
- Import/Export and Bulk Operations on large sets are always async (§13/§14) — the UI is never blocked waiting on a long-running batch job.

---

## 23. Security

- Field-level Role Permission enforced consistently with §2.
- **Approval Workflow:** price changes above a configurable threshold, or any Bulk Price Update, route through a Manager/Owner approval step before taking effect (mirrors the Manager Override pattern from [04-pos.md](04-pos.md) §24) — prevents an accidental bulk formula error from silently repricing the catalog.
- **Audit Log / Activity Log:** every create/edit/status-change/delete writes an immutable entry (user, timestamp, old/new value) — full detail view lives in 06 §19, summarized here in the List via an "Updated By" column option.
- **Delete Confirmation:** standard Confirmation Dialog (Design System §14), always requiring the product name be reconfirmed for Bulk Delete specifically (§13), given its restricted, hard-to-reverse nature.
- **Sensitive Action Confirmation:** Publish (customer-facing exposure) and Bulk Price Update both get an explicit confirmation summary before committing, even though neither is destructive — the blast radius (visible to customers, or catalog-wide pricing) warrants the extra step.

---

## 24. Developer Implementation Notes

- Product Type (§6) should drive a form-schema/config object (which steps/fields render) rather than branching UI logic per type scattered across components — new product types become config additions.
- Variant Matrix (§7) generation and edit-grid should share the same stock-validation and SKU-generation logic consumed by POS's Variant Picker ([04-pos.md](04-pos.md) §7) and Inventory (07), to prevent divergent rules about what makes a variant valid.
- List (§5) row expansion (variant breakdown) should lazy-load variant data on expand, not eagerly fetch for every visible row — keeps initial table paint fast at scale.
- Saved Views (§5) persist as user- or team-scoped filter/column/sort configs; store as a serializable config object so the same mechanism can be reused by other modules' list views (Inventory, Customers, Orders) rather than reimplemented per module.
- Import (§14) validation should run the exact same rule set as inline Create/Edit validation (§18) — one shared validator, invoked both per-field in the form and per-row in the import preview.

---

**Next:** 06-product-detail.md
