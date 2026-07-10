# Sales & Order Management Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md)
**Consumed by:** Customers, Finance, Reports, AI Analytics, E-commerce
**Scope note:** This module owns non-POS Order-to-Cash (B2B, wholesale, corporate, omnichannel). Walk-in retail transactions are POS's domain ([04-pos.md](04-pos.md)); a completed POS sale still appears here read-only as a Sales Order record for unified reporting. Reservation and stock decrement both write through Inventory's engines ([07-inventory.md](07-inventory.md) §7/§11) — Sales never maintains a parallel stock or reservation store.

---

## 1. Module Objective

Manage the complete Order-to-Cash lifecycle — Sales Opportunity, Quotation, Sales Order, Approval, Inventory Reservation, Fulfillment, Delivery, Invoice, Payment, Return, Exchange, Refund, Credit Note — for B2B, B2C, Wholesale, Retail, Omnichannel, and Corporate customers, as one continuous auditable chain mirroring Purchase's structure (module 08) on the revenue side.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, all approval tiers, credit limit configuration |
| Sales Director | Full lifecycle access, approves orders/discounts above Sales Manager threshold |
| Sales Manager | Approves quotations/orders/discounts up to threshold; branch/team-scoped reporting |
| Sales Executive | Creates quotations/orders; cannot self-approve own discounts above threshold |
| Branch Manager | Branch-scoped order visibility and approval, same tier as Sales Manager but store-level |
| Customer Service | Read/edit Returns, Exchanges, order status updates, customer communication (§18); no pricing authority |
| Finance Manager | Full Invoice/Payment/Credit Note access, credit limit approval |
| Warehouse Manager | Fulfillment (§9) and Delivery (§10) execution; read-only on commercial terms |

Same segregation-of-duties principle as Purchase (08 §2): a Sales Executive cannot self-approve their own order's discount above threshold — enforced server-side, not just UI-hidden.

---

## 3. Order-to-Cash Workflow

```
Lead / Customer → Quotation → Negotiation → Sales Order → Approval
→ Inventory Reservation → Picking → Packing → Shipping/Delivery
→ Sales Invoice → Payment → Order Complete → Returns/Exchange (if required)
```

**Rule (mirrors Purchase 08 §3):** Quotation/Negotiation is optional for repeat/standing customers with pre-agreed pricing — a Sales Order can be created directly. The full Quotation path is used for new B2B/wholesale/corporate accounts or custom-priced deals. Both converge at Sales Order.

---

## 4. Module Structure

```
Sales Dashboard (§5)
↓
Quotations (§6) ──→ Sales Orders (§7)
                        ↓
                Inventory Reservation (§8)
                        ↓
                Order Fulfillment (§9) ──→ Deliveries (§10)
                        ↓
                Sales Invoices (§11) ──→ Returns & Exchange (§13)
                        ↓                        ↓
                Payments (§12)           Credit Notes (§14)
                        ↓
                Sales Analytics (§15)
```

---

## 5. Sales Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Today's Sales · Monthly Revenue · Sales Orders (count) · Pending Quotations · Pending Deliveries · Pending Invoices · Outstanding Payments · Average Order Value · Sales Growth · Sales Target Achievement (progress bar vs. quota) — plus Top Customers and Top Products ranked mini-lists.

This is the non-POS commercial view; it complements rather than duplicates the business-wide Dashboard (03) — figures here reconcile with POS sales data (since completed POS sales post here read-only, per the Scope note) for one consistent revenue number company-wide.

---

## 6. Sales Quotation

Statuses: Draft → Submitted → Sent → (Accepted | Rejected | Expired) → Converted to Sales Order.

Fields: Customer · Line items (product/variant, quantity) · Discount · Tax · Validity Date · Terms & Conditions · Attachments.

- **Expired:** auto-flagged past Validity Date, excluded from active pipelines but not deleted — a Sales Executive can still manually revive/re-quote from an expired one.
- **Converted to Sales Order:** one-click action carrying all line items/pricing/terms forward; the Quotation remains linked (read-only, historical) to the resulting Order for traceability — mirrors Purchase's Quotation→PO conversion (08 §9).
- Same customer-communication hooks as §18 (Email Quotation).

---

## 7. Sales Order

Statuses: Draft → Confirmed → Approved → Partially Fulfilled → Completed → Cancelled → Closed.

