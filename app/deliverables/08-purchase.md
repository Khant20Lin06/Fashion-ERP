# Procurement & Purchase Management Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md)
**Consumed by:** Inventory (stock receipt), Finance (payables), Suppliers, Reports, AI Analytics
**Scope note:** This module owns the procurement lifecycle from demand to payment. Goods Receipt writes into Inventory's Stock Movement ledger ([07-inventory.md](07-inventory.md) §7) rather than maintaining a parallel stock record — Purchase is the *trigger*, Inventory is the *ledger of truth*.

---

## 1. Module Objective

Manage the complete procurement lifecycle — Purchase Planning, Purchase Requests, RFQ, Supplier Quotation Comparison, Purchase Orders, Approval Workflow, Goods Receipt, Purchase Invoice, Supplier Returns, Payments, Purchase Analytics, Supplier Performance — as one continuous, auditable chain where every downstream document (PO, Receipt, Invoice, Payment) traces back to its origin request.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, budget configuration, all approval tiers |
| Procurement Manager | Full lifecycle access, approves POs/budget exceptions up to org-wide threshold |
| Purchasing Officer | Creates Requests/RFQs/POs; cannot self-approve own POs above threshold |
| Warehouse Manager | Goods Receipt + Quality Inspection for their warehouse; read PO/RFQ |
| Inventory Controller | Read-only across procurement; initiates Purchase Requests from Replenishment suggestions ([07-inventory.md](07-inventory.md) §14) |
| Finance Manager | Purchase Invoice, Payment Management, budget oversight, full financial reporting |
| Accountant | Purchase Invoice + Payment entry, no PO creation/approval |
| Branch Manager | Creates branch-scoped Purchase Requests; approves branch-level requests up to threshold |

Segregation-of-duties rule: the user who creates a Purchase Order cannot also be the sole approver of that same PO above the auto-approval threshold — enforced at the workflow level, not just a UI suggestion, since this is a standard procurement control auditors check for.

---

## 3. Procurement Workflow

```
Demand Planning → Purchase Request → Approval → RFQ → Supplier Quotation
→ Quotation Comparison → Purchase Order → Approval → Goods Receipt
→ Quality Inspection → Purchase Invoice → Payment → Inventory Update → Reporting
```

**Rule:** RFQ/Quotation Comparison steps are optional, not mandatory — for routine reorders with an established Primary Supplier (per [06-product-detail.md](06-product-detail.md) §12), a Purchase Request can flow directly to a Purchase Order without an RFQ cycle. The full RFQ path is used for new suppliers, large orders, or org policy requiring competitive quotes above a value threshold. Both paths converge at Purchase Order.

---

## 4. Module Structure

```
Purchase Dashboard (§5)
↓
Purchase Requests (§6) ──→ RFQ Management (§7) ──→ Supplier Quotations (§8)
                                                 ──→ Quotation Comparison (§9)
                       ──→ Purchase Orders (§10)
                                ↓
                       Goods Receipts (§11) ──→ Quality Inspection (§12)
                                ↓
                       Purchase Invoices (§13) ──→ Supplier Returns (§14)
                                ↓
                       Payment Management (§15)
                                ↓
                       Purchase Analytics (§16)
```

---

## 5. Purchase Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Pending Purchase Requests · Pending RFQs · Pending Purchase Orders · Pending Goods Receipts · Pending Purchase Invoices · Overdue Deliveries — plus Supplier Performance (top/bottom ranked mini-list), Monthly Purchase Value (KPI + trend), Purchase Trend (chart), Cost Analysis (breakdown by category/brand).

Each "Pending X" KPI card is clickable, deep-linking to that list pre-filtered to the pending state — consistent with the Dashboard's KPI-card-as-navigation rule (03 §6).

---

## 6. Purchase Request

**Fields:** Department · Requested By · Priority (Low/Normal/Urgent) · Required Date · Line items (product/variant, quantity, suggested supplier if known) · Notes · Attachments.

**Statuses:** Draft → Submit → (Approval | Reject) → Cancel.

- Can originate manually or pre-filled from Inventory's Reorder Suggestions ([07-inventory.md](07-inventory.md) §14) — the "Create Purchase Order" action there actually creates a Purchase Request first if org policy requires request-level approval, or skips straight to PO Draft if the requester has direct PO authority.
- **Approval** routes to the requester's manager or a configured approval chain based on estimated value; Reject requires a reason, returned to the requester as an editable Draft (not a dead end).
- **Urgent priority** surfaces the request higher in the Procurement Manager's queue and on the Dashboard, but does not skip the approval step itself — urgency affects visibility/ordering, not control bypass.

---

## 7. Request for Quotation (RFQ)

