# Business Intelligence, Reporting & Analytics — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [17-reports.md](../deliverables/17-reports.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module is a read-only aggregation and presentation layer — every report here queries the same underlying data its owning module's own Analytics section already computes (Sales Analytics, Inventory Analytics, Finance's Financial Statements, etc.). This UI never introduces a second calculation; it introduces cross-functional browsing, the Custom Report Builder, and the Dashboard Builder as this module's genuinely new surfaces.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Reports
↓
Page Header (Title + Toolbar: Date Range, Branch, Warehouse, global Export/Schedule)
↓
BI Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Executive · Sales · Purchase · Inventory · Finance · Customer · Supplier · Marketing · Employee · Custom Reports · Scheduled Reports · Analytics Workspace
```

---

## 2. Page Header & Toolbar

```
Reports & Business Intelligence                        [Export] [Schedule Report] [+ Build Custom Report]
Data as of: 2m ago

[🔍 Search reports…]  [Date Range ▾] [Branch ▾] [Warehouse ▾] [Filters ▾] [Saved Views ▾]
```

Every filter set here persists across drill-down/drill-through navigation (per the spec's context-preservation rule) — moving from a summary card into a detail table never resets the active Date Range/Branch selection.

---

## 3. BI Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Revenue · Net Profit · Sales Growth · Customer Growth · Inventory Value · Stock Turnover · Top Performing Branch · Best Selling Product · Low Stock Alert · Campaign Performance.

- This is the executive-level rollup **above** the business-wide Dashboard (module 03) — same KPI Card component, same chart tokens, a different altitude: cross-functional trend/comparison rather than day-to-day operational focus
- Every figure here reconciles exactly with its owning module's own dashboard number — this screen introduces no new calculation, only a different vantage point

---

## 4. Sales / Purchase / Inventory / Finance / Customer / Supplier / Marketing / Employee Report Tabs

Each tab follows one shared structural template (per the spec's "one report-format presentation" rule) — a report category is never a bespoke layout:

```
[Report Type Selector: chips or dropdown, e.g., Sales Trend | Sales by Branch | Sales by Category | ...]

[Chart Area — 8 cols]                    [Summary Stats — 4 cols]
                                           Total: ฿4.8M
                                           vs. prior period: +12%
                                           Top segment: Outerwear (34%)

[Detail Table — full width, sortable/filterable/exportable]
```

- **Sales tab:** Sales Overview, Sales Trend, Daily/Monthly Sales, Sales by Branch/Channel/Employee, Product Sales, Category Sales, Brand Performance — all reading from Sales Analytics
- **Purchase tab:** Purchase Analysis, Supplier Performance, Purchase Trend, Purchase Cost Analysis, PO Status (funnel: Draft→Approved→Issued→Received), Supplier Spending — reading from Purchase Analytics and Supplier Analytics
- **Inventory tab:** Stock Valuation, Inventory Movement, Stock Aging (heatmap), Slow/Fast Moving Products (paired ranked lists, shown side-by-side intentionally), Low/Out of Stock Report, Warehouse Performance — reading from Inventory Analytics
- **Finance tab:** Profit & Loss, Balance Sheet, Cash Flow, Expense Analysis, Revenue Analysis, Payment Collection, Outstanding Balance — these render as the **identical formatted-statement layout** already built in Finance UI's Financial Statements tab ([16-finance-ui.md](16-finance-ui.md) §13), never regenerated as a generic table here
- **Customer tab:** Customer Growth, Retention, CLV, Segmentation, Loyalty Performance, Top Customers, Customer Behavior — reading from Customer Analytics and Loyalty Analytics
- **Supplier tab:** mirrors Suppliers UI's own Analytics tab content ([15-suppliers-ui.md](15-suppliers-ui.md) §7.8)
- **Marketing tab:** Campaign Performance, Promotion ROI, Coupon Usage, Customer Engagement, Conversion Rate, Marketing Revenue — reading from Marketing Automation's and Promotions' own Analytics
- **Employee tab:** Sales Performance, Attendance Summary, Productivity, Commission, Target Achievement, Task Completion — reading from Employees' own Analytics

Report Type Selector switches which chart/table renders within the same tab shell — a tab is one page with swappable content, not N separate pages per report type.

---

## 5. Data Visualization — Shared Component Library

Line, Bar, Area, Pie, Donut, Heatmap, Funnel, KPI Cards, Progress/Gauge, Comparison (grouped bar), Trend Indicators — all built on the Design System's chart component base and `chart-categorical` palette (Design Tokens §16). This module introduces the platform's remaining chart types not needed elsewhere (Funnel for conversion tracking, Heatmap beyond Inventory's Stock Aging use, Comparison for branch/period side-by-sides) — each follows the identical tooltip/axis/accessibility-fallback rules already established since the Dashboard module.

Every chart's overflow menu: Export (PNG/CSV) · **View as Table** (accessible fallback, mandatory) · Fullscreen · **Add to Custom Dashboard** (the one new action here, feeding the Dashboard Builder, §8).

---

## 6. Custom Report Builder

Full-page builder (not a modal), three-panel layout:

```
┌───────────┬──────────────────────────────┬──────────┐
│ Data       │ Report Canvas                 │ Preview   │
│ Source &   │                               │ Panel     │
│ Fields     │ [Grouping] [Sorting] [Filters] │           │
│ (3 cols)   │                               │ (3 cols)  │
│            │ [Column drop zone — drag       │ live-     │
│ Sales      │  fields here to build columns] │ updating  │
│  ☐ Amount   │                               │ table/    │
│  ☐ Date     │ [Calculated Field: + Add]      │ chart     │
│ Products    │                               │ preview   │
│  ☐ Category │ [Pivot Table toggle]           │           │
│  ☐ Brand    │ [Chart Type: none/Bar/Line/…]  │           │
└───────────┴──────────────────────────────┴──────────┘
                        [Save Report]  [Share]
