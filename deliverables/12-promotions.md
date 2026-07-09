# Promotion & Pricing Rule Engine Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md), [09-sales.md](09-sales.md), [10-customers.md](10-customers.md), [11-loyalty.md](11-loyalty.md)
**Consumed by:** POS, Sales, E-commerce, Mobile App, Marketplace, Loyalty, CRM, Marketing Automation
**Scope note:** This module is the single authoritative pricing/discount-eligibility engine for the platform. Loyalty's Coupons & Vouchers ([11-loyalty.md](11-loyalty.md) §13) and POS's Promotions handling ([04-pos.md](04-pos.md) §10) both call into this engine rather than maintaining separate discount logic — this is the shared service flagged as required in those modules' developer notes.

---

## 1. Module Objective

Increase revenue, average order value, and conversion while automating promotional pricing across every channel — POS, Sales, E-commerce, Mobile App, Marketplace — from one rule engine, so a discount behaves identically no matter where a customer encounters it.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full configuration, all approval tiers |
| Marketing Manager | Full campaign/promotion configuration; margin-impact review required above threshold |
| Promotion Manager | Full rule configuration, coupon/voucher/bundle management |
| CRM Manager | Personalized/segment-targeted promotion configuration (works with Customer Segmentation, 10 §14) |
| Sales Manager | Read all; request/apply Manual Discount within their approval tier (09 §25) |
| Branch Manager | Branch-scoped promotion visibility; local flash-sale creation within policy limits |
| Finance Manager | Margin/ROI oversight, approves promotions with projected margin impact above threshold |

---

## 3. Promotion Lifecycle

```
Promotion Planning → Rule Configuration → Approval → Scheduling → Activation
→ Real-time Validation → Customer Redemption → Performance Tracking
→ Expiration → Archive
```

**Approval** is a distinct gate before Scheduling — any promotion projected to exceed a margin-impact or discount-depth threshold (§25) requires Finance/Marketing Manager sign-off before it can even be scheduled, preventing an aggressive rule from going live and only being caught after the fact.

---

## 4. Module Structure

```
Promotion Dashboard (§5)
↓
Promotion Rules (§6–§8) ──→ Coupons (§9)
                        ──→ Vouchers (§10)
                        ──→ Bundles (§11)
                        ──→ Member Pricing (§12)
                        ──→ Price Lists (§13)
                        ──→ Campaign Pricing / Scheduling (§14)
↓
Promotion Priority & Stacking (§15)
↓
Promotion Analytics (§16)
```

---

## 5. Promotion Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Active Promotions · Scheduled Promotions · Expired Promotions · Coupon Usage · Voucher Usage · Promotion Revenue · Average Discount · Redemption Rate · ROI — plus Top Promotions (ranked) and Campaign Performance (trend).

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15).

---

## 6. Promotion Rules — Types

Percentage Discount · Fixed Amount Discount · Buy X Get Y · Buy X Get X (repeat-item variant) · Mix & Match (discount across a defined product group regardless of specific SKU combination) · Bundle Discount (§11) · Category / Brand / Collection / Season Discount · Tier Pricing (quantity-tiered, e.g., 10% off 2+, 20% off 5+) · Volume Pricing · Spend & Save (e.g., "spend ฿2,000, get ฿200 off") · Gift With Purchase · Free Shipping · Manual Discount (cashier/salesperson-applied, within their authorized tier per POS §24/Sales §25) · Automatic Discount (system-applied, no code/action needed).

Each rule is built via a structured rule builder (condition → action pairing, §7/§8), not free-text logic — ensuring every rule is simulatable (§27) and auditable.

---

## 7. Rule Conditions

Product · Variant · Brand · Category · Collection · Season · Gender · Color · Size · Warehouse · Branch · Customer · Membership Tier · Customer Segment (10 §14) · Sales Channel · Order Amount · Order Quantity · Payment Method · Day of Week · Time Range · Holiday · Birthday · Anniversary · Referral · Coupon Code.

