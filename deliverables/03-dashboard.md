# Dashboard Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md)
**Consumed by:** fashion-ui-prompts/01-dashboard-ui.md

---

## 1. Module Objective

The Dashboard is the command center — a role-scoped 10-second health check of the business: Sales Performance, Inventory Health, Financial Summary, Operational Alerts, Staff Performance, Customer Insights, and one-click access to the highest-frequency actions.

It is a root page (per [02-navigation.md](02-navigation.md) §8, no breadcrumb) and the default landing screen for every role except Cashier/Sales Associate, who land on POS.

---

## 2. Role-Adaptive Views

One dashboard **template**, not eight separate screens — sections are added/removed/reordered by role via widget visibility rules, so the layout stays muscle-memory-consistent when a user's role changes (e.g., promotion).

| Role | Sections shown (in order) | Sections hidden |
|---|---|---|
| Super Admin | All sections + System Health widget | — |
| Business Owner | KPI (all) → Sales Analytics → Financial Overview → Inventory Analytics → Customer Analytics → Activity Timeline | Employee Attendance detail (summary only) |
| Regional Manager | KPI (branch-comparison focus) → Sales by Branch → Inventory Analytics → Alert Center → Activity Timeline | Payroll-level Financial detail |
| Branch Manager | KPI (branch-scoped) → Sales Analytics → Inventory Analytics → Operational Widgets → Activity Timeline | Multi-branch comparisons, Financial Overview (P&L) |
| Store Manager | KPI (store-scoped, daily focus) → Recent Sales → Inventory Alerts → Employee Attendance → Quick Actions | Financial Overview, Customer LTV analytics |
| Warehouse Manager | KPI (inventory-scoped) → Inventory Analytics (full) → Upcoming Deliveries → Stock Aging → Alert Center | Sales Analytics, Financial Overview |
| Finance Manager | KPI (financial-scoped) → Financial Overview (full) → Outstanding Payments/Receivables → Expense Categories | Inventory Analytics, Employee Attendance |
| Sales Manager | KPI (sales-scoped) → Sales Analytics (full) → Sales by Employee → Top Customers → Activity Timeline | Financial Overview (P&L), Warehouse Utilization |

**Rule:** widget components themselves are never redesigned per role — only the *set and order* of widgets change, all drawing from the same component library (§6–§11 below). Data is additionally row-level scoped to the user's assigned branch/region per the active Workspace Switcher context (Navigation §14).

---

## 3. Page Structure

Inherits the global shell from [02-navigation.md](02-navigation.md) §2. Dashboard-specific content region:

```
Page Header (lightweight variant, §4)
↓
Global Filter Bar (§5)
↓
KPI Card Row (§6) — horizontally scrollable strip on smaller widths
↓
Analytics Section (§7–§10) — 12-col grid, mixed card widths
↓
Operational Widgets (§11) — 2–3 column widget grid
↓
Activity Timeline + Alert Center (§13–§14) — side-by-side on desktop, stacked below
↓
Quick Actions (§12) — persistent floating cluster, not a scrolled section
```

Grid: content region uses the standard 12-column grid ([01-design-system.md](01-design-system.md) §6) with `space-6` gutters between cards and `space-8` between major sections.

---

## 4. Page Header (Lightweight Variant)

Unlike standard module Page Headers (Navigation §7), the Dashboard header omits Description and uses a condensed single row:

`Dashboard Title` + `Current Branch/Workspace chip` — left. `Date Range Selector` · `Refresh` · `Export` · `Share Dashboard` · `Last Updated: 2m ago` — right.

- **Share Dashboard:** opens a dialog to generate a read-only scoped link (respects the recipient's own role permissions if they're an internal user) or export a snapshot (PDF/image) for external sharing (e.g., to a franchise partner).
- **Last Updated** ticks live; hovering shows exact timestamp; becomes a manual "Refresh now" affordance if auto-refresh has failed (paired with a subtle Warning-colored dot).

---

## 5. Global Filter Bar

Filter chips: Branch · Warehouse · Date Range · Sales Channel · Category · Brand · Collection · Season · Employee · Customer Segment.

