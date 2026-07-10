# Customer Relationship Management (CRM) Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md), [09-sales.md](09-sales.md), [10-customers.md](10-customers.md), [11-loyalty.md](11-loyalty.md), [12-promotions.md](12-promotions.md), [13-marketing-automation.md](13-marketing-automation.md)
**Consumed by:** Sales, Customer 360, Finance, Mobile App, E-commerce
**Scope note:** This module owns the Lead-to-Opportunity process — everything **before** a Sales Order exists. It converges into Sales' Quotation ([09-sales.md](09-sales.md) §6) at the handoff point: an Opportunity reaching Proposal stage generates a Sales Quotation there, not a duplicate quoting mechanism here. Once a Quotation is Accepted and becomes a Sales Order, that record and its fulfillment lifecycle belong entirely to module 09.

---

## 1. Module Objective

Manage the complete customer relationship lifecycle prior to sales conversion — Lead Management, Opportunity Management, Sales Pipeline, Accounts, Contacts, Activities, Meetings, Tasks, Calls, Emails, Quotations (handoff), Forecast, CRM Analytics — primarily serving B2B/wholesale/corporate sales motions where a deal has a multi-touch relationship-building phase, unlike POS's instant walk-in transaction model.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, all territories |
| Sales Director | Full pipeline visibility, forecast oversight, territory configuration |
| Sales Manager | Team-scoped pipeline, approves stage-progression exceptions |
| Sales Executive | Own leads/opportunities/accounts (Record Ownership, §25); team visibility read-only |
| Business Development | Lead creation/qualification focus; hands off qualified leads to Sales Executives |
| CRM Manager | System configuration (pipeline stages, lead scoring rules, territory rules) |
| Customer Success | Read Account/Contact history for post-sale relationship continuity; logs Activities |
| Marketing Manager | Read Lead Source/campaign-attribution data; no pipeline edit access |

**Record Ownership:** every Lead, Account, and Opportunity has an assigned Owner — non-owners (outside management tiers) see records read-only or not at all, per **Territory-based Access** (§25) rules (e.g., geographic or account-size territory assignment).

---

## 3. CRM Lifecycle

```
Lead → Qualification → Opportunity → Quotation → Negotiation
→ Sales Order → Customer → Retention → Upsell → Renewal
```

**Quotation → Sales Order** is the exact handoff point to [09-sales.md](09-sales.md) §6/§7 — this module's Opportunity record remains linked (Won status) to the resulting Sales Order for full-cycle traceability, but does not duplicate its fulfillment tracking. **Retention/Upsell/Renewal** stages hand continued relationship management to Customer Success, informed by Customer 360's purchase history ([10-customers.md](10-customers.md) §13) rather than a separate CRM-side purchase record.

---

## 4. Module Structure

```
CRM Dashboard (§5)
↓
Lead Management (§6) ──→ Account Management (§7) ──→ Contact Management (§8)
                                    ↓
                        Opportunity Management (§9) ──→ Sales Pipeline (§10, Kanban)
                                    ↓
                Activities (§11) · Tasks (§12) · Meetings (§13) · Emails (§14)
                                    ↓
                        Sales Forecast (§15)
                                    ↓
                        CRM Analytics (§16)
```

---

## 5. CRM Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: New Leads · Qualified Leads · Open Opportunities · Won Opportunities · Lost Opportunities · Pipeline Value · Expected Revenue · Activities Due Today · Meetings Today · Tasks Due · Conversion Rate · Average Sales Cycle — plus Sales Forecast (trend) and Top Sales Representatives (ranked).

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15); "Activities/Meetings/Tasks Due Today" cards are the Sales Executive's literal daily worklist — clicking opens the filtered Activities/Tasks view (§11/§12) for immediate action, consistent with the KPI-card-as-navigation rule (03 §6).

---

## 6. Lead Management

