# Customer Management & Customer 360 Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md), [09-sales.md](09-sales.md)
**Consumed by:** POS, Sales, Loyalty, Marketing, Finance, E-commerce, AI Analytics
**Scope note:** This module is the master source of customer identity, contact, addresses, segmentation, and the 360° record. Loyalty **program configuration** (tiers, point rules, rewards catalog, gift cards, referrals, coupons, campaigns) is owned by **11-loyalty.md** — this module surfaces a customer's current standing within those programs (read + earn/redeem-in-context), not the program rules themselves.

---

## 1. Module Objective

One master record per customer — identity, segments, membership standing, purchase history, communications, wallet/credit, addresses, preferences, credit limit, analytics, lifecycle stage — read and written consistently by every module that touches a customer, so a phone number typo fixed here is fixed everywhere.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, PII export, merge/delete |
| Sales Manager | Full read/write on assigned accounts, credit limit view |
| Sales Executive | Full read/write on own customers, no credit limit edit |
| Cashier | Search/create/quick-view only (mirrors POS §9's Customer Panel) — no edit of financial fields |
| Customer Service | Full read, edit Notes/Addresses/Communication, initiate Returns (routes to Sales module 09) |
| Marketing Team | Read all; edit Segments, Tags, Marketing Consent, Communication preferences |
| Finance Manager | Full read, edit Credit Limit, Wallet/Store Credit adjustments |
| Branch Manager | Branch-scoped read/write |

PII fields (full address, ID/tax numbers, payment tokens) are masked by default for roles without explicit PII access (§24) — visible only on deliberate reveal action, which itself logs to the Audit Log (§19).

---

## 3. Customer Lifecycle

```
Lead → Customer Registration → Verification → Membership → Purchases
→ Loyalty Growth → Retention Campaign → VIP Customer
→ Inactive Customer → Reactivation
```

Lifecycle stage is a computed/displayed status (driven by purchase recency/frequency and membership tier from Loyalty, module 11), not a manually-set field — it's a diagnostic label, and Retention/Reactivation campaign triggers (module 11 §14) key off it automatically.

---

## 4. Module Structure

```
Customer Dashboard (§5)
↓
Customer List (§6) ──→ Customer Detail / Customer 360 (§7)
                              ↓
                    Addresses (§8) · Membership (§9, summary)
                    Wallet & Store Credit (§10, summary) · Loyalty (§11, summary)
                    Communication (§12) · Purchase History (§13)
                    Segmentation (§14) · Analytics (§15)
```

---

## 5. Customer Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Total Customers · New Customers · Returning Customers · Active Customers · Inactive Customers · VIP Customers · Customer Lifetime Value (avg) · Average Purchase Value · Repeat Purchase Rate — plus Membership Distribution (Donut, tier-colored consistent with Loyalty's tier palette, 11 §6), Top Customers (ranked list), Birthday Customers (this week/month, actionable — links to Communication §12 for a birthday outreach).

Reuses Dashboard KPI Card and chart components verbatim (03 §6/§15) — a module-scoped rollup, not a new widget system.

---

## 6. Customer List

Enterprise data table (Design System §12): Profile Photo · Customer ID · Customer Name · Email · Phone · Membership (tier badge) · Wallet Balance · Store Credit · Loyalty Points · Credit Limit · Total Purchases · Last Purchase · Status · Branch · Created Date.

Toolbar: Search (name/phone/email/Customer ID/membership card) · Advanced Filter (§16) · Sort · Pagination · Saved Views · Column Visibility · Bulk Actions (§17) · Export · Print — the standard platform table toolbar (05 §5, 07 §5).

Row click → Customer 360 (§7). Row hover quick-actions: View, Edit, "New Sale" (deep-links to POS with this customer pre-attached, per [04-pos.md](04-pos.md) §9).

---

## 7. Customer 360 Profile

Standard app shell + Summary Header + Tabs pattern, structurally identical to Product Detail ([06-product-detail.md](06-product-detail.md) §3) applied to a customer record:

**Summary Header:** Profile Image · Name · Customer ID · Membership tier badge · Contact info (phone/email, click-to-call/email) · Lifecycle stage badge (§3) · Quick stats (Total Purchases, Last Purchase date, Outstanding Balance).

**Tabs:** Overview (Basic Information, Marketing Consent, Notes, Tags, Documents) · Addresses (§8) · Membership (§9) · Wallet & Store Credit (§10) · Loyalty (§11) · Purchase History (§13, includes Sales Orders/POS Transactions/Returns/Invoices) · Communication (§12) · Analytics (per-customer view of §15's metrics, scoped to this individual).

Same tab-overflow, lazy-load-per-tab, and sticky-condensing-header behavior established in Product Detail (06 §6/§27) — reused pattern, not reinvented for customers.

---

## 8. Customer Addresses

Billing Address · Shipping Address · Multiple Addresses (labeled, e.g., "Home," "Office," "Gift Recipient") · Default Address (per type) · Map Location (pin, for delivery routing) · Address Validation (format/postal-code check against a reference service, inline at entry — catches typos before they cause a failed delivery in Sales module 09's Delivery Management, 09 §10).

---

## 9. Membership (Customer-Level View)

Displays this customer's current tier (Standard/Silver/Gold/Platinum/VIP/custom, per [11-loyalty.md](11-loyalty.md) §6), tier progress (points/spend toward next tier), membership expiry/renewal date, and history of tier changes (Automatic Upgrade vs. Manual Upgrade, with the approving user if manual).

Manual tier override (Customer Service/Sales Manager action) is available here for exception handling (e.g., goodwill upgrade) but writes back into the same tier-change event stream Loyalty's engine manages — this tab never maintains a separate tier value from module 11's source of truth.

---

## 10. Wallet & Store Credit (Customer-Level View)

Wallet Balance · Store Credit · Refund Credit · Transaction History (all top-ups, spends, adjustments, expirations for this customer) — Top-up and Manual Adjustment actions available here (Finance Manager/Cashier-with-limit, per §2), writing to the same wallet ledger [11-loyalty.md](11-loyalty.md) §10 defines and POS ([04-pos.md](04-pos.md) §11) spends against at checkout.

One wallet ledger, three consumption points (this profile view, POS payment, Loyalty's program-level reporting) — never three separate balances that could drift.

---

## 11. Customer Loyalty (Customer-Level View)

Current Points · Earned Points (recent) · Redeemed Points (recent) · Available Rewards (eligible from [11-loyalty.md](11-loyalty.md) §9's catalog, given this customer's tier/points) · Reward History · Point Expiration (upcoming, surfaced as a nudge — "500 points expire in 14 days") · Tier Progress (duplicated from §9 for at-a-glance convenience within this tab).

Redemption actions here (Customer Service assisting a customer by phone, for instance) invoke the same redemption flow/validation as POS (04 §17) and the Loyalty module's own redemption UI (11 §8) — one redemption service, multiple entry points.

---

## 12. Customer Communication

Tracked channels: Email · SMS · Push Notification · Phone Call (logged manually by Customer Service) · WhatsApp/LINE (optional, region-dependent).

Templates (shared library, also used by Sales' Payment Reminders, 09 §18, and Loyalty's Campaigns, 11 §14) · Campaign History (which marketing campaigns this customer received, cross-referenced from module 13) · Communication Timeline (chronological, all channels merged into one view — this is the canonical place to see "everything we've sent/said to this customer," regardless of which module triggered it).

Marketing Consent (opt-in/out per channel, required for compliance) is edited here and respected by every sending module (Sales reminders, Loyalty campaigns, Marketing module 13) — consent is checked once, centrally, not re-implemented per sender.

---

## 13. Purchase History

POS Sales · Sales Orders · Invoices · Payments · Returns · Exchanges — unified chronological view pulling from POS (04) and Sales (09) transaction records (this tab is a read view, not a duplicate store, per the platform-wide rule established in Product Detail §29 and Inventory §26). Favorite Products and Most Purchased Categories computed from this same history, surfaced as ranked mini-lists — also the source for Cross-Sell/Upsell suggestions ([05-product-management.md](05-product-management.md) §17) and POS's Customer Panel purchase-history summary (04 §9).

---

## 14. Customer Segmentation

Segments: VIP · Wholesale · Retail · Online · Inactive · High Value · Frequent Buyers · Birthday · Custom Tags.

Segments are computed (rule-based, e.g., "High Value = lifetime spend > X") or manually tagged, and are the shared targeting mechanism consumed by Marketing (module 13) and Loyalty Campaigns (11 §14) — defined once here, not redefined per consuming module. A customer can belong to multiple segments simultaneously; segment membership changes are logged to the Activity Timeline (§18) since they often drive automated campaign triggers.

---

## 15. Customer Analytics

Customer Lifetime Value (CLV) · Average Order Value · Purchase Frequency · Retention Rate · Churn Risk (score, from AI Analytics module 25) · **RFM (Recency-Frequency-Monetary)** analysis (scatter/quadrant visualization, standard retail segmentation technique) · Top Spending Customers · Geographic Distribution (map, from Address data §8) · Membership Growth (trend, tier distribution over time).

Module-level view here is the aggregate/cohort analysis; the per-customer Analytics tab (§7) is this same metric set scoped to one individual — one computation engine, two display granularities.

---

## 16. Search & Filter

Customer Name · Phone · Email · Membership · Branch · Status · Birthday (month/range) · Wallet Balance · Loyalty Tier · Date Range — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 17. Bulk Operations

Bulk Import · Bulk Export · Bulk Update · Bulk Tag · Bulk Membership Update · Bulk Communication (e.g., sending a templated message to a filtered segment) · **Bulk Delete (Permission Controlled)** — restricted to Super Admin/Owner and only permitted for customers with zero transaction history (mirrors the Bulk Delete restriction pattern from Product Management, 05 §13); customers with history use Bulk Status Update → Inactive/Archived instead, preserving Sales/Finance reporting integrity.

Same preview-before-commit rule as every other bulk action platform-wide.

---

## 18. Activity Timeline

Customer Created · Profile Updated · Membership Changed · Wallet Updated · Points Earned · Points Redeemed · Purchase Completed · Return Processed · Campaign Sent — same human-readable actor+timestamp+link pattern used throughout (03 §13, 06 §20, 07 §19, 08 §19, 09 §19).

---

## 19. Audit Log

User · Action · Timestamp · Old Value · New Value · Reference Document — generated from the same event stream as §18, restricted per §2's PII-access rule; PII field reveals (§2) are themselves logged here.

---

## 20. Validation

| Rule | Behavior |
|---|---|
| Duplicate Email | Warns with a link to the existing record (likely the same person registering twice), not a hard block — some households share an email deliberately |
| Duplicate Phone | Same treatment as Email — phone is the primary POS lookup key (04 §9), so a near-duplicate is surfaced prominently |
| Duplicate Membership ID | Hard-blocked — membership IDs must be unique |
| Credit Limit | Enforced at the point of use (Sales Order confirmation, 09 §21), not at profile save — a profile can record a limit of any value; exceeding it is what's blocked downstream |
| Required Fields | Name + one contact method (phone or email) minimum to create a record; full profile can be completed later |
| Address Format | Inline validation (§8) against postal/regional format rules |

---

## 21. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table (List) / skeleton Summary Header + tab content (360 Profile) |
| Skeleton | Shape-matched per view |
| No Customers | New tenant: icon + "No customers yet" + "Add your first customer" / "Import customers" CTAs |
| No Purchase History | Neutral, common for a newly registered customer |
| No Loyalty Activity | Neutral, distinct from an error — most new members haven't earned/redeemed yet |
| Offline | Cached read view on store devices (Cashier searching a customer, per POS §9), consistent with the offline-cache pattern established there; profile edits queue |
| Permission Denied | Standard Navigation §19 pattern; PII fields masked per §2 rather than the whole record being hidden |
| Server Error | Inline retry, per-tab isolation on the 360 Profile (mirrors Product Detail §24) |
| Retry | Consistent retry affordance throughout |

---

## 22. Responsive Design

| Breakpoint | List | Customer 360 |
|---|---|---|
| Desktop/Laptop | Full table | Full two-column Summary Header + full tab bar |
| Tablet | Priority columns + scroll | Condensed header, scrollable tab strip (mirrors Product Detail §25) |
| Mobile | Card-per-customer stacked list | Slim sticky header, tabs become a dropdown selector |

---

## 23. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels (especially click-to-call/email actions and PII-reveal toggles), accessible forms (Address/Profile edit), accessible tables (List, Purchase History, Transaction History), WCAG AA contrast on all tier/status badges.

---

## 24. Security

Role Permission per §2. **PII Protection:** default-masked sensitive fields with an explicit, audit-logged reveal action (§2/§19) — never displayed in plaintext in list exports by default (Export respects the same masking unless the exporting role has explicit PII access). **Audit Trail:** immutable, per §19. **Sensitive Action Confirmation:** required for Bulk Delete (§17), Customer Merge (§26), and Credit Limit changes. **Customer Data Access Control:** branch-scoped visibility for Branch Manager/Sales Executive roles (§2) — a customer registered at Branch A is still visible platform-wide for service continuity, but "owned" (default salesperson attribution) by Branch A unless reassigned.

---

## 25. Performance

Optimized for millions of customer records: List virtualizes rows, search is server-side indexed (phone/email lookup must be near-instant given POS's checkout-time usage, 04 §9), server-side pagination throughout, Customer Analytics (§15) aggregates via precomputed rollups (CLV/RFM/Churn Risk are expensive computations run as background jobs, not on-demand per page load).

---

## 26. Advanced Enterprise Features

Customer Merge (combining duplicate records — preserves full transaction/communication history from both, with a clear before/after preview and an undo window, given how destructive an incorrect merge would be) · Duplicate Detection (proactive, fuzzy-matching name+phone+email, surfaced as a suggestion rather than auto-merging) · Household Accounts (linking related individual customers, e.g., family members sharing a loyalty benefit) · Corporate Customers (a business entity as the customer record, with Multiple Contacts underneath it — ties into Sales' Corporate Accounts, 09 §27) · Customer Credit Account (the profile-level counterpart to Sales' Credit Limit enforcement, 09 §21/§25) · Marketing Preferences & Consent Management (§12) · AI Customer Segmentation (module 25, feeds §14) · AI Product Recommendations (module 25, feeds §13's cross-sell) · Churn Prediction (§15) · Next Best Offer (module 25, surfaced in POS's Customer Panel and Communication §12 as an actionable suggestion).

These layer onto the core profile (§7) as opt-in capability — a small single-branch retailer operates with none of Household Accounts/Corporate Customers/Coalition-style features enabled, consistent with the platform-wide "advanced features are additive" principle established in Sales (09 §27).

---

## 27. Developer Implementation Notes

- Wallet/Store Credit (§10), Loyalty points/tiers (§11), and Purchase History (§13) must all be *views* into Loyalty's (module 11) and Sales/POS's (09/04) own ledgers — this module holds customer identity and reads everything transactional, never duplicating those write paths, exactly matching the read/write ownership discipline established between Product Detail and Inventory (06/07).
- Segmentation (§14) should be a rules-engine output (computed segments) plus a manual-tag overlay, exposed as one unified "segments" field to Marketing (13) and Loyalty (11) consumers — they shouldn't need to know which segments are computed vs. manual.
- Communication Timeline (§12) should aggregate from each sending module's own send-log (Sales reminders, Loyalty campaigns, Marketing blasts) rather than requiring every module to write into a shared customer-communication table directly — reduces coupling while still presenting one merged view.
- PII masking/reveal (§2/§24) should be enforced at the API/query layer, not just hidden in the UI — an export or API response must respect masking server-side, consistent with the security posture established for approval bypass prevention in Sales/Purchase (09 §28, 08 §27).
- Customer Merge (§26) should operate as an explicit, reversible transaction (soft-merge with an undo window) rather than an immediate irreversible delete-and-relink, given how much downstream history (orders, loyalty points, wallet balance) must reconcile correctly.

---

**Next:** 11-loyalty.md
