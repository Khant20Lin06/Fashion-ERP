# Integration Platform (API, Webhooks & Event Management) — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [27-api-webhook.md](../deliverables/27-api-webhook.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module is the actual implementation behind Settings' Integration Settings' "Webhook Endpoints" deferral ([20-settings-ui.md](20-settings-ui.md) §11) and every prior module's "Webhooks"/"API Integration" advanced-feature reference (Promotions, Marketing, CRM, Suppliers, Finance, Reports, Notifications, Barcode, E-commerce). This is also the one console in the entire platform whose primary audience is developers rather than business users — the Developer Portal (§8) departs furthest from the platform's business-data visual language toward genuine dev-tool conventions (monospace code blocks, syntax highlighting) while still inheriting the same Design System tokens.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Integrations
↓
Page Header (Title + Toolbar)
↓
API Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: API Keys · Applications · Endpoints · Webhooks (default) · Event Management · Connectors · Logs · Developer Portal · Analytics
```

---

## 2. Page Header & Toolbar

```
Integrations                                          [+ New API Key] [+ New Webhook]
1.2M API calls this month · 99.6% success rate

[🔍 Search endpoint, webhook, application…]  [Status ▾] [Application ▾] [Date Range ▾] [Filters ▾]
```

---

## 3. API Dashboard (Collapsible KPI Strip)

10 KPI cards: Total API Calls · Successful Requests · Failed Requests · Active Integrations · API Usage (quota %) · Response Time (avg) · Error Rate · Webhook Events (delivered count).

- Error Rate and Failed Requests render in `color-error` if above a healthy threshold; a small trend arrow shows whether the rate is improving or worsening
- This dashboard is a technical-operations view, akin to Settings' System Status — tracks integration health, not business performance

---

## 4. API Keys Tab

**Columns:** Key Name · Application (linked) · Created By · Permission Scope (chip list, e.g., "Products: Read, Orders: Read/Write") · Last Used (relative) · Expiration Date · Status (Active/Expired/Revoked badge).

Key value itself is **never shown in the list** — only in the one-time reveal at creation (§10) and via an explicit masked-with-reveal-icon in the detail drawer, audit-logged on every reveal. Row overflow `⋮`: View Scope, Rotate, Revoke. Rotate opens a confirmation explaining the old key will stop working after a grace period (if configured) — never an instant hard cutover without warning, to avoid breaking a live integration mid-request.

---

## 5. Applications Tab

Card grid: Connected Applications / Third Party Apps / Mobile Apps / Marketplace Apps — each card: app icon/logo, Application Name, Client ID (masked, copy-icon), Status (● Connected/Error/Disconnected badge), Last Sync, Permission summary. Drill-in shows full OAuth Client configuration (§11) and a request-log scoped to just this application.

---

## 6. Endpoints Tab

Table: Endpoint (path, e.g., `/v1/products/{id}`), Method (badge, color-coded per HTTP verb — GET=`color-info`, POST=`color-success`, PUT/PATCH=`color-warning`, DELETE=`color-error`), API Version, Status (Active/Deprecated badge — Deprecated shows a small clock icon + sunset date), Permission (which Action Permission from IAM's Matrix gates this endpoint), Requests Today.

Deprecated endpoints get a distinct row treatment (`color-text-secondary`, slightly muted) with a tooltip explaining the migration path and sunset timeline, per the spec's API Deprecation policy — never silently removed without this visible warning period.

---

## 7. Webhooks Tab

**List:** Webhook Name, Event (badge — Order Created/Updated, Payment Completed, Product Updated, Inventory Changed, Customer Created, Stock Transfer, Employee Updated, etc.), URL (truncated + copy icon), Status (Active/Paused/Failing badge — Failing shown distinctly, e.g., after N consecutive delivery failures), Last Trigger, Success Rate (small inline percentage + sparkline).

**Create/Edit Webhook (dialog or side-panel):**
```
Webhook Name: [___________]
URL: [https://partner-system.com/webhook]           [Test Webhook]

Events to subscribe:
☑ Order Created        ☐ Order Updated
☑ Payment Completed     ☐ Product Updated
☐ Inventory Changed      ☐ Customer Created
☐ Stock Transfer         ☐ Employee Updated

Secret: [generated •••••••••]  [Regenerate]
Retry Policy: [Exponential backoff, 5 attempts ▾]

[Payload Preview]  → shows a sample JSON payload for the selected event(s)
```

- **Test Webhook** sends a real sample payload to the configured URL immediately, showing the response status/time inline — critical for an integration engineer validating a receiving endpoint before going live
- **Payload Preview** renders as a syntax-highlighted, collapsible JSON tree (monospace, `font-family-mono` token) — the one place in this platform's business-facing UI that adopts genuine dev-tool typography conventions
- Webhook detail drill-in shows **Delivery History** for that specific webhook (timestamp, response code, duration, retry count) and a **Dead Letter Queue** section listing deliveries that exhausted all retries, each with a manual "Replay" action

---

## 8. Developer Portal Tab

The platform's one genuinely developer-tool-styled surface:

**API Explorer** (interactive, try-it-now): left rail lists endpoints grouped by resource (Products, Orders, Inventory, Customers…) → selecting one shows Request Example (method, URL, headers, body — with a "Copy" icon on every code block) → parameter inputs (for actually trying the call) → **Response Example** (syntax-highlighted JSON) → a "Send Request" button that executes against the current API Key's scope, showing the live response inline.

**Authentication Guide / Webhook Guide:** static documentation pages (rendered markdown-style content, code blocks with copy buttons) explaining how to authenticate and how to verify webhook signatures.

**Error Codes:** a reference table (Code, Meaning, Common Cause, Resolution).

**API Changelog:** a chronological list of API version changes, each entry showing what changed and any deprecation notices, cross-referenced with Endpoints' own deprecation indicators (§6).

**SDK Downloads:** simple card list (language/platform + download/install-command).

Search Documentation (instant, matches endpoint names/descriptions), and every code sample throughout this tab has a one-click **Copy Code** action.

---

## 9. Event Management Tab

Read-mostly view into the platform's event bus: Event Type (Business/Domain/Custom), recent Event History (a live-updating feed of fired events, filterable by type), **Event Replay** (re-deliver a historical event to a specific webhook subscriber — used when a consumer's processing logic changed and needs reprocessing). This is administrative/diagnostic, not a configuration surface most users touch routinely.

---

## 10. Connectors Tab

Card grid, one card per pre-built integration category: Payment Gateways, Shipping Providers, Accounting Systems, CRM Systems, ERP Systems, BI Platforms, Marketplace APIs, Email/SMS Providers, Cloud Storage. Each card: connector icon, name, Status (● Connected/Not Configured/Error), "Configure →" opening a credential-entry form (masked secret fields, "Test Connection" button validating before save).

This tab is the general connector registry; E-commerce UI's Marketplace Integration tab ([23-ecommerce-ui.md](23-ecommerce-ui.md) §9) is a specialized, channel-focused view that reads from the same underlying Connector records — not a duplicate configuration surface.

---

## 11. Security Settings (within relevant tabs, not a standalone tab)

IP Whitelist (per API Key or Application — a simple CIDR/IP-range list input), Access Token settings (expiration defaults), Secret Management (rotation schedule, masked-with-reveal), Permission Scope (the same Action Permission scoping from IAM, surfaced here in API-key-specific context), Authentication Method (API Key / OAuth 2.0 Client Credentials / Authorization Code + PKCE — selected when creating an Application, §5).

---

## 12. API Logs Tab

Enterprise table: Request ID, Endpoint, Method (color badge per §6), Status Code (color-coded: 2xx=`color-success`, 4xx=`color-warning`, 5xx=`color-error`), Response Time, User/Application, Timestamp, Error Message (if any). Row expand shows full Debug Information (request headers, body excerpt, stack trace reference) — the technical counterpart to every other module's business-focused Audit Log.

---

## 13. Rate Limit Management (within API Keys / Applications)

Per-key or per-application: current Usage Quota (progress bar, e.g., "8,400 / 10,000 requests this hour"), Request Throttling status, Client Restrictions (max concurrent requests). A **429 rate-limit event** in the Logs (§12) links back here so an integration engineer can see exactly why a request was rejected and what headroom remains.

---

## 14. Integration Monitoring (within Connectors / Applications drill-ins)

Sync Status (● Healthy/Degraded/Failed per connection), Connection Health (uptime sparkline), Data Transfer volume, Failed Sync list (with reason), **Retry Queue** (pending retries with backoff countdown, manual "Retry Now" per item) — surfaced contextually within each Connector/Application's own detail view rather than as a separate top-level destination.

---

## 15. Search Experience

API Search / Endpoint Search / Log Search / Application Search — a segmented search scope selector alongside the standard instant-search field, since "search" means genuinely different things across this module's tabs (searching code documentation vs. searching request logs).

---

## 16. Dialogs

| Dialog | Contents |
|---|---|
| **Create API Key** | Name, Application, Permission Scope (chip multi-select from IAM's Action Permissions), Expiration → generates the key, shown **once** in a copy-to-clipboard reveal with a clear "This won't be shown again" warning |
| **Revoke Key** | Confirmation — explains any application currently using this key will immediately lose access |
| **Create Webhook** | Per §7 |
| **Test Webhook** | Per §7's inline Test action, or as a standalone dialog for testing an already-saved webhook |
| **Retry Request** | Shown from Logs (§12) for a failed request — re-sends with the same payload, shows the new result inline |
| **Delete Integration** | Reserved for Connectors/Applications with zero active usage; otherwise "Disconnect" (reversible) is offered instead |

---

## 17. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover` |
| Focus | 2px `color-focus` ring throughout, including code-block copy buttons |
| Selection | Checkbox multi-select on Keys/Applications lists |
| Keyboard Navigation | Full Tab-through on every form; API Explorer's endpoint list is arrow-key navigable |
| Code Copy | Every code/JSON block throughout Developer Portal and Webhook payload previews has a one-click copy icon with a brief "Copied!" tooltip confirmation |
| Expand Logs | Log rows expand in-place to reveal Debug Information (§12) rather than navigating to a separate page |
| Test Actions | Test Webhook / Test Connection / API Explorer's "Send Request" all execute live and show results inline, never requiring a page reload |

---

## 18. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton dashboard/table per Design System §17 |
| Empty Integration | New tenant: icon + "No integrations configured yet" + link to Connectors (§10) |
| No API Calls | Neutral, common for a fresh API Key before first use |
| Connection Failed | Distinct, actionable state on a Connector card: "Connection failed" + reason + "Reconfigure" action |
| Invalid Credentials | Shown inline during Connector/Application credential entry, before save — never silently accepted then failing later |
| Permission Denied | Standard pattern; Technical Partner role sees only their own Application's Keys/Logs, never platform-wide configuration |
| Validation Error | Inline — e.g., a malformed webhook URL blocked at the field |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; a dedicated one-time reveal screen for newly-created API Keys (§16), never repeatable |

---

## 19. Responsive Design

| Breakpoint | Desktop Developer Console | Tablet Admin View / Mobile Monitoring View |
|---|---|---|
| Desktop/Laptop | Full API Explorer, full Webhook configuration, full Developer Portal | N/A |
| Tablet Admin View | Priority columns + scroll; Connector/Application configuration usable | Monitoring dashboards viewable |
| Mobile Monitoring View | Card-per-row stacked lists | **Monitoring Essentials** — checking System Health/Error Rate/a failing webhook's status from a phone; API Key creation, Webhook configuration, and Developer Portal authoring remain Desktop/Tablet-oriented |

---

## 20. Accessibility

Standard baseline: keyboard navigation, screen reader labels, accessible tables (Logs, all list tabs), accessible forms (Key/Webhook/Connector configuration), visible focus, WCAG AA. Code blocks throughout Developer Portal maintain sufficient contrast for syntax highlighting (verified against both light/dark modes) and remain screen-reader-readable as plain text, not solely as a visual rendering.

---

## 21. Figma Build Notes

- Frame: `Integrations/Dashboard/Desktop/1440`, `Integrations/Webhooks/Desktop/1440`, `Integrations/DeveloperPortal/APIExplorer/Desktop/1440`
- Code block component (`CodeBlock`, with `Language` property for syntax-highlight theming) is a new component specific to this module — the only place in the platform's UI that needs genuine syntax-highlighted code rendering
- HTTP Method badge is a new small Badge variant (`Method=GET|POST|PUT|PATCH|DELETE`) with the color mapping from §6
- Layer naming: `Integrations/Webhooks/Row-Failing`, `Integrations/DeveloperPortal/CodeBlock-RequestExample`, `Integrations/Logs/Row-5xx`, per convention

---

## 22. Developer Handoff Notes

- Every module's own REST endpoints must be defined against this module's Endpoint Management (§6) and OpenAPI Specification as the single contract source — this UI's Endpoint list is generated from that specification, not manually maintained as a separate list that could drift out of sync with the actual API.
- Webhook delivery (§7) and Event Management (§9) share the exact event-subscription infrastructure already established for internal triggers (Marketing Automation, Notifications, AI Analytics) — external webhook delivery is simply another subscriber type on the same event bus, per `27-api-webhook.md` §25.
- Idempotency Keys are non-negotiable for any endpoint affecting Inventory stock, Finance postings, or Sales/Purchase order creation — this UI's API Explorer (§8) should surface idempotency-key usage in its Request Examples for those specific endpoints, teaching correct usage by example.
- API Key/OAuth scoping (§4/§11) must be enforced through IAM's own Action Permissions/Access Policies ([26-role-permission-ui.md](26-role-permission-ui.md) §6/§7) — this UI's Permission Scope picker reads from and writes to that same system, never a separately maintained scope-checking mechanism.
- Connectors (§10) should each implement one common adapter interface per category — a new provider integration should be additive (a new card in the grid), never requiring changes to this UI's core Connector-list rendering logic.

---

**Next:** 28-error-empty-loading-ui.md
