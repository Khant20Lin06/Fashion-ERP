# Executive Dashboard — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [03-dashboard.md](../deliverables/03-dashboard.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This document does not redecide anything already settled in `03-dashboard.md` (widget catalog, role-adaptive layout rules, filter behavior). It specifies exact grid placement, component instancing, spacing, and interaction detail so the screen is Figma-buildable and developer-handoff ready.

---

## 1. Screen Anatomy (Desktop, 1440px canvas)

```
┌────────────────────────────────────────────────────────────────────┐
│ Top Header (64px) — Navigation §3                                  │
├───────────┬──────────────────────────────────────────┬─────────────┤
│           │ Page Header (lightweight, Dashboard §4)   │             │
│  Sidebar  ├──────────────────────────────────────────┤ Right Panel │
│  264px    │ Global Filter Bar                         │ 360px       │
│  expanded │──────────────────────────────────────────│ (§6 below)  │
│           │ KPI Card Row (horizontal scroll)          │             │
│           │──────────────────────────────────────────│             │
│           │ Analytics Section (12-col grid)           │             │
│           │──────────────────────────────────────────│             │
│           │ Operational Widgets (3-col grid)          │             │
│           │──────────────────────────────────────────│             │
│           │ Activity Timeline + Alert Center           │             │
└───────────┴──────────────────────────────────────────┴─────────────┘
```

Content region margin: `space-6` (24px) left/right/top. Vertical rhythm between major sections: `space-8` (32px). This is the Business Owner/CEO default view — the role-adaptive widget set from `03-dashboard.md` §2 applies identically at the layout-mechanics level described below; only which cards populate each slot changes per role.

---

## 2. Global Header (inherits Navigation §3 exactly — instanced, not redesigned)

64px height, `elevation-1` at rest → `elevation-3` once page content scrolls beneath it (per Design System §8). Layout, left→right:

| Zone | Component | Notes |
|---|---|---|
| Left | Logo (32px) + Sidebar collapse toggle | `icon-size-lg` (24px) toggle icon |
| Center-left | Workspace/Branch Switcher | Dropdown, `type-body` label + chevron-down |
| Center | Global Search | Expands to 480px on focus; placeholder "Search products, orders, customers…" |
| Right | Quick Actions (+) · Tasks · Notifications (bell, badge) · Help (?) · Settings (gear) · Profile avatar | All icon buttons 40×40px hit area, `icon-size-lg` visual, `space-4` gaps between |

**Breadcrumb:** omitted — Dashboard is a root page per Navigation §8's rule (no breadcrumb on top-level landing screens).

---

## 3. Page Header (Lightweight Variant)

Single row, `space-4` vertical padding, positioned directly under the Top Header, above the Filter Bar:

- **Left:** `type-headline` "Dashboard" + Branch/Workspace chip (Body Small, `color-text-secondary`, `radius-full` pill background `color-primary-container`)
- **Right, in order:** Date Range Selector (Dropdown, default "Today") · Refresh icon button (spins during fetch) · Export icon button · Share Dashboard button (Secondary/tonal, `type-button`) · "Last Updated: 2m ago" (`type-caption`, `color-text-secondary`, tooltip on hover shows exact timestamp)

---

## 4. Global Filter Bar

Horizontal row of Dropdown chips (`chip-radius`, Small button size, 32px height), left-aligned: Branch · Warehouse · Date Range (primary — never collapses) · Sales Channel · Category · Brand · Collection · Season · Employee · Customer Segment.

- Beyond 5 visible chips at Laptop width, remainder collapse into an "More Filters" overflow chip (opens a popover checklist).
- Active filters render as removable chips below the bar (`space-2` gap between bar and active-chip row), each with a trailing ✕ (12px, `icon-size-sm`).
- "Clear all" text link, `type-body-small`, `color-primary`, right-aligned on the active-chip row.
- Filter bar sits at `z-sticky` beneath the Top Header on scroll for long dashboards.