Fields: Customer · Shipping Address · Billing Address · Line items (product/variant, quantity) · Warehouse · Branch · Delivery Method · Payment Terms · Tax · Discount · Salesperson.

- **Confirmed → Approved:** approval required above a configurable order value or discount threshold (§25); routine in-policy orders can auto-approve.
- **Partially Fulfilled:** set automatically once any Delivery (§10) ships less than the full order — mirrors Purchase Order's Partial Delivery state (08 §10) exactly, same underlying pattern applied to the opposite flow direction.
- Order confirmation is the trigger point for Inventory Reservation (§8) — nothing is reserved at Quotation stage, since a quotation is not yet a commitment.

---

## 8. Inventory Reservation

Automatic on order confirmation, writing directly into Inventory's Reservation engine ([07-inventory.md](07-inventory.md) §11, Reservation Source = "Sales Order").

Full Reservation (entire order quantity available) · Partial Reservation (some lines short) · Reservation Expiry (configurable hold window; if payment/confirmation isn't finalized in time, releases automatically per Inventory's background expiry job, 07 §11) · Reservation Release (manual, on cancellation) · **Backorder** (for lines with insufficient stock — the order line is flagged Backordered rather than blocking the entire order, and can optionally auto-generate a Purchase Request via Inventory's Replenishment suggestions, 07 §14, closing the loop back to Purchase, module 08).

---

## 9. Order Fulfillment

Pick List (generated per warehouse/order or batched across orders for efficiency) → Picking (barcode-scan-driven, reusing the same scan interaction pattern as Goods Receipt, 08 §11, and Cycle Count, 07 §10) → Packing → Shipment Preparation → Quality Check (optional, configurable per category — mirrors Purchase's optional Inspection step, 08 §12) → Dispatch → Delivery Confirmation.

Each stage updates the Sales Order's fulfillment status and posts to the Activity Timeline (§19); Dispatch is the point Inventory's Stock Movement ledger records the decrement (Reason: "Sales Issue," 07 §7) — reservation converts to an actual outbound movement here, not at order confirmation.

---

## 10. Delivery Management

Partial Delivery · Complete Delivery · Multiple Shipments (a single order fulfilled across several dispatches, e.g., staggered stock availability) · Courier Assignment · Tracking Number · Delivery Status (Preparing/Dispatched/In Transit/Delivered/Failed) · Proof of Delivery (signature/photo capture) · Delivery Notes.

Delivery Status feeds the Dashboard's "Pending Deliveries" KPI (§5) and the business-wide Dashboard's "Upcoming Deliveries" widget (03 §11) — one status source, multiple surfaces, consistent with the platform-wide rule against duplicated status logic.

---

## 11. Sales Invoice

Statuses: Draft → Approved → Issued → (Paid | Partially Paid | Overdue) → Cancelled, with Credit Note (§14) as a linked correction path.

Generated from a Sales Order (auto-suggested on Dispatch/Delivery, or manually for advance-invoicing arrangements) — same three-way-match discipline as Purchase (08 §13) applies in reverse: Order vs. Delivery vs. Invoice quantities/prices should reconcile, with discrepancies flagged before Issue.

Feeds Finance module 16's Accounts Receivable; Outstanding Amount aggregates into the Dashboard's "Outstanding Payments" KPI (03 §10, §5 above).

---

## 12. Payment Management

Cash · Bank Transfer · Credit Card · Debit Card · QR Payment · Digital Wallet · Installments · Advance Payment · Partial Payment · Outstanding Balance.

Same payment method set and split/partial handling model as POS ([04-pos.md](04-pos.md) §11) applied to invoice-level (rather than transaction-level) payment — reuses the same Payment component, parameterized by context (POS transaction vs. Sales Invoice) rather than a second implementation.

---

## 13. Returns & Exchange

Full Return · Partial Return · Exchange · Replacement · Refund · Store Credit — Return Reason (Quality Issue, Damage, Wrong Item, Changed Mind, Other), matching the fixed reason set established in POS (04 §13) so return-reason reporting is consistent whether the sale originated at a register or through this module.

Resolution writes a reversing Stock Movement ("Sales Return," 07 §7) and, where a refund is issued, a linked Credit Note (§14) or direct payment reversal.

---

## 14. Credit Notes

Refund Credit · Price Adjustment · Sales Correction · Tax Adjustment · Invoice Correction.

A Credit Note always references its originating Invoice and, where applicable, Return — it is the accounting instrument that formally adjusts what a customer owes, distinct from the operational Return record (§13) that adjusts stock. Feeds Finance (module 16) and the customer's Account balance (Customers module 10).

---

## 15. Sales Analytics

Sales Trend · Revenue Trend · Gross Profit · Net Profit · Sales by Branch · Sales by Store · Sales by Category · Sales by Brand · Sales by Collection · Sales by Customer · Sales by Employee · Sales by Payment Method · Conversion Rate (Quotation→Order) · Forecast (AI Analytics module 25 integration).

Reuses Dashboard's chart components (03 §15) and the same time-granularity toggle pattern (03 §7) — this module's Analytics rolls up both POS and non-POS sales for the complete picture, distinguishable via a Channel filter (§16).

---

## 16. Search & Filter

Customer · Order Number · Invoice Number · Quotation Number · Branch · Warehouse · Status · Salesperson · Payment Status · Delivery Status · Date Range · Category · Brand — same combinable filter+chip+Saved View pattern used platform-wide (05 §15, 07 §18, 08 §17).

---

## 17. Bulk Operations

Bulk Approval · Bulk Print · Bulk Export · Bulk Cancel · Bulk Status Update · Bulk Invoice Generation (batch-converting a set of fulfilled/delivered orders into invoices at period-end, common for wholesale/corporate accounts billed on a cycle rather than per-order) — same preview-before-commit and segregation-of-duties-preserving rules as Purchase's Bulk Approval (08 §18).

---

## 18. Customer Communication

Email Quotation · Email Invoice · SMS Notification · Order Updates · Delivery Updates · Payment Reminders · Customer Notes.

Payment Reminders escalate automatically as an Invoice approaches/passes its due date (configurable schedule, e.g., 7 days before, on due date, 7/30 days overdue) — reduces manual chasing for Finance/Sales on B2B accounts with Credit Terms. All communication logged against the Order/Customer record, visible in both this module and the Customers module (10)'s interaction history.

---

## 19. Activity Timeline

Quotation Created · Order Confirmed · Inventory Reserved · Items Picked · Items Packed · Order Shipped · Invoice Generated · Payment Received · Return Processed — same human-readable actor+timestamp+link pattern used throughout the platform (03 §13, 06 §20, 07 §19, 08 §19).

---

## 20. Audit Log

User · Action · Timestamp · Old Value · New Value · Approval Status · Reference Document — generated from the same event stream as §19, restricted to management/finance roles, consistent with the shared-source rule (06 §29).

---

## 21. Validation

| Rule | Behavior |
|---|---|
| Duplicate Orders | Soft warning (possible accidental resubmission), not a hard block |
| Invalid Customer | Blocked — customer must exist and be in good standing (not blocklisted) |
| Negative Quantity | Hard-blocked at field level, consistent with Inventory/Purchase (07 §18, 08 §21) |
| Insufficient Stock | Does not block the order — routes the short line to Backorder (§8) instead, consistent with fashion retail norms where backorders are common |
| Expired Quotation | Blocks direct conversion to Order; must be manually revived/re-validated first (§6) |
| Price Changes | Soft warning vs. last-sold price or standing wholesale agreement, inline delta shown |
| Discount Limits | Hard-blocks beyond the Sales Executive's threshold, routes to Approval (§25) |
| Credit Limits | Hard-blocks order confirmation for Corporate/Credit-Account customers exceeding their approved credit limit, unless an authorized override is granted (§25) |

---

## 22. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Orders | New tenant/quiet period: icon + "No sales orders yet" + "Create Quotation" / "New Order" CTA |
| No Quotations | Neutral, common for retail-only operations relying on POS instead |
| No Deliveries | Neutral state for orders not yet at fulfillment stage |
| Offline | Read-only cached view; write actions (order creation from a store device) queue per the pattern in Inventory (07 §21) / Purchase (08 §22) |
| Permission Denied | Standard Navigation §19 pattern |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Sync Failed | Consistent with Inventory/Purchase's Sync Failed treatment, relevant where Fulfillment scanning happens on handheld devices |
| Retry | Consistent retry affordance throughout |

---

## 23. Responsive Design

| Breakpoint | List/Dashboard Views | Order / Fulfillment Forms |
|---|---|---|
| Desktop/Laptop | Full tables, side-by-side order detail + line items | Full multi-step forms |
| Tablet | Priority columns + scroll | Picking/Packing is the primary tablet/handheld flow (warehouse floor), large touch targets matching Inventory/Purchase's 48px rule (07 §22, 08 §23) |
| Mobile | Card-per-row stacked lists | Sequential step screens; Picking prioritizes barcode-scan entry, consistent with Purchase's Goods Receipt mobile pattern (08 §23) |

---

## 24. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels (especially scan-driven Picking controls), accessible forms (Order/Quotation entry), accessible tables (all lists), accessible dialogs (Approval, Credit Limit Override, Return confirmation), WCAG AA contrast on all status badges (Order, Payment, Delivery, Invoice status).

---

## 25. Security

Role Permission and segregation-of-duties per §2. **Discount Approval / Price Override Approval / Credit Limit Approval** all reuse the shared Manager Override component pattern established in POS (04 §24), Product Management (05 §23), Inventory (07 §24), and Purchase (08 §25) — one approval mechanism, parameterized by trigger type, across the entire platform. **Audit Trail:** immutable, per §20. **Sensitive Action Confirmation:** required for Order Cancel (after Approval/Reservation), Credit Note issuance, and Refunds above a configurable threshold.

---

## 26. Performance

Optimized for millions of sales records and large customer databases: list views virtualize rows, search is server-side indexed (consistent with the back-office approach in 05/07/08), Sales Analytics aggregates via precomputed rollups rather than scanning full history on each load, server-side pagination throughout.

---

## 27. Advanced Enterprise Features

Order Split (dividing one order into multiple fulfillments/shipments, e.g., partial stock availability across warehouses) · Order Merge (combining multiple orders from the same customer into one shipment/invoice, reducing shipping cost) · Backorder (§8) · Drop Shipping (fulfillment routed directly from supplier to customer, bypassing warehouse receipt — integrates with Purchase's PO flow, 08 §10, tagging the PO as drop-ship-linked to this Order) · Consignment Sales (stock remains owned by the supplier until sold, revenue-recognition handled distinctly in Finance, module 16) · Subscription Orders (recurring auto-generated orders on a schedule, e.g., a corporate uniform replenishment contract) · Multi Currency · Multi Tax (jurisdiction-aware, relevant for franchise/multi-country operations) · Inter-Branch Sales (one branch selling/transferring to fulfill another's customer order) · Wholesale Pricing (tier-based, from Product Management's pricing tiers, 05 §9) · Corporate Accounts · Customer Credit Accounts (tied to Credit Limits, §21/§25) · AI Sales Forecast (module 25) · Cross-Sell / Upsell Recommendations (sourced from Product Management's Related Products configuration, 05 §17).

These are advanced, opt-in capabilities layered onto the core O2C flow (§3) — a small retailer's Sales module can operate with none of them enabled, while a large wholesale/franchise operation activates the relevant subset without the core workflow changing shape.

---

## 28. Developer Implementation Notes

- Reservation (§8) and stock decrement (§9's Dispatch trigger) must call Inventory's existing Reservation and Stock Movement write paths ([07-inventory.md](07-inventory.md) §26) — Sales never maintains a parallel stock/reservation store, exactly mirroring the rule established for Purchase (08 §27).
- Payment Management (§12) should reuse the same Payment component as POS (04 §11), parameterized by context (register transaction vs. invoice), not a second payment UI/logic implementation.
- The Backorder→Purchase Request link (§8) and Drop Shipping's PO tagging (§27) both require a bidirectional reference between a Sales Order line and a Purchase module record — model this as a shared "linked demand" relationship so Inventory Replenishment (07 §14) can report accurately on why a given PO was raised.
- Discount/Price Override/Credit Limit approval (§25) should be the exact same shared component invoked in POS/Product Management/Inventory/Purchase, differentiated only by a context parameter — one audit-safe implementation, five call sites.
- Sales Analytics (§15) and Purchase Analytics (08 §16) should share a common rollup/aggregation service where metrics overlap (e.g., branch performance, category trends) rather than two independently computed pipelines that could drift.

---

**Next:** 10-customers.md
