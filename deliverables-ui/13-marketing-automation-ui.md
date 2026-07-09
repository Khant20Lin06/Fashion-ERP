# Marketing Automation — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [13-marketing-automation.md](../deliverables/13-marketing-automation.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module is the messaging/orchestration layer — Promotions ([12-promotions-ui.md](12-promotions-ui.md)) owns pricing mechanics; this module owns *when and how customers are told about them*. The Customer Journey Builder (§6) is the platform's second visual node-based canvas, and it deliberately reuses the Condition Row component first built for Promotions' Rule Builder ([12-promotions-ui.md](12-promotions-ui.md) §6) — same interaction model, different node vocabulary (Trigger/Decision/Delay/Message/Reward/Exit vs. Promotions' Condition/Action).

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Marketing Automation
↓
Page Header (Title + Toolbar)
↓
Automation Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Segments · Campaigns (default) · Journeys · Automation Rules · Templates · Audience · Communication History · Analytics
```

---

## 2. Page Header & Toolbar

```
Marketing Automation                                  [+ New Segment] [+ New Journey] [+ New Campaign]
8 active journeys · 42,000 messages sent this month

[🔍 Search campaign, journey, segment…]  [Status ▾] [Channel ▾] [Audience ▾] [Filters ▾] [Saved Views ▾]
```

Three creation entry points (Segment/Journey/Campaign) as Outlined buttons of equal visual weight — none elevated to Primary, since which one a Marketing Manager reaches for first is genuinely context-dependent, avoiding a false hierarchy among them.

---

## 3. Automation Dashboard (Collapsible KPI Strip)

10 KPI cards: Active Workflows · Running Campaigns · Scheduled Campaigns · Email Delivery Rate · SMS Delivery Rate · Push Delivery Rate · Open Rate · Click Rate · Conversion Rate · Revenue Generated.

- Delivery Rate cards (Email/SMS/Push) grouped visually as a 3-card cluster with a shared "Delivery Health" label above them, since they're read together far more often than individually
- Revenue Generated reconciles exactly with Sales Analytics' revenue-attribution figure — never independently tallied

---

## 4. Campaigns Tab (List — Default)

**Columns:** Campaign Name (linked) · Type (icon + label: Email/SMS/Push/In-App/Coupon/Voucher/Birthday/Holiday/Flash Sale/Collection Launch/Restock/Abandoned Cart/Win-back/Referral) · Audience (segment name badge) · Status (Draft/Scheduled/Active/Completed/Paused badge) · Sent · Open Rate · Click Rate · Conversion · Revenue Attributed · Scheduled/Sent Date.

Row overflow `⋮`: View, Edit, Duplicate, Pause/Resume, Archive. Bulk-action bar: `[Bulk Launch] [Bulk Schedule] [Bulk Pause] [Bulk Resume] [Export]` — Bulk Launch shows a pre-send summary dialog (audience size, channel, estimated cost where SMS/push has per-message cost) before committing, per the spec's rule that a launch is hard to fully undo once messages are in-flight.

---

## 5. Campaign Calendar (View Toggle within Campaigns Tab)

Month-grid calendar view (toggle beside the List/Card view switcher, top-right of the tab): each campaign renders as a colored bar spanning its active date range (color by Type, using the same categorical palette as chart tokens), with Flash Sale entries showing a countdown chip once within 24 hours — visually identical treatment to Promotions' Campaign Scheduling calendar (§8 there), since both modules plot time-boxed marketing activity the same way.

**Campaign Timeline** (drill-in from a calendar bar or list row): a horizontal stepper showing the campaign's actual lifecycle — Created → Scheduled → Sending → Sent/Completed — with real timestamps, distinct from the Calendar's forward-looking scheduling view.

---

## 6. Customer Journey Builder

Full-screen canvas (minimal chrome — Sidebar collapses automatically when this view opens, matching the "focus mode" pattern established for POS's Register Mode), reached via "+ New Journey" or editing an existing one from the Journeys tab.

**Canvas anatomy:**
```
┌─────────────────────────────────────────────────────┐
│ [Journey Name]                    [Test] [Simulate] [Publish] │
├─────────────────────────────────────────────────────┤
│                                                         │
│   ◆ Entry Trigger                                        │
│   Cart Abandoned                                          │
│        │                                                  │
│   ⬡ Condition                                             │
│   Cart Value > ฿1,000?                                    │
│    ┌───┴───┐                                              │
│   Yes      No                                             │
│    │        │                                             │
│   ⏱ Wait    ⏱ Wait                                        │
│   2 hours   6 hours                                        │
│    │        │                                             │
│   ▭ Message  ▭ Message                                    │
│   "Come back  "You left                                   │
│   for 10% off" something!"                                 │
│    │        │                                             │
│   ⬤ Exit    ⬤ Exit                                         │
│                                                         │
└─────────────────────────────────────────────────────┘
                    [+ Add Step]  (floating action, bottom-center)
