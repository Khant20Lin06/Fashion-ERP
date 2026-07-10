# Notification Center & Communication Hub — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [21-notifications.md](../deliverables/21-notifications.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This document covers two distinct surfaces per `21-notifications.md`'s own split: the **personal Inbox/bell panel** (already specified at the UI level in Navigation §13 — instanced here, not redesigned) and the **admin console** (Dashboard, Rule Engine, Templates, Delivery Logs, User Preferences) that configures and monitors the engine behind it. Everyone has an Inbox; only Marketing/Admin/IT roles see the admin console.

---

## 1. Screen Anatomy

**Personal Inbox** (accessible to all roles, via the header bell icon — Navigation §13):
```
Top Header (bell icon, badge count)
↓
[Click] → Slide-in panel (400px, right side, elevation-4)
```

**Admin Console** (Marketing/Admin/IT roles, via Sidebar → Notifications):
```
Top Header → Sidebar → Breadcrumb: Dashboard > Notifications
↓
Page Header (Title + Toolbar)
↓
Notification Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Rules · Templates · Delivery Logs · Announcements · User Preferences (org defaults)
```

---

## 2. Notification Center (Bell Panel) — Instanced from Navigation §13

Slide-in panel, 400px, `elevation-4`, right-aligned beneath the header bell icon:

```
Notifications                                          [Mark all read]
[All]  [Unread]                    [Sales ▾] [Inventory ▾] [Filter...]
──────────────────────────────────────────────────────
🔴 Critical  Payment failed for Order #4821          2m ago
   Card declined — customer notified                   [View]

📦 Inventory  Low stock: Denim Jacket — Blue/M        14m ago
   8 units remaining, reorder level is 20               [Reorder] [View]

✓ Approvals  Nina L. requested ฿1,200 discount        1h ago
   Order #4790                          [Approve] [Reject]

──────────────────────────────────────────────────────
[Load more]
```

- **Priority indicator:** a colored dot/bar (🔴 Critical=`color-error`, 🟡 Warning=`color-warning`, blank=Info) precedes every row — never color alone, always paired with the category icon and label
- **Category chips** (top filter row): All · Sales · Inventory · Purchase · Approvals · Finance · Marketing · **Security** (Security-category notifications render with a distinct, non-dismissible-in-bulk treatment per §11) · System
- Each row: priority dot + category icon → title (bold) + description (`type-body-small`, `color-text-secondary`) → relative timestamp → inline **Action Button** where applicable (Approve/Reject, Reorder, View) — an **Actionable Notification** invoking the exact same authenticated endpoint the source module's own UI uses, never a separate/lighter-weight action path
- Pin icon (appears on hover) lets a user pin a notification to the top regardless of recency
- Swipe-left (touch) or trailing icon (desktop) to Archive/Delete a single row
- "Mark all read" top-right; individual rows toggle read/unread via a hover-revealed dot-icon

---

## 3. Notification Dashboard (Admin Console)

10 KPI cards: Total Notifications · Unread Notifications · Critical Alerts · Pending Approvals · Failed Deliveries · Email Sent · SMS Sent · Push Sent · User Engagement Rate · Response Rate.

- Failed Deliveries renders in `color-error` — this is the operational-health signal an IT Administrator checks first
- Response Rate (time from Approval Alert sent to action taken) is shown as a small distribution/trend chart rather than a bare average, since knowing whether approvals are getting slower over time is more actionable than one number

---

## 4. Notification Types & Real-Time Alerts (Reference, not a separate screen)

The full category catalog (System Alerts, Approval Requests, Inventory Alerts, Sales Alerts, Purchase Alerts, Payment Alerts, Customer Alerts, Marketing Alerts, Security Alerts, Employee Alerts) and the Real-Time Alert list (Low Stock, Out of Stock, Failed Payment, Server Error, Sync Failure, Suspicious Login, Approval Reminder) are what populate the Bell Panel's category chips (§2) and Delivery Logs' Type filter (§8) — there is no dedicated "Notification Types" screen; these are the taxonomy every other surface in this module organizes by.

---

## 5. Approval Notifications (Reference)

Pending Approval / Approval Request / Approved / Rejected / Escalated states are rendered via the Bell Panel's inline Action Button treatment (§2) and, for the requester, a corresponding status update on the same notification row (once actioned, the row updates in-place from "Pending" to "✓ Approved by Priya S." rather than disappearing) — **Approval History** is a filtered view of Delivery Logs (§8) scoped to Approval-category notifications, not a separate table.

---

## 6. Notification Rule Engine

List view: Rule Name, Trigger Type (Event/Time/Threshold badge), Module, Status (Active/Disabled toggle inline in the row).

