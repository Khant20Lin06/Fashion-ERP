# Design System Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Single Source of Truth
**Depends on:** 00-master-system.md
**Consumed by:** All future modules (02–29), all UI prompts

---

## 1. Design Philosophy

The platform reads as a premium enterprise SaaS product — the visual register of Linear, Shopify Admin, and SAP Fiori, tuned for the operational density of fashion retail (SKUs × variants × sizes × colors × stores).

Rules that govern every decision below:
- Every element must have a business purpose — no decoration.
- Consistency beats novelty. When in doubt, reuse.
- Optimize for the power user (cashier doing 200 transactions/day) without punishing the occasional user (store manager checking a weekly report).
- Information density is achieved through layout discipline (grid, spacing, typography scale), never by shrinking touch targets or contrast below AA.

---

## 2. Foundational Principles

| Principle | Implementation |
|---|---|
| Material Design 3 | Token structure, elevation model, state layers, shape system adapted from M3 |
| Desktop First | Design at 1440px canvas first, then compress to laptop/tablet/mobile |
| 12-column grid | See §6 |
| 8pt spacing | See §5 |
| WCAG AA | 4.5:1 text contrast, 3:1 UI component contrast, all states keyboard-reachable |
| Component variants | Every component defined as a variant set (size × state × emphasis), never a one-off |

---

## 3. Color System

Colors are defined as **semantic roles**, not raw hex usage. Raw hex values live in the Design Tokens module (29); this document defines the roles and their required relationships. Reference values below are the approved defaults.

### 3.1 Brand & Semantic Roles

| Role | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| Primary | `#1A56DB` | `#5B8DEF` | Primary actions, active nav, links, focus |
| Primary Container | `#E8EFFD` | `#16233D` | Selected row bg, active tab bg |
| Secondary | `#4B5768` | `#A6B0C3` | Secondary emphasis actions |
| Accent | `#7C3AED` | `#A78BFA` | Highlights, promotional callouts (sparingly) |
| Success | `#0E9F6E` | `#3FCF8E` | Positive status, in-stock, completed |
| Warning | `#D97706` | `#F5A524` | Low stock, pending, expiring |
| Error | `#E02424` | `#F87171` | Out-of-stock, failed, destructive |
| Info | `#0891B2` | `#22D3EE` | Informational banners, tips |
| Surface | `#FFFFFF` | `#12151C` | Cards, panels, modals |
| Background | `#F4F6F9` | `#0A0C10` | App canvas |
| Border | `#E2E5EA` | `#242832` | Dividers, input borders, table lines |
| Divider | `#EAECEF` | `#1C1F27` | Subtle section separation |
| Text Primary | `#111827` | `#F3F4F6` | Headings, body |
| Text Secondary | `#6B7280` | `#9CA3AF` | Helper text, metadata |
| Text Disabled | `#9CA3AF` @ 60% | `#6B7280` @ 60% | Disabled labels |
| Overlay/Scrim | `#0F172A` @ 48% | `#000000` @ 64% | Modal/drawer backdrop |
| Hover Layer | Primary @ 8% | Primary @ 12% | State layer over any interactive surface |
| Selected Layer | Primary @ 12% | Primary @ 16% | Selected row/item background |
| Focus Ring | `#1A56DB` @ 100%, 2px | `#5B8DEF` @ 100%, 2px | Keyboard focus outline, 2px offset |

**Rules:**
- Never use color alone to convey status — always pair with icon and/or text label (e.g., stock badges show icon + "Low Stock" text, not just an amber dot).
- Every Primary/Error/Warning/Success color must pass 4.5:1 against its paired background at both text and icon sizes.
- Dark mode is not an inverted filter — each token has an explicitly designed value above.

### 3.2 Data Visualization Palette

A fixed 8-color categorical sequence for charts (defined fully in module 25/29), plus dedicated Positive/Negative/Neutral trend colors reusing Success/Error/Text Secondary respectively — never introduce ad hoc chart colors per module.

---

## 4. Typography

**Font family:** Inter (UI text) / Roboto Mono (numeric tabular data — prices, SKUs, barcodes, quantities in tables) as fallback stack: `Inter, -apple-system, "Segoe UI", sans-serif`.

