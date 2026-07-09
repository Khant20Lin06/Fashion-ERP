# Customer Loyalty & Rewards Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md), [09-sales.md](09-sales.md), [10-customers.md](10-customers.md)
**Consumed by:** POS, Sales, E-commerce, Mobile App, Marketing, Customer 360
**Scope note:** This module owns loyalty **program configuration and engines** — tiers, point rules, rewards catalog, wallet ledger, gift cards, referrals, coupons/vouchers, campaigns. [10-customers.md](10-customers.md) surfaces a given customer's current standing within these programs; this module defines the rules those standings are computed from and provides the program-wide management/analytics console.

---

## 1. Module Objective

Increase retention, purchase frequency, and average order value by rewarding loyal customers, encouraging referrals, and running structured retention campaigns — consistently across POS, Sales, E-commerce, Mobile App, and Marketing, from one rules engine.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full program configuration, financial liability oversight (points/wallet = deferred revenue) |
| Marketing Manager | Full campaign/reward/coupon configuration; no tier-value or point-rate changes without Finance sign-off |
| CRM Manager | Full member management, manual adjustments up to threshold |
| Branch Manager | Read program config; manual point/wallet adjustment for their branch's customers up to threshold |
| Cashier | Redeem points/rewards/gift cards at checkout (via POS, 04 §17) — no program configuration access |
| Customer Service | Manual adjustment (with approval above threshold), reward reissue for service recovery |
| Finance Manager | Full visibility into points/wallet/gift card liability, approves point-rate/tier-value changes |

Point/wallet/gift-card balances represent real financial liability (unredeemed value the business owes) — this is why Finance Manager has approval authority over rate/value changes, distinct from Marketing's campaign-content authority.

---

## 3. Loyalty Lifecycle

```
Customer Registration → Membership Enrollment → Earn Points → Tier Progress
→ Rewards → Redeem → Retention Campaign → VIP Membership → Renewal
```

This lifecycle is the loyalty-specific elaboration of the broader Customer Lifecycle defined in [10-customers.md](10-customers.md) §3 — Enrollment/Earn/Tier/Redeem/Renewal are the mechanics; Customers module's Lead→Reactivation stages are the higher-level narrative this module's events drive.

---

## 4. Module Structure

```
Loyalty Dashboard (§5)
↓
Loyalty Programs ──→ Membership Tiers (§6) ──→ Point Rules (§7) ──→ Point Redemption (§8)
                 ──→ Rewards Catalog (§9)
                 ──→ Wallet (§10)
                 ──→ Gift Cards (§11)
                 ──→ Referral Program (§12)
                 ──→ Coupons & Vouchers (§13)
                 ──→ Campaigns (§14)
                 ──→ Loyalty Analytics (§15)
```

A business can run multiple concurrent Loyalty Programs (e.g., a core program plus a wholesale-partner coalition program, §26) — each with its own Tier/Point Rule/Reward configuration; a customer's Customer 360 Loyalty tab (10 §11) shows their standing across whichever program(s) they're enrolled in.

---

## 5. Loyalty Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Active Members · New Members · Points Issued · Points Redeemed · Expired Points · Reward Redemptions · Referral Conversions · Wallet Balance (aggregate liability) · Gift Card Usage · Retention Rate · Repeat Purchase Rate — plus Tier Distribution (Donut, tier-colored, same palette Customer Dashboard's Membership Distribution uses, 10 §5).

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15).

---

## 6. Membership Tiers

Standard · Silver · Gold · Platinum · VIP · Custom Tiers.

