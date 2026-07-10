# Sales Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [09-sales.md](../deliverables/09-sales.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers non-POS Order-to-Cash — Sales Dashboard, Sales Order List/Detail/Workflow, Payment, Delivery, Returns & Refunds. Per `09-sales.md`'s own scope boundary, walk-in POS transactions are covered in `02-pos-ui.md`; this screen's List includes completed POS sales read-only for unified reporting, per that spec's rule. This document mirrors `08-purchase-ui.md`'s List/Detail/Approval-Timeline patterns wherever the two modules are structurally symmetric (Order↔PO, Partial Fulfillment↔Partial Delivery), rather than inventing a second visual language for the same underlying pattern.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Sales
↓
Page Header (Title + Toolbar)
↓
Sales Dashboard (KPI strip, collapsible)
↓
Filter Bar
↓
Sales Order List
```

Secondary tabs beneath Page Header: **Quotations** · **Sales Orders** (default) · **Fulfillment** · **Deliveries** · **Sales Invoices** · **Payments** · **Returns & Exchange** · **Credit Notes** · **Analytics**.

---

## 2. Page Header & Toolbar

```
Sales                                                 [Import] [Export] [+ New Sales Order]
1,842 orders this month · ฿4.8M revenue

[🔍 Search order#, customer…]  [Date Range ▾] [Branch ▾] [Channel ▾] [Status ▾] [Filters ▾] [Saved Views ▾]
```

Channel selector (E-commerce/Marketplace/Wholesale/POS/Social, per `09-sales.md` §7's Sales Channel dimension) is pinned adjacent to Branch, given its structural role in this module comparable to Purchase's Supplier selector prominence.

---

## 3. Sales Dashboard (Collapsible KPI Strip)

10 KPI cards (condensed variant): Total Sales · Gross Revenue · Net Revenue · Profit · Average Order Value · Total Orders · Completed Orders · Pending Orders · Returned Orders · Cancelled Orders.

- Gross/Net Revenue reconcile exactly with the business-wide Dashboard's and BI Dashboard's Sales figures — same computed value, never independently tallied
- Returned/Cancelled Orders cards render numerals in `color-warning`/neutral respectively (return volume is a health signal worth flagging, cancellation is neutral operational noise unless it spikes)

---

## 4. Sales Order List

**Columns:** Order Number (Roboto Mono link) · Customer (avatar + name, linking to Customer 360) · Order Date · Sales Channel (badge, channel-specific icon) · Branch · Salesperson (avatar) · Payment Status (badge) · Delivery Status (badge) · Order Status (badge) · Total Amount (right-aligned, tabular-nums) · Last Updated.

**Status badge palettes** (mirroring Purchase's exact pattern, applied to Sales' own states):
- Order Status: Draft → Confirmed → Approved (`color-warning` while pending) → Partially Fulfilled (`color-info`) → Completed (`color-success`) → Cancelled/Closed (neutral)
- Payment: Unpaid (`color-error`) → Partially Paid (`color-warning`) → Paid (`color-success`) → Overdue (`color-error`, bold)
- Delivery: Preparing → Dispatched → In Transit (`color-info`) → Delivered (`color-success`) → Failed (`color-error`)

Row overflow `⋮`: View, Edit (disabled once Approved/Reserved), Duplicate, Print, Cancel. Bulk-action bar: `[Bulk Approve] [Bulk Print] [Bulk Export] [Bulk Cancel] [Bulk Invoice Generation]` — the last specifically for batch-converting fulfilled/delivered orders into invoices at period-end for wholesale/corporate accounts, per `09-sales.md` §17.

---

## 5. Sales Order Detail

**Header band:** Order Number (`type-headline`) + Order/Payment/Delivery status badges inline → Customer name (linked, opens Customer Panel §9 or navigates to full Customer 360) → Salesperson/Date → Quick Actions: Edit · Duplicate · Print · Cancel · **Confirm Order** (Primary, shown only while Draft).

**Two-column body (8 + 4 cols):**

**Left (8 cols):**
- Customer Information card (compact) — Billing Address / Shipping Address as two side-by-side sub-cards (4 cols each), with a "Same as billing" indicator if applicable
- **Line Items table:** Product (thumbnail + name + variant), Quantity, Unit Price, Discount, Promotion (badge if applied, e.g., "Member Pricing"), Tax, Line Total — editable while Draft/Confirmed, locked once Reserved/Fulfilling with the same Amendment side-panel pattern as Purchase Orders
- Totals: Subtotal / Discount / Promotion / Tax / Shipping Fee / **Grand Total**
- Notes · Attachments (drag-and-drop)

**Right (4 cols):**
- Order Status Timeline (vertical stepper, identical component to Purchase's Approval Timeline, oriented to Sales' own stages: Draft → Confirmed → Approved → Reserved → Fulfilling → Shipped → Delivered → Complete)
- Fulfillment Progress card (once Confirmed): per-line Picked/Packed/Shipped progress, aggregate at top
- Related Documents: linked Quotation (if converted), linked Invoice(s), linked Delivery/Shipment(s), linked Return(s)

---

## 6. Order Workflow UI

**Create/Edit Sales Order:** full-page form. Header fields: Customer (searchable select, "+ New Customer" inline quick-create), Branch, Warehouse, Delivery Method, Payment Terms. Line Items table identical component to Detail's editable state, with a **Backorder indicator** appearing inline on any line where requested quantity exceeds Available Stock — the order still saves, that line is flagged "Backordered" rather than blocking the whole order, per `09-sales.md` §8/§21's explicit rule.

**Confirm Order:** transitions Draft→Confirmed, triggers Inventory Reservation — a brief inline toast confirms "Stock reserved for 4 of 5 lines; 1 line backordered."

**Fulfill Order:** reached from an Approved/Reserved order's action — Pick List view (per-line checkbox + location), Packing confirmation, then **Ship Order** (Delivery §7 below).

**Complete Order:** manual or automatic on Delivered + Paid — read-only from this point, only Returns/Exchange (§10) can further act on it.

**Cancel Order:** Confirmation Dialog; blocked if Reservation has already converted to a Dispatch (per Inventory's rule), same disabled-with-tooltip pattern as Purchase Order Cancel.

**Duplicate Order:** clones line items/customer/terms into a new Draft.

**Order Split / Order Merge** (Advanced feature, `09-sales.md` §27): reached via a Line Items table action — "Split into separate fulfillment" (select a subset of lines → creates a linked child order for those lines) or, from the List's multi-select, "Merge into one order" (combines selected orders from the same customer, shown as a preview before confirming).

---

## 7. Payment & Delivery

**Payment Summary card** (on Detail, or its own tab for period-end reconciliation): same Payment Method tile grid component as POS (§5.3 of the POS UI spec), parameterized for invoice-level rather than transaction-level entry — Cash/Card/QR/Bank Transfer/Gift Card/Wallet/Store Credit, **Split Payment** support identical in interaction pattern to POS's, **Refund** as a distinct action (opens the Refund dialog, §10) rather than a payment-method tile.

**Delivery tab/section:** Shipping Method (dropdown) → Courier Assignment (searchable select) → Tracking Number (input, becomes a clickable external tracking link once populated) → **Shipment Timeline** (horizontal stepper: Preparing → Dispatched → In Transit → Delivered, with timestamps) → **Partial Shipment** support — multiple Shipment cards stack if an order ships in more than one dispatch, each with its own tracking number and line-item scope shown.

---

## 8. Customer Panel (Embedded)

Slide-in Right Panel drawer (same interaction pattern as Purchase's Supplier Panel): Customer Profile (avatar, name, contact) → Membership Tier badge → Loyalty Points balance → Purchase History (condensed, last 5 orders) → Credit Balance / Outstanding Balance (two stat rows, Outstanding in `color-warning` if non-zero) — reads from the same Customer 360/Loyalty data those modules own, never a duplicated snapshot.

"View full Customer 360 →" footer link deep-links to the dedicated Customers module.

---

## 9. Returns & Refunds

**Return Request:** reached from a Completed order's action or standalone lookup (order#/customer search). Line-item selectable list (checkbox + quantity stepper capped at originally-sold quantity) → **Return Reason** required dropdown per line (Quality Issue/Damage/Wrong Item/Changed Mind/Other — the identical fixed reason set POS uses, ensuring consistent reporting regardless of origin) → Resolution segmented control: Refund / Store Credit / Exchange.

**Return Approval:** shown as a Pending status badge + the shared Approval component gate for returns beyond a configured window/value threshold.

**Exchange:** after resolution, the screen reopens a product-search panel to select replacement items; a net-difference line ("Additional payment due" / "Refund due") replaces the plain total, mirroring POS's exchange flow exactly.

**Refund dialog:** amount (pre-filled from the return calculation, editable within limits), method (defaults to original payment method, Store Credit as fallback if unavailable), reason — Confirm triggers the linked Credit Note.

**Return Status** badge progression: Requested → Approved → Inspecting → Resolved (Refunded/Credited/Exchanged badge sub-variant).

---

## 10. Search Experience

Instant Search (Order#/Customer name) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused across the platform's list screens.

---

## 11. Dialogs

| Dialog | Contents |
|---|---|
| **Create Sales Order** | Full-page form, per §6 |
| **Edit Sales Order** | Same form pre-filled; Amendment side-panel once locked |
| **Payment** | Tile-grid component per §7, invoke-able standalone for recording a payment against an existing Invoice |
| **Refund** | Per §9 |
| **Return** | Per §9's Return Request flow |
| **Shipment** | Courier/Tracking entry, triggered from Fulfill Order's Ship step |
| **Cancel Confirmation** | Standard Confirmation Dialog, disabled-with-tooltip if blocked |
| **Delete Confirmation** | Reserved for Draft orders with zero history only |

---

## 12. Interaction Design

Identical interaction table to Purchase Management UI §11 (Hover/Focus/Selection/Keyboard/Context Menu/Drag-and-drop-attachments) — same components, same behavior, applied to Sales' own row/field content. Notably: **Order Split** (§6) is the one drag-and-drop-adjacent interaction unique to this screen — implemented as a checkbox-select-then-button-action rather than literal drag-and-drop, avoiding the error-proneness of dragging financially significant line items between orders.

---

## 13. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Standard shape-matched skeletons throughout |
| Empty Sales | New tenant/quiet period: icon + "No sales orders yet" + "Create Quotation" / "New Order" dual CTAs |
| No Search Results | Distinct — "No orders match '[query]'" + Clear filters |
| Offline | Read-only cached view; order creation from a store device queues, consistent with Inventory/Purchase's offline model |
| Sync Pending | Pending-count badge |
| Permission Denied | Standard pattern; Discount/Credit Limit override actions hidden or shown-disabled per the same authority-tier rule as Purchase's Approval |
| Validation Error | Inline field-adjacent (e.g., Credit Limit exceeded hard-blocks Order Confirmation with the specific limit shown, per `09-sales.md` §21) |
| Payment Failed | Inline error on the payment tile, order/cart state preserved, Retry/Switch Method — same pattern as POS |
| Server Error | Inline retry, per-section isolation on Detail |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated Success Dialog for Order Confirmation (triggers Reservation) and Payment completion, given their downstream significance |

---

## 14. Responsive Design

| Breakpoint | List / Dashboard | Order Form / Fulfillment |
|---|---|---|
| Desktop/Laptop | Full table, side-by-side Detail | Full multi-step forms |
| Tablet | Priority columns + scroll | **Picking/Packing is the primary tablet flow** (warehouse floor), 48px touch targets — mirroring Purchase's Goods Receipt scoping |
| Mobile Sales View | Card-per-row stacked list | Sequential step screens; Picking prioritizes barcode-scan entry |

---

## 15. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels (scan-driven Picking controls), accessible forms (Order/Quotation/Return entry), accessible tables (all lists), accessible dialogs (Confirm, Credit Limit Override, Return confirmation), WCAG AA contrast on all status badges (Order/Payment/Delivery/Return status).

---

## 16. Figma Build Notes

- Frame: `Sales/List/Desktop/1440`, `Sales/Detail/Desktop/1440`, `Sales/Fulfillment/Tablet/1024`
- Order List row, Line Items table, Order Status Timeline, and Payment tile grid are instances of base components shared with Purchase Management UI (Table Row, Stepper, Payment Tile from POS) — configured for Sales' content, never rebuilt as separate implementations
- Layer naming: `Sales/List/Row-Backordered`, `Sales/Detail/StatusTimeline/Stage-Reserved`, `Sales/Returns/LineItem-Selected`, per convention

---

## 17. Developer Handoff Notes

- Reservation (on Confirm Order, §6) and stock decrement (on Dispatch, §7) must call Inventory's existing Reservation/Stock Movement write paths ([07-inventory.md](../deliverables/07-inventory.md) §7/§11) — this screen never maintains a parallel stock/reservation store, per `09-sales.md` §28.
- Payment component (§7) must be the exact same component/logic as POS's Payment Panel ([02-pos-ui.md](02-pos-ui.md) §5.3), parameterized by context (register transaction vs. invoice) — not a second payment implementation.
- Backorder (§6) and Purchase's Replenishment suggestions ([08-purchase.md](../deliverables/08-purchase.md) §14) require a bidirectional "linked demand" reference between a Sales Order line and a Purchase Request/PO — this UI's Backorder indicator should deep-link to that generated Purchase record once one exists.
- Discount/Credit Limit approval must invoke the identical shared Approval component used across POS/Purchase/every other module, differentiated only by a context parameter — never a Sales-specific approval modal.
- Order Status Timeline and Purchase's Approval Timeline should share one underlying vertical-Stepper component, per the pattern noted in Purchase UI's own developer notes — two configurations of one component, not two components.

---

**Next:** 10-customers-ui.md
