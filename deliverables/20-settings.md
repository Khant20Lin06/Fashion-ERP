# System Administration & Configuration Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [19-multi-branch.md](19-multi-branch.md) (all prior modules)
**Consumed by:** Every module in the platform
**Scope note:** This module is the "where" behind every prior spec's "configured," "configurable threshold," or "per organization policy" — Purchase's approval thresholds (08 §21/§25), Sales' discount/credit limits (09 §21/§25), Product Management's number series (05 §6), Finance's Chart of Accounts/Fiscal Year (16 §6/§17), and every module's shared Manager Override component's actual threshold values are all configured here, once, then read by each module at runtime. This module never re-implements those modules' approval *mechanics* — it owns the configuration values those mechanics consult.

---

## 1. Module Objective

Provide centralized configuration for system behavior, business rules, localization, numbering, approvals, integrations, notifications, and application preferences — a single control surface so that "how discounts get approved" or "what a Sales Order number looks like" has exactly one place to look, not eighteen scattered module-level settings pages.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin | Full access, all environments, Configuration Locking authority |
| System Administrator | Full operational configuration; cannot bypass Environment Separation (§27) |
| IT Administrator | Integration Settings (§17), Backup & Maintenance (§18), technical configuration |
| Owner | Full business-configuration access (Business Rules, Approval Configuration, Currency/Tax); typically not Integration/Backup |
| Operations Manager | Business Rules (§10), Number Series (§9), Notification Settings (§15) within their scope |

**Sensitive Configuration Protection (§27):** API Keys, payment gateway credentials, and integration secrets are masked-with-audit-logged-reveal, consistent with the platform-wide sensitive-data pattern (Customers 10 §24, Finance 16 §27, Employees 18 §24) — extended here to system secrets rather than personal/financial data.

---

## 3. Configuration Lifecycle

```
Configuration Created → Validation → Approval (Optional) → Activation
→ Version History → Audit
```

**Approval (Optional)** — most settings apply immediately on save (e.g., toggling a notification preference); structurally significant changes (Number Series format affecting already-issued documents, Chart of Accounts restructuring feeding Finance, Business Rule changes affecting live approval thresholds platform-wide) route through the same shared Approval component used everywhere else, parameterized for configuration-change context, before Activation.

---

## 4. Module Structure

```
Settings Dashboard (§5)
↓
General Settings (§6) · Company Preferences (§7) · Localization (§8)
↓
Number Series (§9) · Business Rules (§10) · Approval Configuration (§11)
↓
Currency Management (§12) · Tax Configuration (§13) · Units of Measure (§14)
↓
Notification Settings (§15) · Feature Flags (§16) · Integration Settings (§17)
↓
Backup & Maintenance (§18)
↓
Configuration History (§19)
```

---

## 5. Settings Dashboard

