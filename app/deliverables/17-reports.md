# Business Intelligence (BI), Reporting & Analytics Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [16-finance.md](16-finance.md) (all prior modules)
**Consumed by:** Executive/management roles across every function
**Scope note:** This module is a read-only aggregation and presentation layer over every other module's data. It never becomes a second source of truth — every report/dashboard here queries the same underlying records that POS, Sales, Purchase, Inventory, Finance, etc. already own and expose via their own Analytics tabs/sections. This is the module every prior spec's "Reports (module 17)" cross-reference resolves to.

---

## 1. Module Objective

Provide enterprise-wide reporting and business intelligence — Operational Reports, Financial Reports, Executive Dashboards, Interactive Analytics, Custom Reports, Scheduled Reports, KPI Monitoring, AI Insights — consolidating what every module's own Analytics section already computes into cross-functional, exportable, shareable, and self-service views.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner, CEO | Full access, all reports, all branches |
| CFO | Full Financial Reports, restricted operational detail as needed |
| COO | Full Operational (Sales/Purchase/Inventory/Employee) Reports |
| Branch Manager | Branch-scoped across all report categories |
| Sales Manager | Sales/Customer Reports, team-scoped |
| Finance Manager | Financial Reports (full), read access elsewhere |
| Warehouse Manager | Inventory/Purchase Reports, warehouse-scoped |
| Marketing Manager | Marketing/Customer Reports |
| HR Manager | Employee Reports |
| Business Analyst | Custom Report Builder + Analytics Workspace across permitted data, typically without financial drill-down unless explicitly granted |

Access here is **row-level and column-level** (§27), not just page-level — a Branch Manager building a Custom Report (§15) can only select fields and rows their role permits, enforced at the query layer so the report builder itself cannot be used to circumvent permission boundaries.

---

## 3. Reporting Lifecycle

```
Data Collection → Validation → Aggregation → Visualization → Analysis
→ Decision Making → Scheduled Distribution → Archive
```

**Data Collection** here means *subscribing to* each module's existing data (their own tables/event streams), never a separate capture step — this module has no data-entry surface of its own; everything it displays originates elsewhere.

---

## 4. Module Structure

```
BI Dashboard (§5)
↓
Executive Reports (§6) · Sales (§7) · Purchase (§8) · Inventory (§9) · Finance (§10)
Customer (§11) · Supplier (§12) · Marketing (§13) · Employee (§14)
↓
Custom Report Builder (§15) ──→ Dashboard Builder (§16)
↓
Scheduled Reports (§20) · Analytics Workspace (self-service exploration, §17's visualizations applied ad hoc)
```

---

## 5. BI Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Revenue · Profit · Gross Margin · Net Margin · Sales Growth · Inventory Value · Cash Flow · Customer Retention · Marketing ROI · Employee Productivity — plus Top Products, Top Customers, Top Suppliers, and Branch Performance ranked/comparison views.