| Style | Size / Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|
| Display | 36 / 44 | 700 | -0.02em | Marketing/onboarding only, rarely in-app |
| Headline | 28 / 36 | 700 | -0.01em | Page titles |
| Title | 20 / 28 | 600 | 0 | Section/card headers |
| Subtitle | 16 / 24 | 600 | 0 | Sub-sections, dialog titles |
| Body | 14 / 20 | 400 | 0 | Default UI text |
| Body Small | 13 / 18 | 400 | 0 | Secondary descriptions |
| Caption | 12 / 16 | 400 | 0.01em | Metadata, timestamps |
| Overline | 11 / 16 | 600 | 0.08em, uppercase | Category labels, table group headers |
| Label | 13 / 16 | 500 | 0 | Form field labels |
| Button | 14 / 20 | 600 | 0.01em | Button text |
| Table Header | 12 / 16 | 600 | 0.02em, uppercase | Column headers |
| Table Cell | 13 / 20 | 400 | 0 | Table body; tabular-nums for numeric columns |
| Helper Text | 12 / 16 | 400 | 0 | Below inputs |
| Error Text | 12 / 16 | 500 | 0 | Validation errors, paired with error icon |

**Rules:**
- Never introduce a font size outside this scale.
- Numeric columns (price, qty, SKU) always use `font-variant-numeric: tabular-nums` for alignment.
- Line length for body text capped at ~80ch in read-heavy contexts (reports, descriptions).

---

## 5. Spacing System (8pt base, 4pt half-step)

| Token | Value | Typical Use |
|---|---|---|
| `space-1` | 4px | Icon-to-label gap, tight inline spacing |
| `space-2` | 8px | Compact component internal padding |
| `space-3` | 12px | Input internal padding, chip padding |
| `space-4` | 16px | Standard component padding, card padding |
| `space-5` | 20px | Card-to-card gap (compact density) |
| `space-6` | 24px | Section internal spacing, card padding (comfortable density) |
| `space-8` | 32px | Between major sections |
| `space-10` | 40px | Page-level vertical rhythm |
| `space-12` | 48px | Large section breaks |
| `space-14` | 56px | Modal padding (large) |
| `space-16` | 64px | Empty-state vertical centering offset |
| `space-20` | 80px | Hero/onboarding spacing |
| `space-24` | 96px | Rare — full-bleed marketing sections only |

Density modes: the platform supports **Comfortable** (default, table row height 48px) and **Compact** (table row height 36px) — a user-level preference, not a per-module decision.

---

## 6. Grid System

- **Desktop canvas:** 1440px design width, 12 columns, 24px gutter, 24px margin.
- **Container max-width:** 1440px, centered, background fills viewport.
- **Breakpoints:**

| Breakpoint | Width | Columns | Margin | Gutter |
|---|---|---|---|---|
| Desktop | ≥1440px | 12 | 24px | 24px |
| Laptop | 1024–1439px | 12 | 24px | 20px |
| Tablet | 768–1023px | 8 | 20px | 16px |
| Mobile | 360–767px | 4 | 16px | 12px |

- Sidebar (fixed 264px expanded / 72px collapsed) sits outside the grid; the content grid applies to the main content region only.
- Cards/panels snap to column boundaries; never use arbitrary fractional widths.

---

## 7. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Chips, badges, small buttons |
| `radius-md` | 8px | Inputs, buttons, cards (default) |
| `radius-lg` | 12px | Modals, drawers, large cards |
| `radius-xl` | 16px | Onboarding/marketing surfaces |
| `radius-full` | 9999px | Avatars, pills, switch tracks, FAB |

Applied consistently — a "card" is always `radius-lg` everywhere it appears, never `radius-md` in one module and `radius-lg` in another.

---

## 8. Elevation & Shadow

M3-style tonal elevation, shadows used sparingly (primarily for overlays, not resting surfaces).

| Level | Shadow | Usage |
|---|---|---|
| 0 | none | Base page background, flat cards on canvas |
| 1 | `0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)` | Resting cards, table rows on hover |
| 2 | `0 2px 4px rgba(16,24,40,0.08), 0 4px 8px rgba(16,24,40,0.10)` | Dropdowns, popovers, tooltips |
| 3 | `0 4px 8px rgba(16,24,40,0.10), 0 8px 16px rgba(16,24,40,0.12)` | Sticky header on scroll, dragged card |
| 4 | `0 8px 16px rgba(16,24,40,0.12), 0 16px 32px rgba(16,24,40,0.14)` | Modals, dialogs |
| 5 (overlay-only) | `0 12px 24px rgba(16,24,40,0.16), 0 24px 48px rgba(16,24,40,0.18)` | Command palette, full-screen drawer |

Dark mode uses elevation via subtle surface-tint lightening in addition to shadow, since shadows read poorly on dark backgrounds.

---

## 9. Iconography

