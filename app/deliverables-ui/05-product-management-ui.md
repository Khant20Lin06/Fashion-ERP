# Product Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [05-product-management.md](../deliverables/05-product-management.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This document covers the multi-product surfaces (List, Create/Edit stepper, Bulk Operations, Import/Export), matching `05-product-management.md`'s own scope boundary with the single-product workspace (covered separately in `06-product-detail-ui.md`). Field-level permission behavior, validation rules, and the product-type-driven form schema are inherited exactly as specified there — this document adds grid placement, component instancing, and interaction detail only.

---

## 1. Screen Anatomy (Desktop, standard app shell)

```
Top Header (64px) — Navigation §3, unchanged
├── Sidebar (264px expanded)
└── Content Region
    ├── Breadcrumb: Dashboard > Products
    ├── Page Header (Title + Primary Action + Toolbar)
    ├── Product Dashboard (KPI strip, collapsible)
    ├── Filter Bar
    └── Product List (Table / Card / Compact view)
```

Content region margin `space-6`, vertical rhythm `space-6` between Page Header/Dashboard/Filter Bar/List blocks.

---

## 2. Page Header

**Row 1 — Title & Primary Action:**
```
Products                                    [Import] [Export] [+ New Product]
120,482 SKUs · 8,204 Products                (secondary/outlined)  (primary)
```
- `type-headline` title, `type-body-small` `color-text-secondary` subtitle showing live counts
- Secondary Actions (Import/Export) as Outlined buttons, `space-3` gap between them and the Primary "+ New Product" button

**Row 2 — Toolbar:**
```
[🔍 Search products, SKU, barcode…]   [Filters ▾]  [Saved Views ▾]        [⚏ Table] [▦ Card] [☰ Compact]
```
- Search field: 320px width, `input-height` 44px, expands to 480px on focus
- Filters and Saved Views: Dropdown buttons, Small size (32px height)
- View mode toggle: 3-icon segmented control, right-aligned, `Selected` state = `color-primary-container` fill on active icon

---

## 3. Product Dashboard Strip (Collapsible KPI Row)

Reuses the KPI Card component (Design System §13) in a condensed single-row variant, collapsible via a chevron toggle beneath the Page Header:

