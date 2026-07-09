# System Administration & Configuration — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [20-settings.md](../deliverables/20-settings.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module is the configuration surface behind every prior module's shared Approval component thresholds and auto-generated document numbers — Business Rules (§9) and Approval Configuration (§10) here are literally where "$500 discount requires manager approval" gets set, once, for the whole platform. This UI departs from the standard app-shell layout (sidebar + content) in favor of a dedicated Settings sidebar, per the spec's distinct navigation pattern for deep configuration trees.

---

## 1. Screen Anatomy

```
Top Header (unchanged) → Settings Sidebar (240px, replaces the main Sidebar within this module)
↓
Breadcrumb: Settings > [Section] > [Subsection]
↓
Page Header (Section title + Save/Reset actions)
↓
Settings Form Content
```

**Settings Sidebar** (distinct from the platform's main navigation Sidebar, scoped only within this module): grouped list — General · Company · Localization · Number Series · Business Rules · Approval Configuration · Currency · Tax · Units of Measure · Notifications · Feature Flags · Integrations · Backup & Maintenance · Configuration History · **Audit Log** · **System Status**. A **Search Settings** field pins to the top of this sidebar (distinct from Global Search) with instant filtering of the section list itself.

---

## 2. Settings Home Dashboard

Reached at `Settings` root before selecting a section — lightweight header pattern, overview cards (not the platform's usual KPI-card row, since these are status indicators, not business metrics): System Status · Company Information (compact summary) · Active Users · Security Status · Integration Status · Storage Usage · API Usage · Recent Changes (mini activity feed) · Pending Approvals (configuration changes awaiting sign-off, per the spec's Approval-before-Activation rule).

Each card deep-links into its full section in the Settings Sidebar.

---

## 3. Company Settings

Form sections (each its own card, `space-6` between cards): Company Profile (Name, Registration Number) → Company Logo (upload with light/dark variant slots, since the logo token feeds both theme modes) → Legal Information → Business Address → Contact Information → Fiscal Year (start month/day picker) → Default Currency (searchable select) → Time Zone → Language.

Every field group has its own **Save** button scoped to that card (not one giant form-wide save) — consistent with the spec's Configuration Lifecycle where most settings apply immediately, reducing the risk of an unrelated field's accidental edit being bundled into an unrelated save.

---

## 4. Business Configuration

Sub-tabs within this section: Sales Settings · Purchase Settings · Inventory Rules · POS Configuration · Pricing Rules · Discount Rules · Return Policy · Approval Rules.

Each renders as a structured form of toggles/number-inputs/dropdowns (e.g., Return Policy: "Return window: [30] days," "Require receipt: [✓]," "Restocking fee: [0]%") — no free-form configuration here; every setting is a bounded, validated input, consistent with the spec's Business Rules being the literal values other modules' Approval components read.

---

## 5. Number Series

Table: Document Type (Products/Customers/Suppliers/Purchase Orders/Sales Orders/Invoices/Receipts/Payments/Returns/Employees/Branches/Custom), Current Pattern (e.g., `PO-{YYYY}-{00001}`), Next Number preview, Reset Cadence (Never/Yearly/Monthly).

Row click opens an inline editor: Prefix, Number padding, Reset Cadence, Starting Number — with a live preview showing what the next 3 generated numbers will look like. **A prominent, permanent notice** beneath the editor: *"Changing this pattern only affects future numbers — already-issued document numbers never change."* — surfacing the spec's hard invariant directly in the UI, not just as backend behavior a user has to trust blindly.

---

## 6. Business Rules

This is where every platform-wide Approval component's actual threshold lives, presented as readable rule rows rather than a raw settings table:

```
Discount Limits
  Cashier can approve discounts up to:        [10]%   or   [฿500]
  Store Manager can approve discounts up to:    [25]%   or   [฿2,000]
  Above these thresholds → requires:  [Regional Manager ▾]

Credit Limits
  Default customer credit limit:  [฿50,000]
  Requires Finance Manager approval above: [฿200,000]

Stock Policy
  Negative Stock: [Hard-blocked (recommended) ▾]  — exceptions per category below
  Return Window: [30] days
```

Each rule reads like a sentence with inline editable values, consistent with the rule-builder readability pattern established in Promotions — this is deliberately *not* a raw key-value settings table, since these values are read by non-technical managers trying to understand "what will happen" as much as configured by administrators.

---

## 7. Approval Configuration

Table: Workflow (Purchase/Sales/Finance/Returns/Price Override/Discount Approval/Stock Adjustment/Leave Requests), Threshold, Approver Tier (Single Manager/Approval Matrix/Dual Approval), Escalation (time window + fallback approver).

Row click opens a configuration panel: Threshold value/quantity/percentage input → Approver Tier selector (selecting "Approval Matrix" reveals a tiered-threshold sub-table, e.g., "$0-$1000 → Store Manager, $1000-$10000 → Regional Manager, $10000+ → CFO") → Escalation rule ("If not actioned within [24] hours, escalate to [next tier] and notify via [Email + Push]").

This panel **is** the configuration backend for the shared Manager Override/Approval component used across all 20+ prior modules — a caption at the top of this section states that explicitly: *"These thresholds apply platform-wide, wherever an approval is required."*

---

## 8. Currency, Tax, Units of Measure

- **Currency Management:** Base Currency (locked after first transaction, shown with a lock icon + explanation if attempting to change) → Additional Currencies (multi-select) → Exchange Rates table (Currency Pair, Rate, Last Updated, Auto-update toggle) → Currency Precision (decimal places)
- **Tax Configuration:** Tax Groups/Templates table (Name, Rate, Type, Region, Active) — "+ New Tax Template" form dialog; Inclusive/Exclusive default toggle; Tax Rounding rule (Round Up/Down/Nearest)
- **Units of Measure:** Base Units list + Alternative Units with Conversion Rules (e.g., "1 Carton = 12 Units") — a simple two-column conversion table, "+ Add Conversion"

---

## 9. Notification Settings

Channel toggles (Email/SMS/Push/In-App — each with an "Enabled" switch and a "Configure Provider →" link into Integration Settings, §11, for credentials). Reminder Rules and Escalation Rules as simple rule-row lists (Trigger → Lead Time → Channel), reusing the same rule-row visual pattern as Business Rules (§6).

---

## 10. Feature Flags

Grouped toggle list, one row per platform module: **Enable/Disable Modules** (CRM, Marketing Automation, Loyalty, E-commerce, etc. — each with an "Active" switch; disabling immediately removes that module from every user's Sidebar, per the spec's routing-layer gating rule) → Beta Features (separate section, `color-info` accent, "Try new features early") → Experimental Features (`color-warning` accent, "May be unstable") → Tenant-specific Features (Super Admin only, relevant for multi-tenant deployments).

Disabling a module with existing data shows a confirmation: *"Disabling CRM will hide it from navigation but preserve all existing data — re-enable anytime to restore access."*

---

## 11. Integration Settings

Card grid, one card per integration category: Payment Gateways, Email Providers, SMS Providers, Shipping Providers, Accounting Integrations, Webhook Endpoints, API Keys.

Each card shows connection status (● Connected / Not Configured / Error badge) and a "Configure →" action opening a credential-entry form (masked input fields for secrets, a "Test Connection" button that validates before saving). **Webhook Endpoints** specifically: a table of registered endpoints (URL, Subscribed Events multi-select, Status, Last Delivery) — the single registry every module's "Webhooks" advanced feature registers against, per the Integration Platform module's ownership.

**API Keys** table: Key Name, Scope (chips), Created Date, Last Used, masked key value with a reveal-icon (audit-logged on reveal) and Revoke action.

---

## 12. Backup & Maintenance

Manual Backup (button + last-backup timestamp) → Scheduled Backup (cadence config) → Restore (a restricted, heavily-confirmed action — file/snapshot picker + a typed confirmation of consequence) → **Maintenance Mode** toggle with an explicit caption: *"Enabling Maintenance Mode makes back-office screens read-only. POS registers continue operating normally."* — directly surfacing the spec's carve-out so an administrator never mistakenly believes this would stop registers from selling → System Health Check (button, runs diagnostics, shows a pass/fail checklist) → Cache Management ("Clear Cache" with a scope selector — All/Reports/Promotions Rule Cache — since indiscriminately clearing everything is rarely what's actually needed).

