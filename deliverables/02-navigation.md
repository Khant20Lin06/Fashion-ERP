# Navigation & Information Architecture Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Single Source of Truth
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md)
**Consumed by:** All future modules (03–29), all UI prompts

---

## 1. Navigation Philosophy

Three questions must be answerable at a glance on every screen: **Where am I? Where did I come from? Where can I go next?**

Answered respectively by: active sidebar state, breadcrumb, and the combination of sidebar + page header actions + contextual row actions. Navigation is never a puzzle — every path a user can take is visible, not hidden behind gestures or memorized sequences (except power-user shortcuts, which are accelerators to *visible* actions, never the only path).

---

## 2. Application Layout

Fixed five-region shell, consistent across every module:

```
┌──────────────────────────────────────────────────────────────┐
│ TOP HEADER (64px, sticky)                                    │
├───────────┬────────────────────────────────────────────────────┤
│           │ PAGE HEADER (title, breadcrumb, actions)          │
│  SIDEBAR  ├────────────────────────────────────────────────────┤
│  (264px / │                                                    │
│   72px)   │ PAGE CONTENT                       │ RIGHT PANEL  │
│           │ (12-col grid, scrollable)          │ (optional,   │
│           │                                     │  360px,     │
│           │                                     │  contextual) │
├───────────┴────────────────────────────────────────────────────┤
│ FOOTER (optional — sync status, version, support link)        │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
- Sidebar and Top Header are always present and fixed; only Page Content (and optional Right Panel) scrolls.
- Right Panel is used for contextual detail-without-navigation (e.g., customer quick-view from an order row) — it never duplicates a route that also exists as a full page.
- Footer appears only where relevant (POS shows register/shift status; back-office screens show last-sync time for offline-capable modules).
- Layout regions use tokens from [01-design-system.md](01-design-system.md): `space-6` padding inside Page Content, `elevation-1` for Sidebar/Header separation from canvas, `radius-lg` for Right Panel.

---

## 3. Top Header (64px, sticky)

Left → right layout:

| Zone | Contents |
|---|---|
| Left | Company logo (32px) · Sidebar collapse toggle |
| Center-left | Workspace/Branch Switcher (see §14) |
| Center | Global Search (see §9) — expands on focus, `Ctrl/Cmd+K` also opens Command Palette |
| Right | Quick Actions (+) · Tasks (checklist icon, badge count) · Notifications (bell icon, badge count) · Help Center (?) · Settings shortcut (gear) · User Profile avatar (see §12) |

**Behavior:**
- Sticky at all scroll positions, `elevation-1` at rest, `elevation-3` once page content scrolls beneath it.
- Responsive: on Tablet, Workspace Switcher collapses into the Profile Menu; on Mobile, Global Search collapses to an icon that expands to a full-screen overlay.
- All icon buttons are 40×40px hit targets (per Design System §10), tooltipped, and keyboard-reachable in this left-to-right order.

---

## 4. Left Sidebar

**Expanded:** 264px, icon (24px) + label (Body, 14px), section grouping with `overline` labels (e.g., "OPERATIONS", "MANAGEMENT").
**Collapsed:** 72px, icon-only, label shown as tooltip on hover, flyout sub-menu on hover/click for nested items.

**States:**
- **Active:** Primary Container background (`radius-md`), Primary-colored icon+text, 3px left accent bar.
- **Hover:** Hover Layer token background.
- **Nested/expanded parent:** chevron rotates 90°, children indent 12px with a connecting guide line.
- **Permission-based visibility:** items the current role cannot access are omitted entirely (not shown-disabled) — reduces clutter and avoids implying access that doesn't exist. Exception: items requiring upgrade/approval show a lock icon with tooltip explaining why.
- **Favorites/Pinned:** a dedicated top section (max 6 pinned items) populated via a pin icon on hover over any nav item or sub-item; persisted per-user.
- **Scrollable region:** primary nav list scrolls independently if it exceeds viewport height; Favorites and the collapse toggle remain fixed.

Toggle between Expanded/Collapsed persists per-user (localStorage/profile preference), with a smooth 200ms width transition (`motion-base`, per Design System §18).

---

## 5. Primary Navigation — Module List & Icons

| Order | Module | Icon (Phosphor) | Default Landing Roles |
|---|---|---|---|
| 1 | Dashboard | `House` | All roles |
| 2 | POS | `Storefront` | Cashier, Sales Associate, Store Manager |
| 3 | Sales | `Receipt` | Store Manager+, Accountant |
| 4 | Products | `TShirt` | Purchasing, Inventory Controller, Store Manager+ |
| 5 | Inventory | `Package` | Warehouse Staff, Inventory Controller, Branch Manager+ |
| 6 | Purchase | `ShoppingCartSimple` | Purchasing Officer, Regional Manager+ |
| 7 | Customers | `Users` | Sales Associate+, Marketing, Customer Service |
| 8 | Suppliers | `Truck` | Purchasing Officer, Finance |
| 9 | Finance | `Wallet` | Accountant, Finance Manager, Business Owner |
| 10 | Reports | `ChartBar` | Manager tiers and above |
| 11 | Employees | `IdentificationBadge` | HR Manager, Branch Manager+ |
| 12 | Marketing | `Megaphone` | Marketing Team |
| 13 | Branches | `Buildings` | Regional Manager+, Franchise Partner |
| 14 | AI Analytics | `ChartLineUp` | Business Owner, Regional Manager, Finance Manager |
| 15 | Settings | `Gear` | Role-scoped subsections (see module 20/26) |
| 16 | Developer | `Code` | Super Admin only |

Each item shows a Regular-weight icon at rest, Bold-weight when active (per Design System §9). Module order is fixed across all roles — items not permitted are removed, not reordered, so muscle memory transfers between roles a user might hold over time (e.g., promoted from Cashier to Store Manager).

---

## 6. Secondary Navigation (In-Module)

Standard sub-navigation pattern, rendered as **Tabs** directly beneath the Page Header when a module has ≤6 sub-sections, or as a **secondary sidebar flyout** when a module (e.g., Settings) has a deeper tree:

Overview · List · Create · Detail · History · Analytics · Reports · Settings

Not every module uses all seven — only include tabs that have real content (e.g., POS has no "List" tab; Dashboard has no sub-nav at all, since it *is* the overview). Tabs use the Design System Tab component with underline-style active indicator, keyboard arrow-key navigation between tabs, and persist last-visited tab per module per session.

---

## 7. Page Header

Every page (except the Dashboard, which has a lighter variant) includes, top to bottom:

1. **Breadcrumb** (§8)
2. **Title row:** Page Title (Headline style) + optional status badge → right-aligned Primary Action Button + Secondary Actions (overflow menu for anything beyond 2 secondary actions)
3. **Description** (Body Small, Text Secondary) — one line, optional, explains the page's purpose for less-frequent users
4. **Toolbar row** (only on list/table pages): Search · Filters · Date Range (where time-scoped) · Sort · Export · Refresh — left-aligned Search+Filters, right-aligned Export/Refresh

Spacing: `space-6` between each zone, `space-8` below the full header before Page Content begins. Toolbar is sticky beneath the Top Header on long scrolling tables.

---

## 8. Breadcrumb

Present on every page **except** top-level module landing pages reached directly from the sidebar (Dashboard, and each module's own Overview/List) — those are the "root," so a breadcrumb would be redundant with the sidebar's active state. Appears from the first level of drill-down onward.

```
Dashboard  >  Products  >  Product List  >  Product Detail
```

- Each segment (except the current, final one) is a clickable link, Text Secondary color, Primary on hover.
- Final segment is Text Primary, non-interactive (it's "you are here").
- Truncates middle segments on narrow viewports as `… >` with the full path in a tooltip.
- Uses `nav aria-label="Breadcrumb"` with an ordered list, per accessibility rules.

---

## 9. Global Search

Searches across: Products, Customers, Suppliers, Invoices, Orders, Employees, Reports, Branches.

**Interaction:**
- Trigger: click the header search field, or `Ctrl/Cmd+K` → opens Command Palette in "search mode" (search and command palette share one entry point and one overlay — see §11 for why they're unified, not duplicated).
- Results grouped by entity type with category headers, top 5 per category, "See all N results in Products →" link per group.
- **Instant results:** debounced 200ms, results stream in as categories resolve (products may return before reports).
- **Recent searches:** shown when the field is focused but empty (last 5, clearable).
- **Search suggestions:** typeahead against product names/SKUs/customer names/order numbers as the highest-frequency lookups.
- Keyboard: `↑↓` to navigate results, `Enter` to open, `Esc` to close, result rows show the matched entity's key metadata (e.g., product: thumbnail + name + SKU + stock status).

---

## 10. Quick Actions

A persistent `+` button in the Top Header opens a role-filtered dropdown of the highest-frequency create actions:

New Sale · New Product · New Customer · Purchase Order · Transfer Stock · Create Supplier · Generate Report

**Rules:**
- List is role-scoped and usage-ordered (e.g., a Cashier sees "New Sale" first; a Purchasing Officer sees "Purchase Order" first) — same action set, reordered by role relevance, never hidden arbitrarily.
- Each entry also has a direct keyboard shortcut (§18) for zero-click access once memorized.
- Available identically from every screen — this is the one navigation element that is never contextual to "where you are."

---

## 11. Command Palette

`Ctrl/Cmd+K` from anywhere in the app opens a centered modal overlay (elevation-5, per Design System §8):

- **Navigate:** jump to any module/page ("go to Inventory")
- **Search:** same engine as Global Search (§9) — typing a non-command string falls into search results
- **Open Modules:** direct module jump with fuzzy match
- **Run Actions:** the Quick Actions list (§10) plus power-user-only actions (e.g., "Recalculate stock valuation")
- **Create Records:** "Create Product," "Create Customer," etc.

Rationale for unifying Search + Command Palette behind one shortcut and entry point: reduces the number of distinct "type things here" affordances a new user must discover from two to one, while still giving power users a single fast path to everything. Palette remembers the last 5 used commands at the top of the empty state.

---

## 12. User Profile Menu

Top-right avatar → dropdown:

Profile · My Account · Preferences · Theme (Light/Dark/System) · Language · Branch (shortcut into Workspace Switcher, §14) · Help · **Logout** (visually separated below a divider, since it's the one destructive/high-friction item in this menu).

---

## 13. Notification Center

Bell icon → slide-in panel (right side, 400px, `elevation-4`) categorized by: Sales · Inventory · Purchase · Approvals · Finance · Marketing · Security · System.

- Tabs at top: **All** / **Unread** — unread count badge on the bell icon itself (max display "99+").
- Each notification: icon (colored by category), title, timestamp (relative, e.g., "12m ago"), and a contextual deep-link (clicking navigates directly to the relevant record, e.g., a low-stock alert opens that product's Inventory detail).
- **Mark all read** action top-right of the panel; individual notifications can be marked read/unread via row hover action.
- **Filter** by category via chips beneath the tabs.
- Security-category notifications (e.g., failed login, permission change) are visually distinguished with an Error/Warning accent and cannot be bulk-dismissed without individual acknowledgment.

---

## 14. Workspace Switcher

Header element allowing context switch without re-authentication, in nested order: **Company → Branch → Warehouse → Department**, plus a separate **Role** switcher for users holding multiple roles (e.g., a Regional Manager who also has Store Manager access at one location).

- Presented as a single dropdown with a searchable list when the org has many branches; grouped by region.
- Switching branch/warehouse re-scopes all module data (Inventory, Sales, POS) to the new context — a confirmation toast ("Now viewing: Branch 04 – Siam Square") confirms the switch succeeded, since this changes what data is visible everywhere.
- Current selection always visible in the header, never just in a menu the user has to open to check.

---

## 15. Page-Level Actions (List/Table Screens)

Standard toolbar action set: Search · Filter · Sort · Export · Import · Bulk Actions · Refresh · Create · Settings (column visibility / density toggle).

- **Bulk Actions** only appear (as a sticky contextual bar replacing the toolbar) once ≥1 row is selected — shows count ("3 selected"), available bulk operations, and a "Clear selection" action.
- **Import** always pairs with a template download and a pre-commit validation/preview step — never a blind bulk write.
- **Refresh** is manual-trigger plus auto-refresh indicator where data is live (e.g., POS queue, stock levels) — spinning icon during fetch, last-updated timestamp on hover.

---

## 16. Contextual (Row) Actions

Every table row supports, permission-filtered: View · Edit · Duplicate · Print · Export · Archive · Delete.

- Two most relevant actions shown as inline icon buttons (e.g., View + Edit), remainder in a trailing overflow (`⋮`) menu — keeps rows scannable per Design System density rules.
- **Delete** always routes through the Confirmation Dialog pattern (Design System §14) — never a direct destructive click.
- **Archive** is preferred over Delete wherever the business domain allows it (e.g., discontinued products, past employees) — preserves historical/reporting integrity; Delete is reserved for genuine mistakes (e.g., a duplicate entry created seconds ago).
- Row actions are keyboard-accessible (row focus → context menu key or a visible "..." button, never hover-only).

---

## 17. Responsive Navigation

| Breakpoint | Sidebar | Top Header | Right Panel |
|---|---|---|---|
| Desktop (≥1440) | Expanded (default) | Full | Inline, 360px |
| Laptop (1024–1439) | Collapsible, user-toggled | Full | Inline, 320px or overlay |
| Tablet (768–1023) | Overlay (hidden by default, hamburger toggle) | Search collapses to icon | Overlay only |
| Mobile (360–767) | Full-screen drawer navigation | Logo + hamburger + avatar only | Overlay only, full-screen |

Navigation never disappears entirely at any breakpoint — it degrades to an overlay/drawer, always reachable via a persistent, consistently-positioned toggle (top-left hamburger).

---

## 18. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + K` | Open Command Palette / Search |
| `Ctrl/Cmd + N` | Context-aware "New" (New Sale in POS, New Product in Products, etc.) |
| `Ctrl/Cmd + S` | Save current form |
| `Esc` | Cancel / close current dialog, drawer, or palette |
| `Ctrl/Cmd + R` | Refresh current view |
| `G` then a letter | Navigate modules (e.g., `G` `D` → Dashboard, `G` `P` → Products) — Gmail-style go-to |
| `?` | Open keyboard shortcut reference overlay |