**Rule Builder** — reuses the platform's canonical condition/action visual pattern established in Promotions' Rule Builder ([12-promotions-ui.md](12-promotions-ui.md) §6), applied to notification-triggering instead of pricing:

```
Trigger
  [Event Based ▾]  →  [Stock level crosses reorder threshold ▾]

Conditions (optional refinement)
  IF  [Module ▾] [is] [Inventory ▾]                    [✕]
  AND [Branch ▾] [is any of] [Flagship, Downtown ▾]      [✕]
  [+ Add condition]

Actions
  Send Notification    [In-App] [checked]
  Send Email            [✓]  Template: [Low Stock Alert ▾]
  Send SMS               [ ]
  Create Task            [✓]  Assign to: [Purchasing Officer ▾]

[+ Add action]
```

- Trigger types: Event Based (a domain event fires — e.g., "Order Cancelled"), Time Based (scheduled — e.g., "Daily at 8am"), Threshold Based (a value crosses a configured line — e.g., "Stock < Reorder Level")
- Condition rows are the identical Condition Row component instanced from Promotions/Marketing's rule builders — not redrawn
- Multiple Actions chain visually as a checklist with per-action configuration (template picker, recipient/assignee) — mirroring the chained-actions pattern from Promotions' Rule Actions

---

## 7. Notification Channels & Templates

**Channels:** In-App, Email, SMS, Push, LINE, WhatsApp — configuration/credentials link out to Settings' Integration Settings ([20-settings-ui.md](20-settings-ui.md) §11); this module only shows enabled/disabled status per channel, never re-hosts credential entry.

