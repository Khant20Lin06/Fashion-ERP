# Organization, Multi-Company & Multi-Branch Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [19-multi-branch.md](../deliverables/19-multi-branch.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module owns the actual Branch/Warehouse/Company *records* every prior UI has referenced (Navigation's Workspace Switcher, Inventory's Warehouse tab, Employees' Branch Assignment). Per `19-multi-branch.md`'s ownership split, Warehouse here covers structural/hierarchy fields only — operational stock detail (zones/bins/current inventory) remains Inventory UI's Warehouses tab ([07-inventory-ui.md](07-inventory-ui.md) §6), consumed via the same shared entity, not redefined.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Organization
↓
Page Header (Title + Toolbar)
↓
Organization Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Companies · Legal Entities · Business Units · Regions · Branches (default) · Stores · Warehouses · Inter-Branch Operations · Analytics
```

---

## 2. Page Header & Toolbar

```
Organization                                          [Export] [+ New Branch]
1 Company · 6 Regions · 42 Branches · 8 Warehouses

[🔍 Search branch, region, manager…]  [Region ▾] [Status ▾] [Filters ▾] [Saved Views ▾]     [⚏][🗺 Map][📊 Chart]
```

Three view-mode icons (Table/Map/Chart) rather than the platform's usual two (Table/Card), since this module's structural nature makes geographic and hierarchical visualization genuinely primary alternatives, not a secondary convenience.

---

## 3. Organization Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Branches · Active Branches · New Branches · Branch Revenue · Branch Profit · Sales Growth · Inventory Value · Staff Count · Customer Count · Performance Ranking.

- Performance Ranking card shows the #1 branch by name directly on the card face ("🏆 Flagship Store") rather than just a numeral — a small personalization that makes this specific KPI immediately actionable/interesting
- Every figure reconciles exactly with Sales/Inventory/Employees' own aggregate numbers — never independently tallied

---

## 4. Organization Hierarchy (Tree / Chart / Map Views)

**Tree View** (default for the Companies/Legal Entities/Business Units/Regions tabs): expandable indented list — Enterprise → Company → Legal Entity → Business Unit → Region → Branch → Store → Warehouse, each node showing a count badge and click-to-expand. Not every level is populated for every organization (per the spec's flexibility rule) — unpopulated levels simply don't render rather than showing empty placeholder rows.

**Organization Chart View:** visual boxes-and-lines chart, same rendering pattern as Employees UI's Chart View ([18-employees-ui.md](18-employees-ui.md) §6) but for structural entities instead of people — pan/zoom supported for large hierarchies.

**Map View** (§10) is the third alternative, specific to this module given its geographic dimension.

---

## 5. Branch Directory (Table View, Default for the Branches Tab)

**Columns:** Branch Code (Roboto Mono link) · Branch Name · Region · Address (truncated + tooltip full) · Manager (avatar + name) · Staff Count · Warehouse (linked) · POS Terminals (count, with an "● N active" live indicator) · Revenue (right-aligned, tabular-nums) · Status (badge: Active/Opening Soon/Temporarily Closed/Closed) · Opening Date.

**Status badge palette:** Active (`color-success`) → Opening Soon (`color-info`) → Temporarily Closed (`color-warning`) → Closed (neutral).

Row overflow `⋮`: View, Edit, Assign Manager, Configure POS, Archive. Bulk-action bar: `[Bulk Branch Assignment] [Bulk Region Assignment] [Bulk Status Update] [Export]` — no Bulk Delete offered anywhere in this tab (or the Companies/Warehouses tabs) given how many transactional modules reference a Branch Code by ID; Status→Closed is the only decommissioning path.

---

## 6. Branch Profile

**Summary Header** (same base component, fifth consumer alongside Product Detail/Customer 360/Vendor 360/Employee Profile):

```
[Photo/Storefront img 80px]  Downtown Flagship                          [Edit] [⋮]
                            BR-004   Bangkok Region   [● Active]
                            123 Sukhumvit Rd · +66 2 123 4567
                                                    ฿2.1M revenue this month   18 staff   4 POS terminals
