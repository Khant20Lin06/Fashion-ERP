# Notification Center & Communication Hub Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [20-settings.md](20-settings.md) (all prior modules)
**Consumed by:** Every module in the platform
**Scope note:** This module is the delivery-and-orchestration engine behind the bell-icon panel already specified in Navigation ([02-navigation.md](02-navigation.md) §13). That earlier spec defined the *surface UI* (categorized panel, unread badge, mark-all-read); this module defines the full backend — channels, templates, delivery tracking, approvals-as-notifications, reminders, announcements — that populates it and every other notification surface (email, SMS, push) platform-wide. Notification Settings' channel-enablement/credentials ([20-settings.md](20-settings.md) §15/§17) configure what this module is allowed to use; this module is the engine that actually sends.

---

## 1. Module Objective

Centralize every system-generated communication — In-App, Push, Email, SMS notifications; Workflow Alerts, Approval Requests, Announcements, Reminders, Scheduled and Real-time Alerts — so that every module's "feeds the Notification Center" reference (used dozens of times across this spec set: Inventory's stock alerts, Suppliers' document expiry, Purchase's overdue deliveries, Finance's budget alerts, CRM's task due dates) resolves to one engine, not a re-implemented notification system per module.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, all channels, Announcement authoring platform-wide |
| Managers | Branch/team-scoped Announcements, Approval Alerts for their tier |
| Employees, Cashiers, Warehouse Staff | Personal Inbox, relevant Reminders/Approvals/Announcements scoped to their role |
| Finance Team | Finance-category alerts (Payment Due, Budget) with elevated visibility |
| Customers (Optional) | Order/delivery/loyalty notifications only, via their chosen channel — no access to this module's admin surface |
| Suppliers (Optional) | PO/RFQ/payment status notifications, via Supplier Portal ([15-suppliers.md](15-suppliers.md) §25) if enabled |

Customers and Suppliers are notification **recipients**, never users of this module's Notification Center/Templates/Analytics administration — their inclusion in §2 reflects that they receive messages this engine sends (via Sales, Loyalty, Marketing, Purchase triggers), not that they have any login access here.

---

## 3. Notification Lifecycle

```
Event Trigger → Notification Created → Delivery Queue → Channel Selection
→ Delivered → Read → Archived
```

**Event Trigger** is always an event already emitted by an owning module (a sale completed, a stock threshold crossed, a leave request submitted) — this module has no independent trigger source of its own, exactly mirroring the subscription-based trigger model already established for Marketing Automation (13 §9/§26) and generalized here as the platform-wide pattern every module's alerts follow.

---

## 4. Module Structure

```
Notification Dashboard (§5)
↓
Notification Center (§6, the bell-panel backend) ──→ Inbox (personal view)
                                                  ──→ Announcements (§9)
                                                  ──→ Approvals (§7)
                                                  ──→ Reminders (§8)
                                                  ──→ Scheduled Notifications
↓
Templates (§11) ──→ Delivery History (§12) ──→ Analytics (§13)
```

---

## 5. Notification Dashboard

Lightweight header pattern (Dashboard §4): Unread Notifications · Pending Approvals · Today's Alerts · Failed Deliveries · Scheduled Messages · Delivery Success Rate · Channel Usage.

This is an admin/operations view (for Super Admin/IT monitoring the health of the notification pipeline itself) — distinct from the personal Inbox any user sees via the Navigation bell panel (02 §13), which shows only that user's own relevant notifications.

---

## 6. Notification Center (Bell Panel Backend)

