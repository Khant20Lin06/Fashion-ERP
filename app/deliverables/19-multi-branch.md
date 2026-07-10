# Organization, Multi-Company & Multi-Branch Management Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [18-employees.md](18-employees.md) (all prior modules)
**Consumed by:** Every module — this is the structural backbone (Company/Branch/Warehouse) every prior spec assumed already existed when referencing "Branch," "Warehouse," or the Workspace Switcher.
**Scope note:** This module owns the organizational hierarchy itself — the actual Branch/Warehouse/Store *records* that Navigation's Workspace Switcher ([02-navigation.md](02-navigation.md) §14) lets a user switch between, that Inventory ([07-inventory.md](07-inventory.md) §6) assigns stock to, and that Employees ([18-employees.md](18-employees.md) §8) hangs its org structure from. Those modules consume this one's entities; this module never re-defines Inventory's stock rules or Employees' reporting lines — it defines *where* those things happen.

---

## 1. Module Objective

Manage the enterprise organizational structure — Company, Legal Entity, Business Unit, Region, Branch, Store, Warehouse, Inter-Branch Operations, Consolidated Reporting — as the single hierarchy every other module's location-scoping (row-level security, stock assignment, branch-scoped dashboards) is built on top of.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner, CEO | Full access, all companies/entities |
| COO | Full operational access across all branches/regions |
| Regional Manager | Full access within assigned Region(s) |
| Branch Manager | Full access to their own Branch's profile/settings; read-only on peer branches |
| Finance Manager | Read all (for consolidation, §14); edit Company-level financial fields (fiscal year, default currency, bank accounts) |
| Operations Manager | Store/Warehouse configuration (layout, capacity) across assigned scope |

**Branch-level / Region-level / Company-level Access (§23)** is the row-level security foundation this module *provides* to every other module — a Branch Manager's scoping in Sales, Inventory, Finance, and everywhere else derives from their assignment here, not from separately configured permissions per module.

---

## 3. Organization Hierarchy

```
Enterprise → Company → Legal Entity → Business Unit → Region → Branch → Store → Warehouse
```

Not every business populates every level — a single-location retailer collapses this to essentially Company→Branch(=Store)→Warehouse; a global franchise operation uses the full depth. Each level is optional except Company and Branch, which are the minimum viable structure for the platform to function at all (every transaction needs at least a Company and a Branch to post against).

---

## 4. Module Structure

```
Organization Dashboard (§5)
↓
Companies (§6) ──→ Legal Entities (§7) ──→ Business Units (§8)
                                    ↓
                            Regions (§9) ──→ Branches (§10) ──→ Stores (§11)
                                                        ↓
                                                Warehouses (§12)
↓
Inter-Branch Operations (§13)
↓
Organization Analytics (§14)
```

---

## 5. Organization Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Total Companies · Total Branches · Total Stores · Total Warehouses · Active Employees · Active POS (registers currently in an open shift, per [04-pos.md](04-pos.md) §14) · Branch Revenue · Inventory Value · Organization Growth — plus Regional Performance (ranked/comparison).

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15); this is the structural-health view (how big is the org, is everything set up correctly) complementing the BI Dashboard's (17 §5) performance-focused executive view.

---

## 6. Company Management