`Total Products` · `Active/Published` · `Draft` · `Low Stock SKUs` · `Out of Stock SKUs` · `Pending Approval` — each card 160px min-width, 88px height (shorter than the Dashboard module's 132px KPI cards, since this is a secondary/contextual strip, not the primary screen focus). Each card deep-links to the List below, pre-filtered.

---

## 4. Filter Bar (Advanced Filter Panel)

Chip row: Category · Brand · Collection · Season · Gender · Supplier · Warehouse · Branch · Status · Stock Level · Price Range · Created Date · Updated Date.

- Chips beyond 6 visible collapse into a "More Filters ▾" overflow, opening a popover with the remaining checklist-style filters
- **Price Range** and **Stock Level** render as range-slider or min/max input pairs within their dropdown popover (not simple checklists)
- Active filters render as removable chips in a second row beneath the bar, AND-combined across categories, OR within a multi-select category — displayed with a small "3 filters active" counter badge on the "Filters" button itself
- "Save as View" text link appears once any filter is active, opening a naming prompt that adds the combination to Saved Views

---

## 5. Product List — Table View (Default)

Enterprise data table (Design System §12 component, instanced).

**Default visible columns** (per `05-product-management.md` §5's density rule): Image (48×48 thumbnail, `radius-sm`) · Name (`type-body`, bold, 2-line clamp) · SKU (`type-table-cell`, Roboto Mono) · Brand · Category · Selling Price (right-aligned, tabular-nums) · Available Stock (right-aligned, color-coded: `color-error` if 0, `color-warning` if below reorder level) · Status (badge) · Updated Date (`type-caption`, relative + tooltip exact).

**Columns available via "Columns" menu** (hidden by default): Barcode, Collection, Gender, Size, Color, Cost Price, Reserved Stock, Warehouse, Branch, Tags, Created Date.

**Row anatomy:**
```
☐  [img]  Denim Jacket                DJ-001      Levi's   Outerwear   ฿1,350   142   [● Published]   2h ago   ⋮
           Blue, Navy, Black · 3 sizes
```
- Row height: 56px (Comfortable, image-bearing rows run slightly taller than the platform's standard 48px) / 44px (Compact density)
- Expandable row chevron (left of checkbox) reveals per-variant breakdown inline (nested mini-table: variant thumbnail, SKU suffix, color/size, stock, price) — lazy-loaded on first expand
- Row hover: `color-hover` overlay + trailing `⋮` overflow icon becomes visible (View, Edit, Duplicate, Print Label, Archive, Delete — Delete only shown/enabled if zero transaction history)
- Status badge colors: Published = `color-success` container, Draft = `color-text-secondary` container, Out of Stock = `color-error` container, Discontinued/Archived = neutral `color-border` container

**Toolbar row (above table, within the List card):** Bulk-select checkbox (header) · row count · Column visibility icon button · Density toggle (Comfortable/Compact) · Print icon · Export icon.

**Bulk-action bar** (replaces the toolbar row once ≥1 row selected, `color-primary-container` background, slides down `motion-base`):
```
✓ 12 selected     [Bulk Edit] [Update Price] [Update Status] [Change Category] [Export] [Archive]     [Clear]
```

**Pagination footer:** page-size selector (10/25/50/100) + page number controls + "Jump to page" input, per Design System §12.

---

## 6. Product List — Card View

Grid of Product Cards, 4-up at Desktop / 3-up at Laptop, `space-5` gutters (Compact density spacing). Each card:

```
┌─────────────────┐
│  [Product Image]  │  160×160
│  ● Published        │  status badge, top-left overlay on image
│                    │
│  Denim Jacket       │  type-body, bold
│  DJ-001 · Levi's    │  type-caption
│  ฿1,350             │  type-title
│  142 available      │  type-body-small, color-coded
│  [☐]          [⋮]   │  checkbox + overflow, bottom row
└─────────────────┘
```

---

## 7. Product List — Compact View

Dense single-line rows (36px height), no images, columns limited to: Name, SKU, Category, Price, Stock, Status — optimized for a Warehouse Staff or Inventory Controller scanning many SKUs quickly. Same row-hover/overflow-menu behavior as Table View.

---

## 8. Search Experience

- **Instant Search:** debounced 200ms, results replace the table body live with matched-term highlighting (`color-primary-container` background behind matched substring)
- **Advanced Search:** a "⚙ Advanced" link beside the search field opens a structured query builder (field + operator + value rows) for power users
- **Search Suggestions:** typeahead dropdown beneath the field showing top 5 matches (thumbnail + name + SKU) as the user types
- **Recent Searches:** shown when the field is focused but empty, last 5, each removable
- **Saved Searches:** distinct from Saved Views (filter combinations) — a Saved Search persists a text query specifically, listed in the same "Saved Views ▾" dropdown under a "Searches" sub-section
- **Filter Chips:** per §4, active filters always visible as removable chips regardless of which search mode produced them

---

## 9. Bulk Operation Dialogs

All modals: `radius-lg`, `elevation-4`, centered, max-width 560px unless noted.

| Dialog | Contents |
|---|---|
| **Bulk Edit** | Field picker (checkbox list of editable fields) → per selected field, an input row appears below → live count "This will update 12 products" |
| **Bulk Price Update** | Method selector (Fixed Amount / Percentage / Formula, e.g. "cost + 40%") → preview table showing before/after price per affected SKU (scrollable, max-height 320px) → Confirm |
| **Bulk Status Update** | Status dropdown → same before/after preview pattern |
| **Import Products** | Step 1: Template Download link + file dropzone → Step 2: Import Preview table (parsed rows, Create/Update/Skip column) → Step 3: Validation Report (row-level error list, each individually excludable) → Confirm & Import (async, progress bar) |
| **Export Products** | Format radio (CSV/Excel/JSON) → scope radio (Selected / All Filtered / All) → column picker checklist → Export button |
| **Delete Confirmation** | Standard Confirmation Dialog (Design System §14) — requires typing the product name for Bulk Delete specifically, per `05-product-management.md` §13/§23; only reachable when 100% of selected rows have zero transaction history |
| **Archive Confirmation** | Lighter-weight — single "Archive N products?" confirm, no typed re-confirmation required (reversible, non-destructive) |

---

## 10. Create/Edit Product (Stepper)

Full-page (not modal) stepper, reached via "+ New Product" or a row's "Edit" action — same form instance for both flows per `05-product-management.md` §6/§16.

**Stepper header** (Design System §15 Stepper component): `1 Basic Info` → `2 Variants` → `3 Pricing` → `4 Inventory` → `5 Media` → `6 Review & Publish` — steps 2 skipped entirely (grayed, non-clickable) for Simple/Service/Digital/Gift Card product types selected in step 1.

**Step 1 — Basic Info:** Product Type selector (7 large selectable cards, icon + label, top of the step) → two-column form grid below (`space-6` gutters): Name, Short Name, Description (rich text), Brand, Category, Subcategory, Collection, Season, Gender, Age Group, Material, Fabric, Pattern, Style, Country of Origin, Supplier, Tax Class, Tags (multi-chip input).

**Step 2 — Variants:** Dimension selector chips (Color, Size, Fit, Length, Material, Pattern, Style — toggle which apply) → per selected dimension, a tag-input for values → "Generate Matrix" button → resulting editable grid (one row per variant combination): thumbnail, SKU (auto-suggested, editable), Barcode, Price, Cost, Stock, Weight, Status toggle. Grid supports row multi-select → mini bulk-update bar identical in pattern to §5's.

**Step 3 — Pricing:** Field grid: Cost Price, Retail Price, Wholesale Price, Member Price, VIP Price, Branch Price (table if multi-branch overrides needed), Tax Inclusive/Exclusive toggle. Live-calculated Margin/Markup helper text beneath Retail Price field (`type-helper`, turns `color-warning` if margin drops below a configured threshold).

**Step 4 — Inventory:** Warehouse/Branch multi-select, Initial Stock per variant (table), Reorder Level, Min/Max Stock, Safety Stock, Track Inventory/Serial/Batch toggles.

**Step 5 — Media:** Drag-and-drop upload zone (dashed `radius-md` border) → uploaded image grid with drag-to-reorder, first position badged "Primary" → 360°/Video/Size Guide as separate sub-sections beneath the main gallery.

**Step 6 — Review & Publish:** Read-only summary of all prior steps in an accordion layout → Status selector (Save as Draft / Publish, the latter disabled until validation passes) → validation error summary list if any step is incomplete, each entry deep-linking back to its step.

Footer, every step: `Save as Draft` (Text button, left) · `Back` / `Next` (Outlined/Primary, right) — persistent across all 6 steps, `elevation-2` sticky footer bar.

---

## 11. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover` overlay, overflow menu reveal |
| Focus | 2px `color-focus` ring on all interactive elements including table cells in edit-in-place contexts |
| Selection | Checkbox-driven multi-select, Shift-click range-select, Ctrl/Cmd-click toggle-select |
| Right Click | Context menu on a row: View, Edit, Duplicate, Print Label, Archive |
| Keyboard Navigation | Arrow keys move focus cell-to-cell within the table; Space toggles row checkbox; Enter opens the focused row |
| Multi Selection | Header checkbox = select-all-on-page; a secondary "Select all 8,204" link appears once the page is fully selected, for filtered bulk actions spanning pagination |
| Drag & Drop | Variant Matrix row reordering (cosmetic only, doesn't affect SKU); Media gallery image reordering (§10 Step 5) |

---

## 12. States

| State | Treatment |
|---|---|
| Loading | Skeleton table rows (List) / skeleton form sections (Create/Edit stepper) |
| Skeleton | Shape-matched per view, per UX State System §6 |
| Empty Products | New tenant: icon + "No products yet" + "Add your first product" / "Import products" dual CTAs, centered |
| No Search Results | Distinct component: "No products match '[query]'" + "Clear filters" — never conflated with Empty Products |
| Import Success | Toast + completion summary dialog: "N created, N updated, N skipped" + "Download error log" if any skipped |
| Import Failed | Row-level Validation Report within the Import dialog (§9), never an all-or-nothing failure message |
| Offline | List/Detail show last-cached data with staleness banner; Create/Edit forms queue saves, per `05-product-management.md` §19 |
| Permission Denied | Field-level: restricted fields render read-only with an info tooltip explaining why (e.g., Purchasing Officer viewing Retail Price); Page-level: standard Navigation §19 pattern |
| Error | Inline retry per Design System §17 pattern, per-section isolation (a failed KPI strip fetch never blocks the table below it) |
| Retry | Consistent retry button + toast |

---

## 13. Responsive Design

| Breakpoint | List | Create/Edit Form |
|---|---|---|
| Desktop/Laptop | Full table, all toolbar actions inline, 4-up Card view | Full stepper, two-column field groups |
| Tablet | Priority columns (Image/Name/Price/Stock/Status) + horizontal scroll for rest; 2-up Card view | Stepper retained, single-column field groups |
| Mobile Management View | Card-per-product stacked list (image, name, SKU, price, stock, status) | Full-screen step-by-step, one field group per screen, sticky Next/Back footer |

---

## 14. Accessibility

- Keyboard navigation through table (arrow-key cell traversal, §11) and the full 6-step form
- Screen reader labels on all icon actions (barcode generate, image upload/reorder, overflow menu)
- Accessible tables: `<th scope>`, sort-state announcement, selection-count announcement ("12 of 8,204 selected")
- Accessible forms: every field labeled, `aria-describedby` error linking, required fields marked visually + `aria-required`
- Visible focus throughout the Stepper and Variant Matrix grid
- WCAG AA contrast on all status badges, verified against both light/dark and high-contrast modes

---

## 15. Figma Build Notes

- Frame: `Products/List/Desktop/1440`, `Products/Create/Step1-BasicInfo`, etc. — one frame per stepper step for clean handoff
- Product row/card, every dialog, and the Stepper itself are instances of Design System base components (Table Row, Card, Dialog, Stepper) with Product-specific content — never detached
- Layer naming: `Products/List/Row-Default`, `Products/Filters/Chip-Category`, `Products/Create/Step2-VariantMatrix/Row`, per the `Category/Component/Variant` convention
- Product Type selector cards (Step 1) are a new small variant set on the base Card component — Selected state uses `color-primary` border + `color-primary-container` fill, consistent with every other selectable-card pattern in the platform (e.g., POS's Payment Method tiles)
- Variables bound throughout — no hardcoded hex/px; Column-visibility and Density-toggle states persist as component properties reflecting user preference

---

## 16. Developer Handoff Notes

- Product Type (Step 1) must drive a form-schema config determining which steps/fields render, per `05-product-management.md` §24 — never per-type conditional branching scattered through the UI implementation.
- Variant Matrix (Step 2) and its stock-validation logic must be the exact shared component/service also used by POS's Variant Picker ([04-pos.md](../deliverables/04-pos.md) §7) and Inventory (07), per `05-product-management.md` §24 — one source of truth for "is this variant valid/in stock."
- Row expansion (§5) must lazy-load variant data on first expand, not eagerly fetch for every visible row, to keep initial table paint fast at 100,000+ product scale.
- Saved Views/Saved Searches (§4/§8) should persist as a serializable filter/column/sort/query config, reusable by the same mechanism other modules' list views (Inventory, Customers, Orders) already rely on — not reimplemented per module.
- Import validation (§9) must run the identical rule set as inline Create/Edit field validation — one shared validator invoked both per-field in the Stepper and per-row in the Import Preview.

---

**Next:** 06-product-detail-ui.md