---

## 5. KPI Card Row

Horizontal scroll container, `space-6` gap between cards, each card 200px min-width, 132px height. Card component = `card-radius` (`radius-lg`), `elevation-0` at rest (flat on canvas), `card-padding` (`space-6`).

**Anatomy per card** (KPI Card variant, Design System §13):
```
[Icon 20px]                    [ⓘ info icon, top-right, 16px]
Label (type-caption, color-text-secondary)
$142,850  (type-headline, color-text-primary)
▲ 8.2%  vs. yesterday  (type-body-small, color-success + chart-positive arrow glyph)
[sparkline, 32px height, chart-cat-1 stroke]
```

- Cards: Today's Sales, Yesterday's Sales, Monthly Revenue, Gross Profit, Net Profit, Orders, AOV, Total Customers, New Customers, Returning Customers, Inventory Value, Low Stock Count, Out of Stock Count, Pending POs, Pending Deliveries, Pending Returns (full catalog per `03-dashboard.md` §6; role-filtered subset renders here).
- **Value color rule:** Out of Stock / Low Stock cards render the numeral itself in `color-error`/`color-warning` (not just the trend line) — the absolute count is the alert.
- Clicking a card navigates to that metric's filtered module list (e.g., "Low Stock Count" → Inventory list, low-stock filter pre-applied) — `motion-fast` scale-down (0.98) on press per Button/Card pressed-state token.
- Scrollbar hidden; scroll affordance via a subtle right-edge gradient fade (16px, `color-background` → transparent) hinting more cards exist off-screen.

---

## 6. Right Panel (360px, fixed, independently scrolling)

`elevation-0`, left border `1px solid color-border` separating it from Main Content. Internal padding `space-6`. Sections stacked with `space-8` gaps:

1. **Today's Tasks** — compact list, checkbox + `type-body` label + due-time (`type-caption`), max 5 visible + "View all →"
2. **Pending Approvals** — Alert-style rows (Warning-tinted left border 3px), requester name + amount + type, inline Approve/Reject icon buttons (reuses the shared Approval component pattern)
3. **Notifications** — top 3 unread, identical row anatomy to the header bell panel (Navigation §13), "View all →" deep-links to full Notification Center
4. **Calendar** — mini month view, current date circled `color-primary`, dots under dates with events
5. **Upcoming Events** — list rows, date badge (`radius-md`, `color-primary-container` bg) + event title + time

Right Panel collapses to an overlay (triggered by a toggle icon in the Page Header) at Laptop width and below, per §11.

---

## 7. Analytics Section (12-column grid, `space-6` gutters)

Mixed card widths, each sub-section a Chart Card (Design System §13):

| Row | Widget | Grid Span | Chart Type |
|---|---|---|---|
| 1 | Sales Trend (with granularity toggle: Day/Week/Month/Year segmented control, top-right of card) | 8 cols | Area chart, `chart-cat-1` fill @ 12% opacity + stroke |
| 1 | Sales by Payment Method | 4 cols | Donut, `chart-categorical` sequence |
| 2 | Sales by Branch | 6 cols | Horizontal bar, ranked descending |
| 2 | Sales by Category | 6 cols | Donut (≤6 categories) |
| 3 | Inventory Value + Stock Distribution | 4 cols | Donut: In Stock/Low/Out/Overstock, `color-success`/`color-warning`/`color-error`/`color-info` |
| 3 | Inventory Turnover Trend | 4 cols | Line |
| 3 | Financial Overview (Revenue vs. Expenses) | 4 cols | Combo bar+line — **visible only to Business Owner/Finance Manager/Regional Manager per role gating (03 §10)** |

Each Chart Card: Header (Title `type-title` + overflow menu `⋮` → Export/View as Table/Fullscreen) → chart body (min-height 280px) → optional footer caption. Drill-down: clicking a bar/donut segment applies a platform-wide drill-down chip ("Filtered: Outerwear ✕") above the Analytics Section, re-scoping every widget below it.

