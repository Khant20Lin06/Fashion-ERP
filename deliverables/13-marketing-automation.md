# Marketing Automation & Customer Engagement Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md), [09-sales.md](09-sales.md), [10-customers.md](10-customers.md), [11-loyalty.md](11-loyalty.md), [12-promotions.md](12-promotions.md)
**Consumed by:** CRM, Customer 360, Loyalty, E-commerce, Mobile App
**Scope note:** This module owns campaign orchestration, journey automation, and messaging — the communication layer that [12-promotions.md](12-promotions.md) §14 deferred to ("this module handles pricing mechanics; module 13 handles messaging"). It sends through the same channel infrastructure and consent rules already established in Customer Communication ([10-customers.md](10-customers.md) §12), never a second messaging system.

---

## 1. Module Objective

Automate customer engagement across the full lifecycle — Segmentation, Campaigns, Journeys, Omnichannel Messaging, Behavior-based Automation, Personalization, Retention — driven by real events from POS, Sales, Loyalty, and Promotions, without requiring manual campaign execution for routine, predictable customer moments (birthdays, cart abandonment, win-back windows).

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full configuration, all approval tiers |
| Marketing Manager | Full campaign/journey/template configuration, approves campaigns above reach/spend threshold |
| CRM Manager | Segment and audience configuration, journey building |
| Campaign Manager | Creates/schedules campaigns within approved templates and segments; cannot bypass Consent rules |
| Customer Success | Read campaign performance relevant to their accounts; manual trigger for individual customer journeys (service recovery) |
| Branch Manager | Read branch-scoped campaign performance; local campaign requests routed to Marketing Manager |

---

## 3. Customer Journey (Marketing Lifecycle View)

```
Visitor → Lead → Customer → First Purchase → Repeat Purchase → VIP
→ Inactive → Win-back Campaign → Loyal Customer
```

This is the marketing-specific narrative overlay on [10-customers.md](10-customers.md) §3's Customer Lifecycle — Visitor/Lead stages precede that module's Registration point (pre-conversion marketing funnel), and this module's Win-back Campaign is the concrete mechanism behind Customers' abstract "Reactivation" stage.

---

## 4. Module Structure

```
Marketing Dashboard (§5)
↓
Customer Segments (§6) ──→ Audience Management (§12)
↓
Campaigns (§7) ──→ Message Templates (§11)
↓
Customer Journey Builder (§8) ──→ Automation Triggers (§9) ──→ Automation Actions (§10)
↓
Communication History (§13)
↓
Marketing Analytics (§14)
```

---

## 5. Marketing Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Active Campaigns · Scheduled Campaigns · Customer Segments (count) · Emails Sent · SMS Sent · Push Notifications Sent · Open Rate · Click Rate · Conversion Rate · Revenue Generated · Campaign ROI · Repeat Purchase Rate.

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15).

---

## 6. Customer Segmentation

Segmentation dimensions: Customer Tier (Loyalty, [11-loyalty.md](11-loyalty.md) §6) · Purchase Frequency · Purchase Value · RFM Score (shared computation with Customer Analytics, [10-customers.md](10-customers.md) §15) · Location · Branch · Age Group · Gender · Favorite Brand/Category/Collection (derived from Purchase History, 10 §13) · Birthday Month · Last Purchase Date · Custom Tags · **Dynamic Segments** (auto-recalculating membership as customer data changes, vs. static point-in-time lists).

This module does not redefine segmentation logic — it is the same Segments engine defined in [10-customers.md](10-customers.md) §14, exposed here for campaign-targeting purposes. A segment created in either surface is visible/usable in both.

---

## 7. Campaign Management

Email Campaign · SMS Campaign · Push Notification · In-App Message · Coupon Campaign · Voucher Campaign (both generating/distributing instruments defined in Loyalty §13/§11 and Promotions §9/§10) · Birthday Campaign · Holiday Campaign · Flash Sale (announcing a promotion configured in [12-promotions.md](12-promotions.md) §14) · Collection Launch · Product Restock (triggered by Inventory's stock-replenished event, [07-inventory.md](07-inventory.md) §16) · Abandoned Cart Recovery (E-commerce/Mobile App cart events) · Win-back Campaign · Referral Campaign (announcing Loyalty's referral program, 11 §12).