Lightweight header pattern (Dashboard §4): System Status · Active Modules (which of the platform's feature areas are enabled, §16) · System Version · Pending Configuration Changes (awaiting Approval, §3) · Scheduled Jobs · Failed Jobs · Storage Usage · API Health · License Status (Optional).

This is the one Dashboard variant in the platform aimed at system health rather than business performance — reuses the same KPI Card layout (03 §6) but with operational/technical metrics instead of revenue/inventory figures.

---

## 6. General Settings

Application Name · Logo (feeds the app shell header, Navigation §3, and Company Branding, [19-multi-branch.md](19-multi-branch.md) §6 — this is the platform-wide default; Multi-Branch's Company Branding can override per company in multi-company setups) · Theme Selection (Light/Dark/System, per Design System §3.1's dark mode tokens) · Time Zone · Date Format · Time Format · Language · Default Landing Page (per-role override of the Navigation §5 default-landing-role table) · Session Timeout (the platform-wide default; POS's shorter register-specific timeout, 04 §24, is an intentional override for its public-facing exposure, not a bug).

---

## 7. Company Preferences

Default Company · Default Branch · Fiscal Year (mirrors and, in single-company setups, is the same field as Multi-Branch's Company-level Fiscal Year, [19-multi-branch.md](19-multi-branch.md) §6 — this section is the operator-facing settings surface; that module is the structural record) · Business Hours · Business Calendar · Default Warehouse · Default Currency.

For organizations using the full Multi-Branch hierarchy (19), these fields are effectively read/quick-edit shortcuts into that module's Company Management (19 §6) rather than a second, independently-stored set of values — avoiding the two-sources-of-truth problem that would arise from duplicating fiscal year or default currency in two places.

---

## 8. Localization

Languages · Translations (string/label overrides per language) · Time Zones · Country Formats (address, phone number conventions) · Regional Formats (number/date formatting conventions distinct from the single Date/Time Format in §6 — this is about *regional* variation for multi-country operations) · Multi-language Labels (UI string overrides, distinct from Marketing's Message Template Localization, [13-marketing-automation.md](13-marketing-automation.md) §11, which is content-translation, not UI-chrome translation).

---

## 9. Number Series

Configures the format/sequence for: Products · Customers · Suppliers · Purchase Orders · Sales Orders · Invoices · Receipts · Payments · Returns · Employees · Branches · Custom Documents.

Each series supports a configurable prefix/pattern (e.g., `PO-{YYYY}-{00001}`), reset cadence (never / yearly / monthly), and starting number — this is the single configuration surface behind every module's auto-generated ID/number (Purchase's PO numbers, 08 §10; Sales' Order/Invoice numbers, 09 §7/§11; Product Management's SKU auto-generation scheme, 05 §6/§11). Changing a series' pattern only affects future numbers — already-issued document numbers never retroactively change, a hard invariant given how many downstream references (audit logs, printed documents, customer-facing receipts) depend on number stability.

---

## 10. Business Rules

Discount Limits · Credit Limits · Minimum/Maximum Stock (defaults, overridable per product in Product Management, 05 §10) · Negative Stock Policy (should generally remain hard-blocked per the platform-wide invariant established in Inventory, 07 §18/§26 — this setting governs edge-case handling like whether a specific low-risk category may be exempted, not a global toggle to allow negative stock generally) · Return Policy (window/conditions, referenced by POS/Sales Returns, 04 §13, 09 §13) · Exchange Policy · Order Approval Rules.

These are the actual threshold **values** that every module's shared Manager Override/Approval component (first established in POS §24, reused through Product Management, Inventory, Purchase, Sales, Loyalty, Promotions, Marketing, CRM, Suppliers, Finance, and Employees) reads at evaluation time — this section is where "$500 discount requires manager approval" is actually set, once, rather than each of those eleven modules maintaining its own copy of that number.

---

## 11. Approval Configuration

Configures approval workflows for: Purchase · Sales · Finance · Returns · Price Override · Discount Approval · Stock Adjustment · Leave Requests.

For each, defines: threshold (value/quantity/percentage trigger), approver tier (single manager / approval matrix / dual approval — mirroring Finance's Approval Matrix concept, 16 §27, generalized here as the configuration surface for every module's approval, not just Finance's), and escalation (what happens if the assigned approver doesn't act within a time window). This section, together with §10, **is** the shared Manager Override/Approval component's configuration backend across the entire platform — every module that referenced "reuses the shared Approval component" throughout this spec set reads its actual thresholds/tiers from here.

---

## 12. Currency Management

Base Currency · Multiple Currencies · Exchange Rates · Automatic Rate Updates (via an external rate-feed integration, §17) · Currency Precision (decimal places, rounding rules).

This is the configuration Finance's Multi-Currency Posting and Exchange Rate Management (16 §7/§29) and Sales/Purchase's Multi-Currency features (09 §27, 08 §10) all consume — one exchange rate table, updated here, read everywhere a cross-currency calculation is needed.

---

## 13. Tax Configuration

Tax Groups · Tax Templates (the exact templates Product Management's Tax Class field references, 05 §6, and Finance's Tax Management operates against, 16 §12) · Inclusive/Exclusive Tax (the default; overridable per product per Design System's retail pricing rule, 01 §11) · Regional Tax Rules (multi-jurisdiction, per Sales' Multi Tax feature, 09 §27) · Tax Rounding.

---

## 14. Units of Measure

Base Units · Alternative Units (e.g., a garment sold individually but purchased from a supplier by the case/carton — Purchase, 08, needs the conversion) · Conversion Rules · Category-specific Units (fashion-specific: most apparel is unit-based, but some accessory/trim inventory may be tracked by length/weight).

---

## 15. Notification Settings

Configures, platform-wide: Email Notifications · SMS Notifications · Push Notifications · In-App Notifications · Reminder Rules · Escalation Rules.

This is the delivery-channel configuration layer beneath Marketing Automation's campaign sends (13), Sales' Payment Reminders (09 §18), Suppliers' Document Expiry Alerts (15 §12), and the platform-wide Notification Center (Navigation §13) — those modules define *what* triggers a notification and *what it says*; this section configures *which channels are enabled/available* and the underlying provider credentials (linked to Integration Settings, §17).

---

## 16. Feature Flags

Enable/Disable Modules (a tenant running pure retail might disable CRM/Marketing Automation entirely, per those modules' own "additive/opt-in" framing throughout this spec set — this is the literal toggle that realizes that framing) · Beta Features · Experimental Features · Tenant-specific Features (for a multi-tenant SaaS deployment of this platform, different tenants may have different feature sets enabled).

Every module marked "additive, opt-in" across this entire spec set (Sales' Advanced Enterprise Features 09 §27, Loyalty's 11 §26, CRM's 14 §27, Suppliers' 15 §25, Finance's 16 §29, Employees' 18 §26, Multi-Branch's 19 §25) is, concretely, a Feature Flag defined and toggled here.

---

## 17. Integration Settings

Payment Gateways (feeds POS/Sales payment processing, 04 §11, 09 §12) · Email Providers · SMS Providers (feeds §15's channels) · Shipping Providers (feeds Sales' Delivery Management courier assignment, 09 §10) · ERP Integrations · Accounting Integrations · Webhook Endpoints (the destination configuration for every module's own "Webhooks" advanced feature — Promotions 12 §27, Marketing 13 §25, CRM 14 §27, Suppliers 15 §25, Finance 16, Reports 17 §29 — one webhook-endpoint registry, not one per module) · API Keys.

---

## 18. Backup & Maintenance

Manual Backup · Scheduled Backup · Restore · **Maintenance Mode** (a platform-wide read-only/unavailable state for planned maintenance windows — must be carefully scoped given POS needs to keep functioning at the register even if back-office is in maintenance mode; Maintenance Mode should typically exclude POS's offline-capable transactional core) · System Health Check · Cache Management (relevant to Reports' caching layer, 17 §28, and Promotions' precomputed rule-set cache, 12 §26 — a manual cache-clear affordance for troubleshooting stale data).

---

## 19. Configuration History

Configuration Changes · Version History · **Rollback** (reverting a configuration to a prior version — distinct from Finance's Period Reopen, 16 §17, though conceptually similar: both are controlled, audited exceptions to normal forward-only progress) · Approval History.

Mirrors the immutable-revision pattern established for Product Pricing (05 §9), PO Amendments (08 §10), and Message Templates (13 §11) — every configuration change is a new version, never an in-place overwrite, so "what was this setting last Tuesday" is always answerable.

---

## 20. Search & Filter

Setting Name · Category · Status · Last Updated · Updated By — same combinable filter+chip pattern used platform-wide, scaled down given Settings is a configuration surface rather than a high-volume transactional list.

---

## 21. Bulk Operations

Bulk Import · Bulk Export · Bulk Update · **Reset to Default** (reverting a set of settings to their platform defaults, useful when troubleshooting or after an experimental configuration didn't work out) · **Configuration Templates** (a saved bundle of settings, e.g., "Standard Retail Franchise Setup," applicable to a new branch/tenant in one action — reduces new-location onboarding from dozens of individual settings to one template application).

---

## 22. Audit Log

User · Action · Timestamp · Old Value · New Value · **Affected Module** (which downstream module(s) consume this setting — critical context here specifically, since a Settings change's blast radius is often invisible without knowing which modules read it; e.g., changing a Number Series pattern silently affects every future document in that owning module). Given this module configures security-relevant values (approval thresholds, negative stock policy) platform-wide, this Audit Log is held to the same strictest retention standard as Finance's (16 §22).

---

## 23. Validation

| Rule | Behavior |
|---|---|
| Duplicate Number Series | Hard-blocked — each document type has exactly one active series |
| Currency Conflicts | Blocked if a Base Currency change would orphan existing multi-currency transactions without a defined conversion path |
| Tax Conflicts | Blocked if overlapping Tax Groups/Templates would create an ambiguous rate for the same product/region combination |
| Invalid Business Rules | Blocked — e.g., Minimum Stock cannot exceed Maximum Stock; a Discount Limit cannot be configured below 0% |
| Integration Configuration | Blocked at save if a required credential/endpoint is missing or a test connection fails (where the integration supports a connection test) |

---

## 24. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton settings form/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active settings section |
| No Settings | Not applicable in the traditional sense — every setting ships with a sensible platform default (§21's Reset to Default target); "No Settings" would only appear for a genuinely empty category like Custom Documents' Number Series before any are configured |
| Offline | Read-only cached view; this module's configuration changes are inherently back-office/admin actions, lower offline priority than transactional modules, consistent with Multi-Branch's similar reasoning (19 §20) |
| Permission Denied | Standard Navigation §19 pattern, scoped per §2 |
| Configuration Error | Distinct error type specific to this module — a misconfiguration that would break downstream functionality (e.g., an invalid webhook endpoint) is caught and surfaced clearly before it can propagate failures into POS/Sales/Finance |
| Retry | Consistent retry affordance throughout |

---

## 25. Responsive Design

| Breakpoint | Settings Forms | Mobile (Admin Essentials) |
|---|---|---|
| Desktop/Laptop | Full forms, side-by-side sections where related | N/A |
| Tablet | Single-column forms, full functionality retained | Most settings viewable/editable |
| Mobile | Sequential single-field-group screens | **Explicitly supported per the prompt's own note, scoped to "Admin Essentials"** — a Super Admin toggling a Feature Flag, checking System Status, or approving a pending Configuration Change from a phone; deep configuration work (Number Series patterns, Integration credential setup, Tax Template design) remains Desktop/Tablet-oriented, consistent with the same essentials-only Mobile scoping established for Finance (16 §25) |

---

## 26. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (every settings section is fundamentally a form), WCAG AA compliance. Given this module is pure configuration (no charts/tables beyond simple lists), it has a lighter accessibility surface than data-heavy modules, but the same rigor applies to every input, toggle, and validation message.

---

## 27. Security

**Role-Based Configuration Access** per §2. **Approval Before Activation:** per §3, for structurally significant changes. **Configuration Locking:** Super Admin can lock specific settings against further change (e.g., locking Number Series format after go-live to prevent accidental disruption) — a stronger control than role permission alone, since it blocks even otherwise-authorized users. **Environment Separation:** Dev/Test/Production configuration profiles (§29) are strictly isolated — a change tested in a non-production environment never silently affects Production, and credentials/API keys are environment-scoped, never shared across them. **Audit Trail:** immutable, strictest standard, per §22. **Sensitive Configuration Protection:** API Keys/integration secrets masked-with-audit-logged-reveal per §2.

---

## 28. Performance

Optimized for large configuration sets and fast configuration lookup: since virtually every transactional operation platform-wide reads at least one setting (a number series pattern, an approval threshold, a tax template), configuration values must be cached aggressively at the application layer with fast invalidation on change — a configuration lookup must never become the bottleneck in POS's checkout-speed budget ([04-pos.md](04-pos.md) §25) or Promotions' real-time rule evaluation (12 §26). Instant search, lazy loading, server-side pagination for the settings browser itself.

---

## 29. Advanced Enterprise Features

Configuration Templates (§21) · **Environment Profiles (Dev/Test/Production)** (§27's isolation mechanism) · Tenant-specific Configuration (for multi-tenant SaaS deployment) · **Dynamic Business Rules** and **Rule Engine** (a more expressive condition/action configuration surface for Business Rules, §10, beyond simple threshold values — conceptually related to, but distinct from, Promotions' pricing rule engine, 12 §6/§7, and Marketing's Journey Builder, 13 §8, which are domain-specific rule engines; this one is for general operational business rules) · Scheduled Configuration Activation (a change takes effect at a future date/time, useful for e.g. a tax rate change effective at a fiscal year boundary) · Configuration Comparison (diff view between versions or environments) · Rollback (§19) · Configuration API · Configuration Webhooks.

Additive/opt-in per the platform-wide principle — a small single-tenant retailer uses General/Company/Number Series/Business Rules/Approval Configuration without ever touching Environment Profiles or multi-tenant features.

---

## 30. Developer Implementation Notes

- Every module's shared Manager Override/Approval component (established across POS, Product Management, Inventory, Purchase, Sales, Loyalty, Promotions, Marketing, CRM, Suppliers, Finance, Employees) must read its actual threshold/tier values from this module's Business Rules (§10) and Approval Configuration (§11) at evaluation time — never hardcode a threshold locally or cache it beyond the invalidation window (§28) established for configuration changes.
- Number Series (§9) generation must be centralized as one service every document-creating module calls (Purchase POs, Sales Orders/Invoices, Product SKUs, Employee IDs, Branch Codes) — never a per-module counter implementation, since collision-avoidance and pattern consistency depend on one authority issuing numbers.
- Feature Flags (§16) should gate at the routing/navigation layer (Sidebar visibility, per Navigation §4's permission-based-visibility rule) as well as the API layer — a disabled module must be neither navigable to nor reachable via a direct API call, not just hidden from the menu.
- Configuration caching (§28) needs a well-defined invalidation event published whenever any setting changes — every consuming module (there are potentially dozens) subscribes to invalidation for the specific settings it depends on, rather than each module polling for changes independently.
- Environment Separation (§27) should be enforced at the data layer (separate configuration stores per environment), not just a UI toggle — a Production API key must be physically inaccessible from a Test environment session, not merely hidden by a filter.
- Configuration History/Rollback (§19) should use the same immutable-versioned-revision pattern already implemented for Product Pricing (05 §9), PO Amendments (08 §10), and Message Templates (13 §11) — reuse that versioning infrastructure rather than building a fourth parallel implementation.

---

**Next:** 21-notifications.md