- **Single library:** Phosphor Icons (Regular weight default, Bold for emphasis/active states) — chosen for coverage breadth (retail, logistics, finance glyphs) and consistent 24×24 grid.
- **Sizes:** 16px (inline/dense table), 20px (default UI), 24px (nav, section headers), 32px (empty-state illustration accents).
- Icons always paired with `aria-label` or adjacent text — never icon-only without a tooltip and accessible name.
- Stroke weight consistent at 1.5px across the Regular set; never mix in a second icon set for "one missing glyph" — commission/extend instead.

---

## 10. Button System

**Variants:** Primary (filled) · Secondary (tonal) · Outlined · Text · Danger (filled, error color) · Success (filled, success color) · Icon Button · FAB · Split Button · Dropdown Button.

**Sizes:** Small (32px height), Medium (40px height, default), Large (48px height) — horizontal padding 12/16/20px respectively.

**States (every variant):** Default, Hover (+state layer), Focused (2px focus ring, 2px offset), Pressed (state layer darkens, scale 0.98), Loading (spinner replaces label, width preserved, disabled interaction), Disabled (38% opacity, no pointer events), Selected (for toggle-style buttons — tonal background persists), Success/Error (transient — button briefly shows check/x icon after async action, 1.2s, then reverts).

**Rules:**
- Exactly one Primary button per view/section — never two competing primary CTAs.
- Destructive actions always use Danger variant + confirmation dialog (see §13).
- Icon-only buttons require 40×40 minimum hit area regardless of visual icon size (24px).

---

## 11. Form Components

Text Field, Textarea, Password, Search, Email, Phone, Number, Currency, Date, Time, Dropdown (Select), Autocomplete, Multi-Select, Checkbox, Radio, Switch, Slider, Upload, Image Picker, Barcode Scanner input, QR Scanner input.

**Shared anatomy:** Label (top-aligned) → Input container (44px height default, 8px radius, 1px border) → Helper/Error text below.

**States (every control):** Default, Hover, Focused (2px focus ring + border color shift to Primary), Filled, Disabled (surface tinted, text disabled color), Read Only (no border, subtle background), Error (border + text → Error color, error icon trailing, error text below), Loading (trailing spinner, e.g. async validation or barcode lookup), Success (trailing check, e.g. validated SKU).

**Retail-specific rules:**
- Currency fields always right-align value, show currency symbol as a fixed prefix, and format with thousands separators live.
- Barcode/QR scanner inputs auto-submit on scan-terminator character and show a distinct "scanning…" loading micro-state.
- Number/Quantity fields include stepper controls (+/-) at Medium/Large sizes for touch-friendly POS use.

---

## 12. Table System

Enterprise data table (used across Inventory, Products, Orders, Customers, Employees, Suppliers, Finance):

Sorting (click header, tri-state: asc/desc/none) · Filtering (per-column filter icon + global filter bar) · Search (debounced, highlights matches) · Pagination (page-size selector: 10/25/50/100 + jump-to-page) · Bulk selection (checkbox column, sticky bulk-action bar appears on selection) · Column resize (drag handle) · Column visibility (toggle via "Columns" menu) · Sticky header (on vertical scroll) · Sticky first column (on horizontal scroll, for identifying columns like SKU/Name) · Export (CSV/XLSX/PDF) · Print · Row actions (trailing overflow menu, max 2 inline icon actions + "more") · Expandable rows (for variant breakdown, e.g. product → size/color matrix) · Empty/Loading/Responsive states per §16.

Row height: 48px (Comfortable) / 36px (Compact). Zebra striping is **not** used (relies on hover state + border instead, per modern enterprise convention) — hover state uses Hover Layer token.

---

## 13. Card System

Variants: Summary, Analytics, Product, Customer, KPI, Activity, Chart, Statistic.

**Anatomy:** Header (title + optional overflow menu) → Body (content-specific) → Footer (optional, actions or metadata) → Status (optional top-border or corner badge for alerts).