Conditions combine with AND/OR grouping (visual rule-builder, similar interaction pattern to Advanced Filter's chip system, e.g., 05 §15) — a rule can require ALL of {Category=Outerwear, Branch=Flagship} AND ANY of {Tier=Gold, Tier=Platinum}.

---

## 8. Rule Actions

Apply Percentage Discount · Apply Fixed Discount · Apply Bundle Price · Add Free Product · Issue Coupon · Issue Voucher · Award Loyalty Points (calls into Loyalty's earning engine, [11-loyalty.md](11-loyalty.md) §7, as a bonus multiplier rather than a separate point calculation) · Award Cashback (Loyalty's Wallet, 11 §10) · Apply Free Shipping · Unlock VIP Offer.

A single rule can chain multiple actions (e.g., "20% off AND award double points") — actions execute atomically with the triggering transaction, never as a separate follow-up step that could be missed if a session ends early.

---

## 9. Coupon Management

Single-use Coupon · Multi-use Coupon · Unique Coupon (one code per customer, e.g., a personalized win-back offer) · Bulk Coupon Generation · QR Coupon · Barcode Coupon (both scannable at POS, reusing the exact scan-to-apply interaction from [04-pos.md](04-pos.md) §5) · Coupon Prefix (for tracking which channel/campaign issued a code, e.g., `SUMMER-XXXXXX`) · Coupon Expiration · Coupon Usage Limits (per-code and per-customer) · Coupon Validation (real-time — code existence, expiry, usage limit, eligibility all checked at the moment of application, not just at generation).

**This is the same coupon entity Loyalty references** ([11-loyalty.md](11-loyalty.md) §13) — coupons are created and ruled here; Loyalty's redemption UI and POS's application UI both call this module's validation service rather than each re-implementing coupon rules.

---

## 10. Voucher Management

Gift Voucher · Cash Voucher · Discount Voucher · Promotional Voucher · Digital Voucher · Printed Voucher — Voucher Balance · Voucher History.

Vouchers with a stored monetary balance (Gift/Cash Voucher) share the same balance-ledger mechanics as Loyalty's Gift Cards (11 §11) — same partial-usage/split-payment support at POS (04 §11) — implemented as the same underlying "stored value instrument" concept, differentiated by issuance context (promotional giveaway vs. purchased gift card) rather than by separate code paths.

---

## 11. Bundle Management

Product Bundle · Mix & Match (§6) · Complete Look (fashion-specific: a curated outfit bundle spanning categories, e.g., top + bottom + accessory at a bundle price) · Cross Sell Bundle · Upsell Bundle · Season Bundle · Gift Bundle.

Bundle composition references live product/variant data from Product Management ([05-product-management.md](05-product-management.md) §6's Bundle product type) — this module defines the *pricing rule* for a bundle; the bundle's product membership itself is a Product Management concern, avoiding two places that define "what's in this bundle."

---

## 12. Member Pricing

Retail Price · Member Price · Silver / Gold / VIP Price · Wholesale Price · Corporate Price.

These tiers are the same price fields defined in [05-product-management.md](05-product-management.md) §9 — this module's Member Pricing section is where the *tier-to-price-field mapping rule* lives (e.g., "Gold tier customers see the Gold Price field"), not a duplicate pricing data store. A customer's applicable tier price is resolved by cross-referencing Loyalty's tier assignment (11 §6) against the product's price fields at the moment of sale.

---

## 13. Price List Management

Default Price List · Branch Price List · Channel Price List (POS vs. E-commerce vs. Wholesale may each have distinct pricing) · Seasonal Price List · Campaign Price List · Multi-Currency Price List.

Price Lists are a layering mechanism — a product's effective price at any moment resolves through an ordered stack (Default → Branch override → Channel override → Seasonal/Campaign override → Member tier, §12) with the most specific applicable list winning, following the same priority-resolution philosophy as promotion stacking (§15).

---

## 14. Campaign Scheduling

Immediate · Scheduled (future start) · Recurring (e.g., every weekend) · Holiday Campaign · Flash Sale (time-boxed, often hours not days — surfaces a live countdown in POS/E-commerce) · Weekend Promotion · Birthday Campaign · Anniversary Campaign (both reusing Loyalty's birthday/anniversary trigger data, 11 §7, rather than duplicating date tracking) · Season Launch · End of Season Sale.

Scheduling integrates with Marketing Automation's (module 13) broader campaign orchestration for the communication side (announcing the promotion) — this module handles the *pricing mechanics* of the campaign; module 13 handles the *messaging*.

---

## 15. Promotion Priority & Conflict Resolution

Configurable priority ranking across simultaneously-eligible promotions, resolved by: **Priority** (explicit rank order) → **Best Discount** (auto-select the option most favorable to the customer, common default) → **First Match** (first rule in evaluation order wins) → **Stacking Rules** (which combinations are explicitly permitted to combine) → **Exclusive Promotions** (flagged to never combine with anything else) → **Non-stackable Rules** (the default for most promotions unless explicitly marked stackable, preventing accidental over-discounting).

This resolution logic is exactly what POS's Promotions section describes narratively ([04-pos.md](04-pos.md) §10: "Already applying Member Pricing — higher discount kept automatically") — this module is where that behavior is formally defined and computed; POS merely displays the engine's outcome.

---

## 16. Promotion Analytics

Promotion Revenue · Promotion Cost (total discount value given) · Promotion ROI · Coupon Redemption · Voucher Redemption · Average Discount · Campaign Conversion · Upsell Rate · Cross Sell Rate · Repeat Purchase (post-promotion).

Reuses Dashboard/Sales Analytics chart components (03 §15, 09 §15) — Promotion Cost and ROI specifically feed Finance's margin reporting (module 16) so a "successful" high-redemption promotion that erodes margin is visible as a trade-off, not just celebrated for volume.

---

## 17. Search & Filter

Promotion Name · Promotion Type · Status · Branch · Sales Channel · Customer Segment · Coupon Code · Date Range — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 18. Bulk Operations

Bulk Create · Bulk Activate · Bulk Deactivate · Bulk Delete · Bulk Coupon Generation · Bulk Voucher Generation · Bulk Export — same preview-before-commit rule as every other bulk action platform-wide; Bulk Delete restricted to promotions with zero redemption history (Bulk Deactivate/Archive preferred otherwise, consistent with the Archive-over-Delete principle established since Navigation §16).

---

## 19. Activity Timeline

Promotion Created · Rule Updated · Promotion Activated · Coupon Generated · Voucher Redeemed · Campaign Started · Campaign Ended — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 20. Audit Log

User · Action · Timestamp · Old Value · New Value · Approval Status — generated from the same event stream as §19, restricted to management/finance roles.

---

## 21. Validation

| Rule | Behavior |
|---|---|
| Duplicate Promotion | Warns if a near-identical active rule already exists (same conditions/actions), not a hard block |
| Invalid Date Range | Hard-blocked — end date must be after start date, and Scheduling (§14) blocks a start date in the past |
| Expired Promotion | Auto-deactivates at expiry; a manual attempt to reactivate an expired promotion routes through re-approval (§3), not a silent re-enable |
| Coupon Limit | Blocked at redemption once usage limit reached, with a clear "this code has reached its usage limit" message |
| Voucher Balance | Blocked/partial-split at redemption if balance insufficient, consistent with Loyalty's Gift Card balance handling (11 §20) |
| Stacking Conflict | Resolved automatically per §15's priority rules — surfaced to the configuring user at rule-creation time as a warning if the new rule conflicts with an existing active one ("This overlaps with 'Summer Sale' — Best Discount will apply") |
| Pricing Conflict | Same resolution as Stacking Conflict, applied to Price List layering (§13) — the most specific applicable list wins, with the resolution path visible in a debug/preview view for the configuring user |

---

## 22. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Promotions | New tenant: icon + "No promotions yet" + "Create your first promotion" CTA |
| No Coupons | Neutral, common before a coupon-based campaign is configured |
| No Campaigns | Neutral, distinct from an error |
| Offline | Automatic/eligible promotions still apply at POS using the last-synced rule set (04 §15's offline model) — a rule change made moments ago on another register may not yet be reflected; this is a known, bounded staleness window, not a failure |
| Permission Denied | Standard Navigation §19 pattern |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Retry | Consistent retry affordance throughout |

---

## 23. Responsive Design

| Breakpoint | Rule Builder / Lists | Redemption (at POS/E-commerce) |
|---|---|---|
| Desktop/Laptop | Full rule-builder canvas (condition/action tree), full tables | N/A — redemption UI lives in POS/Sales, not here |
| Tablet | Condensed rule-builder (stacked condition/action cards instead of side-by-side tree) | N/A |
| Mobile | Single-column, simplified rule creation (advanced multi-condition rules best built on larger screens; mobile supports viewing/activating/deactivating) | N/A |

This module is primarily a back-office configuration console — the customer/cashier-facing redemption experience is specified in POS (04 §10) and Sales (09), not duplicated here.

---

## 24. Accessibility

Standard platform baseline: keyboard navigation through the rule-builder's condition/action tree, visible focus, screen reader labels (especially on the visual rule-builder's drag/connector interactions — must have an equivalent keyboard-operable add/remove-condition flow), accessible forms, accessible tables, WCAG AA contrast on all status badges (Active/Scheduled/Expired).

---

## 25. Security

Role Permission per §2. **Promotion Approval:** required above a configurable discount-depth or projected-margin-impact threshold before Scheduling (§3) — reuses the shared Manager Override/Approval component pattern established across POS/Product Management/Inventory/Purchase/Sales/Loyalty. **Price Override Approval:** for Manual Discounts applied at POS/Sales beyond the cashier/salesperson's tier, validated against this module's configured limits. **Audit Trail:** immutable, per §20. **Sensitive Action Confirmation:** required for Bulk Delete/Deactivate of active promotions and any rule change affecting already-scheduled campaigns.

---

## 26. Performance

Optimized for millions of promotion evaluations and real-time rule execution: the eligibility/stacking engine must resolve within POS's checkout-speed budget (consistent with the <100ms/<500ms targets in [04-pos.md](04-pos.md) §25) — achieved via a compiled/indexed rule set per channel-branch context (not re-evaluating every active promotion's full condition tree from scratch on every cart change), server-side indexed search for the admin console, virtualized tables, lazy loading.

---

## 27. Advanced Enterprise Features

**Promotion Stacking Engine** (§15's formal implementation) · **Promotion Simulator** (a "what would this rule do" preview — run a hypothetical cart/customer through the rule set before activating, catching unintended interactions before they reach real customers) · **Rule Conflict Detection** (proactive, surfaced at configuration time per §21) · AI Promotion Recommendations · AI Dynamic Pricing · Personalized Promotions (per-customer, via Segmentation 10 §14 and AI Analytics module 25) · Geo-based Promotions · Omnichannel Promotions · Marketplace Promotions · **A/B Promotion Testing** (splitting eligible customers between rule variants, measuring lift via §16's analytics) · Customer-specific Pricing · Promotion API · Promotion Webhooks (for external system integration, e.g., a marketplace channel needing to know current active discounts).

The Promotion Simulator specifically is called out as high-value given how costly a mis-configured stacking rule can be at scale (an unintended 90% discount reaching thousands of transactions before being caught) — it should be treated as a required step in the Approval gate (§3) for any promotion above the margin-impact threshold, not merely an optional tool.

---

## 28. Developer Implementation Notes

- This module's eligibility/stacking resolution (§15) must be exposed as a single callable service — POS (04 §10), Sales (09), Loyalty's coupon redemption (11 §8/§13), and E-commerce all call it, none reimplement discount logic locally. This closes the shared-service requirement flagged in both POS's and Loyalty's own developer notes.
- Price List resolution (§13) and Promotion stacking (§15) should share one "effective price" computation pipeline — a cart line's final price is the output of one deterministic function (base price → price list layers → promotion actions → member tier), never computed by different logic in POS vs. E-commerce vs. Sales.
- Coupons (§9) and Vouchers (§10) as "stored value / redeemable code" entities should share a base schema with Loyalty's Gift Cards (11 §11) where mechanically identical (balance, partial-usage, expiry), differentiated by an issuance-context field rather than parallel implementations.
- The Promotion Simulator (§27) should run against the exact same resolution engine used in production (§15/§28's first point) — a simulator that uses separate/simplified logic would give false confidence, defeating its purpose.
- Real-time rule execution (§26) should precompute/cache a channel-and-branch-scoped "active rule set" that updates on rule change events, rather than querying and evaluating the full promotions table per checkout — critical for meeting POS's checkout-speed budget under high transaction volume.

---

**Next:** 13-marketing-automation.md