Company Profile · Tax Information · Business Registration · Default Currency (the base Finance operates in absent a branch-level override, [16-finance.md](16-finance.md) §29) · Fiscal Year (defines Finance's Period Closing calendar, 16 §17) · Bank Accounts (the same accounts Finance's Cash & Bank Management references, 16 §11 — configured here at the org level, operated there) · Company Branding (logo/theme, consumed by the app shell's header, Navigation §3, and Receipt/Invoice templates, 04 §12, 09 §11) · Status.

---

## 7. Legal Entity Management

Legal Entity Profile · Registration Number · Tax Number · Country · Compliance Status · Linked Branches.

A Legal Entity is the level Finance's Multi-Company Accounting and Intercompany Transactions (16 §29) actually consolidate/eliminate against — Branches link up to a Legal Entity, and it's at this level (not Company, which may span multiple legal entities in different countries) that statutory financial statements are ultimately produced.

---

## 8. Business Unit Management

Retail · Wholesale · E-commerce · Corporate Sales · Franchise · Custom Business Units.

Business Unit is a cross-cutting classification (a single Branch can primarily serve one Business Unit, e.g., a Wholesale-only warehouse-branch) that Sales' Sales Channel field ([09-sales.md](09-sales.md) §7) and Promotions' Sales Channel condition ([12-promotions.md](12-promotions.md) §7) reference — defined once here, consumed as a filter/condition dimension throughout.

---

## 9. Region Management

Country · State/Province · City · Regional Manager (assignment, ties into Employees' Organization Structure, [18-employees.md](18-employees.md) §8) · Regional KPIs (the same rollup Dashboard's Regional Manager view (03 §2) and this module's own Analytics (§14) both display).

---

## 10. Branch Management

Branch Profile · Branch Code (unique key referenced by every transactional module — Sales, Inventory, POS, Finance) · Manager (assignment) · Address · GPS Location (feeds any Geo-fenced Attendance, [18-employees.md](18-employees.md) §26, and Geo Map View, §25) · Opening Hours (relevant to POS availability and Delivery Management's scheduling, 09 §10) · Contact Details · Status · **Branch Calendar** (holidays/special hours, distinct per branch — a flagship store's extended holiday hours vs. a standard branch's regular schedule).

Branch is the level most other modules scope directly against (Inventory's Branch Stock, Sales' Branch field, Finance's Branch Cost Center) — its Branch Code is effectively the platform's most-referenced foreign key outside of Product SKU and Customer ID.

---

## 11. Store Management

Store Layout (floor plan reference, relevant for POS terminal placement and, at a stretch, in-store navigation features) · Store Type (Flagship / Outlet / Franchise Store) · Store Capacity · Assigned Employees (view into Employees' Branch Assignment, 18 §3) · Assigned POS (which registers/terminals operate at this store, linking to POS's per-register Shift sessions, 04 §14).

Store is typically the retail-facing sub-unit of a Branch (a Branch might be "Downtown Region Store," which *is* the Store in a simple single-location-per-branch setup, or a Branch could encompass multiple Stores in a mall/complex scenario) — the distinction matters most for larger, multi-location-per-branch operations; smaller businesses can treat Branch and Store as effectively 1:1.

---

## 12. Warehouse Management

Main Warehouse · Branch Warehouse (attached to/serving a specific Branch) · Transit Warehouse (in-transit staging, relevant to Inter-Branch Operations, §13, and Purchase's drop-shipping flows, 08) · **Virtual Warehouse** (a non-physical stock-holding construct — e.g., representing consignment stock still legally owned by a supplier, per Sales' Consignment Sales, 09 §27, or an E-commerce-only fulfillment allocation that doesn't correspond to a physical location) · Default Warehouse (per Branch, the fallback assignment for new Product stock, 05 §10) · Warehouse Capacity.

This is the same Warehouse entity Inventory's Warehouse Management ([07-inventory.md](07-inventory.md) §6) operates — this module creates and structurally places warehouses within the org hierarchy; Inventory manages their zones/bins/stock contents. One entity, two modules each owning a different facet (existence/hierarchy here, operational stock detail there).

---

## 13. Inter-Branch Operations

Stock Transfer / Inventory Transfer (the org-structural view of transfers Inventory already executes, [07-inventory.md](07-inventory.md) §8 — this module surfaces cross-branch transfer volume/patterns at the organizational level, not a duplicate transfer mechanism) · Employee Transfer (the org-structural view of Employees' Transfer workflow, 18 §3) · Cash Transfer (branch-to-branch or branch-to-HQ cash movement, feeding Finance's Cash & Bank Management, 16 §11) · Inter-Branch Sales (one branch fulfilling another's customer, per Sales' Inter-Branch Sales feature, 09 §27) · Intercompany Transactions (where branches sit under different Legal Entities, §7, requiring formal intercompany accounting per Finance, 16 §29) · Approval Workflow (reuses the shared Manager Override/Approval component pattern, parameterized for inter-branch context, especially for Cash Transfer and Intercompany Transactions given their financial sensitivity).

This section is explicitly a **cross-branch operational visibility and approval layer**, not a re-implementation of Inventory's transfer mechanics, Employees' transfer workflow, or Finance's intercompany posting — it's where a COO looks to see the aggregate picture of how much is moving between branches, and where higher-tier approvals for unusually large or cross-entity movements are granted.

---

## 14. Organization Analytics

Revenue by Company/Region/Branch · Profit by Branch · Inventory by Warehouse · Employee Distribution · Store Performance · Branch Growth.

Reuses Dashboard/Sales/Finance/Inventory Analytics chart components — Revenue/Profit by Branch specifically must reconcile with Sales Analytics' branch performance (09 §15), Finance's Branch Profitability (16 §18), and Inventory's Branch Comparison (07 §15), consistent with the "these three views must never disagree" rule already established when Finance's own Analytics section was specified (16 §18).

---

## 15. Search & Filter

Company · Region · Branch · Store · Warehouse · Manager · Status · Country · Date Range — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 16. Bulk Operations

Bulk Import · Bulk Export · Bulk Branch Assignment · Bulk Region Assignment · Bulk Status Update — same preview-before-commit rule as every other bulk action platform-wide. No Bulk Delete for Companies/Branches/Warehouses (every transactional module references these by ID; deleting one out from under active data would be catastrophic) — Bulk Status Update to Inactive/Closed is the only decommissioning path, consistent with the platform-wide Archive-over-Delete principle taken to its strictest extreme here.

---

## 17. Activity Timeline

Company Created · Branch Added · Store Opened · Warehouse Created · Transfer Completed · Manager Assigned — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 18. Audit Log

User · Action · Timestamp · Old Value · New Value · Reference Document — generated from the same event stream as §17, restricted to Super Admin/Owner/Finance Manager given how structurally significant changes here are (e.g., changing a Company's Fiscal Year retroactively would have serious Finance implications).

---

## 19. Validation

| Rule | Behavior |
|---|---|
| Duplicate Company Code | Hard-blocked — unique key |
| Duplicate Branch Code | Hard-blocked — the platform's most-referenced foreign key, per §10, cannot collide |
| Duplicate Store Code | Hard-blocked |
| Duplicate Warehouse Code | Hard-blocked |
| Missing Required Fields | Company/Branch minimum viable fields (§3) enforced; deeper hierarchy levels can be added incrementally |
| Invalid Organization Hierarchy | Blocked — a Branch cannot be created without a valid parent Region/Company reference (whichever levels the org has chosen to populate, per §3); circular parent-child relationships blocked, consistent with Employees' circular-manager-relationship rule (18 §20) |

---

## 20. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Companies | New tenant, first-run setup: icon + "Set up your organization" + "Create your first company" CTA — this is the very first configuration step a brand-new tenant performs, blocking most of the rest of the platform until at least one Company+Branch exists |
| No Branches | Same blocking treatment — mirrors Inventory's "no warehouse blocks stock" rule (07 §21) and Suppliers' "no supplier blocks PO" rule (15 §20), applied at the foundational org level |
| No Warehouses | Neutral if Branches exist but warehouses haven't been configured yet (small operations may only need Branch-level stock, no separate warehouse tier) |
| Offline | Read-only cached view; structural edits (creating a new branch, changing hierarchy) are inherently back-office/HQ actions unlikely to happen from a disconnected store device, so this module's offline tolerance is lower priority than transactional modules |
| Permission Denied | Standard Navigation §19 pattern, scoped per §2's Branch/Region/Company-level access |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Retry | Consistent retry affordance throughout |

---

## 21. Responsive Design

| Breakpoint | Lists / Hierarchy Views | Mobile (Managers) |
|---|---|---|
| Desktop/Laptop | Full tables, full org hierarchy tree/Geo Map view | N/A |
| Tablet | Priority columns + scroll, hierarchy tree remains pan/zoomable | Branch-level profile viewing/editing supported |
| Mobile | Card-per-row stacked lists | **Explicitly supported per the prompt's own note** — a Regional/Branch Manager checks their branch's KPIs, opening hours, or approves an Inter-Branch transfer/cash-movement request from a phone; full Company/Legal Entity/hierarchy structural configuration remains Desktop/Tablet-oriented |

---

## 22. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (Company/Branch/Warehouse entry), accessible tables. The organizational hierarchy tree and Geo Map View (§25) require a keyboard-operable list-based alternative to visual tree/map navigation, consistent with the same accessibility requirement established for Employees' Organization Tree View (18 §23).

---

## 23. Security

**Role-Based Permissions** per §2. **Branch-level / Region-level / Company-level Access:** the row-level security foundation (§2) — every other module's location-based scoping (Sales, Inventory, Finance, CRM's Territory-based Access) ultimately derives from a user's assignment at these levels, configured here once. **Approval Workflow:** applied to Inter-Branch Operations (§13), especially Cash Transfer and Intercompany Transactions, reusing the shared Manager Override/Approval component pattern. **Audit Trail:** immutable, per §18, with heightened retention given the structural/financial significance of changes here.

---

## 24. Performance

Optimized for thousands of branches, hundreds of warehouses, and millions of transactions referencing them: hierarchy lookups (which Region does this Branch belong to, etc.) are cached/indexed rather than recomputed via repeated tree traversal on every transactional operation across the platform — since virtually every Sale, Purchase, Inventory movement, and Finance posting includes a Branch reference that may need hierarchy context (e.g., "which Region's dashboard does this roll up to"). Virtual tables, server-side pagination, instant search throughout.

---

## 25. Advanced Enterprise Features

Multi-Country · Multi-Timezone (critical for accurate cross-branch reporting timestamps and Scheduled Reports, 17 §20, when branches span time zones) · Multi-Language · Multi-Currency (ties into Finance's Exchange Rate Management, 16 §29) · Franchise Management (Franchise Partner-specific access scoping and reporting, distinct from wholly-owned branches) · Organization Chart (the visual hierarchy view, §3/§4) · Branch KPI Scorecards · **Geo Map View** (branches plotted geographically, useful for regional performance-at-a-glance and identifying market coverage gaps) · Store Heatmaps (in-store traffic/zone performance, where supported by in-store sensors — a specialized retail analytics feature) · Capacity Planning (warehouse/store capacity vs. actual utilization, cross-referencing Inventory's Warehouse Utilization, 07 §4, and Store Capacity, §11) · **Store Opening Checklist** and **Branch Closing Checklist** (structured task lists, reusing the Task Management component pattern from Employees/CRM, 18 §12, 14 §12, for the specific workflow of launching a new location or winding one down) · Intercompany Consolidation (Finance's Multi-Branch Consolidation, 16 §29, executed here at the org-structure level) · AI Branch Performance Insights · AI Regional Forecasting.

Additive/opt-in per the platform-wide principle — a single-branch retailer configures one Company and one Branch and never engages Multi-Country/Franchise/Intercompany features at all.

---

## 26. Developer Implementation Notes

- Branch/Warehouse records created here are the actual entities Inventory (07 §6), Sales (09 §7), Finance (16 §6/§15's Cost Centers), and every other location-scoped module reference by ID — this module is upstream of all of them structurally; it must exist and be seeded before those modules can create any transactional data, which has bootstrapping implications for tenant onboarding (§20's blocking empty states).
- Inter-Branch Operations (§13) must not duplicate Inventory's Transfer execution (07 §8), Employees' Transfer workflow (18 §3), or Finance's intercompany posting (16 §29) — it aggregates/visualizes/approves at the cross-branch level while those modules retain ownership of the actual transactional mechanics, exactly the read/write ownership discipline applied throughout the platform.
- Branch/Region/Company-level Access (§23) should be implemented as one hierarchical row-level-security service that Sales, Inventory, Finance, CRM, and Reports all query against — not a separately re-implemented scoping check per module, since a change to how access cascades (e.g., does Regional Manager access automatically include all child branches) must apply consistently everywhere at once.
- Hierarchy caching (§24) needs cache invalidation whenever a Branch's parent Region/Company assignment changes — a stale cached hierarchy could misroute a transaction's rollup reporting to the wrong Region after a reorganization.
- Warehouse (§12) is a shared entity with Inventory (07 §6) — implement as one table with this module owning structural/hierarchy fields (parent Branch, type, capacity) and Inventory owning operational fields (zones, bins, current stock aggregates), not two separate warehouse records requiring synchronization.

---

**Next:** 20-settings.md