```

- **Field picker (left):** grouped by data source (Sales/Products/Inventory/Customers/Finance…), each field a draggable chip; **only fields the user's role permits appear here at all** — the picker itself queries the same row/column-level permission service every pre-built report uses, per the spec's hard requirement
- **Canvas (center):** drag fields into the column drop zone to build the table shape; Grouping/Sorting/Filters as dropdown controls above; **Calculated Fields** via a formula-input dialog (e.g., `Margin % = (Revenue - Cost) / Revenue`) referencing already-added fields; a Pivot Table toggle reshapes the same field selection into a cross-tab; a Chart Type dropdown renders the same data as a visualization instead of/alongside the table
- **Preview (right):** live-updating as configuration changes, debounced 300ms
- **Save Report** names and stores the configuration (private or Shared with a role/team); **Share** generates the same scoped Public Link pattern as the Dashboard module's Share action

Saved custom reports appear as first-class entries in the Custom Reports tab list and become selectable building blocks in the Dashboard Builder (§8).

---

## 7. Scheduled Reports

**Schedule list:** Report Name, Cadence (Daily/Weekly/Monthly/Quarterly/Yearly/Custom badge), Recipients (avatar stack + count, or "All Branch Managers" role-based badge), Last Sent, Status (Active/Paused).

**Create Schedule (dialog):** Report (searchable select — any pre-built or custom report) → Cadence (with a custom-schedule cron-like builder for non-standard cadences) → **Email Delivery** (Recipient Management: individual email picker, or **Role-based Distribution** toggle — "Send to all users with role: Branch Manager," which the spec requires to be a live query, not a static list) → Format (PDF/Excel/CSV attached, or inline HTML email) → Save.

Pause/Resume as an always-visible row toggle. Schedule Status shows a small delivery-history sparkline (successful sends over the last 10 occurrences) so a Marketing Manager can spot a silently-failing schedule.

---

## 8. Dashboard Builder

Drag-and-drop canvas (same 12-column Auto Layout grid as the Design System's base grid) for assembling a personal or role-shared dashboard from Widgets, Cards, Charts, KPIs, Maps, Tables, Calendar, Heatmaps, Gauge Charts, Trend Charts — sourced from any pre-built report or saved Custom Report.

```
[Widget Library — collapsible left rail]          [Canvas — 12-col grid, drag widgets here]
  KPI Card
  Line Chart
  Bar Chart
  Table
  Map
  Custom Report: "Branch Comparison" (saved)        [Widget placeholders snap to grid columns]