---

## 13. Configuration History

Table: Setting Name, Category, Old Value, New Value, Changed By, Date. **Rollback** action per row (restricted to Super Admin) opens a confirmation showing exactly what will revert. This is the same immutable-versioned-revision pattern used for Product Pricing History and PO Amendments, applied to configuration itself.

---

## 14. Audit Log

Enterprise table: User, Action, Date, IP Address, Module (which downstream module the setting affects — critical context here specifically, since a Settings change's blast radius is often invisible without this column), Change Details (expandable row revealing old/new value diff). This is the platform's most security-sensitive audit surface after IAM's own — filterable by Module/User/Date Range/Action Type, exportable, and read-accessible to Auditor-tier roles without edit rights.

---

## 15. System Status

Server Status / Database Status / API Health / Queue Status / Integration Health — each a status card (● Healthy/Degraded/Down badge) with a small uptime sparkline. Queue Status specifically shows pending/failed job counts (relevant to Scheduled Reports, Notification delivery, Bulk operations) with a "View failed jobs →" drill-in.

---

## 16. Search Experience

**Global Settings Search** (the sidebar's own search field, §1) — instant, matches setting names/descriptions across every section, jumping directly to the matched field with a brief highlight flash on arrival (not just navigating to the section). Recent Settings (last 5 visited) and Search Suggestions (typeahead) shown when the field is focused/empty.

---

## 17. Dialogs

| Dialog | Contents |
|---|---|
| **Update Settings** | Not typically a separate dialog — most sections save inline per §3's card-scoped save pattern; this applies to settings that specifically require a confirmation step beyond simple inline save (e.g., Base Currency change) |
| **Confirm Changes** | Generic confirmation for any setting flagged as structurally significant (per the spec's Approval-Before-Activation rule) — shows old vs. new value |
| **Reset Configuration** | "Reset to Default" — shows exactly which values will revert before confirming |
| **Delete Configuration** | Reserved for Custom Document Number Series / Custom Tax Templates not yet in use — never for foundational settings |
| **Enable Feature / Disable Feature** | Per §10's confirmation pattern |

---

## 18. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover` |
| Focus | 2px `color-focus` ring throughout every form field |
| Selection | N/A (this module is primarily single-record configuration, not bulk list operations) |
| Keyboard Navigation | Full Tab-through on every form; Settings Sidebar is keyboard-navigable with arrow keys within its grouped list |
| Toggle Controls | Switch component (Design System base) for every boolean setting — immediate visual state change on click, with the underlying save behavior (immediate vs. requiring confirmation) determined by the setting's significance tier, not the toggle's appearance |
| Inline Editing | Business Rules' sentence-style rows (§6) support click-to-edit on the embedded value inputs without a separate "Edit" mode toggle |
| Confirmation Feedback | A brief `color-success` checkmark flash on successful inline save, consistent with every other inline-edit pattern in the platform (Product Detail's Overview tab, Customer 360) |

---

## 19. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton settings form per section |
| Empty Configuration | Rare given every setting ships with a platform default — applies mainly to empty sub-lists (no Custom Document Series configured yet) |
| No Search Results | Settings Search yielding nothing: "No settings match '[query]'" |
| Permission Denied | A settings section the role cannot access is omitted from the Settings Sidebar entirely, per the platform's omission-over-denial rule |
| Validation Error | Inline — e.g., Minimum Stock exceeding Maximum Stock blocked at the field before save |
| Save Failed | Distinct from generic Server Error — a settings save failure shows the specific reason where known (e.g., "This webhook endpoint failed a test connection") |
| Save Success | Brief inline checkmark (§18) for routine saves; toast for section-wide saves |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |

---

## 20. Responsive Design

| Breakpoint | Settings Forms | Mobile Admin View |
|---|---|---|
| Desktop/Laptop | Settings Sidebar + full-width form content, side-by-side related sections | N/A |
| Tablet | Settings Sidebar collapses to a top dropdown selector; single-column forms | Most settings viewable/editable |
| Mobile Admin View | Sequential single-field-group screens | **Admin Essentials** — a Super Admin toggling a Feature Flag, checking System Status, or approving a pending Configuration Change from a phone; deep configuration work (Number Series patterns, Integration credentials, Tax Template design) remains Desktop/Tablet-oriented |

---

## 21. Accessibility

Standard baseline: keyboard navigation, screen reader labels, visible focus, accessible forms (every settings section is fundamentally a form — labeled inputs, `aria-describedby` errors), WCAG AA. Given this module is pure configuration with minimal charts/tables beyond simple lists, it carries a lighter accessibility surface than data-heavy modules, but the same rigor applies to every toggle, input, and validation message — critical given Auditor-role users frequently rely on assistive technology when reviewing this exact module's Audit Log.

---

## 22. Figma Build Notes

- Frame: `Settings/Home/Desktop/1440`, `Settings/BusinessRules/Desktop/1440`, `Settings/NumberSeries/Desktop/1440`
- Settings Sidebar is a distinct component from the platform's main navigation Sidebar (Navigation §4) — same visual language (spacing, active-state treatment, `color-primary-container` active background) but scoped to this module's own section list, not swapping out the global Sidebar's content
- Business Rules' sentence-style rows are a new small component pattern — inline editable value chips embedded within static label text, distinct from a standard form row
- Layer naming: `Settings/BusinessRules/Rule-DiscountLimit`, `Settings/NumberSeries/Row-PurchaseOrder`, `Settings/Integrations/Card-PaymentGateway`, per convention

---

## 23. Developer Handoff Notes

- Business Rules (§6) and Approval Configuration (§7) values must be read by every module's shared Manager Override/Approval component at evaluation time, never hardcoded or cached beyond the invalidation window this module's own save action triggers, per `20-settings.md` §30.
- Number Series (§5) generation must be centralized as one service every document-creating module calls — never a per-module counter implementation, per `20-settings.md` §30.
- Feature Flags (§10) must gate at both the routing/navigation layer (Sidebar visibility) and the API layer — a disabled module must be neither navigable to nor reachable via a direct API call, not just hidden from the menu.
- Configuration caching (§23 of the spec) needs a well-defined invalidation event published whenever any setting changes here — every consuming module subscribes to invalidation for the specific settings it depends on, rather than polling for changes.
- Environment Separation (referenced in the spec's Security section) must be enforced at the data layer, not just a UI toggle — this UI's Integration Settings (§11) must never expose a Production credential from within a Test-environment session context.

---

**Next:** 21-notifications-ui.md