**Templates:** card grid (filterable by channel), each showing thumbnail preview, name, last-modified, "Used in N rules" count. Template Editor: block-based visual editor for Email (same editor component as Marketing Automation's Templates tab, [13-marketing-automation-ui.md](13-marketing-automation-ui.md) §8, reused not rebuilt); plain-text + character-count + Variables picker for SMS/Push/LINE/WhatsApp. Preview pane shows live-rendered output with sample data substituted for variables. Version History accordion beneath.

---

## 8. Delivery Logs

Enterprise table: Notification ID, Channel (icon), Recipient, Template, Status (Queued/Sent/Delivered/Opened/Clicked/Failed/Retried badge), Sent Time, Delivered Time, Error Message (populated only for Failed rows, shown as a tooltip on the Status badge rather than a permanent column — keeps the table scannable while the detail remains one hover away).

Row action: **Resend** (Failed rows only) — re-queues through the identical delivery pipeline, never a special-case retry path. Bulk-action bar (on selection): `[Resend Selected] [Export]`.

---

## 9. User Preference Settings

Reached from a user's own Profile menu (personal) or, for org-wide defaults, from the Admin Console's User Preferences tab:

```
Notification Preferences

Category              In-App   Email   SMS    Push
Sales                    ✓        ✓                ✓
Inventory                ✓        ✓       ✓        ✓
Approvals                ✓        ✓                ✓
Marketing                ✓
Security                 ✓        ✓       ✓        ✓   (locked — cannot disable)

Quiet Hours:  [10:00 PM] to [7:00 AM]   Timezone: [Bangkok]
              Critical/Security alerts always bypass Quiet Hours.

Digest: [ ] Batch non-critical notifications into a daily summary at [8:00 AM]
```

- A channel × category matrix of checkboxes — Security row is visually locked (checkboxes shown but disabled with a tooltip: "Security notifications cannot be disabled") per the spec's non-optional-for-security-category rule
- Quiet Hours and Digest are per-user preferences; the caption clarifying Critical/Security bypass is always shown, not just on hover, since it's a genuinely important behavior to understand upfront

---

## 10. Search Experience

Instant Search (notification title/recipient) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide, applied to Delivery Logs and the Rule list.

---

## 11. Dialogs

| Dialog | Contents |
|---|---|
| **Create Notification Rule** | Opens the Rule Builder (§6) as a full-page flow, not a modal |
| **Edit Template** | Per §7's Template Editor |
| **Send Test Notification** | Recipient (defaults to current user) + channel confirmation → "Send Test" |
| **Delete Notification** | Applies only to a user's own read Inbox items (Archive is the more common action); Rules/Templates use Archive over Delete once they have delivery history |
| **Disable Rule** | Lightweight single-confirm — reversible, no typed re-confirmation needed |

---

## 12. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`; Bell Panel row reveals Pin/Read-toggle icons on hover |
| Focus | 2px `color-focus` ring throughout |
| Selection | Checkbox multi-select on Delivery Logs, Shift/Ctrl-click |
| Keyboard Navigation | Bell Panel fully keyboard-navigable (arrow keys between rows, Enter to open/action); Rule Builder's condition/action rows keyboard-operable per the platform-wide rule-builder accessibility requirement |
| Real-time Updates | New notifications appear in the Bell Panel live (no manual refresh) with a subtle slide-in animation (`motion-base`) and the header badge count incrementing — announced via `aria-live="polite"` rather than stealing focus |
| Toast Feedback | Non-notification-center toasts (e.g., "Dashboard link copied") remain the platform's standard Toast component — distinct from this module's own persistent notification log |
| Quick Actions | Approve/Reject/Reorder inline on Bell Panel rows (§2) — the defining interaction of this module, keeping the majority of routine approvals to a single click without leaving the current screen |

---

## 13. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton notification-row shimmer in the Bell Panel; skeleton table/dashboard in the Admin Console |
| Empty Notification | Positive-framed: check icon + "You're all caught up" — absence of notifications is good news, not a broken state, per the platform-wide rule established since the Dashboard module |
| No Search Results | Distinct — "No notifications match '[query]'" + Clear filters, in Delivery Logs/Rules search |
| Delivery Failed | Shown per-row in Delivery Logs (§8) with the specific reason on hover; a spike in Failed Deliveries surfaces as a Critical alert to IT Administrators via the same pipeline (self-monitoring) |
| Permission Denied | The Admin Console tabs are omitted from Sidebar navigation entirely for non-Marketing/Admin/IT roles — everyone still has their personal Inbox regardless |
| Validation Error | Inline — a Rule missing a required Action, or a Template referencing a deleted variable, blocked before Save/Enable |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves (Rule created, Template saved); Bell Panel actions (Approve/Reject) show an immediate in-place row update rather than a separate toast, since the row itself is the confirmation |

---

## 14. Responsive Design

| Breakpoint | Notification Center / Inbox | Admin (Dashboard, Rules, Templates, Logs) |
|---|---|---|
| Desktop/Laptop | Full panel (per Navigation §13's spec) | Full tables, full Rule Builder, full template editor |
| Tablet | Same panel pattern, condensed | Priority columns + scroll |
| Mobile Notification Center | Full-screen Inbox view — the bell panel becomes the primary in-app notification surface, alongside native push (on Mobile Manager) | Admin essentials only (Delivery Logs/Dashboard viewing), consistent with the essentials-only Mobile scoping established for Finance/Settings/IAM |

---

## 15. Accessibility

Standard baseline: keyboard navigation, screen reader labels, visible focus, WCAG AA. **Accessible Alerts:** Critical/Error-severity Bell Panel rows use `role="alert"`; Warning-tier and routine notifications use `role="status"` to avoid overly aggressive screen-reader interruption for non-urgent items — this distinction matters given how frequently notifications arrive. **Focus Management:** new real-time notifications (§12) never steal focus from the user's current task — announced via `aria-live="polite"` only.

---

## 16. Figma Build Notes

- Frame: `Notifications/BellPanel/Desktop`, `Notifications/Dashboard/Desktop/1440`, `Notifications/RuleBuilder/Desktop/1440`
- Bell Panel is the same component already specified structurally in Navigation §13 — this document adds pixel detail, it does not redesign that panel
- Notification Rule's Condition Row **instances** the same component built for Promotions/Marketing's rule builders — third consumer of that pattern, not redrawn
- Layer naming: `Notifications/BellPanel/Row-Critical`, `Notifications/RuleBuilder/Action-SendEmail`, `Notifications/DeliveryLogs/Row-Failed`, per convention

---

## 17. Developer Handoff Notes

- Trigger ingestion (§6) must be implemented as event subscriptions to every other module's existing domain events — never requiring an owning module to add notification-specific instrumentation, per `21-notifications.md` §24.
- Message Templates (§7) must be the single shared template store also used by Marketing Automation and CRM's Email Management — one template entity type with a category/purpose field, per `21-notifications.md` §24.
- Delivery Logs (§8) is the canonical send-log; Marketing's Communication History and Customer 360's Communication Timeline are filtered views over this same table, not separately maintained logs — this UI's table is the source those aggregators read from.
- Approval Alerts' inline actions (§2/§5) must invoke the exact same approval-processing endpoint the source module's own UI uses — never a separate, potentially less-secure code path reachable only from a notification click.
- Consent enforcement and Quiet Hours/Digest batching (§9) must be enforced server-side as a single gate checked immediately before dispatch — this UI never needs its own consent-checking logic; the User Preferences screen simply configures inputs to that one gate, and the Security row's lock (§9) must be enforced there too, not merely visually disabled in this UI.

---

**Next:** 22-barcode-label-ui.md
