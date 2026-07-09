# Loyalty & Membership — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [11-loyalty.md](../deliverables/11-loyalty.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers the program-configuration console — Loyalty Dashboard, Membership Tiers, Points Management, Rewards Catalog, Redemption Management, Campaigns, and the program-level Member Directory. Per `11-loyalty.md`'s own scope boundary, a customer's *individual* loyalty standing is Customer 360's Loyalty tab ([10-customers-ui.md](10-customers-ui.md) §7.5) — this document's Member Profile (§9) is the program-side administrative view of a member, distinct from that customer-facing summary. **Naming note:** this UI prompt names tiers Bronze/Silver/Gold/Platinum/VIP; the approved spec (`11-loyalty.md` §6) fixes them as Standard/Silver/Gold/Platinum/VIP + Custom Tiers — tier names are business configuration, not a UI-phase decision, so this document uses the spec's names throughout.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Loyalty
↓
Page Header (Title + Toolbar)
↓
Loyalty Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Members · Tiers · Points · Rewards · Redemptions · Campaigns · Gift Cards · Referrals · Coupons & Vouchers · Analytics
```

---

## 2. Page Header & Toolbar

```
Loyalty                                               [Export] [+ New Reward] [+ New Campaign]
18,240 members · 2.4M points outstanding

[🔍 Search member, reward, campaign…]  [Tier ▾] [Status ▾] [Filters ▾] [Saved Views ▾]
```

Two primary actions (Reward/Campaign) rather than one — justified since this console genuinely has two distinct high-frequency creation flows, unlike single-entity modules; both render as Outlined (secondary-weight) buttons rather than competing Primary buttons, per Design System §10's one-Primary-per-view rule.

---

## 3. Loyalty Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Members · Active Members · New Members · VIP Members · Total Points Issued · Total Points Redeemed · Expiring Points · Reward Redemptions · Active Campaigns · Average Customer Lifetime Value.

- **Total Points Issued/Redeemed** rendered with an outstanding-liability framing beneath ("2.4M points outstanding · ≈฿24,000 liability") since these represent real deferred revenue per the spec's Finance-approval framing
- Tier Distribution donut chart (below the KPI row, half-width) uses the exact tier-color palette established in Customer 360's tier badges — same colors, same meaning, everywhere

---

## 4. Members Tab (Program-Level Member Directory)

**Columns:** Member ID · Customer Name (linked to Customer 360) · Membership Tier (badge, same tier-color system as §3/Customer 360) · Current Points (tabular-nums) · Wallet Balance · Lifetime Spend · Total Orders · Enrollment Date · Last Activity · Status (Active/Inactive/Suspended badge).

Row overflow `⋮`: View in Customer 360, Adjust Points, Override Tier, Reissue Reward (service recovery). Bulk-action bar: `[Bulk Point Adjustment] [Bulk Membership Upgrade] [Bulk Reward Assignment] [Bulk Campaign Enrollment] [Export]` — Bulk Point Adjustment specifically requires the Finance Manager approval gate per the spec's liability-sensitivity rule, shown as a required approval step within the bulk dialog rather than applying instantly.

---

## 5. Tiers Tab

**Tier cards** (one per configured tier, horizontal scroll or wrap grid): each card shows the tier's color swatch, name, member count, and a "Configure" button. Clicking opens the **Tier Configuration panel** (side drawer):

```
Gold Tier                                          [Save]
Point Multiplier: [1.5x]
Benefits: [+ Add benefit]  → Free Shipping, Early Access, Birthday Reward (chip list, removable)
Upgrade Rule: Spend ≥ [฿20,000] within [12 months]  OR  Points ≥ [10,000]
Downgrade Rule: Re-evaluated [Annually] · Grace period [30 days]
Exclusive Pricing: [Link to Product Management's Gold Price field]
```

- Each rule row uses inline number/dropdown inputs rather than a monolithic form — configuration reads like a sentence, consistent with the platform's general rule-builder pattern established in Promotions
- "+ Add Custom Tier" card at the end of the tier grid, opening the same configuration panel blank

---

## 6. Points Tab

Two sub-sections via inner tab toggle: **Earn Rules** / **Redemption Rules**.

**Earn Rules:** rule-builder list (same visual pattern as Promotions' condition/action rows) — each rule: Trigger (Purchase Amount/Category/Brand/Promotion/Birthday/Anniversary/Referral/Bonus Event) → Rate (points per currency unit or multiplier) → Active toggle. "+ Add Earn Rule" button.

**Redemption Rules:** Minimum Points, Maximum Points per transaction, Expiration policy (duration + grace-period notification lead time), Eligibility (tier-gating checklist).

**Point Ledger** (separate section/tab below): a platform-wide, filterable table of all point transactions (Date, Member, Type badge [Earned/Redeemed/Adjusted/Expired/Transferred], Points Δ, Balance After, Source reference link) — the program-wide view of the same ledger Customer 360's Loyalty tab shows per-member.

**Manual Adjustment / Point Transfer / Expire Points:** each a dedicated dialog (§10), reachable from the Ledger's toolbar or a Member row's quick action.

---

## 7. Rewards Tab (Catalog)

Card grid (4-up Desktop): Reward Cards, Gift Vouchers, Discount Coupons, Free Products, Exclusive Gifts, Experiences, Limited-Time Rewards — each card:

```
┌─────────────────┐
│  [Reward Image]   │
│  [Limited-Time]     │  badge, top-left overlay, countdown if time-boxed
│  Free Tote Bag       │
│  1,500 pts            │  type-title
│  Tier: Gold+           │  type-caption
│  Stock: 42 available   │  type-caption, color-warning if low
└─────────────────┘
```

- Out-of-stock product-rewards (per the spec's inventory-availability rule) are **hidden from the catalog entirely**, not shown-grayed — distinct from POS's out-of-stock product treatment, per the spec's explicit reasoning (a reward customers can't get reads worse than a product they can't buy)
- "+ New Reward" opens a form dialog: Reward Type selector → Name/Image → Point Cost → Tier Eligibility → Stock link (if Product-type reward) → Time-boxed toggle (start/end date if Limited-Time)

---

## 8. Redemptions Tab

Table: Redemption ID, Member (linked), Reward, Points Used, Date, Status badge (Pending Approval/Approved/Fulfilled/Failed/Cancelled), Channel (POS/Mobile/Admin). Row action for Pending: Approve/Reject (shared Approval component). Failed Redemption rows show an inline reason ("Insufficient points at time of processing" / "Reward out of stock") rather than a bare failure badge. Cancel Redemption available on Approved-but-not-yet-Fulfilled rows only, with a confirmation dialog reversing the point deduction.

---

## 9. Campaigns Tab

Campaign cards (grid, similar structure to Marketing Automation's Campaign cards for visual consistency across the two related modules): Birthday Rewards, Anniversary Rewards, Double Points Events, Seasonal Campaigns, VIP Exclusive Campaigns, Referral Rewards — each card shows type icon, name, status (Active/Scheduled/Ended), audience size, and a mini performance sparkline once it has run. "Automated" badge distinguishes trigger-based campaigns (Birthday/Anniversary — always-on) from manually scheduled ones (Seasonal/Flash).

Campaign detail (drill-in): reuses the same Journey-style trigger→action configuration pattern established in Marketing Automation, since Loyalty Campaigns are a specialized subset of that same orchestration capability rather than a separately invented builder.

---

## 10. Gift Cards / Referrals / Coupons & Vouchers Tabs (Concise Coverage)

- **Gift Cards:** table (Card Number, Type [Physical/Digital], Balance, Status, Issued Date, Expiry) + "Issue Gift Card" action; Balance Check/Recharge/Transfer as row-level quick actions
- **Referrals:** table (Referrer, Referee, Status badge [Registered/Qualifying Purchase Pending/Reward Granted], Date) + a small Fraud Flag indicator (icon) on rows the system has flagged for review, per the spec's flag-don't-auto-block rule
- **Coupons & Vouchers:** table (Code, Type, Discount, Usage Count/Limit, Expiry, Status) + Bulk Coupon Generation dialog (prefix pattern, quantity, expiry — generates a downloadable batch)

---

## 11. Member Profile (Program-Side Admin View)

Reached from the Members tab's row click — distinct from Customer 360's Loyalty tab (which is the customer-service-facing summary): this is the **program administration** view, showing the same data plus configuration-adjacent actions not appropriate for general customer service staff (Manual point ledger edit, Tier override with full rule-bypass authority, Campaign participation audit).

Layout: Membership Summary header (tier, points, enrollment date) → Tier Progress → Point Balance + Wallet Balance stat row → tabs: Reward History · Redemption History · Purchase History · Campaign Participation · Activity Timeline — same tab-content components as Customer 360's equivalents, reused rather than rebuilt, with this screen's chrome (header/actions) reflecting its program-admin context instead.

---

## 12. Search Experience

Instant Search (member name/ID, reward name, campaign name) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 13. Dialogs

| Dialog | Contents |
|---|---|
| **Create Membership Tier** | Per §5's Tier Configuration panel, presented as a dialog when triggered from a "+" action rather than the tab's own drawer |
| **Adjust Points** | Member search-select (if not already in context) → Increase/Decrease toggle → Amount → Reason (required) → live preview "New balance: 1,740 pts" → Approval gate if above threshold |
| **Create Reward** | Per §7 |
| **Redeem Reward** | Member context → eligible reward picker (tier/points-filtered) → confirm → point deduction preview before commit |
| **Transfer Points** | From Member → To Member (both search-selects) → Amount → Reason → validates sufficient balance before allowing submit |
| **Expire Points** | Manual override for early expiration (rare, exception-handling) — requires a reason, logged distinctly from automatic expiration |
| **Delete Confirmation** | Reserved for Rewards/Campaigns with zero redemption/participation history; Archive is the default path otherwise |

---

## 14. Interaction Design

Standard platform interaction set (Hover/Focus/Selection/Keyboard/Context Menu) applied identically to every table/card grid in this module. **Quick Actions** specifically: a Member row's "Adjust Points" and "Reissue Reward" are the two highest-frequency Customer Service actions, kept as always-visible row icons rather than buried in the overflow menu — mirroring the "New Sale" always-visible precedent from Customers UI.

---

## 15. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Shape-matched skeletons throughout |
| Empty Loyalty Program | New program launch: icon + "No members enrolled yet" + "Enroll your first member" CTA |
| No Members | Distinct from Empty Loyalty Program if filters are simply too narrow — "No members match these filters" + Clear filters |
| Offline | Point-earning at POS functions offline and reconciles on sync (per POS's model); this admin console itself is read-only cached when offline, consistent with back-office configuration modules generally |
| Permission Denied | Standard pattern; Tier configuration (§5) and Bulk Point Adjustment hidden/shown-disabled per role, per the spec's Finance-approval-gated sensitivity |
| Validation Error | Inline — e.g., Transfer Points blocked at the field if the source balance is insufficient, shown before submit attempt |
| Server Error | Inline retry, per-tab isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine actions (reward created, points adjusted); dedicated confirmation for Bulk Point Adjustment given its liability significance |

---

## 16. Responsive Design

| Breakpoint | Dashboard / Tables | Tier Config / Campaign Builder |
|---|---|---|
| Desktop/Laptop | Full tables, full Tier cards grid | Full side-drawer configuration, full Campaign trigger/action builder |
| Tablet | Priority columns + scroll | Condensed drawer, simplified builder |
| Mobile Manager View | Card-per-row stacked lists | Viewing/basic point adjustment supported; deep Tier/Campaign configuration remains Desktop/Tablet-oriented |

---

## 17. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (Tier/Rule/Campaign configuration), accessible tables, WCAG AA contrast on all tier badges and status indicators — tier color-coding always paired with the tier name as text, never color alone.

---

## 18. Figma Build Notes

- Frame: `Loyalty/Dashboard/Desktop/1440`, `Loyalty/Tiers/ConfigDrawer`, `Loyalty/Rewards/CatalogGrid`
- Tier badge component is the exact same instance/variant set built for Customer 360 ([10-customers-ui.md](10-customers-ui.md) §14) — not redefined here, just consumed
- Reward Card is a new small variant on the base Card component (`Type=Reward`), sharing anatomy with Product Cards where applicable (image + name + price/cost + status)
- Layer naming: `Loyalty/Members/Row-VIP`, `Loyalty/Tiers/Card-Gold`, `Loyalty/Rewards/Card-LimitedTime`, per convention

---

## 19. Developer Handoff Notes

- Point earning/redemption (§6/§8) must call the single shared rules-engine service specified in `11-loyalty.md` §27 — this UI never computes point math locally; it displays the engine's live-preview output during dialog entry (Adjust Points, Redeem Reward) and the committed result afterward.
- The Wallet ledger (§6's Point Ledger is points-specific; Wallet is a related but separate ledger) is the same one POS spends against and Customer 360 displays — one ledger, multiple read/write clients.
- Reward Catalog inventory-availability (§7's hide-when-out-of-stock rule) should subscribe to Inventory's stock-change events to auto-hide/restore, rather than this UI polling stock levels on every catalog render.
- Tier state changes (§5/§11) must emit one event consumed by both this module's Activity Timeline and Customer 360's Membership tab — a single write, two read projections, so they can never disagree about a member's current tier.
- Referral Fraud Flags (§10) must be an asynchronous review-queue signal, never a synchronous block on legitimate customer actions — this UI's flag indicator is informational for Customer Service/Finance review, not a gate preventing the referral from processing.

---

**Next:** 12-promotions-ui.md