**States:** Default, Hover (elevation 0→1, only if card is clickable), Loading (skeleton matching card's real layout), Empty (icon + message + optional CTA, never a blank box).

KPI Card specifically always shows: Label → Value (Headline-weight numeral) → Trend indicator (▲/▼ + % + Success/Error color + vs. period text) → optional sparkline.

---

## 14. Feedback Components

Toast (bottom-right, auto-dismiss 4s, stackable, max 3 visible) · Snackbar (bottom-center, action + dismiss) · Alert (inline, persistent, 4 semantic variants) · Banner (page-top, dismissible, for system-wide notices e.g. "Store offline — syncing") · Inline Message (below a form section) · Notification (bell panel, persistent log) · Confirmation Dialog (for reversible risky actions) · Success/Error Dialog (blocking, for critical outcomes e.g. "Sale completed") · Progress Indicator (linear for determinate, circular for indeterminate).

**Rule:** Destructive/irreversible actions (delete product, void transaction, terminate employee) always require a Confirmation Dialog with the target's name typed or explicitly re-stated — never a single-click delete on a table row.

---

## 15. Navigation Components

Sidebar (persistent, collapsible, role-based menu items — see module 26) · Top Header (global search, branch switcher, notifications, profile) · Breadcrumb (below header, all screens except top-level dashboards) · Tabs (section-level navigation within a screen) · Stepper (multi-step forms — e.g. Purchase Order creation) · Pagination · Drawer (contextual detail/edit without leaving list context) · Command Palette (Cmd/Ctrl+K, power-user navigation + actions) · Quick Actions (floating, role-contextual — e.g. "New Sale" for Cashier) · Profile Menu · Notification Panel.

Full IA and per-role menu structure is defined in module 02-navigation.md, inheriting all tokens from this document.

---

## 16. Data Visualization

Line, Bar, Area, Pie, Donut, Table, Heatmap, Progress/Gauge, KPI Cards, Trend Indicators.

- Charts never rely on color alone: direct labeling or legend + pattern/marker differentiation for colorblind accessibility.
- Minimum text size in charts: 12px (Caption).
- All charts have an accessible data-table fallback (toggle or screen-reader-only table) — required for WCAG AA on complex visualizations.
- Full chart color tokens defined in module 29.

---

## 17. Empty / Loading / Error States

Every screen defines all of: Loading (skeleton, shape-matched to real content) · Empty (first-use, zero-data — icon + headline + explanation + primary CTA) · No Search Result (distinct from Empty — "no matches" + clear-filters CTA) · Offline (banner + disabled write actions + queued-sync indicator, relevant for POS) · Permission Denied (role lacks access — explanation, not a blank 403) · 404 · 500/Server Error · Success · Warning.

Full state catalog with copy guidelines lives in module 28-error-empty-loading.md; this document fixes the *visual* pattern (icon + headline + body + action, centered, `space-16` vertical offset) that all of those states must use.

---

## 18. Motion System

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `motion-fast` | 100ms | Standard | Hover, focus ring |
| `motion-base` | 200ms | Standard | Fade, tab switch |
| `motion-moderate` | 300ms | Decelerate | Modal/drawer enter |
| `motion-slow` | 400ms | Decelerate | Full-page transitions |

Easing curves: Standard `cubic-bezier(0.2,0,0,1)`, Decelerate `cubic-bezier(0,0,0,1)`, Accelerate `cubic-bezier(0.3,0,1,1)`.

Respects `prefers-reduced-motion`: all transforms/slides degrade to opacity-only fades ≤100ms.

---

## 19. Responsive Design

| Breakpoint | Sidebar | Table Strategy | Cards |
|---|---|---|---|
| Desktop/Laptop | Expanded/collapsible | Full columns | Multi-column grid (3–4 up) |
| Tablet | Collapsed to icon rail, opens as overlay | Priority columns + horizontal scroll for rest | 2-up grid |
| Mobile | Hidden, hamburger → full-screen drawer | Converts to stacked card-per-row list | 1-up stacked |

POS screen (module 04) is the one exception designed **tablet-first** in addition to desktop, given real-world register hardware — noted explicitly when that module is generated.

---

## 20. Accessibility

- Full keyboard navigation: logical tab order, all interactive elements reachable, visible 2px focus ring (never `outline: none` without replacement).
- ARIA labels on icon-only controls, live regions for toast/async status updates.
- Color contrast: 4.5:1 text, 3:1 large text/icons/UI borders — validated per token pair in §3.
- Minimum touch target 40×40px (44×44px on touch/tablet contexts like POS).
- Tables: proper `<th scope>`, sortable columns announce sort state, row selection announces count.
- Forms: label bound via `for`/`id`, error messages linked via `aria-describedby`, required fields marked both visually and via `aria-required`.
- Dialogs trap focus, return focus to trigger on close, closable via Escape.

---

## 21. Figma Implementation Notes

- All values above exist as Figma Variables (color, spacing, radius modes) — light/dark as variable modes, not duplicate layers.
- Components built as variant sets: e.g. `Button` component with properties `Variant`, `Size`, `State`, `Icon` rather than dozens of separately named components.
- Auto Layout on every group; no absolute positioning except decorative background elements.
- Naming convention: `Category/Component/Variant` (e.g. `Form/TextField/Error`, `Nav/Sidebar/Collapsed`).

---

## Final Rules

This document is binding for every module that follows. Modules 02–29 (and their `-ui` counterparts) must reference these tokens and states by name, not redefine them. Any new component discovered to be missing during a later module should be added back into this system (versioned), never created as a one-off local variant.

**Next:** 02-navigation.md