```

`⋮` overflow: Assign Manager, Configure POS, Branch Opening/Closing checklist (§7), Archive.

**Tabs:** Overview · Staff · Warehouse Connection · POS Configuration · Sales Performance · Inventory Summary · Calendar & Hours.

### 6.1 Overview Tab
Two-column (8+4): Left — Branch Information (Address, GPS Location with a small embedded map pin), Contact Details, Business Hours (per-day table with holiday overrides), Business Calendar (linked to §11's calendar). Right — Preferred Warehouse (linked), Store Type badge (Flagship/Outlet/Franchise), Capacity stat.

### 6.2 Staff Tab
Filtered view of Employee Directory scoped to this branch (reuses Employees UI's table component, not rebuilt) — Name, Position, Shift, Status. "Assign Employee" quick-add deep-links to Employees' Assign Branch action.

### 6.3 Warehouse Connection Tab
Card showing the linked Default Warehouse (name, capacity utilization gauge) + a list of any additional warehouses this branch draws stock from. "View in Inventory →" deep-links to that Warehouse's full operational detail in Inventory UI.

### 6.4 POS Configuration Tab
Table: Terminal ID, Status (● Active/Offline badge), Assigned Cashier (if currently in a shift), Last Sync. "+ Add Terminal" registers a new POS device to this branch.

### 6.5 Sales Performance Tab
Reuses Sales Analytics chart components, scoped to this branch — Revenue Trend, Top Products, Top Employees.

### 6.6 Inventory Summary Tab
Reuses Inventory Analytics components, scoped to this branch's stock — Stock Value, Low Stock count, Fast/Slow Moving.

### 6.7 Calendar & Hours Tab
Business Hours editor (per-day open/close time pickers) + Holiday Calendar (list of date-specific overrides — closed days, special hours) — this is the actual configuration surface behind the Business Calendar reference in §6.1.

---

## 7. Store Operations

**Branch Opening / Branch Closing Checklist:** a literal checklist UI (per the pattern established in Finance's Period Closing) — required steps (register setup verified, initial stock confirmed, staff assigned, POS terminals tested for Opening; end-of-day sales reconciled, cash counted, security checks for Closing) with a progress indicator; the "Confirm Opening/Closing" button stays disabled until every item is checked.

**Daily Sales Summary:** a compact end-of-day card (Total Sales, Transaction Count, Top Category) surfaced from this tab and cross-linked from POS's own Shift Closing screen ([02-pos-ui.md](02-pos-ui.md) §9).

**Cash Closing:** aggregates each register's individual Shift Closing reports (POS UI §9) into one branch-level reconciliation summary — this screen never re-enters cash counts; it displays the roll-up.

**Store Status:** a simple toggle/indicator (Open/Closed/Opening Soon) reflected in the Branch Directory's Status badge and Navigation's Workspace Switcher.

---

## 8. Inventory Distribution Tab

**Stock Allocation:** a matrix view (Product/Category rows × Branch columns) showing how central stock is distributed — primarily a read/planning view.

**Branch Transfer:** deep-links to Inventory's Transfer flow ([07-inventory-ui.md](07-inventory-ui.md) §8) pre-scoped to a branch-to-branch context — this module never re-implements transfer mechanics, per the spec's rule that Inter-Branch Operations is a visibility/approval layer, not a duplicate.

**Warehouse Assignment:** simple dropdown reassignment (which warehouse serves which branch by default) — a structural configuration, distinct from Inventory's operational stock-per-warehouse detail.

**Stock Availability / Transfer History:** read tables, cross-linking to Inventory's own records.

---

## 9. Branch Performance Tab (Analytics)

12-col grid: Revenue Comparison + Profit Comparison (grouped bar chart, all branches side-by-side, 6-col each) → Sales Target (progress bars per branch, 6 cols) + Customer Growth (trend, 6 cols) → Staff Performance / Inventory Efficiency (two ranked lists, side-by-side, 6-col each).

---

## 10. Map Experience

**Branch Location Map:** all branches plotted as pins on a map, pin color indicating Status (§5's palette) — clicking a pin opens a compact popover (Branch Name, Revenue, Manager, "View Profile →").

**Store Density:** a cluster/heatmap overlay toggle showing branch concentration by area — useful for spotting market coverage gaps.

**Performance Heatmap:** an alternative overlay mode coloring each branch's pin/region by a selected performance metric (Revenue/Profit/Growth) rather than status — a legend clarifies which metric is currently mapped.

**Regional Overview:** clicking a Region in the Tree View or selecting one from the toolbar zooms/filters the map to that region's branches only.

---

## 11. Target Management Tab

Sales Targets / Monthly Goals configuration (per branch, cross-referencing Employees' Sales Targets, [18-employees-ui.md](18-employees-ui.md) §11, for the employee-level breakdown) → **Branch KPI** scorecards (a curated set of the metrics this org cares about most, configurable per Branch KPI Scorecards' advanced feature) → **Achievement Tracking** (progress against target, color-coded on-track/at-risk/behind).

---

## 12. Permission & Access Tab

**Branch Access Control:** a matrix (Users × Branches) showing who has access to which branch's data — reuses IAM's Access Policies UI as its underlying mechanism; this tab is a Multi-Branch-scoped view/shortcut into that system, not a parallel permission store, consistent with Employees' "Assign Permission deep-links to IAM" pattern.

**User Assignment / Role Assignment:** quick-assign actions that write into the same IAM records.

**Data Visibility Rules:** a read-only summary explaining the cascade (e.g., "Regional Manager access automatically includes all child branches") — informational, since the actual rule engine lives in IAM.

---

## 13. Search Experience

Instant Search (branch/region/manager name) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 14. Dialogs

| Dialog | Contents |
|---|---|
| **Create Branch** | Compact form: Branch Code (validated unique live), Name, Region, Address, Manager (searchable select), Default Warehouse |
| **Edit Branch** | Full field set, pre-filled |
| **Assign Manager** | Searchable user picker, single or bulk |
| **Assign Warehouse** | Warehouse select, single or bulk |
| **Configure POS** | Terminal registration form (Terminal ID, hardware notes) |
| **Transfer Branch Data** | Rare/exceptional — e.g., consolidating one branch's historical data under another during a merger; heavily confirmed, requires typed re-confirmation of both branch codes |
| **Delete Confirmation** | Never offered — every transactional module references Branch/Warehouse by ID; Status→Closed is the only path, and the Delete action is omitted entirely from the UI rather than shown-disabled |

---

## 15. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`, map pin hover shows a lightweight tooltip before the full click-popover |
| Focus | 2px `color-focus` ring throughout |
| Selection | Checkbox multi-select on Directory, Shift/Ctrl-click |
| Keyboard Navigation | Tree View expand/collapse via arrow keys + Enter; Tab through form fields |
| Tree Expand/Collapse | Click or Enter/Space on a tree node toggles its children; a "keyboard-operable" requirement mirrors the same rule established for every hierarchy view in the platform (Employees' Org Structure) |
| Drag & Drop Organization | Not used for re-parenting branches/regions (deliberately — accidental drag-reorganization of the platform's most foundational structural data would be catastrophic); reorganization happens via the Edit form's explicit parent-selection field instead |
| Context Menu | Right-click a Directory row: View, Edit, Assign Manager |
| Quick Actions | "View Branch Schedule" / "Create Purchase Order" type shortcuts surfaced contextually within relevant tabs, not as a generic quick-action row here |

---

## 16. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table/tree/map per active view |
| Empty Branch Data | First-run tenant setup: icon + "Set up your organization" + "Create your first company/branch" CTA — this state blocks most of the rest of the platform until at least one Company+Branch exists, per the spec's bootstrapping rule |
| No Search Results | Distinct — "No branches match '[query]'" + Clear filters |
| Offline | Read-only cached view; structural edits (creating a branch, changing hierarchy) are inherently back-office/HQ actions, lower offline priority than transactional modules |
| Permission Denied | Standard pattern, scoped per Branch/Region/Company-level Access |
| Validation Error | Inline — Duplicate Branch Code hard-blocked live at the field; Invalid Organization Hierarchy (e.g., circular parent-child) blocked at save |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation for Branch Opening/Closing checklist completion and the rare Transfer Branch Data action |

---

## 17. Responsive Design

| Breakpoint | Directory / Hierarchy Views | Mobile Manager View |
|---|---|---|
| Desktop/Laptop | Full table, full org tree/chart/map | N/A |
| Tablet | Priority columns + scroll, hierarchy views remain pan/zoomable | Branch-level profile viewing/editing supported |
| Mobile Manager View | Card-per-row stacked list | A Regional/Branch Manager checks their branch's KPIs, opening hours, or approves an Inter-Branch transfer/cash-movement request from a phone; full Company/Legal Entity/hierarchy structural configuration remains Desktop/Tablet-oriented |

---

## 18. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels, accessible forms, accessible tables. **Accessible Maps:** the Map Experience (§10) requires a keyboard-operable, screen-reader-friendly alternative — a linked list view of the same branches with their location/status data, not solely a visual map, consistent with the platform's rule that every visual-only surface has a data-table equivalent. **Tree/Chart View** requires keyboard-operable pan/zoom alternative (a breadcrumb-style drill path), matching Employees' Org Structure requirement.

---

## 19. Figma Build Notes

- Frame: `Organization/Branches/Desktop/1440`, `Organization/BranchProfile/Desktop/1440`, `Organization/Map/Desktop/1440`
- Summary Header instances the same base component (`State=Full|Condensed`) as Product Detail, Customer 360, Vendor 360, and Employee Profile — fifth consumer, still not rebuilt
- Map pins are a new small component (`Pin=Status` variant, colors matching §5's status palette) — built once, reused across Branch Location Map and Performance Heatmap modes
- Layer naming: `Organization/Branches/Row-Active`, `Organization/Map/Pin-OpeningSoon`, `Organization/Hierarchy/TreeNode-Region`, per convention

---

## 20. Developer Handoff Notes

- Branch/Warehouse records created here are the actual entities Inventory, Sales, Finance, and every other location-scoped module reference by ID — this module is upstream of all of them structurally, per `19-multi-branch.md` §26; it must exist and be seeded before those modules can create transactional data.
- Warehouse (§6.3/§8) is a shared entity with Inventory ([07-inventory-ui.md](07-inventory-ui.md) §6) — one table, this module owning structural fields (parent Branch, type, capacity), Inventory owning operational fields (zones, bins, stock aggregates) — never two separate warehouse records requiring synchronization.
- Inter-Branch Operations (§8) must not duplicate Inventory's Transfer execution, Employees' Transfer workflow, or Finance's intercompany posting — this UI aggregates/visualizes/approves at the cross-branch level while those modules retain ownership of the actual transactional mechanics.
- Branch/Region/Company-level Access (§12) should be implemented as one hierarchical row-level-security service that Sales, Inventory, Finance, CRM, and Reports all query against — this tab is a view into that one service, not a second implementation.
- Hierarchy caching needs cache invalidation whenever a Branch's parent Region/Company assignment changes — a stale cached hierarchy could misroute a transaction's rollup reporting to the wrong Region after a reorganization.

---

**Next:** 20-settings-ui.md