A discoverable shortcut reference (triggered by `?` or from the Help menu) lists all shortcuts grouped by context — shortcuts are always an accelerator layer on top of visible UI, never the only way to perform an action.

---

## 19. Accessibility

- All navigation is keyboard-operable in DOM/logical order matching visual order (sidebar → header → breadcrumb → page actions → content).
- Sidebar, header, and command palette use proper landmark roles (`nav`, `banner`, `dialog` with `aria-modal`).
- Breadcrumbs use `nav aria-label="Breadcrumb"` with an ordered list (§8).
- Active nav state communicated to assistive tech via `aria-current="page"`, not color alone.
- Drawers and the Command Palette trap focus and restore it to the triggering element on close.
- Notification updates use a polite `aria-live` region so new alerts are announced without interrupting current task focus.

---

## 20. UX Principles Applied

- **Reduce clicks:** Quick Actions + Command Palette give ≤2-click/keystroke access to the ~10 highest-frequency create actions from anywhere.
- **Avoid hidden actions:** row actions always show at least 2 inline before overflowing; nothing is exclusively hover-only or gesture-only.
- **Discoverability over memorization:** every keyboard shortcut maps to a visible button/menu item; power-user paths are additive.
- **Consistent orientation:** sidebar active state + breadcrumb + page title together always uniquely identify location — no page exists where a user can't tell where they are.

---

## 21. Inheritance Rule for Future Modules

Every module from 03 onward automatically inherits, without restating: Top Header, Sidebar, Breadcrumb pattern, Page Header structure, Global Search, Quick Actions, Command Palette, Notification Center, Workspace Switcher, all responsive behaviors, and all accessibility rules defined above.

Module-specific specs (03+) should describe only what's *distinct* about that module's Page Content, Secondary Navigation tabs, and any module-specific Right Panel or contextual actions — never redefine the shell.

**Next:** 03-dashboard.md