- Rendered as a horizontal row of dropdown chips (Design System Dropdown component, small size), with a "Filters" overflow button once more than 5 are active on narrower widths.
- **Date Range** is the primary filter and always visible (never collapses to overflow) — presets (Today, Yesterday, Last 7 Days, Last 30 Days, This Month, This Quarter, This Year, Custom Range) plus a custom calendar picker.
- Changing any filter updates **every widget on the page simultaneously** — each widget shows its own lightweight loading skeleton (not a full-page reload) while refetching, so the rest of the dashboard stays interactive.
- Active filters display as removable chips beneath the bar; "Clear all" resets to the role's default (typically Today + user's assigned branch).
- Filter state is shareable via the Share Dashboard link (§4) and persists per-user per-session (returning to the dashboard restores last-used filters, not defaults).

---

## 6. KPI Cards

Uses the KPI Card component (Design System §13) exactly as specified: Label → Value (Headline weight) → Trend indicator (▲/▼ + % + Success/Error color + vs. period) → sparkline.

**Full catalog** (role-filtered per §2): Today's Sales · Yesterday's Sales · Monthly Revenue · Gross Profit · Net Profit · Orders · Average Order Value · Total Customers · New Customers · Returning Customers · Inventory Value · Low Stock Count · Out of Stock Count · Pending Purchase Orders · Pending Deliveries · Pending Returns.

**Layout:** horizontally scrollable card strip at 200px min-width per card on Desktop/Laptop (typically 6–8 visible without scrolling); each card is independently clickable, navigating to the relevant module's filtered list (e.g., "Low Stock Count" → Inventory list pre-filtered to low-stock).

**Card-specific rules:**
- Comparison basis is explicit in small text under the trend (e.g., "vs. yesterday," "vs. last month") — never an unlabeled percentage.
- Out of Stock / Low Stock cards use Error/Warning color on the value itself (not just the trend) since the absolute number is the alert, not just its direction.
- Tooltip (on the info icon in the card header) explains the exact calculation (e.g., "Gross Profit = Revenue − COGS, excludes returns pending approval") — critical for finance-adjacent metrics where users will question the number.

---

## 7. Sales Analytics

- **Daily / Weekly / Monthly / Yearly Sales Trend** — single Line/Area chart with a time-granularity toggle (segmented control) rather than four separate charts.
- **Sales by Branch, Category, Brand, Collection, Payment Method, Employee** — each a Bar or Donut chart depending on cardinality (Donut for ≤6 categories like Payment Method; horizontal Bar for higher-cardinality or ranked lists like Sales by Employee).
- **Drill-down:** clicking any chart segment/bar filters the whole Analytics section by that dimension (e.g., click "Outerwear" in Sales by Category → all analytics below narrow to Outerwear) with a visible active-drill-down chip and a one-click "Reset drill-down."

---

## 8. Inventory Analytics

Inventory Value (headline stat) · Stock Distribution (Donut: In Stock / Low / Out / Overstock) · Inventory Turnover (trend line) · Fast Moving / Slow Moving / Dead Stock (three ranked mini-lists, top 5 each with "View all →") · Stock Aging (Heatmap or bucketed Bar: 0-30/31-60/61-90/90+ days) · Warehouse Utilization (Progress/gauge per warehouse).

Fast/Slow/Dead Stock lists reuse the compact list-row pattern (thumbnail + name + SKU + metric), consistent with table row styling but without full table chrome, since these are top-N previews, not the canonical data source (full detail lives in the Inventory module).

---

## 9. Customer Analytics