Implements exactly what Navigation §13 specified at the UI level — Grouped Notifications (by category: Sales/Inventory/Purchase/Approvals/Finance/Marketing/Security/System), Priority Levels (Critical/Warning/Info, reusing Design System's Error/Warning/Info semantic colors, 01 §3), Read/Unread, Pin, Archive, Delete, Search, Bulk Actions.

This section is the same component Navigation §13 already described in full; this module additionally defines the backend that populates and manages it — the categories, priority mapping, and per-notification metadata (source module, deep-link target) are configured/generated here.

---

## 7. Approval Alerts

Notifications for: Purchase Approval (08 §10) · Sales Approval (09 §7) · Discount Approval (multiple modules) · Return Approval (04 §13, 09 §13) · Expense Approval (16) · Leave Approval (18 §11) · Stock Adjustment (07 §9).

Every one of these is generated by the shared Manager Override/Approval component's request step (established across POS, Product Management, Inventory, Purchase, Sales, Loyalty, Promotions, Marketing, CRM, Suppliers, Finance, Employees, and configured in Settings §11) — this module is where that component's "notify the approver" step actually delivers, via whichever channel(s) that approver has configured (§10). An Approval Alert always includes the direct action (Approve/Reject) inline where the channel supports it (in-app, rich push) — an **Actionable Notification** (§23) rather than requiring the recipient to separately navigate to the source module first.

---

## 8. Reminders

Follow-up Reminder (CRM, 14 §12) · Meeting Reminder (14 §13) · Contract Expiry (Purchase 08 §8, Suppliers 15 §8) · License Expiry (Settings 20, Suppliers 15 §12's Compliance) · Low Stock (Inventory 07 §16) · Payment Due (Sales 09 §18, Finance 16) · Invoice Due · Birthday Reminder (Customers 10 §5, Loyalty 11 §7) · Task Reminder (CRM 14 §12, Employees 18 §12).

Every Reminder type listed here was already specified as "feeding the Notification Center" in its owning module — this section is the literal fulfillment of each of those forward-references, generated on a schedule (configurable lead time before the deadline/expiry) rather than instantaneously like most other notification types.

---

## 9. Announcements

Company Announcement · Branch Announcement · Department Announcement — Target Audience (role/branch/department scoped, reusing the same Organization Structure hierarchy from Multi-Branch/Employees, 19 §3, 18 §8, as the targeting dimension) · Scheduled Publish · Pinned Announcement (stays at the top of affected users' Notification Center regardless of recency) · Attachments.

Announcements are the one notification type authored directly by a human for broadcast (vs. system-triggered) — e.g., "Store closing early Friday for inventory count" — and are the closest analog to Marketing Automation's Campaigns (13 §7) but for internal/operational audiences rather than customers, sharing the same Message Template infrastructure (§11) but a distinct audience-targeting mechanism (org structure vs. customer segments).

---

## 10. Notification Channels

In-App · Push · Email · SMS · WhatsApp · LINE · Slack · Microsoft Teams · Webhook.

Channel availability/credentials are configured in Settings (20 §15/§17) — this module consumes that configuration to determine which channels are actually usable per tenant. **Notification Preferences** (§23) let each user choose their preferred channel(s) per notification category (e.g., "Approval Alerts via Push + Email, Announcements via In-App only") — the platform respects these preferences except where a category is marked non-optional (e.g., Security alerts, per the non-bypassable-consent principle already established for Marketing, 13 §23, though Security notifications are operational rather than marketing and so aren't subject to Marketing Consent — they're subject to their own always-on policy instead).

---

## 11. Message Templates

Email Templates · SMS Templates · Push Templates · Variables · Localization · Preview · Version History.

This is the same template infrastructure already established in Marketing Automation ([13-marketing-automation.md](13-marketing-automation.md) §11) and referenced by CRM's Email Management (14 §14) — one shared template system serving marketing campaigns, CRM correspondence, and this module's system-generated notifications alike, differentiated by category/purpose rather than three parallel template stores. Version History follows the same immutable-revision pattern established platform-wide (Product Pricing 05 §9, PO Amendments 08 §10, Settings' Configuration History 20 §19).

---

## 12. Delivery History

Queued · Sent · Delivered · Opened · Clicked · Failed · Retried — per-notification, per-channel tracking.

This is the data source Marketing Automation's Communication History (13 §13) and Customer 360's Communication Timeline (10 §12) both aggregate from for customer-facing sends — this module's Delivery History is the complete record (internal + customer + supplier notifications); those modules' views are filtered/scoped subsets of it, not separately maintained logs.

---

## 13. Analytics

Open Rate · Click Rate · Delivery Rate · Failure Rate · Channel Performance · Response Time (time from notification sent to action taken, particularly relevant for Approval Alerts, §7 — a slow response time on approvals is an operational bottleneck worth surfacing).

Reuses Dashboard chart components; Open/Click Rate figures here must be the same numbers Marketing Automation's own Analytics (13 §14) reports for campaign sends — one delivery-tracking source, both modules' Analytics views reading from it.

---

## 14. Search & Filter

Type · Priority · Status · Channel · Sender · Recipient · Date Range — same combinable filter+chip pattern used platform-wide.

---

## 15. Bulk Operations

Mark Read · Archive · Delete · **Resend** (for Failed deliveries, §12) · Export — same preview-before-commit rule as every other bulk action platform-wide, though lighter-weight here given most actions are non-destructive (Mark Read/Archive) rather than structurally significant.

---

## 16. Audit Log

Created · Sent · Read · Archived · Deleted · Template Updated — tracked per §12's Delivery History for the sending side, plus standard audit coverage for Template changes (Version History, §11) and any Sensitive Notification handling (§21).

---

## 17. Validation

| Rule | Behavior |
|---|---|
| Recipient Exists | Blocked — cannot queue a notification for a deleted/non-existent user, though a customer/supplier notification checks against those modules' respective active records instead |
| Channel Available | Blocked if the target channel isn't configured/enabled in Settings (20 §17) — falls back to the recipient's next-preferred available channel rather than silently failing |
| Template Exists | Blocked — a notification referencing a deleted template is caught before queueing, consistent with Marketing's equivalent rule (13 §19) |
| Duplicate Notification | Soft-deduplicated — an identical alert firing twice in rapid succession (e.g., two near-simultaneous stock-movement events both crossing the low-stock threshold) collapses to one notification rather than spamming the recipient |
| Invalid Schedule | Hard-blocked — a Scheduled Notification's send time must be in the future, consistent with Marketing's equivalent rule (13 §19) |

---

## 18. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton list per Design System §17 |
| Skeleton | Notification-row-shaped placeholders |
| No Notifications | Positive-framed empty state (mirrors the Dashboard's "No Inventory Alerts" pattern, 03 §16): check icon + "You're all caught up" — absence of notifications is good news, not a broken state |
| Offline | Cached notifications remain viewable; new real-time alerts queue and appear on reconnect, consistent with the offline-tolerance pattern established for POS-adjacent modules |
| Permission Denied | Not typically applicable to a personal Inbox (everyone has one); applies to the admin Notification Dashboard (§5) and Templates (§11) per standard Navigation §19 pattern |
| Delivery Failed | Distinct from a generic Server Error — surfaced in Delivery History (§12) with the specific failure reason (invalid number, bounced email, etc.) and a Resend action (§15) |
| Retry | Consistent retry affordance throughout |

---

## 19. Responsive Design

| Breakpoint | Notification Center / Inbox | Admin (Dashboard, Templates, Analytics) |
|---|---|---|
| Desktop/Laptop | Full panel (per Navigation §13's spec) | Full tables, full template editor |
| Tablet | Same panel pattern, condensed | Priority columns + scroll |
| Mobile | Full-screen Inbox view (the bell panel becomes the primary in-app notification surface, alongside native push) | Admin essentials only (viewing Delivery History/Analytics), consistent with the essentials-only Mobile scoping established for Finance (16 §25) and Settings (20 §25) |

---

## 20. Accessibility

Standard platform baseline: keyboard navigation, screen reader labels, visible focus indicators, WCAG AA. **Accessible Toasts:** in-app toast/snackbar notifications (Design System §14) use `aria-live` regions so they're announced without stealing focus from the user's current task, consistent with the live-region requirement already established for the Dashboard's real-time updates (03 §18) and Marketing's Consent-respecting sends (13 §23).

---

## 21. Security

**Role-based Visibility:** per §2 — a user's Inbox shows only notifications relevant to their own role/scope, never a platform-wide firehose. **Encrypted Messages:** notification content in transit/at rest for sensitive categories (Finance alerts, HR/Employee data) encrypted consistent with Finance's Financial Data Encryption standard (16 §27). **Audit Trail:** per §16. **Approval Security:** Approval Alerts (§7) must deep-link to an authenticated action — clicking "Approve" in an email cannot bypass the platform's own authentication/authorization check merely because the link was clicked, preventing a forwarded or intercepted email from being used to approve something. **Sensitive Notifications:** Security-category alerts (failed login, permission change — per Navigation §13's original categorization) cannot be bulk-dismissed without individual acknowledgment, carrying forward that rule from where it was first specified.

---

## 22. Performance

Optimized for millions of notifications and real-time delivery: implemented as a message queue architecture (not synchronous send-and-wait) so a triggering module's own operation (a sale completing, a stock threshold crossing) is never slowed down waiting for a notification to actually deliver — the event is queued and this module's delivery pipeline processes it asynchronously. Lazy loading and infinite scroll for the Inbox/Notification Center list, consistent with virtualized-list patterns used throughout the platform.

---

## 23. Advanced Enterprise Features

**Notification Preferences** (§10's per-user, per-category channel selection) · **Quiet Hours** (a user-configured window during which non-critical notifications are held and batched for delivery after, rather than interrupting off-hours — Security/Critical alerts bypass Quiet Hours) · **Digest Notifications** (batching lower-priority items into a single periodic summary rather than one-at-a-time delivery, reducing notification fatigue — conceptually related to Marketing's Communication Limits frequency-capping, 13 §19, but for internal/operational notifications rather than customer marketing) · Escalation Rules (an unacknowledged Approval Alert, §7, escalates to the next tier after a configured window, extending Settings' Approval Configuration escalation rule, 20 §11, into an actual notification behavior) · Multi-language Templates (§11) · AI Priority Detection · **AI Smart Delivery Time** (per-recipient optimal send timing, the same concept as Marketing's AI Send-Time Optimization, 13 §25, generalized to operational notifications) · Geo-targeted Notifications · **Rich Notifications** (images, action buttons, structured content beyond plain text) · **Actionable Notifications** (§7's inline Approve/Reject — the general capability, of which Approval Alerts are the primary use case) · Workflow-triggered Notifications (the general mechanism §3 describes) · Notification API · Webhook Events.

Additive/opt-in per the platform-wide principle — a small retailer relies on basic In-App/Email/SMS notifications without ever engaging Quiet Hours/Digest/AI-driven delivery timing.

---

## 24. Developer Implementation Notes

- This module's trigger ingestion must be implemented as event subscriptions to every other module's existing domain events (the same events their own Activity Timelines already consume) — never requiring an owning module to add notification-specific instrumentation, exactly the pattern established for Marketing Automation's triggers (13 §26) and generalized here as the platform-wide default for *all* system notifications, not just marketing ones.
- Message Templates (§11) should be the single shared template store also used by Marketing Automation (13 §11) and CRM's Email Management (14 §14) — one template entity type with a category/purpose field, never three parallel template systems.
- Delivery History (§12) is the canonical send-log; Marketing's Communication History (13 §13) and Customer 360's Communication Timeline (10 §12) are filtered views over this same table, not separately maintained logs — this closes the aggregator-pattern requirement flagged in both of those modules' own developer notes.
- Approval Alerts' inline actions (§7/§21) must invoke the exact same approval-processing endpoint the source module's own UI uses — a click from an email/push notification is not a separate, potentially less-secure code path, it's the identical authenticated action a user would take by navigating to the record directly.
- The message queue (§22) should decouple triggering modules from delivery entirely — a triggering module publishes an event and returns immediately; this module's queue consumers handle channel selection (§10), template rendering (§11), Quiet Hours/Digest batching (§23), and actual delivery, retrying failures (§12) without ever blocking the original transaction that triggered the notification.
- Deduplication (§17) should key on trigger-event-type + recipient + a short time window, configurable per notification category, since the right dedup window differs (a stock-threshold alert firing twice in one minute should collapse; two genuinely separate approval requests an hour apart should not).

---

**Next:** 22-barcode-label.md