---

## 8. Operational Widgets (3-column grid at Desktop, `space-6` gutters)

Compact cards, 240px min-height: Recent Sales · Recent Purchase Orders · Inventory Alerts · Approval Requests · Employee Attendance · Upcoming Deliveries · Recent Returns · Supplier Notifications.

**Anatomy:** Header (`type-title` + "View all →" link, `type-body-small` `color-primary`) → up to 5 rows (avatar/icon + primary text `type-body` + secondary text `type-caption` + trailing status badge) → Empty state if none (icon + one-line message, centered, per UX State System §7).

**Approval Requests / Inventory Alerts specifically** include an inline action button per row (Approve/Reject, or "Reorder now") — Small Secondary button, right-aligned in the row.

---

## 9. Activity Timeline + Alert Center

Side-by-side at Desktop (Activity Timeline 8 cols, Alert Center 4 cols), stacked below Operational Widgets, `space-8` top margin.

**Activity Timeline:** reverse-chronological feed, each row: actor avatar (24px) → `type-body` description with bold entity names → status badge (optional) → `type-caption` relative timestamp (right-aligned). Category filter chips above the list. Infinite scroll, 25-row pages, skeleton row shimmer while loading more.

**Alert Center:** stacked Alert components (Design System §14), Warning/Error severity left-border accent, icon + message + inline resolving action button. Critical (Error) alerts sort to top regardless of recency — visually separated by a thin divider from Warning-tier alerts below.

---

## 10. Charts — Shared Build Spec

Every chart instance in this screen uses:
- `chart-categorical` 8-color sequence for multi-series; `chart-positive`/`chart-negative`/`chart-neutral` for trend-only visuals
- Axis text `type-caption`, `chart-axis-text` color; grid lines `chart-grid-line`
- Tooltip: `chart-tooltip-bg` + `elevation-2`, shows exact value + date/label on hover
- Every chart's overflow menu includes "View as Table" — renders the identical data as an accessible HTML table (WCAG AA fallback, per Design System §16)
- Responsive resize: labels thin (show every Nth) before font drops below `type-caption`'s 12px floor

---