This is the executive-level rollup **above** the business-wide Dashboard (module 03) — where module 03 is role-adaptive and operationally focused (a Store Manager's daily view), the BI Dashboard is the cross-functional, trend-and-comparison view for CEO/COO/CFO-tier decision-making. Reuses the same KPI Card/chart components (03 §6/§15) — a different altitude of the same visual system, not a new one.

---

## 6. Executive Reports

Executive Summary · Business Performance · Branch Comparison · Department Performance · Year-over-Year Growth · Month-over-Month Growth · KPI Summary.

These are curated, narrative-style rollups (typically single-page, presentation-ready) combining figures from Sales (§7), Finance (§10), and Inventory (§9) reports into one coherent read for a board meeting or investor update — assembled via the same Custom Report Builder (§15) infrastructure, pre-configured as a template rather than a bespoke report type.

---

## 7. Sales Reports

Sales by Date/Branch/Category/Brand/Collection/Product/Customer/Employee/Payment Method · Sales Returns · Sales Forecast.

Queries directly against Sales Analytics ([09-sales.md](09-sales.md) §15) and POS transaction data — this section is a report-format (exportable, schedulable, filterable table+chart) presentation of the same figures Sales' own Analytics tab shows live, never a recomputed or independently-tallied number.

---

## 8. Purchase Reports

Purchase by Supplier/Category · Purchase Cost · Purchase Trend · Lead Time Analysis · Supplier Performance · Purchase Forecast.

Sourced from Purchase Analytics ([08-purchase.md](08-purchase.md) §16) and Suppliers' Analytics ([15-suppliers.md](15-suppliers.md) §14) — Supplier Performance specifically must show the identical figure Suppliers' Vendor 360 and Purchase's Quotation Comparison already use, per the "one metrics service, three surfaces" rule established there.

---

## 9. Inventory Reports

Stock on Hand · Inventory Valuation · Low Stock · Out of Stock · Overstock · Stock Movement · ABC Analysis · Dead Stock · Inventory Aging · Stock Turnover.

Sourced from Inventory Analytics ([07-inventory.md](07-inventory.md) §15) and the Stock Movement ledger (07 §7) directly — this is the canonical read surface for "what does our stock situation look like," reusing Inventory's own computed figures rather than re-deriving them from raw movement data independently.

---

## 10. Financial Reports

Trial Balance · Balance Sheet · Profit & Loss · Cash Flow Statement · Accounts Receivable Aging · Accounts Payable Aging · Budget vs. Actual · Expense Analysis.

These are **identical outputs** to Finance's own Financial Statements ([16-finance.md](16-finance.md) §16) — this module doesn't regenerate them from raw ledger data; it surfaces Finance's already-generated, period-locked statements (16 §17) in the same cross-functional report browser as every other category, with the same export/schedule/share affordances (§19/§20) applied uniformly.

---

## 11. Customer Reports

Customer Lifetime Value · Top Customers · Repeat Customers · Customer Segmentation · Purchase Frequency · Customer Churn · Membership Distribution · Loyalty Usage.

Sourced from Customer Analytics ([10-customers.md](10-customers.md) §15) and Loyalty Analytics ([11-loyalty.md](11-loyalty.md) §15) — Membership Distribution and Loyalty Usage specifically pull the same tier/points figures those modules' own dashboards display.

---

## 12. Supplier Reports

Supplier Performance · Purchase Spend · Quality Score · Lead Time · Contract Status · Vendor Rating · Risk Assessment.

Sourced entirely from Suppliers' own Vendor 360/Analytics (15 §7/§14) — this section exists so a COO doing a supplier review doesn't need to open the Suppliers module directly; the data displayed is identical, not parallel.

---

## 13. Marketing Reports

Campaign Performance · Email Open Rate · SMS Delivery · Push Notification Performance · Conversion Rate · ROI · Customer Acquisition · Retention.

Sourced from Marketing Automation's own Analytics ([13-marketing-automation.md](13-marketing-automation.md) §14) — Conversion Rate and ROI here must reconcile with that module's figures exactly, per the Revenue Attribution consistency rule already established there (13 §14: "should reconcile against Sales Analytics' own revenue figures").

---

## 14. Employee Reports

Sales Performance · Attendance Summary · Productivity · Commission · Target Achievement · Task Completion.

Sourced from the Employees module (18) — Sales Performance specifically cross-references Sales by Employee (§7) and CRM's Salesperson Performance ([14-crm.md](14-crm.md) §16) so an individual's sales figures are consistent whether viewed from HR, CRM, or this reporting layer.

---

## 15. Custom Report Builder

Drag & Drop Fields · Column Selection · Grouping · Sorting · Filtering · Calculated Fields (formulas over selected fields, e.g., "Margin % = (Revenue − Cost) / Revenue") · Pivot Tables · Charts (§17) · Saved Reports (private or shared) · Shared Reports.

**Field availability is permission-scoped** (§2/§27) — the drag-and-drop field picker only lists fields/tables the requesting user's role can access; there is no way to construct a custom report that surfaces data outside one's permission boundary, since the picker itself queries the same row/column-level security layer every pre-built report uses.

Saved custom reports become available as building blocks for the Dashboard Builder (§16) and can be scheduled (§20) exactly like pre-built reports.

---

## 16. Dashboard Builder

Widgets · Cards · Charts · KPIs · Maps (geographic, e.g., branch performance or customer distribution overlays) · Tables · Calendar (useful for campaign/promotion scheduling overviews) · Heatmaps · Gauge Charts · Trend Charts.

A drag-and-drop canvas (Auto Layout grid, consistent with the Design System's 12-column grid, §01 §6) for assembling a personal or role-shared dashboard from any combination of pre-built report widgets or Custom Report Builder (§15) outputs — this is how a Regional Manager might build "my morning view" combining a Branch Comparison chart, a Low Stock table, and a Cash Flow KPI card into one page, without engineering involvement.

---

## 17. Visualizations

Line · Bar · Column · Area · Pie · Donut · Scatter Plot · Heatmap · Treemap · Gauge · Funnel · Waterfall · KPI Cards.

All visualizations are built on the same chart component library and shared categorical/semantic palette established in the Design System (§3.2) and used throughout every module's own Analytics section — this module introduces genuinely new chart *types* (Scatter, Treemap, Gauge, Funnel, Waterfall) beyond what individual modules needed, but they follow the same token, tooltip, accessibility-fallback, and export rules already established for Line/Bar/Area/Donut in Dashboard §15.

---

## 18. Search & Filter

Global Search · Date Range · Branch · Department · Warehouse · Category · Brand · Supplier · Customer · Employee · Status — the broadest filter set in the platform, since this module cuts across every other module's dimensions. Same combinable filter+chip+Saved View pattern used platform-wide, with filters persisting across drill-down/drill-through navigation (§29) so context isn't lost when moving from a summary to a detail view.

---

## 19. Export & Sharing

PDF · Excel · CSV · Print · Email · Scheduled Email (§20) · **Public Link (Permission Controlled)** — a shareable read-only link, scoped to the report's data as of generation time (or live-refreshing, configurable), with an expiration date and revocable at any point; mirrors the Share Dashboard pattern already established in the business-wide Dashboard (03 §4), generalized here to any report/dashboard in the platform, not just the main one.

---

## 20. Scheduled Reports

Daily · Weekly · Monthly · Quarterly · Yearly · Custom Schedule · Email Distribution · **Role-based Distribution** (a schedule targets a role, e.g., "all Branch Managers," rather than a fixed list of individuals — new hires into that role automatically start receiving it, departures automatically stop, without manual list maintenance).

---

## 21. Activity Timeline

Report Generated · Report Exported · Dashboard Shared · Schedule Created · Filter Applied · Custom Report Saved — same human-readable actor+timestamp+link pattern used throughout the platform, though notably lighter-weight than transactional modules' timelines since most entries here are view/export actions rather than business state changes.

---

## 22. Audit Log

User · Action · Timestamp · Report Name · Export Type · Sharing Activity — restricted to management/compliance roles. Given this module's broad read access across sensitive data (Finance, Customer PII-adjacent fields, Supplier financials), **every export and every Public Link creation is logged here without exception** — this is the platform's primary control point for knowing where sensitive aggregated data has left the system.

---

## 23. Validation

| Rule | Behavior |
|---|---|
| Missing Data | A report section with no underlying data shows the No Data empty state (§24), not a broken/blank widget |
| Permission Checks | Enforced at query time (§2/§27) — a report referencing a field/row outside the user's access silently excludes it rather than erroring, so a shared report looks correctly scoped to each viewer rather than broken for some |
| Invalid Filters | Inline validation (e.g., a date range with end before start) blocked at entry |
| Date Range | Must resolve to a non-empty, sensible range; excessively large ranges on high-cardinality reports trigger a performance warning before executing (§28) |
| Duplicate Scheduled Reports | Warns if an identical schedule (same report, same recipients, same cadence) already exists, not a hard block |

---

## 24. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton dashboard/report/chart per Design System §17 |
| Skeleton | Shape-matched to the active report/visualization type |
| No Data | New tenant or a filter combination yielding zero results: icon + "No data for the selected filters" + "Adjust filters" action |
| No Reports | New tenant: icon + "No reports yet" + "Browse report library" / "Build a custom report" CTAs |
| Offline | Cached last-generated report view with a staleness indicator; live/real-time dashboards clearly indicate they've stopped refreshing |
| Permission Denied | Distinct from Missing Data (§23) — a report category the role cannot access at all is omitted from navigation entirely, consistent with the Sidebar's permission-based visibility rule (Navigation §4) |
| Server Error | Inline retry, per-widget isolation on the BI Dashboard (mirrors 03 §16) |
| Retry | Consistent retry affordance throughout |

---

## 25. Responsive Design

| Breakpoint | Report Browser / Builder | Mobile (Dashboards & KPIs) |
|---|---|---|
| Desktop/Laptop | Full report tables, full Custom Report/Dashboard Builder canvas | N/A |
| Tablet | Priority columns + scroll; Builder canvases remain usable with simplified drag targets | Dashboards viewable, KPI cards fully supported |
| Mobile | Card-per-row for tabular reports | **Explicitly supported per the prompt's own note** — executives check KPI Cards and pre-built Dashboards from a phone; Custom Report/Dashboard Builder authoring remains Desktop/Tablet-oriented, consistent with Finance's own Mobile scoping (16 §25) |

---

## 26. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible charts (every visualization type in §17 has a "View as Table" fallback, per the pattern established in Dashboard §15/§18 — now extended to the additional chart types Scatter/Treemap/Gauge/Funnel/Waterfall introduced here), accessible tables, WCAG AA compliance. The Dashboard Builder's drag-and-drop canvas requires a keyboard-operable alternative (add-widget menu + arrow-key repositioning), consistent with the same requirement established for Promotions' rule-builder (12 §24), Marketing's Journey Builder (13 §22), and CRM's Kanban (14 §24).

---

## 27. Security

**Role-Based Permissions** per §2. **Row-Level Security** (branch/department/territory scoping, consistent with the row-level security already enforced in Sales/Inventory/CRM). **Column-Level Security** (e.g., a report including Cost Price alongside Retail Price restricts the Cost column to roles with pricing visibility, per Product Management's field-level permission model, 05 §2). **Sensitive Data Masking** (PII/financial fields follow the same masking-with-audit-logged-reveal pattern established for Customers, 10 §24, Suppliers, 15 §7, and Finance, 16 §27). **Audit Trail:** per §22, with export/sharing logged without exception. **Secure Sharing:** Public Links (§19) are scoped, expiring, and revocable, never a permanent unauthenticated data exposure.

---

## 28. Performance

Optimized for millions of records and large datasets: real-time dashboards use server-side aggregation (precomputed rollups, consistent with every module's own Analytics performance approach — 03 §21 widget isolation, 07 §25, 09 §26, 16 §28) rather than scanning raw transactional tables on every view. Virtual tables, lazy loading, and caching throughout — cached report results are served with a visible "as of" timestamp rather than silently going stale, and a manual refresh is always available. Custom Report Builder (§15) queries against large date ranges or high-cardinality groupings run asynchronously with a progress indicator rather than blocking the UI, consistent with the async-for-large-operations pattern established since Product Management's bulk operations (05 §13).

---

## 29. Advanced Enterprise Features

AI Insights (surfaced as plain-language callouts alongside relevant charts, e.g., "Revenue is down 12% vs. last month, primarily driven by Branch 3's Outerwear category") · **Natural Language Query** (ask a question in plain text, e.g., "what were our top 5 products last quarter," returns a generated report) · Predictive Analytics · Forecasting (consuming the same AI Analytics engine referenced throughout — module 25 — rather than a separate forecasting implementation per report type) · Anomaly Detection (extends Finance's Financial Anomaly Detection, 16 §29, to operational data — unusual sales patterns, inventory discrepancies) · Executive KPI Scorecards · Balanced Scorecards · **Drill-down Reports** (summary → detail within the same report, e.g., Branch total → category breakdown) · **Drill-through Reports** (navigating from a report directly into the owning module's live record, e.g., clicking a customer in a Top Customers report opens their actual Customer 360, 10 §7) · Cross-filtering (selecting a data point in one widget filters others on the same dashboard, extending the Dashboard's drill-down interaction, 03 §7, platform-wide) · Data Warehouse Integration · OLAP Cubes · API-based Reporting · Webhook Notifications.

Additive/opt-in per the platform-wide principle — a small retailer relies on pre-built module reports and the BI Dashboard without ever touching Natural Language Query, OLAP Cubes, or Data Warehouse Integration.

---

## 30. Developer Implementation Notes

- Every report category (§7–§14) must query the same underlying tables/services its owning module's own Analytics section uses ([07-inventory.md](07-inventory.md) §15, [08-purchase.md](08-purchase.md) §16, [09-sales.md](09-sales.md) §15, [10-customers.md](10-customers.md) §15, [11-loyalty.md](11-loyalty.md) §15, [13-marketing-automation.md](13-marketing-automation.md) §14, [15-suppliers.md](15-suppliers.md) §14, [16-finance.md](16-finance.md) §16/§18) — this module has no independent data pipeline; it is a presentation and cross-functional aggregation layer only.
- Row/Column-Level Security (§27) must be enforced at the query layer shared by pre-built reports, the Custom Report Builder's field picker (§15), and Dashboard Builder widgets (§16) alike — a single permission-filtering service, not three separate implementations that could drift and leak data through whichever path was checked less carefully.
- Drill-through (§29) should deep-link into the owning module's actual detail page (Product Detail 06, Customer 360 10, Vendor 360 15) using the same routing those modules already expose — never a duplicated read-only "mini profile" maintained inside Reports.
- Scheduled Reports' Role-based Distribution (§20) should subscribe to the platform's role/user-assignment data live — a distribution list is a query ("all users with role=Branch Manager"), not a static snapshot captured at schedule-creation time.
- Caching (§28) must be invalidated or clearly timestamped consistent with each source module's own data-freshness expectations — a cached Inventory report should never appear more current than Inventory's own real-time stock figures would suggest, avoiding a scenario where Reports and the owning module disagree about "right now."

---

**Next:** 18-employees.md