Each tier configures: Benefits (free-text/structured list) · Point Multiplier (e.g., Gold earns 1.5×) · Birthday Reward (auto-granted) · Exclusive Pricing (links to Product Management's Member/VIP price fields, [05-product-management.md](05-product-management.md) §9) · Free Shipping (flag, consumed by Sales' Delivery Management, 09 §10) · Early Access (flag, consumed by Marketing's campaign targeting, module 13) · Tier Upgrade Rules (spend/points threshold, auto or requiring review) · Tier Downgrade Rules (e.g., annual re-evaluation if activity falls below threshold — configurable grace period before downgrade, since abrupt downgrades are a common member-complaint trigger).

Tier changes (auto or manual) write to the same event stream Customer 360's Membership tab reads (10 §9) — one tier-state source, two display surfaces.

---

## 7. Point Earning Rules

Configurable earning triggers: Purchase Amount (base rate, e.g., 1 point per ฿20 spent) · Product Category / Brand / Collection / Season (category-specific multipliers, e.g., double points on Outerwear during a push) · Promotion / Campaign (bonus-point campaigns, §14) · Birthday · Anniversary (membership or first-purchase anniversary) · Referral (§12) · Manual Adjustment (Customer Service correction) · Bonus Events (time-boxed, e.g., "Triple Points Weekend").

Rules are evaluated at the point of sale (POS, 04 §17, or Sales Invoice, 09 §11) — this module defines the rule set; POS/Sales are the trigger points that call into it to compute and post the earn.

---

## 8. Point Redemption

Redeemable for: Discount · Free Product · Coupon · Voucher · Gift · Store Credit · Exclusive Reward — Partial Redemption (using some but not all available points toward a purchase) and Full Redemption both supported.

**Validation:** Minimum Points (per-redemption floor, prevents micro-redemptions with high transaction overhead) · Maximum Points (per-transaction cap, where configured) · Expiration (points past their expiry are excluded from redeemable balance) · Eligibility (some rewards are tier-gated).

Redemption is a single shared service invoked from POS's checkout (04 §17), the Customer 360 Loyalty tab (10 §11, for phone-assisted service), and this module's own admin console (for manual/service-recovery reissues) — one redemption logic path, three entry points, per the rule established in Customers §27.

---

## 9. Rewards Catalog

Products (redeemable stock items — checks live Inventory availability, [07-inventory.md](07-inventory.md) §11, reserving stock like any other order) · Coupons · Gift Cards (§11) · Exclusive Offers · Experiences (non-physical, e.g., a styling session) · VIP Benefits · Limited-Time Rewards (time-boxed availability, tied to Campaigns, §14).

**Inventory Availability:** a product-reward that goes out of stock is automatically hidden/disabled from the catalog (consistent with POS's out-of-stock handling philosophy, 04 §6, but hidden here rather than shown-grayed, since a reward customers can't get is worse for goodwill than a product they can't buy) — reordering restores it automatically once stock is replenished.

---

## 10. Customer Wallet

Wallet Balance · Store Credit · Refund Credit · Top-up (customer or staff-initiated) · Manual Adjustment (with reason, approval above threshold per §24) · Transaction History · Expiration Rules (if store credit expires, configurable grace period with an advance-warning notification via Customer Communication, 10 §12).

This is the canonical wallet ledger — POS spends against it at checkout (04 §11), Sales issues refunds/credit notes into it (09 §14), and Customer 360 displays it (10 §10) — one ledger, multiple read/write clients, never a duplicated balance.

---

## 11. Gift Card Management

Physical Gift Card · Digital Gift Card — Balance Check · Recharge (top-up an existing card) · Transfer (moving balance between cards, e.g., combining two partially-used cards) · Expiration · Partial Usage (a purchase can be split across a gift card + another payment method, consistent with POS's Split Payment, 04 §11) · Gift Card History (full transaction trail per card).

Gift Cards are sold as a Gift Card **product type** (defined in [05-product-management.md](05-product-management.md) §6) — purchasing one at POS both records a sale (revenue recognition deferred until redemption, a Finance concern, module 16) and activates a new Gift Card balance record here.

---

## 12. Referral Program

Referral Code (unique per member) · Referral Link (shareable, trackable via UTM-style attribution) · Friend Registration (new customer signs up via the link/code, auto-linked as a referral) · Referral Reward (granted to referrer, and optionally referee, on the friend's first qualifying purchase — not on registration alone, to prevent reward farming) · Referral Tracking (status: Registered → Qualifying Purchase Pending → Reward Granted) · **Fraud Prevention** (rate-limiting per member, duplicate-address/device/payment-method detection flagging self-referrals for review rather than auto-blocking, since false positives frustrate legitimate customers).

---

## 13. Coupons & Vouchers

Percentage Discount · Fixed Discount · Free Shipping · Buy X Get Y · Bundle Discount · Category Discount · Brand Discount · Member-only Coupon — Usage Limits (per-customer and/or program-wide cap) · Expiration Rules.

Coupons generated here are the same entity type POS applies at checkout (04 §10) and Sales Quotations/Orders reference (09 §6/§7) — defined once, redeemed everywhere, consistent stacking-rule enforcement with Promotions (module 12) to avoid two discount systems disagreeing about what's combinable.

---

## 14. Campaigns

Birthday Campaign · Anniversary Campaign · Win-back Campaign (targets customers crossing into "Inactive" lifecycle stage, 10 §3) · Holiday Campaign · Flash Campaign · VIP Campaign · Seasonal Campaign — **Automated Campaigns** (trigger-based: lifecycle stage change, tier upgrade, points-about-to-expire, birthday window) are the primary mechanism; ad hoc manual campaigns supplement them.

Campaigns send through Customer Communication's channels and templates (10 §12) and respect Marketing Consent (10 §12) without exception — this module never bypasses consent settings even for "high-value" win-back attempts. Full multi-channel campaign orchestration/scheduling detail lives in Marketing Automation (module 13); this module triggers loyalty-specific campaigns into that shared send infrastructure rather than maintaining a separate one.

---

## 15. Loyalty Analytics

Customer Lifetime Value · Repeat Purchase Rate · Retention Rate · Tier Distribution · Points Issued · Points Redeemed · Reward Usage · Referral Performance · Campaign Performance · Churn Rate.

Shares its computation engine with Customer Analytics ([10-customers.md](10-customers.md) §15) for overlapping metrics (CLV, Retention, Churn) — this module's view emphasizes program-specific outcomes (point liability trends, reward redemption rates, referral ROI) layered on top of that shared base.

---

## 16. Search & Filter

Customer · Membership Tier · Reward · Campaign · Branch · Status · Point Balance · Wallet Balance · Date Range — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 17. Bulk Operations

Bulk Point Adjustment · Bulk Membership Upgrade · Bulk Reward Assignment · Bulk Campaign Enrollment · Bulk Coupon Generation · Bulk Export — same preview-before-commit rule as every other bulk action platform-wide; Bulk Point Adjustment specifically requires Finance Manager approval above a configurable aggregate-value threshold (§24), since it directly affects the program's outstanding liability.

---

## 18. Activity Timeline

Points Earned · Points Redeemed · Membership Upgraded · Reward Redeemed · Wallet Updated · Gift Card Used · Referral Completed · Campaign Triggered — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 19. Audit Log

User · Action · Timestamp · Old Value · New Value · Reference Document — generated from the same event stream as §18, restricted to management/finance roles.

---

## 20. Validation

| Rule | Behavior |
|---|---|
| Duplicate Membership | Hard-blocked — one active membership per customer per program |
| Invalid Reward | Blocked if the reward is expired, out of stock (§9), or tier-ineligible |
| Expired Points | Excluded from redeemable balance automatically; a redemption attempt using them is blocked with a clear "these points have expired" message, not a silent partial-fail |
| Expired Coupon | Blocked at redemption, consistent with the Expired Quotation handling pattern in Sales (09 §21) |
| Insufficient Points | Blocked, with the shortfall shown ("need 120 more points") rather than a generic error |
| Gift Card Balance | Blocked if redemption/spend exceeds remaining balance; partial-balance spend auto-splits to another payment method at POS (§11) |
| Eligibility Rules | Tier-gating and program-membership checks enforced at redemption time, not just catalog display time (defense against a stale cached catalog showing an ineligible reward as available) |

---

## 21. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Loyalty Members | New program launch: icon + "No members enrolled yet" + "Enroll your first member" CTA |
| No Rewards | "Rewards catalog is empty" + "Add a reward" CTA, distinct from all-rewards-currently-ineligible (which instead shows the rewards grayed with eligibility reasons) |
| No Campaigns | Neutral, common before a program's first campaign is configured |
| Offline | Point-earning at POS still functions offline (queues per POS's offline model, 04 §15) and reconciles on sync; redemption of high-value rewards may be configured to require online validation to prevent double-spend across offline registers |
| Permission Denied | Standard Navigation §19 pattern |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Retry | Consistent retry affordance throughout |

---

## 22. Responsive Design

| Breakpoint | Program Config / Lists | Redemption Flows |
|---|---|---|
| Desktop/Laptop | Full tables, side-by-side tier/rule configuration | Full forms |
| Tablet | Priority columns + scroll | Redemption at POS is the primary tablet flow — reuses POS's touch-target rules (04 §22) since this is executed at the register, not administered here |
| Mobile | Card-per-row stacked lists | Redemption via Mobile App (module 24) reuses this module's redemption service, not a separate implementation |

---

## 23. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels, accessible forms (tier/rule/campaign configuration), accessible tables, WCAG AA contrast on all tier badges and status indicators.

---

## 24. Security

Role Permission per §2. **Reward Approval:** high-value reward redemptions or catalog additions above a configurable value threshold require Marketing Manager/Finance sign-off. **Manual Adjustment Approval:** point/wallet manual adjustments above threshold require approval — reuses the shared Manager Override component pattern established across POS/Product Management/Inventory/Purchase/Sales (04 §24, 05 §23, 07 §24, 08 §25, 09 §25), parameterized for the loyalty-adjustment context. **Audit Trail:** immutable, per §19. **Sensitive Action Confirmation:** required for Bulk Point Adjustment (§17), tier-value/point-rate changes, and gift card balance transfers (§11). **Fraud Detection:** applied to Referral (§12) and unusually rapid point-earn/redeem patterns (e.g., a compromised account rapidly draining points), flagging for review rather than auto-blocking to avoid false-positive customer friction.

---

## 25. Performance

Optimized for millions of members and millions of point transactions: list/ledger views virtualize rows, search is server-side indexed, server-side pagination throughout, point-balance and tier-status lookups are optimized for POS's real-time checkout usage (must resolve as fast as POS's other checkout-time lookups, 04 §25) rather than requiring a slow aggregation query at the register.

---

## 26. Advanced Enterprise Features

Multi-brand Loyalty (one program spanning several store brands under the same parent company) · Multi-country Loyalty (currency/tax-aware point valuation) · Coalition Loyalty Programs (shared program across partner businesses, e.g., a mall-wide points system) · Tier Expiration (§6) · Tier Challenges / Gamification / Achievements / Badges / Punch Cards (engagement mechanics beyond pure points) · Cashback Programs · Family Accounts (shared points pool, ties into Customers' Household Accounts, 10 §26) · Corporate Loyalty (ties into Customers' Corporate Customers, 10 §26) · Partner Rewards (redeeming points with an external partner brand) · AI Reward Recommendations · AI Churn Prediction (shared engine with Customers §15/§26) · Next Best Reward (module 25 integration, surfaced in POS's Customer Panel, 04 §9, and Customer Communication, 10 §12).

These layer onto the core program (§6–§14) as opt-in capability, consistent with the platform-wide "advanced features are additive" principle (established in Sales 09 §27 and Customers 10 §26) — a single-brand retailer runs Tiers/Points/Rewards/Coupons/Campaigns without ever touching Coalition/Multi-brand/Multi-country configuration.

---

## 27. Developer Implementation Notes

- Point earning (§7) and redemption (§8) must be one shared rules-engine service, invoked identically from POS (04 §17), Sales Invoice posting (09 §11), and this module's admin console — never three separate implementations of "how many points does this purchase earn."
- The Wallet ledger (§10) is the single source POS (04 §11), Sales refunds/credit notes (09 §14), and Customer 360 (10 §10) all read/write against — implement as one ledger table with a typed transaction reason (Top-up, Spend, Refund, Adjustment, Expiration), never per-module balance caches that require reconciliation.
- Tier state (§6) changes should emit one event consumed by both this module's Activity Timeline (§18) and Customer 360's Membership tab (10 §9) — a single write, two read projections, guaranteeing they can't disagree.
- Reward Catalog inventory-availability (§9) should subscribe to Inventory's stock-change events ([07-inventory.md](07-inventory.md) §16's alert mechanism) to auto-hide/restore rewards, rather than polling stock levels on every catalog page load.
- Coupons/Vouchers (§13) must share one stacking-rule/eligibility validator with Promotions (module 12) — implement as a single discount-eligibility service both modules call, so a customer never encounters a coupon and a promotion silently disagreeing about whether they combine.
- Fraud Detection (§24) for referrals and rapid point-drain should run as an asynchronous flagging job (review queue for Customer Service/Finance), never a synchronous block that could deny a legitimate customer's redemption at the point of sale.

---

**Next:** 12-promotions.md