```

**Node shapes/colors** (per the spec's requirement for at-a-glance journey comprehension, consistent with Design System §9's iconography discipline extended to this new visual vocabulary):
- **Entry Trigger** = ◆ diamond, `color-primary` fill
- **Condition/Decision Branch** = ⬡ hexagon, `color-info` fill — reuses the exact Condition Row component from Promotions' Rule Builder ([12-promotions-ui.md](12-promotions-ui.md) §6) when expanded/edited, not a redesigned condition editor
- **Delay/Wait Until** = ⏱ clock-icon rounded rectangle, `color-text-secondary` fill
- **Message/Reward/Coupon/Loyalty Points** (Action nodes) = ▭ rectangle, `color-success` fill (reward-granting actions call directly into Loyalty/Promotions' existing services per the spec — this canvas orchestrates *when*, not *what*)
- **Split Test** = ⬡ hexagon with an "A/B" badge overlay
- **Exit/End Workflow** = ⬤ filled circle, neutral fill

**Interaction:**
- Nodes connect via drag-drawn edges (click-drag from a node's bottom handle to the next node's top handle); an edge auto-snaps and shows a brief `motion-fast` highlight on successful connection
- Clicking any node opens a right-side configuration drawer (360px) specific to that node type — a Message node's drawer shows the Template picker (§8) + Channel selector + Preview pane; a Condition node's drawer is the identical Condition Row editor from Promotions
- "+ Add Step" floating button offers a type picker (Trigger/Condition/Delay/Message/Reward/Split Test/Exit) rather than requiring drag-from-a-palette, keeping the canvas uncluttered
- Keyboard-operable alternative (per accessibility requirement): an "Add step" menu button per existing node (visible on focus, not just hover) plus arrow-key repositioning, so the entire journey can be built without a mouse

**Toolbar:** Test (sends a preview message to the builder's own account) · **Simulate** (runs a hypothetical customer profile through the journey, showing which branch they'd take and what they'd receive — reuses the same "run against the real engine, not a mock" principle established for Promotions' Simulator) · Publish (Primary button, activates the journey).

---

## 7. Automation Rules Tab (Trigger/Action Reference & Simple Rules)

For automations simpler than a full multi-step Journey, a flat rule-row list mirroring Promotions' Rule Builder pattern at a smaller scale: Trigger (New Customer/First Purchase/Repeat Purchase/Birthday/Anniversary/Cart Abandoned/Wishlist Reminder/Loyalty Upgrade/Inactive Customer/VIP Enrollment/Manual/API) → Action (Send Email/SMS/Push/LINE/WhatsApp, Add Loyalty Points, Issue Coupon, Assign Tag, Update Segment, Create CRM Task, Notify Employee) → Active toggle.

"Convert to Journey" action on any row promotes a simple rule into the full Journey Builder (§6) pre-populated with that trigger/action as the first two nodes, for a Marketing Manager who starts simple and later wants branching/delay logic.

---

## 8. Templates Tab

Card grid, filterable by channel (Email/SMS/Push/LINE/WhatsApp): each card shows a thumbnail preview, name, last-modified date, and a "Used in N campaigns" count. Template Editor (drill-in): for Email — a block-based visual editor (Header/Text/Image/Button blocks, drag-to-reorder); for SMS/Push/LINE/WhatsApp — a plain-text editor with a live character-count and a Variables/Personalization Tokens picker (`{customer_name}`, `{points_balance}`, `{order_number}`, etc., inserted via a `{ }` icon button that opens a searchable token list). Version History accordion beneath the editor, mirroring the same versioned-revision pattern used for Product pricing history and PO amendments.

---

## 9. Audience / Segments Tab

Segment cards (Customer Segments, Dynamic Segments marked with a small "live" pulse indicator distinguishing them from Saved/static Audiences) — each card shows segment name, member count (auto-updating for Dynamic), and the rule summary in plain language ("Spent > ฿10,000 in last 90 days"). "+ New Segment" opens a filter-builder (Membership Tier, Purchase History thresholds, Geographic filters, Behavioral filters — reusing the same Advanced Filter chip-and-popover pattern used across every list screen in the platform, applied here to define a persistent audience rather than a transient view filter).

Suppression List sub-section (visually distinct, `color-error`-accented header) — customers who must never receive marketing regardless of segment match, with a clear "why is this customer here" reason shown per row (Bounced/Complained/Manually excluded).

---

## 10. Communication History Tab

Unified table (the aggregator view over Notifications' Delivery History, per the spec's architecture): Channel icon, Recipient, Campaign/Journey source (linked), Subject/Preview, Sent Date, Status (Delivered/Opened/Clicked/Bounced/Failed badge). Filterable by channel/campaign/date — this is where a Marketing Manager checks "did this specific customer actually get my email," distinct from the aggregate Analytics tab below.

---

## 11. Analytics Tab

12-col grid: Conversion Funnel (funnel chart, 6 cols) + Revenue Attribution (6 cols, cross-referenced against Sales' own figures per the spec's reconciliation rule) → Delivery Analytics / Open Rate / Click Rate (3-up trend charts, 4-col each) → Customer Journey visualization (Sankey-style flow diagram showing aggregate drop-off through an active Journey's branches — a natural analytics companion to the Journey Builder's design-time canvas) → Campaign Comparison (side-by-side bar chart, multi-select campaigns to compare).

---

## 12. Search Experience

Instant Search (campaign/journey/segment name) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 13. Dialogs

| Dialog | Contents |
|---|---|
| **Create Workflow** | Opens the full-screen Journey Builder (§6) directly — not a modal, given its canvas nature |
| **Edit Workflow** | Same canvas, pre-loaded |
| **Create Campaign** | Compact form (Name, Type, Audience, Template, Schedule) for simple one-off sends not requiring the full Journey Builder |
| **Schedule Campaign** | Date/time picker + Immediate/Scheduled/Recurring options, identical pattern to Promotions' Campaign Scheduling |
| **Send Test Message** | Recipient (defaults to current user) + channel confirmation + "Send Test" — no audience/segment logic invoked, a direct single-send |
| **Delete Confirmation** | Zero-send-history campaigns/journeys only; Archive is the default path otherwise |

---

## 14. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`; Journey canvas node hover reveals its "+ Add step after" affordance |
| Focus | 2px `color-focus` ring; Journey canvas nodes show a focus ring + reveal their keyboard "Add step" menu button on focus |
| Selection | Checkbox multi-select on list tabs |
| Keyboard Navigation | Full keyboard operability through the Journey canvas (§6's accessibility note) |
| Drag & Drop Workflow Builder | Edge-drawing between nodes (§6); node repositioning on the canvas (cosmetic, doesn't affect logic) |
| Context Menu | Right-click a Campaign/Journey row: View, Edit, Duplicate, Pause |
| Quick Actions | Pause/Resume always-visible on Campaign/Journey rows, mirroring Promotions' precedent for the same reason (fast reaction to an underperforming send) |

---

## 15. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Shape-matched, including a faint grid-skeleton for the Journey canvas while it loads |
| Empty Automation | New tenant: icon + "No campaigns yet" + "Create your first campaign" CTA |
| No Search Results | Distinct — "No campaigns match '[query]'" + Clear filters |
| Offline | Read-only cached view; minimal offline write tolerance, consistent with other marketing/configuration modules |
| Permission Denied | Standard pattern; Campaign Approval-gated fields hidden/shown-disabled per role and reach/spend threshold |
| Validation Error | Inline — Missing Template blocks activation ("Select a template before publishing"), Missing Segment blocks activation, Consent violations auto-exclude recipients silently at send-time (not a validation error the sender sees per-recipient, since consent exclusion is automatic and non-negotiable) |
| Workflow Error | Distinct state specific to this module — a Journey node misconfiguration (e.g., a Message node with no template selected) is flagged directly on the canvas node itself (a small `color-error` badge on the node) rather than only in a separate error list |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation dialog after Bulk Campaign Launch and Journey Publish, given their in-flight-irreversibility |

---

## 16. Responsive Design

| Breakpoint | Lists / Dashboard | Journey Builder Canvas |
|---|---|---|
| Desktop/Laptop | Full tables, full charts | Full drag-and-drop canvas, side panel for node configuration |
| Tablet | Priority columns + scroll | Canvas usable but node-editing recommended on larger screens; a simplified linear list-view of journey steps available as an alternative to the visual canvas, per the spec's own tablet note |
| Mobile Marketing Manager View | Card-per-row stacked lists | **View-only journey summary** (linear step list) — editing requires Desktop/Tablet, the one screen in this module that doesn't attempt full mobile parity given the spatial reasoning drag-and-drop genuinely requires |

---

## 17. Accessibility

Standard baseline: keyboard navigation, screen reader labels, visible focus, WCAG AA. **Accessible Workflow Builder** specifically: every node's Add/Remove/Configure action must be keyboard-reachable via a visible-on-focus button (§6/§14), not exclusively drag-and-drop or hover-revealed — matching the same requirement already established for Promotions' Rule Builder, CRM's Kanban, and Reports' Dashboard Builder.

---

## 18. Figma Build Notes

- Frame: `Marketing/Campaigns/Desktop/1440`, `Marketing/JourneyBuilder/Desktop/Fullscreen`, `Marketing/Templates/EmailEditor`
- Journey node components (Trigger/Condition/Delay/Message/Split/Exit) are new small components, each a distinct shape per §6 — the Condition node specifically **instances** the Condition Row component built in Promotions UI, not a redrawn copy
- Journey canvas connectors (edges) use a consistent arrow-terminated line style matching the platform's general diagram/flow iconography
- Layer naming: `Marketing/JourneyBuilder/Node-Trigger`, `Marketing/JourneyBuilder/Node-Condition`, `Marketing/Templates/Card-Email`, per convention

---

## 19. Developer Handoff Notes

- Journey Builder action nodes (Reward/Coupon/Loyalty Points, §6) must call Loyalty's/Promotions' existing grant services exactly as Promotions' own Rule Actions do — this canvas orchestrates *when*, never reimplementing *what* a reward grant actually does, per `13-marketing-automation.md` §26.
- The Journey Simulator (§6) must run against the same production trigger/condition-evaluation engine as live journeys — not a separate simplified simulation, mirroring the identical requirement already established for Promotions' Simulator.
- Condition node configuration (§6) should share an underlying rule/condition-evaluation library with Promotions' Rule Builder, per `13-marketing-automation.md` §26 — this UI's Condition drawer is literally the same component, not a lookalike rebuild.
- Communication History (§10) is a read-only aggregator over Notifications' own send-log — this screen never writes into a separate marketing-specific communication table.
- Consent enforcement (§15's Validation Error note) must be a single server-side gate checked immediately before any dispatch — this UI never needs its own consent-checking logic; it simply reflects that a send occurred with automatic exclusions already applied, and should never expose a control that could bypass that gate, including for Super Admin.

---

**Next:** 14-crm-ui.md