Total / New / Returning Customers (trend, feeds KPI row too) · Top Customers (ranked list: avatar, name, LTV, last purchase) · Customer Lifetime Value (distribution chart) · Loyalty Distribution & Membership Levels (Donut, tiers colored consistently with the Loyalty module's tier colors — module 11) · Customer Growth (line chart) · Top Spending Customers (ranked list, links to Customer detail).

---

## 10. Financial Overview

Revenue vs. Expenses (combo Bar+Line) · Gross Profit / Net Profit (KPI + trend) · Cash Flow (Area chart, in/out) · Outstanding Payments / Outstanding Receivables (two Statistic Cards with an "Aging" breakdown on hover/click) · Top Expense Categories (horizontal Bar).

Only visible to Business Owner, Finance Manager, and (branch-scoped) Regional Manager per §2 — this section is the most access-sensitive on the dashboard and must respect row-level branch scoping in addition to role visibility (a Regional Manager sees their region's P&L, never another region's).

---

## 11. Operational Widgets

Compact card grid (2–3 columns depending on breakpoint): Recent Sales · Recent Purchase Orders · Inventory Alerts · Approval Requests · Employee Attendance · Upcoming Deliveries · Recent Returns · Supplier Notifications.

Each widget: Header (title + "View all →" link to the owning module) → up to 5 most-recent/relevant rows → Empty state if none (§16). Approval Requests and Inventory Alerts additionally surface an inline action (Approve/Reject, or "Reorder now") directly on the widget row — the two widget types where an extra click to leave the dashboard would meaningfully slow down a manager's morning routine.

---

## 12. Quick Actions

Floating action cluster (bottom-right on Desktop, or the header `+` per Navigation §10 — the dashboard surfaces the same global Quick Actions list, not a separate one): New Sale · Open POS · Create Product · Create Customer · Create Purchase Order · Transfer Stock · Stock Adjustment · Generate Report · Manage Promotions.

Role-ordered identically to Navigation §10's rule (frequency-first per role, same underlying action set).

---

## 13. Activity Timeline

Reverse-chronological feed: Sales Created · Products Updated · Inventory Adjusted · Purchase Approved · Customer Registered · Returns Processed · System Alerts.

Each entry: actor avatar → Action description (e.g., "Nina L. adjusted stock for **Denim Jacket – Blue, M**") → Status badge (where applicable, e.g., "Approved") → relative timestamp (hover for exact). Infinite-scroll paginated (25 per page), with a category filter chip row matching the notification categories (Navigation §13) for consistency.

---

## 14. Alert Center

Distinct from the Activity Timeline (that's a *log*; this is *action-needed*): Critical Low Stock · Out of Stock · Pending Approvals · Failed Synchronization · Payment Due · Supplier Delay · Inventory Discrepancy · System Maintenance.

Rendered as a stacked list of Alert components (Design System §14), each Warning or Error severity, with a direct resolving action button per alert (e.g., "Reorder," "Review," "Retry Sync") — an alert with no available action is a notification, not an alert, and belongs in §13/Notification Center instead. Critical (Error-severity) alerts sort to the top regardless of recency.

---

## 15. Charts & Visualization — Shared Rules

All charts (Line, Bar, Area, Donut, Heatmap, Progress/Trend) on this dashboard:
- Support hover tooltips showing exact value + date/label (never rely on axis reading alone).
- Support click-to-filter drill-down where noted (§7).
- Include a per-chart overflow menu: Export (PNG/CSV), View as Table (accessibility fallback per Design System §16), Fullscreen.
- Resize responsively without label overlap — at narrow widths, axis labels rotate or thin (show every Nth label) before font size is reduced below the 12px minimum.
- Use the fixed categorical/semantic palette from Design System §3.2 — Sales is always chart-color-1, Returns always Error-based, etc., consistent across every widget so color meaning doesn't have to be re-learned chart-to-chart.

---

## 16. Empty / Loading / Error States

| State | Behavior |
|---|---|
| **Loading (initial)** | Full skeleton matching final layout: KPI card skeletons, chart-area gray blocks with shimmer, list-row skeletons — per Design System §17 pattern |
| **Loading (filter change)** | Per-widget skeleton only; rest of dashboard remains interactive |
| **No Data (new store, no history)** | Centered empty state per widget: icon + "No sales data yet" + "Sales will appear here once you complete your first transaction" + CTA "Open POS" |
| **No Sales (today, existing store)** | Lighter-touch inline message within the widget, not a full empty-state takeover — e.g., chart area shows a flat zero-line with a caption, since the *store* isn't new, just today is quiet |
| **No Inventory Alerts** | Positive-framed empty state: check icon + "All stock levels healthy" (Success color) — absence of alerts is good news, must not look like a broken widget |
| **Offline** | Page-top Banner (Navigation-level component): "You're offline — showing last synced data from [time]"; filters/refresh disabled, cached data remains visible and clearly timestamped |
| **Permission Denied (section-level)** | Section replaced with a muted placeholder: lock icon + "You don't have access to Financial Overview" — never a blank gap that looks like a bug |
| **Server Error** | Per-widget inline error card: "Couldn't load this widget" + Retry button — isolated so one failing widget doesn't blank the whole dashboard |
| **Slow response (>3s)** | Skeleton persists with no additional spinner stacking; if >10s, a subtle inline "Still loading…" appears without blocking other widgets |

---

## 17. Responsive Behavior

| Breakpoint | KPI Row | Analytics | Operational Widgets | Timeline/Alerts |
|---|---|---|---|---|
| Desktop (≥1440) | 6–8 visible, scroll for rest | Multi-column (up to 3-wide charts) | 3-column grid | Side-by-side |
| Laptop (1024–1439) | 4–6 visible | 2-column adaptive grid | 2-column grid | Side-by-side |
| Tablet (768–1023) | Horizontal scroll, 3 visible | Stacked, full-width charts | 2-column grid | Stacked |
| Mobile (360–767) | Horizontal scroll, 1.5 visible (peek) | Stacked, single chart per row, collapsible section headers | Single column | Stacked, Alert Center above Timeline |

On Mobile, each Analytics sub-section (Sales/Inventory/Customer/Financial) collapses behind an accordion header so the page remains scannable rather than an endless scroll.

---

## 18. Accessibility

- All chart data available via "View as Table" (per §15) — satisfies WCAG AA for complex visualizations per Design System §20.
- KPI cards, alerts, and timeline entries are focusable, keyboard-activatable (Enter/Space), with visible focus rings.
- Filter bar chips are a proper `listbox`/`combobox` pattern with arrow-key navigation.
- Live-updating elements (Last Updated timestamp, auto-refreshing KPIs) use `aria-live="polite"` so updates are announced without disrupting focus.
- Color is never the sole differentiator for trend direction — ▲/▼ glyphs always accompany Success/Error coloring on trend indicators.

---

## 19. Interaction States

Every interactive dashboard element (KPI cards, chart segments, filter chips, alert action buttons, timeline rows, quick action buttons) implements the full state set from Design System §10 baseline: Default, Hover, Focused, Pressed, Selected (for active drill-down/filter chips), Loading, Disabled, Success/Error (for alert resolution actions — e.g., "Reorder" button shows a brief success check after submission). Transitions use `motion-fast`/`motion-base` tokens only — no dashboard animation exceeds 300ms.

---

## 20. Edge Cases

- **No sales today, existing store:** handled distinctly from new-store empty state (§16).
- **Multiple branches, "All Branches" filter selected:** KPI cards and charts show aggregated totals; Sales by Branch chart becomes the primary comparison view rather than redundant with the KPI row.
- **Large datasets (e.g., Sales by Employee at a 200-employee enterprise):** ranked lists always cap visible rows (top 5–10) with "View all" deep-linking to the full report (module 17), never rendering unbounded lists inline.
- **Network interruption mid-session:** Offline state (§16) triggers automatically; on reconnect, all widgets silently refresh and the offline banner dismisses with a brief "Back online — data refreshed" toast.
- **Permission restrictions mid-session (role changed by admin while user is logged in):** next data refresh re-evaluates visible sections; a section that disappears shows a one-time toast explaining why, rather than silently vanishing.
- **Slow API response:** per-widget isolation (§16) ensures one slow endpoint (e.g., a heavy Customer LTV aggregation) never blocks KPI cards or other fast-loading widgets from appearing.

---

## 21. Developer Implementation Notes

- Dashboard is composed of independently-fetching widget components — each owns its own loading/error/empty state (§16) so no single slow query blocks the page shell from rendering.
- Widget visibility/order per role (§2) should be driven by a role-to-layout config map, not per-widget conditional branches scattered through the page — keeps future role additions a config change, not a code change.
- Filter state (§5) is lifted to a page-level context/store; widgets subscribe to it rather than each managing their own copy, ensuring the "update every widget simultaneously" rule (§5) holds without prop-drilling drift.
- Chart components must accept a shared palette/token config (Design System §3.2) rather than hardcoding series colors per chart instance.
- Share Dashboard links (§4) should encode the active filter state in the URL/token so recipients see the same scoped view, not just the same widget layout.

---

**Next:** 04-pos.md