```

- Widgets resize by dragging a corner handle, snapping to column boundaries (never arbitrary fractional widths, per the platform's grid discipline)
- Each placed widget has its own small config gear (data source, date range override, chart type) without leaving the canvas
- "Save Dashboard" names it and sets sharing scope (Private/Team/Role); saved dashboards appear as new entries the user can set as their default landing view

**Keyboard-operable alternative** (per accessibility requirement): an "Add Widget" menu + arrow-key repositioning, since this is a drag-and-drop canvas subject to the same accessibility rule as every other visual builder in the platform.

---

## 9. AI Analytics Section (within relevant report tabs, not a separate tab)

AI Business Insights (plain-language callouts, e.g., "Revenue is down 12% vs. last month, primarily driven by Branch 3's Outerwear category"), Sales Prediction, Demand Forecast, Anomaly Detection flags, Recommendation Cards, Automated Summary — each rendered with the platform-wide **Confidence indicator** (Design Tokens §3/AI Analytics §5's mandatory visual distinction for AI-sourced figures) so a prediction is never presented with the same unqualified certainty as a deterministic historical figure.

Insight cards appear inline within the relevant report tab (a Sales Prediction card sits within the Sales tab, not off in an unrelated AI section) — contextual placement, per the principle that AI Analytics is a service every module consumes, not a separate destination.

---

## 10. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Chart tooltip on hover; row/card `color-hover` |
| Focus | 2px `color-focus` ring throughout, including Report Builder's drag-field chips (keyboard-add alternative available) |
| Selection | Report Builder field checkboxes; Dashboard Builder widget selection |
| Keyboard Navigation | Full operability through Report/Dashboard Builders per their respective keyboard-alternative requirements |
| Drill Down | Clicking a chart segment/bar narrows the same tab's data (e.g., clicking "Outerwear" in Category Sales filters the detail table below to that category), with a visible active-drill chip and one-click reset |
| Click To Filter | Cross-filtering on a built Custom Dashboard (§8) — selecting a data point in one widget filters sibling widgets on the same dashboard, extending the Dashboard module's own drill-down interaction platform-wide |
| Chart Interaction | Every chart: hover tooltip, click-to-drill, overflow menu (Export/View as Table/Fullscreen/Add to Dashboard) |
| Context Menu | Right-click a Custom Report row: Edit, Duplicate, Share, Schedule |

---

## 11. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton dashboard/report/chart, shape-matched to the active visualization type |
| Empty Report | New tenant: icon + "No reports yet" + "Browse report library" / "Build a custom report" dual CTAs |
| No Data Available | A report section with genuinely no underlying data (e.g., a brand-new tenant's Sales tab) — distinct copy from a filtered-to-nothing state below |
| No Search Results | Filter combination yielding zero results: "No data for the selected filters" + "Adjust filters" action |
| Permission Denied | A report category the role cannot access at all is omitted from navigation entirely, consistent with the Sidebar's permission-based-visibility rule — never a visible-but-blocked tab |
| Export Processing | Progress indicator + "Preparing your export…" — large exports process asynchronously with a completion notification rather than blocking the UI |
| Export Failed | Toast + Retry; a partial file offered with a clear caveat if partially generated |
| Server Error | Inline retry, per-widget isolation on the BI Dashboard |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves (report saved, schedule created); completion notification (not just a toast) for large async exports and Bulk operations |

---

## 12. Responsive Design

| Breakpoint | Report Browser / Builder | Mobile Analytics View |
|---|---|---|
| Desktop/Laptop | Full report tables, full Custom Report/Dashboard Builder canvas | N/A |
| Tablet | Priority columns + scroll; Builder canvases remain usable with simplified drag targets | Dashboards viewable, KPI cards fully supported |
| Mobile Analytics View | Card-per-row for tabular reports | Executives check KPI Cards and pre-built Dashboards from a phone; Custom Report/Dashboard Builder authoring remains Desktop/Tablet-oriented, consistent with Finance's own Mobile scoping |

---

## 13. Accessibility

Standard baseline: keyboard navigation, screen reader labels, WCAG AA. **Accessible Charts:** every visualization type has a mandatory "View as Table" fallback (§5), extended here to the additional chart types (Funnel, extended Heatmap use) introduced by this module. **Accessible Tables:** proper header scope, sort-state announcement across every report/detail table. The **Dashboard Builder's** drag-and-drop canvas requires the keyboard-operable Add Widget + arrow-key-reposition alternative (§8), consistent with the identical requirement already established for every other visual builder in the platform (Promotions' Rule Builder, Marketing's Journey Builder, CRM's Kanban, Barcode's Label Designer).

---

## 14. Figma Build Notes

- Frame: `Reports/Sales/Desktop/1440`, `Reports/CustomBuilder/Desktop/1440`, `Reports/DashboardBuilder/Desktop/1440`
- The shared report-tab template (§4) is built as one Auto Layout frame structure with a `ReportType` content-swap property, not eleven separately laid-out tab frames
- Finance report renderings **instance** the exact Financial Statement frame components built in Finance UI (§13 there) — never redrawn as a second statement layout
- Report Builder's field chips and Dashboard Builder's widget tiles are new small components, but their drag-interaction affordance (grip handle, drop-zone highlight) reuses the same visual language as every other drag-reorder context in the platform (Product Media gallery, Promotions' Priority reorder)
- Layer naming: `Reports/Sales/Chart-Trend`, `Reports/CustomBuilder/FieldPicker/Chip-Amount`, `Reports/DashboardBuilder/Widget-KPICard`, per convention

---

## 15. Developer Handoff Notes

- Every report category (§4) must query the same underlying tables/services its owning module's own Analytics section uses — this module has no independent data pipeline, per `17-reports.md` §30. The UI's job is presentation and cross-functional aggregation only.
- Row/Column-Level Security must be enforced at one shared query layer consumed identically by pre-built reports, the Custom Report Builder's field picker (§6), and Dashboard Builder widgets (§8) — never three separate permission-filtering implementations that could drift and leak data through whichever path was checked less carefully, per `17-reports.md` §30.
- Drill-through must deep-link into the owning module's actual detail page (Product Detail, Customer 360, Vendor 360) using that module's existing routing — never a duplicated read-only "mini profile" maintained inside this module.
- Scheduled Reports' Role-based Distribution (§7) must be a live query against current role assignments ("all users with role=Branch Manager"), not a static snapshot captured at schedule-creation time — new hires/departures are handled automatically.
- Caching must be invalidated or timestamped consistent with each source module's own data-freshness expectations — a cached Inventory report should never appear more current than Inventory's own real-time stock figures would suggest.

---

**Next:** 18-employees-ui.md