Create Lead · Import Leads · Assign Owner · Lead Source (Website, Referral, Walk-in Inquiry, Trade Show, Cold Outreach, etc.) · Lead Score (§27) · Qualification Status (New/Contacted/Qualified/Disqualified) · Tags · Attachments · Notes · Duplicate Detection (fuzzy-match on name/phone/email, surfaced as a merge suggestion, mirroring Customers' Duplicate Detection, [10-customers.md](10-customers.md) §26) · Lead Merge · **Lead Conversion** (promotes a Qualified lead into an Account (§7) + Contact (§8) + Opportunity (§9) in one action, rather than three separate manual creation steps).

Disqualified leads are archived, not deleted — preserved for source/channel-performance analysis (§16) even though they didn't convert.

---

## 7. Account Management

Individual Customers · Corporate Customers · Organizations · Business Accounts — Account Hierarchy (parent/subsidiary relationships, relevant for franchise/multi-location B2B buyers) · Multiple Branches (an Account may transact across several of the business's own branches) · Credit Profile (surfaces Sales' Credit Limit, [09-sales.md](09-sales.md) §21/§25, read-only here — configured in Finance, not duplicated) · Account Notes.

An Account converging to a paying customer links directly to its corresponding record in [10-customers.md](10-customers.md) — this module does not maintain a second customer-identity record; a CRM Account **is** a Customers-module Customer once conversion happens (§6), viewed here through a sales-relationship lens rather than a service/transactional one.

---

## 8. Contact Management

Primary Contact · Multiple Contacts (relevant for Corporate Accounts with several stakeholders — buyer, finance approver, receiving manager) · Job Title · Phone · Email · Social Profiles · Communication Preference · Birthday · Address · Relationship History (every Activity/Meeting/Call/Email logged against this specific contact, not just the parent Account).

Multiple Contacts under one Account is the CRM-side elaboration of the same concept Customers module flags for Corporate Customers ([10-customers.md](10-customers.md) §26) — one data model, viewed/managed here during the pre-sale relationship phase.

---

## 9. Opportunity Management

Pipeline Stages (§10) · Probability (%, either stage-default or manually adjusted) · Expected Revenue · Expected Close Date · Products (line items under consideration — references live Product Management data, [05-product-management.md](05-product-management.md), not a separate product list) · Competitors (tracked for win/loss analysis) · Sales Team (primary owner + supporting members) · Win/Loss Reason (required on stage-close, structured picklist — feeds §16's analytics) · Next Action (always-visible required field — an Opportunity without a defined next step is a stalled deal, surfaced as such on the Dashboard).

---

## 10. Sales Pipeline

Customizable stages (default: New Lead → Qualified → Proposal → Negotiation → Verbal Approval → Contract → Won/Lost) — configurable per CRM Manager to match the organization's actual sales motion (e.g., a simpler 4-stage pipeline for a smaller wholesale operation).

**Kanban view** (drag-and-drop): one column per stage, one card per Opportunity showing Account name, Expected Revenue, Owner avatar, and days-in-stage (visually flagged if exceeding a configurable stall threshold). Dragging a card to a new stage triggers any stage-entry automation (e.g., moving to "Proposal" auto-generates a Sales Quotation draft, per §3's handoff) and, for backward moves or a move to "Lost," requires the Win/Loss Reason (§9) before the drag commits.

List view (standard enterprise table, Design System §12) available as an alternative to Kanban for users who prefer sortable/filterable rows over visual cards — same underlying data, two presentations.

---

## 11. Activities

Calls · Emails · Meetings · Site Visits · Notes · Follow-ups · Reminders · Attachments — logged against a Lead, Account, Contact, or Opportunity. This is the unified activity-logging surface; Meetings (§13) and Emails (§14) have their own dedicated richer views, but all activity types appear together in one chronological feed per record (consistent with the Activity Timeline pattern used platform-wide, e.g., 03 §13, 09 §19).

---

## 12. Task Management

Create Task · Assign Task · Priority · Due Date · Recurring Tasks · Checklist (sub-items within a task) · Comments · Task Status (Open/In Progress/Completed/Overdue — auto-flagged Overdue past Due Date). Tasks feed the Dashboard's "Tasks Due" KPI (§5) and the Notification Center (Navigation §13) as due-dates approach.

---

## 13. Meeting Management

Schedule Meeting · Online Meeting Link (video conferencing integration) · Location (for in-person/site visits) · Participants (internal team + external Contacts, §8) · Agenda · Meeting Notes · Follow-up Actions (creates linked Tasks, §12, directly from the meeting record — ensures commitments made in a meeting don't just live in unstructured notes).

---

## 14. Email Management

Email Templates (shared library with Marketing Automation's Message Templates, [13-marketing-automation.md](13-marketing-automation.md) §11, for consistency of voice/branding, though CRM emails are typically 1:1 relationship correspondence rather than campaign blasts) · Email Tracking · Open Tracking · Reply Tracking · Attachments · Email History (logged to the Contact/Opportunity's Activity feed, §11).

---

## 15. Sales Forecast

Expected Revenue · Forecast by Salesperson · Forecast by Branch · Forecast by Product Category · Forecast by Month · **Forecast Accuracy** (historical: forecasted vs. actual Won revenue, per period — a self-correcting signal for how reliable each salesperson's/team's pipeline estimates tend to be, surfaced constructively rather than punitively).

Forecast calculation weights Opportunity Expected Revenue by Probability (§9) per stage — a configurable methodology (weighted pipeline vs. only-Verbal-Approval-and-beyond) set at the CRM Manager level.

---

## 16. CRM Analytics

Lead Sources (which channels produce the most/best leads) · Lead Conversion Rate · Opportunity Win Rate · Sales Funnel (visualizing drop-off per stage, §10) · Sales Cycle Length (average days Lead→Won) · Activity Performance (which activity types/cadences correlate with wins) · Salesperson Performance · Revenue Forecast (§15, presented analytically here alongside historical accuracy).

Reuses Dashboard/Sales Analytics chart components (03 §15, 09 §15); Lead Source performance should cross-reference Marketing Automation's Revenue Attribution ([13-marketing-automation.md](13-marketing-automation.md) §14) so a lead sourced from a marketing campaign shows consistent attribution across both modules.

---

## 17. Search & Filter

Lead · Account · Contact · Opportunity · Owner · Stage · Branch · Source · Date Range · Tags — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 18. Bulk Operations

Bulk Import · Bulk Export · Bulk Assignment (reassigning leads/opportunities to a different owner, e.g., territory rebalancing) · Bulk Status Update · Bulk Delete (restricted to Leads with no linked Opportunity/Activity history — records with relationship history use Archive instead, consistent with the platform-wide Archive-over-Delete principle) · Bulk Email (to a filtered set of Contacts, respecting the same Consent rules as Marketing Automation, [13-marketing-automation.md](13-marketing-automation.md) §19, since CRM bulk email is still marketing communication subject to the same compliance boundary).

---

## 19. Activity Timeline

Lead Created · Lead Updated · Lead Qualified · Opportunity Created · Meeting Completed · Call Logged · Email Sent · Task Completed · Opportunity Won · Opportunity Lost — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 20. Audit Log

User · Action · Timestamp · Old Value · New Value · Approval Status — generated from the same event stream as §19, restricted to management roles.

---

## 21. Validation

| Rule | Behavior |
|---|---|
| Duplicate Leads | Warned via Duplicate Detection (§6), not hard-blocked — merge is offered, not forced |
| Duplicate Contacts | Same treatment as Leads |
| Missing Required Fields | Name + one contact method minimum to create a Lead, consistent with Customers' equivalent rule (10 §20) |
| Invalid Email / Invalid Phone | Inline format validation at entry |
| Lead Ownership | A lead must have an assigned Owner before it can be Qualified — prevents leads silently sitting unowned |
| Opportunity Stage Rules | Certain stage transitions require required fields to be filled first (e.g., cannot move to "Won" without Expected Close Date and linked Sales Order reference; cannot move to "Lost" without Win/Loss Reason, §9) |

---

## 22. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard/Kanban per Design System §17 |
| Skeleton | Kanban shows column-shaped skeletons with card-shaped placeholders |
| No Leads | New tenant: icon + "No leads yet" + "Add your first lead" / "Import leads" CTAs |
| No Opportunities | Neutral, common for a business relying primarily on POS/walk-in sales rather than a B2B pipeline |
| No Activities | Neutral state on a freshly created Lead/Account/Opportunity |
| Offline | Read-only cached view; Activity logging (calls/notes made in the field) queues and syncs, since Sales Executives may log activity from a mobile device between site visits |
| Permission Denied | Standard Navigation §19 pattern; Territory-based Access (§25) restricts by omitting records outside the user's territory, rather than showing them as denied |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Retry | Consistent retry affordance throughout |

---

## 23. Responsive Design

| Breakpoint | Lists / Dashboard | Kanban Pipeline |
|---|---|---|
| Desktop/Laptop | Full tables | Full multi-column Kanban, drag-and-drop |
| Tablet | Priority columns + scroll | Kanban columns become horizontally swipeable; drag-and-drop remains touch-supported |
| Mobile | Card-per-row stacked lists | Kanban collapses to a single-column, stage-filtered list (select stage from a dropdown) rather than attempting multi-column drag-and-drop on a small screen |

Field sales use (Sales Executives logging Activities/Meetings from mobile between client visits, per §13/§22's offline note) is a real usage pattern — Activity/Task/Meeting logging forms remain fully functional on Mobile even though the Kanban board itself simplifies.

---

## 24. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (Lead/Account/Contact/Opportunity entry), accessible tables. **Kanban board (§10) requires a keyboard-operable alternative to drag-and-drop stage transitions** (e.g., a "Move to stage…" menu on each card) — consistent with the same accessibility requirement already established for Promotions' rule-builder (12 §24) and Marketing's Journey Builder canvas (13 §22). WCAG AA contrast on all stage/status badges.

---

## 25. Security

**Record Ownership:** enforced per §2 — non-owners see only what their role/territory permits. **Territory-based Access:** geographic or account-tier-based row-level security, configured by CRM Manager, layered on top of standard Role Permission. **Approval Workflow:** required for Opportunity discount terms exceeding standard policy (references the same shared Manager Override component used across Sales/Promotions, 09 §25, 12 §25) before a Quotation can be generated at the Proposal stage. **Audit Trail:** immutable, per §20. **Sensitive Action Confirmation:** required for Bulk Delete and Account Merge.

---

## 26. Performance

Optimized for millions of leads and large sales pipelines: list/Kanban views virtualize rendering, search is server-side indexed, server-side pagination throughout — consistent with every other back-office module's performance approach (05 §22, 07 §25, 09 §26).

---

## 27. Advanced Enterprise Features

**Lead Scoring** (rule-based or weighted, e.g., points for company size + engagement recency) feeding **AI Lead Qualification** (automated scoring refinement) · **AI Opportunity Scoring** (win-probability prediction beyond manual Probability entry, §9) · Sales Territory Management (§25's configuration surface) · Sales Goals & Quotas (per salesperson/team/branch, measured against §15's forecast and actuals) · Commission Tracking (calculated from Won Opportunities, feeds Finance/Payroll — module 16/18) · Partner Management (for businesses selling through wholesale partners/agents) · Referral Pipeline (B2B referral tracking, distinct from Loyalty's consumer Referral Program, [11-loyalty.md](11-loyalty.md) §12, though conceptually similar) · **Customer 360 Integration** (deep-link from any Account/Contact directly into that customer's full profile, [10-customers.md](10-customers.md) §7, once they've converted) · Marketing Attribution (§16's cross-reference with Marketing Automation) · Document Management (proposal/contract file storage per Opportunity) · Electronic Signature Integration (for Contract-stage closing) · Webhook Integration · API Integration.

Additive/opt-in per the platform-wide principle — a business running purely POS/walk-in retail may never touch this module at all; a business with a wholesale/corporate sales team relies on it heavily.

---

## 28. Developer Implementation Notes

- Lead Conversion (§6) creating an Account + Contact + Opportunity in one transaction should reuse the exact Account/Contact/Opportunity creation services used for manual entry — conversion is a convenience wrapper, not a separate code path with its own validation rules.
- The Opportunity→Sales Quotation handoff (§3) should call Sales' existing Quotation creation service ([09-sales.md](09-sales.md) §6) directly, passing Opportunity context (Account, Products, discussed pricing) — this module must never implement its own quoting/pricing logic in parallel.
- A CRM Account and a Customers-module Customer record (§7) should be the same underlying entity — model as one customer-identity table with CRM-specific fields (Territory, Owner, Credit Profile display) as an extension, not a separate Account table requiring reconciliation/sync with Customers.
- Kanban stage-transition automation (§10, e.g., auto-generating a Quotation draft on reaching Proposal) should be implemented as the same kind of event-triggered action Marketing Automation's Journey Builder uses (13 §9/§10) — reuse that trigger/action infrastructure rather than building a second one scoped to CRM.
- Win/Loss Reason (§9/§21) and Lead Source (§6) should feed the same analytics rollup service as Marketing's Revenue Attribution (13 §14) and Sales Analytics (09 §15), so lead-to-revenue attribution numbers are consistent no matter which module a stakeholder checks.

---

**Next:** 15-suppliers.md