Created from an approved Purchase Request (or standalone for planned sourcing). Supports: Multiple Suppliers (send to N suppliers simultaneously) · RFQ Deadline · Attachments (spec sheets, sample images) · Terms & Conditions (template, editable per RFQ) · Supplier Responses (tracked per-supplier: Sent/Viewed/Responded/Declined) · Communication History (threaded log per supplier, timestamped) · Quotation Expiry (auto-flags a quotation as expired past its validity date, excluding it from Comparison, §9, unless manually extended).

---

## 8. Supplier Quotation

Per-supplier response record: Supplier · Quotation Number · Price (per line item) · Lead Time · Delivery Date · Discount · Tax · Currency · Payment Terms · Validity · Attachments.

Entered manually (phone/email quotes transcribed) or received via a supplier-facing portal link (if module 15's supplier self-service is enabled) — either path produces the same Quotation record structure feeding Comparison (§9).

---

## 9. Quotation Comparison

Side-by-side comparison table/cards: Price · Lead Time · Quality Rating (from Supplier Performance history, §16) · Delivery Performance (on-time % history) · Payment Terms · Supplier Rating · Previous Purchase History (volume/frequency with this org) · **Recommended Supplier** (system-highlighted, weighted composite of price + reliability, not price alone — a highlighted badge with the weighting rationale in a tooltip, since lowest-price-only recommendations are a common procurement anti-pattern).

Selecting a supplier from Comparison directly generates a Purchase Order (§10) pre-filled from that quotation's line items/pricing/terms — Comparison's output is an action, not just a report.

---

## 10. Purchase Order

**Fields:** Supplier · Warehouse · Branch · Line items (product/variant, quantity, unit cost, tax, discount) · Expected Delivery · Terms · Attachments.

**Statuses:** Draft → Approval → Issue PO → (Partial Delivery | Complete Delivery) → Close, with Cancel and Reopen available at appropriate points (Reopen only from Close, e.g., a supplier ships a missed backorder line after the PO was closed).

- **Approval** enforces the segregation-of-duties rule (§2) and any Budget Limits validation (§21) before Issue.
- **Issue PO** transitions the order to supplier-facing (generates the PO document/PDF, sends to supplier) — this is the point of no easy return; editing an Issued PO requires a formal Amendment (tracked as a revision, not a silent edit) since the supplier has already acted on the original terms.
- **Partial Delivery** status is set automatically once any Goods Receipt (§11) against this PO is less than the full ordered quantity — the PO remains open for the remaining balance until fully received or manually Closed (e.g., supplier confirms a line item is discontinued/unavailable).
- PO document reuses the same line-item/tax/totals rendering pattern as the POS/Sales receipt system ([04-pos.md](04-pos.md) §12) for visual consistency between "money out" and "money in" documents.

---

## 11. Goods Receipt

Created against an Issued PO: Full Receipt · Partial Receipt · Over Receipt (received more than ordered — flagged, requires approval to accept beyond a tolerance %) · Under Receipt (received less — remainder stays open per §10's Partial Delivery rule) · Warehouse Assignment (which warehouse/branch receives, from the PO or overridden) · Barcode Scanning (scan-driven receiving, reusing the same scan-to-line-match interaction pattern as POS's barcode input, 04 §5, and Inventory's Cycle Count scanning, 07 §10).

**Accepted Quantity** vs. **Rejected Quantity** are captured per line at receipt time, feeding directly into Quality Inspection (§12) — a receipt is not "complete" until every line has a disposition (Accepted, Rejected, or Pending Inspection).

**On acceptance, this module writes a Stock Movement entry** ([07-inventory.md](07-inventory.md) §7, Reason: "Purchase Receipt") for the Accepted Quantity only — Rejected Quantity never enters available stock; it routes to Supplier Return (§14) instead. This is the single integration point between Purchase and Inventory — Purchase never adjusts stock directly, it always goes through Inventory's ledger.

---

## 12. Quality Inspection

Per Goods Receipt line: Pass · Fail · Conditional Approval (accepted with a noted defect, e.g., "cosmetic only, sellable at markdown") — Inspection Checklist (configurable per product category, e.g., stitching/fabric/color-match criteria for apparel) · Photos · Documents · Inspection Notes · Inspector (user) · Inspection History.

- **Fail** routes the line to Supplier Return (§14) automatically.
- **Conditional Approval** still posts to Inventory (§11's Stock Movement) but flags the batch/units (linking to [07-inventory.md](07-inventory.md) §12's Batch tracking) so downstream sale/reporting can reflect the condition if the business chooses to markdown-and-sell rather than return.
- Inspection is optional per product/category configuration — low-risk staple goods can skip straight from Receipt to Accepted without a formal inspection step, avoiding unnecessary process overhead on routine reorders.

---

## 13. Purchase Invoice

Fields: Invoice Number · Supplier · linked Purchase Order · linked Goods Receipt · Tax · Discount · Currency · Outstanding Amount · Payment Status (Unpaid/Partially Paid/Paid/Overdue).

- Matched via a **three-way match** (PO vs. Goods Receipt vs. Invoice) — discrepancies (e.g., invoiced quantity/price doesn't match what was ordered or received) are flagged for review before the invoice can be approved for payment, a standard procurement control that prevents paying for goods never received or at unagreed prices.
- Feeds directly into Finance module 16's Accounts Payable; Outstanding Amount here is the same figure Finance's "Outstanding Payments" KPI (Dashboard §10) aggregates from.

---

## 14. Supplier Return

Triggered from Quality Inspection failure (§12) or post-receipt discovery: Damaged Items · Wrong Items · Expired Items · Over Delivery (returning the excess beyond tolerance, §11).

Resolution: Replacement (generates a linked replacement Goods Receipt expectation) · Refund · Credit Note (applied against future Purchase Invoices from the same supplier) — Return Tracking (status: Requested/Approved by supplier/Shipped/Completed).

Writes a reversing Stock Movement entry (Reason: "Purchase Return") if the returned units had already posted to Inventory (e.g., a defect discovered after initial acceptance) — same ledger, same integration point as §11.

---

## 15. Payment Management

Cash · Bank Transfer · Credit Terms (Net 30/60/90, configured per supplier) · Installments · Advance Payment (pre-payment against a PO, reduces the eventual Invoice's Outstanding Amount) · Partial Payment · Outstanding Balance (per supplier, aggregate) · Payment History.

Payments record against a specific Purchase Invoice (§13), updating its Payment Status; a supplier's Outstanding Balance (used in Supplier module 15 and Finance module 16) is the sum of unpaid/partially-paid invoice balances — computed, not separately maintained.

---

## 16. Purchase Analytics

Purchase Trend · Purchase by Supplier · Purchase by Category · Purchase by Brand · Purchase by Branch · Purchase Cost Analysis · **Supplier Performance** (on-time delivery %, quality pass rate from Inspection history §12, price competitiveness trend — the same metrics feeding Quotation Comparison's recommendation, §9) · Lead Time Analysis · Purchase Forecast (AI Analytics module 25 integration) · Budget vs. Actual (per department/category, surfaces overspend before it becomes a Purchase Request approval crisis).

Reuses Dashboard/Inventory Analytics chart components (03 §15, 07 §15) — no new chart types introduced.

---

## 17. Search & Filter

Supplier · Purchase Order · Purchase Request · RFQ · Warehouse · Branch · Category · Brand · Status · Date Range · Payment Status · Approval Status. Same combinable filter+chip+Saved View pattern used across every list in the platform (05 §15, 07 §18).

---

## 18. Bulk Operations

Bulk Approval · Bulk Reject · Bulk Export · Bulk Print · Bulk Cancel · Bulk Status Update — same preview-before-commit rule as established in Product Management (05 §13) and Inventory (07 §17). Bulk Approval specifically still enforces the segregation-of-duties rule (§2) per line — a bulk approve cannot be used to approve a PO the same user created, that item is excluded from the batch with an explanatory note in the action summary.

---

## 19. Activity Timeline

Purchase Request Created · RFQ Sent · Quotation Received · PO Approved · Goods Received · Inspection Completed · Invoice Created · Payment Completed — same human-readable, actor+timestamp+link pattern as every other Activity Timeline in the platform (03 §13, 06 §20, 07 §19).

---

## 20. Audit Log

User · Action · Timestamp · Old Value · New Value · Approval Status · Reference Document — generated from the same event stream as §19 per the shared-source rule established in [06-product-detail.md](06-product-detail.md) §29, restricted to management/finance roles.

---

## 21. Validation

| Rule | Behavior |
|---|---|
| Duplicate Purchase Order | Warns if an open PO already exists for the same supplier+near-identical line items (likely accidental duplicate submission), not a hard block — legitimate repeat orders happen |
| Invalid Supplier | Blocked — supplier must exist and be in Active status (Suppliers module 15) |
| Negative Quantity | Hard-blocked at field level, consistent with Inventory's negative-stock rule (07 §18) |
| Missing Warehouse / Missing Branch | Blocks PO Issue (§10) — receiving destination must be known before a supplier ships |
| Missing Tax | Blocks Invoice approval (§13) — required for accurate Finance posting |
| Price Changes (vs. last purchase price or quotation) | Soft warning, inline, showing the delta — doesn't block, since prices legitimately fluctuate, but ensures it's never silently unnoticed |
| Budget Limits | Hard-blocks PO Approval if the department/category budget (Finance-configured) would be exceeded, unless an authorized budget-override approval is granted (§25) |

---

## 22. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table/dashboard per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Purchase Orders | New tenant/quiet period: icon + "No purchase orders yet" + "Create Purchase Request" CTA |
| No Suppliers | Blocks PO/RFQ creation with a clear "Add a supplier first" CTA linking to module 15 |
| No Quotations | Neutral state within an RFQ's Comparison view while awaiting responses — shows RFQ deadline countdown, not an error |
| Offline | Read-only cached view for roles who may check status from a store device; write actions (approvals, receipts) queue per the pattern in [07-inventory.md](07-inventory.md) §21, since Goods Receipt via barcode scan may happen on a warehouse handheld |
| Permission Denied | Standard Navigation §19 pattern |
| Server Error | Inline retry, per-section isolation on the Dashboard |
| Sync Failed | Distinct treatment matching Inventory's Sync Failed state (07 §21), relevant to Goods Receipt scanning on handheld devices |
| Retry | Consistent retry affordance throughout |

---

## 23. Responsive Design

| Breakpoint | List/Dashboard Views | PO / Receipt / Inspection Forms |
|---|---|---|
| Desktop/Laptop | Full tables, side-by-side Quotation Comparison | Full multi-step forms, side-by-side line-item entry |
| Tablet | Priority columns + scroll; Comparison becomes swipeable cards instead of side-by-side | Full-width forms; Goods Receipt is the primary tablet/handheld flow (warehouse receiving dock), large touch targets matching Inventory's 48px rule (07 §22) |
| Mobile | Card-per-row stacked lists | Sequential step screens; Goods Receipt prioritizes barcode-scan entry over manual typing, consistent with Inventory's Cycle Count mobile pattern |

---

## 24. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels (especially on scan-driven Goods Receipt controls), accessible forms (PO/Request/Inspection entry), accessible tables (all lists), accessible dialogs (Approval, Manager Override, Quality Inspection Fail confirmation), WCAG AA contrast on all status badges (PO status, Payment status, Approval status, Inspection Pass/Fail/Conditional).

---

## 25. Security

Role Permission and segregation-of-duties per §2. **Approval Workflow** reused across Purchase Request, Purchase Order, and Budget Limit overrides — same shared approval component pattern established in POS (04 §24), Product Management (05 §23), and Inventory (07 §24). **Budget Approval:** a distinct escalation tier above standard PO approval, required specifically when §21's Budget Limits validation fails. **Audit Trail:** immutable, per §20. **Sensitive Action Confirmation:** required for PO Cancel (after Issue), Supplier Return initiation, and any payment above a configurable threshold. **Document Locking:** an Issued PO's original terms lock against silent edits (§10) — changes post as tracked Amendments, preserving the document the supplier actually received.

---

## 26. Performance

Optimized for large purchase volumes, multi-branch procurement, and large supplier networks: list views virtualize rows (consistent with 05 §22, 07 §25), search is server-side indexed, Quotation Comparison and Purchase Analytics aggregate via precomputed rollups rather than scanning full transaction history on each load. Goods Receipt barcode scanning targets the same <100ms local-match responsiveness established for POS scanning (04 §25) and Inventory Cycle Count (07 §25).

---

## 27. Developer Implementation Notes

- Goods Receipt (§11) must call into Inventory's Stock Movement write path ([07-inventory.md](07-inventory.md) §26) — Purchase never writes stock balances directly; this guarantees one ledger of truth across Sales, Transfers, Adjustments, and Purchases.
- Three-way match (§13) should be a reusable validation service (PO line vs. Receipt line vs. Invoice line) rather than inline page logic, since Finance (module 16) and Reports (module 17) will need to surface match-exception reports independently.
- Segregation-of-duties (§2) and Budget Limits (§21/§25) should be enforced server-side at the approval-transition endpoint, not only hidden/disabled in the UI — a Purchasing Officer's own API session must be rejected server-side from self-approving, not merely prevented by a disabled button.
- PO Amendment (§10) should be modeled as an immutable revision history on the PO document (original + amendments), mirroring the Price History pattern from Product Management (05 §9), so "what did we actually agree to originally" is always reconstructable.
- Supplier Performance metrics (§16) feeding Quotation Comparison's recommendation (§9) should be computed from the same underlying Inspection (§12) and delivery-date-vs.-actual data — one metrics service, consumed by both the Comparison view and the Supplier module (15), not two divergent scoring implementations.

---

**Next:** 09-sales.md