Each campaign type is a pre-configured Journey (§8) template with sensible default triggers/actions — a Marketing Manager customizes rather than builds every campaign from a blank canvas.

---

## 8. Customer Journey Builder

Visual, drag-and-drop workflow canvas: Entry Trigger (§9) → Conditions (branching logic, reusing the same AND/OR condition-group interaction as Promotions' Rule Conditions, [12-promotions.md](12-promotions.md) §7) → Decision Nodes → Delay/Wait → Message (send action) → Reward/Coupon/Loyalty Points (calls into Loyalty's/Promotions' engines, never reimplemented locally) → Exit.

- **Canvas interaction:** nodes connect via drag-drawn edges; each node type has a distinct shape/color (Trigger=diamond, Condition=hexagon, Action=rectangle, Delay=clock icon) for at-a-glance journey comprehension, consistent with the Design System's iconography rules (§9) applied to a new but consistent visual vocabulary.
- A journey can be tested via a **Journey Simulator** (mirrors Promotions' Simulator, [12-promotions.md](12-promotions.md) §27) — running a hypothetical customer profile through the journey to confirm branching/timing behaves as intended before activating against real customers.
- Every Reward/Coupon/Points action node is a direct call into Loyalty (11 §8) or Promotions (12 §9), never a duplicated grant mechanism — this journey builder orchestrates *when*, those modules define *what*.

---

## 9. Automation Triggers

New Customer · First Purchase · Order Completed · Order Cancelled · Birthday · Membership Upgrade (Loyalty, 11 §6) · Points Expiring (Loyalty, 11 §8) · Coupon Expiring (Promotions, 12 §9) · Product Back in Stock (Inventory, 07 §16) · Abandoned Cart · No Purchase for X Days (feeds the Win-back/Inactive lifecycle transition, §3) · VIP Upgrade · Referral Completed (Loyalty, 11 §12) · Manual Trigger (staff-initiated, e.g., Customer Success starting a service-recovery journey for one customer).

Every trigger here is an event already emitted by its owning module (Loyalty, Promotions, Inventory, Sales) — this module subscribes to those event streams rather than each owning module needing bespoke marketing-trigger logic bolted on.

---

## 10. Automation Actions

Send Email · Send SMS · Send Push Notification · Generate Coupon (calls Promotions §9) · Issue Voucher (calls Promotions §10) · Award Loyalty Points (calls Loyalty §7) · Upgrade Membership (calls Loyalty §6, typically requiring the same approval gate that module defines for manual tier changes) · Assign Customer Tag (writes to Customers' Segmentation, 10 §14) · Create Task (for Customer Success/Sales follow-up) · Notify Staff (Notification Center, Navigation §13) · Webhook · API Call (external system integration).

Consistent with Rule Actions in Promotions (12 §8) — both modules' actions call into the same underlying Loyalty/Promotions grant services, never parallel implementations of "give this customer points/a coupon."

---

## 11. Message Template Management

Email Templates · SMS Templates · Push Templates — Rich Content (image/button blocks for email) · Variables (customer name, points balance, order details — merge-field system) · Localization (multi-language variants of one template) · Approval Workflow (templates above a configured reach go through Marketing Manager review before use in an active journey) · Version History (mirrors the Price History/PO Amendment pattern established in Product Management §9 and Purchase §10 — every template edit is a new tracked revision, not a silent overwrite, since a live journey referencing "the birthday template" must have a stable, auditable version).

Templates here are the shared library referenced by Sales' Payment Reminders (09 §18) and Loyalty's Campaigns (11 §14) — defined once, used by every sending context.

---

## 12. Audience Management

Saved Audiences (static snapshot) · Dynamic Audiences (live-recalculating, same mechanism as Dynamic Segments, §6) · Imported Audiences (CSV upload, validated against existing customer records — matches to Customers module 10 rather than creating shadow contact records) · **Suppression Lists** (customers who must never receive marketing regardless of segment match — bounced contacts, explicit complaints) · Opt-in/Opt-out · Consent Management.

Consent/Opt-out here is the exact same field set as Customer Communication's Marketing Consent ([10-customers.md](10-customers.md) §12) — checked centrally at send-time by this module, not re-verified inconsistently per campaign type.

---

## 13. Communication History

Emails · SMS · Push Notifications · Campaign Responses (opened/clicked/converted) · Coupon Usage · Voucher Usage · Customer Interactions.

This module's sends are exactly what feed the Communication Timeline in Customer 360 ([10-customers.md](10-customers.md) §12) — implemented as this module's send-log being one of the aggregated sources that timeline pulls from, per the pattern already specified there, not a second parallel history a user has to separately check.

---

## 14. Marketing Analytics

Campaign Performance · Revenue Attribution (which campaign drove which sale — cross-referencing Sales' order data, module 09) · Conversion Funnel (Visitor→Lead→Customer→Repeat, per §3) · Customer Acquisition Cost · Customer Lifetime Value (shared computation with 10 §15) · Retention Rate · Repeat Purchase Rate · Open Rate · Click-through Rate · Unsubscribe Rate · ROI.

Reuses Dashboard/Sales/Customer Analytics chart components — Revenue Attribution specifically should reconcile against Sales Analytics' own revenue figures (09 §15) rather than producing an independently-tallied number that could disagree.

---

## 15. Search & Filter

Campaign · Segment · Customer · Status · Channel · Date Range · Branch · Marketing Owner — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 16. Bulk Operations

Bulk Campaign Launch · Bulk Schedule · Bulk Pause · Bulk Resume · Bulk Audience Import · Bulk Export — same preview-before-commit rule as every other bulk action platform-wide; Bulk Campaign Launch specifically shows a pre-send summary (audience size, channel, estimated cost where SMS/push has per-message cost) before committing, since a launch is difficult to fully undo once messages are in-flight.

---

## 17. Activity Timeline

Campaign Created · Campaign Started · Campaign Completed · Automation Triggered · Customer Entered Journey · Customer Exited Journey · Reward Issued · Message Delivered — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 18. Audit Log

User · Action · Timestamp · Old Value · New Value · Approval Status — generated from the same event stream as §17, restricted to management roles.

---

## 19. Validation

| Rule | Behavior |
|---|---|
| Duplicate Campaign | Warns if a near-identical active/scheduled campaign exists, not a hard block |
| Duplicate Audience | Warns, since overlapping saved audiences are sometimes intentional (e.g., a sub-segment of a broader one) |
| Invalid Schedule | Hard-blocked — send time must be in the future for Scheduled campaigns |
| Missing Template | Blocks campaign activation — a journey/campaign cannot go live referencing a deleted or unselected template |
| Missing Segment | Blocks activation — a campaign must have a defined audience before it can send |
| Consent Status | Hard-blocked at send-time per recipient — a customer without valid consent for the given channel is automatically excluded from the send, not just warned about |
| Communication Limits | Configurable per-customer frequency caps (e.g., "max 2 marketing messages per week") enforced automatically to prevent message fatigue, even if multiple journeys would otherwise independently target the same customer simultaneously |

---

## 20. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard/canvas per Design System §17 |
| Skeleton | Shape-matched to the active view (journey canvas shows a faint grid skeleton) |
| No Campaigns | New tenant: icon + "No campaigns yet" + "Create your first campaign" CTA |
| No Segments | Blocks most campaign creation with a clear "Create a segment first" CTA linking to §6 |
| No Automation Rules | Neutral, common before a business configures its first journey |
| Offline | Read-only cached view; journey/campaign edits queue (relevant mainly for Branch Manager review from a store device) |
| Permission Denied | Standard Navigation §19 pattern |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Retry | Consistent retry affordance throughout |

---

## 21. Responsive Design

| Breakpoint | Lists / Dashboard | Journey Builder Canvas |
|---|---|---|
| Desktop/Laptop | Full tables | Full drag-and-drop canvas, side panel for node configuration |
| Tablet | Priority columns + scroll | Canvas usable but node-editing recommended on larger screens; a simplified linear list-view of journey steps available as an alternative to the visual canvas |
| Mobile | Card-per-row stacked lists | View-only journey summary (linear step list); editing requires Desktop/Tablet |

The Journey Builder canvas is the one view in this module that reasonably degrades to view-only rather than full editing on Mobile, given the spatial reasoning drag-and-drop workflow design requires.

---

## 22. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (campaign/template/segment configuration), accessible tables, WCAG AA compliance. The Journey Builder canvas specifically requires a keyboard-operable alternative to drag-and-drop node placement (e.g., a "Add step" menu with arrow-key repositioning) — consistent with the accessibility requirement already flagged for Promotions' rule-builder (12 §24).

---

## 23. Security

Role Permission per §2. **Campaign Approval:** required above a configured audience-size or spend threshold before launch, reusing the shared Manager Override/Approval component pattern established across every prior module. **Consent Management:** enforced at send-time per §19, non-bypassable regardless of role — even Super Admin cannot force a send to an opted-out customer, since this is a compliance boundary, not a permission tier. **Audit Trail:** immutable, per §18. **Sensitive Action Confirmation:** required for Bulk Campaign Launch and any journey activation reaching a large audience.

---

## 24. Performance

Optimized for millions of customers and millions of campaign events: real-time automation (triggers §9 firing and evaluating journey conditions) must process at the volume of platform-wide events (every sale, every point award, every stock replenishment) without lag — achieved via an event-queue/subscriber architecture rather than polling. Search/lists are server-side indexed, virtualized, lazy-loaded, consistent with every other module.

---

## 25. Advanced Enterprise Features

AI Customer Segmentation (shared engine with Customers §26/Loyalty §26) · AI Journey Recommendations · AI Send-Time Optimization (per-customer optimal send window, based on historical open patterns) · AI Product Recommendations (shared with Product Management §17) · Predictive Churn Detection (shared engine with Customers §15) · Predictive Customer Lifetime Value · **A/B Testing** and **Multivariate Testing** (splitting a campaign/journey into variants, measuring performance via §14's analytics — mirrors Promotions' A/B Promotion Testing, 12 §27) · Omnichannel Orchestration (coordinating message timing/sequencing across Email/SMS/Push/In-App so a customer isn't redundantly contacted across channels for the same trigger) · Marketing Calendar (visual scheduling overview across all campaigns/journeys) · Webhook Automation · API Automation.

Additive/opt-in per the platform-wide principle (established in Sales 09 §27, Customers 10 §26, Loyalty 11 §26) — a small retailer runs Segments/Campaigns/basic Journeys without ever engaging AI-driven or multivariate capabilities.

---

## 26. Developer Implementation Notes

- Automation Triggers (§9) must be implemented as subscriptions to existing domain events already emitted by Sales, Loyalty, Inventory, and Promotions — this module should never require those modules to add marketing-specific instrumentation; it listens to the same event stream their own Activity Timelines already consume (established pattern since Product Detail §29).
- Automation Actions that grant value (Coupon, Voucher, Loyalty Points, Membership Upgrade — §10) must call Loyalty's/Promotions' existing grant services exactly as Promotions' own Rule Actions do (12 §8) — one grant implementation per value type, invoked from both rule engines.
- The Journey Builder canvas (§8) and Promotions' rule-builder (12 §6/§7) share enough structural similarity (condition trees, visual node-based configuration) that they should share an underlying rule/condition-evaluation library, even though their domains (marketing orchestration vs. pricing) remain separate.
- Communication History (§13) should be this module's own send-log, exposed as one of the sources Customer 360's Communication Timeline aggregates (10 §12's aggregator pattern) — not a write into a shared table.
- Consent enforcement (§19/§23) should be a single gate function called immediately before any message dispatch, regardless of which trigger/journey/campaign initiated it — centralizing this is what makes the "non-bypassable, even for Super Admin" guarantee actually true in implementation, not just in the spec.
- Communication Limits/frequency capping (§19) requires tracking send-count-per-customer across *all* concurrent journeys collectively, not per-journey independently — implement as a shared rate-limiter keyed on customer+channel, not a counter scoped to a single journey.

---

**Next:** 14-crm.md