## 11. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover (card/row) | `color-hover` layer overlay, `motion-fast` |
| Focus (keyboard) | 2px `color-focus` ring, 2px offset, per Design System §20 |
| Selection (drill-down chip) | `color-selection` background persists until cleared |
| Click (KPI card, chart segment) | Navigates/drills down per §5/§7 |
| Right-click (table rows elsewhere on dashboard, e.g., Recent Sales) | Context menu: View, Duplicate action set per row type |
| Drag & Drop | Not applicable on this screen (Dashboard Builder's drag-and-drop, per Reports 17 §16, is a separate module) |
| Keyboard Navigation | Tab order: Header controls → Filter Bar chips → KPI cards (arrow-key horizontal scroll) → Analytics widgets → Operational widgets → Timeline/Alerts → Right Panel |

---

## 12. States

| State | Treatment |
|---|---|
| Loading (initial) | Full skeleton: KPI card skeletons (shimmer, shape-matched), chart-area gray blocks, operational-widget row skeletons — per UX State System §6 |
| Skeleton (filter change) | Per-widget only; rest of dashboard remains interactive, per Dashboard spec §5 |
| Empty Dashboard | New tenant: centered illustration + "No data yet — sales will appear here once you complete your first transaction" + "Open POS" primary CTA |
| No Data (filtered) | Distinct from Empty Dashboard — "No results for the selected filters" + "Clear filters" action |
| Permission Denied (section-level) | Financial Overview widget replaced with lock icon + "You don't have access to this section" — never a blank gap |
| Offline | Page-top Banner: "You're offline — showing last synced data from [time]" — filters/refresh disabled, cached data remains visible |
| Error (per-widget) | Inline card-level error: "Couldn't load this widget" + Retry button — isolated, never blanks the full dashboard |
| Retry | Standard retry affordance, consistent styling across every failed widget |
| Success Feedback | Toast (bottom-right, 4s auto-dismiss) for actions like "Dashboard link copied" or "Report exported" |

---

## 13. Responsive Behavior

| Breakpoint | Sidebar | Right Panel | KPI Row | Analytics | Operational Widgets |
|---|---|---|---|---|---|
| Desktop (≥1440) | Expanded | Inline, 360px | 6–8 visible | Multi-column (up to 3-wide) | 3-column grid |
| Laptop (1024–1439) | Collapsible | Inline, 320px or overlay toggle | 4–6 visible | 2-column adaptive | 2-column grid |
| Tablet (768–1023) | Icon rail, overlay | Overlay only | Horizontal scroll, 3 visible | Stacked, full-width charts | 2-column grid |
| Mobile Executive View (360–767) | Hidden, drawer | Overlay, full-screen | Horizontal scroll, 1.5 visible (peek) | Stacked, collapsible accordion per sub-section (Sales/Inventory/Customer/Financial) | Single column |

At Mobile, this screen maps to Mobile Manager's own Mobile Dashboard (24 §5) rather than a shrunk version of this layout — this responsive table governs the web back-office's own narrow-viewport behavior specifically (a manager opening the web app in a mobile browser), distinct from the native app.

---

## 14. Accessibility

- Full keyboard tab order per §11; KPI card horizontal scroll region is arrow-key navigable
- Every chart has a "View as Table" accessible fallback (§10)
- `aria-live="polite"` on "Last Updated" timestamp and any auto-refreshing KPI value
- Alert Center rows use `role="alert"` for Critical/Error severity only (Warning-tier uses `role="status"` to avoid overly aggressive screen-reader interruption)
- Color never sole differentiator: trend indicators always pair ▲/▼ glyph with color; stock-status badges always pair icon + text label
- Focus trapping on any opened overlay (Filter overflow popover, Right Panel mobile overlay) with Escape-to-close and focus-return to trigger element

---

## 15. Figma Build Notes

- Frame: `Dashboard/Desktop/1440`, Auto Layout vertical, `space-6` padding
- Every KPI card, Chart Card, and Operational Widget card is an **instance** of the Design System's Card component (§13 there) with variant properties (`Type=KPI|Chart|Statistic`, `State=Default|Loading|Empty`) — never a detached/one-off frame
- Layer naming: `Dashboard/KPIRow/Card-TodaySales`, `Dashboard/Analytics/Chart-SalesTrend`, `Dashboard/Operational/Widget-RecentSales`, following the `Category/Component/Variant` convention from Design System §21
- Variables bound: every color/spacing/radius value in this spec references a Figma Variable from the token set (29) — no raw hex/px values pinned directly on any layer
- Component Properties exposed: KPI Card's `Trend Direction` (boolean up/down), `Value Color Override` (for stock-alert cards), Chart Card's `Chart Type` — allowing content changes without swapping component instances

---

## 16. Developer Handoff Notes

- Widget visibility/order per role should read from the role-to-layout config map specified in `03-dashboard.md` §21 — this UI spec's card set represents the Business Owner default view; other roles render a filtered/reordered subset of the identical component instances, never a redesigned layout.
- Filter state (§4) is lifted to page-level context; every widget subscribes rather than manages its own filter copy, per `03-dashboard.md` §21's architecture note.
- Chart components must accept the shared palette/token config from `29-design-tokens.md` §16 rather than hardcoding series colors per instance.
- Per-widget loading/error isolation (§12) requires each widget to be an independently-fetching unit — no single slow query should block the shell from rendering, per the widget-isolation principle established since `03-dashboard.md` §21.

---

**Next:** 02-pos-ui.md
