# Supplier & Vendor Relationship Management (VRM) Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md), [04-pos.md](04-pos.md), [05-product-management.md](05-product-management.md), [06-product-detail.md](06-product-detail.md), [07-inventory.md](07-inventory.md), [08-purchase.md](08-purchase.md), [09-sales.md](09-sales.md), [10-customers.md](10-customers.md), [11-loyalty.md](11-loyalty.md), [12-promotions.md](12-promotions.md), [13-marketing-automation.md](13-marketing-automation.md), [14-crm.md](14-crm.md)
**Consumed by:** Purchase, Inventory, Finance, Product Management, Reports
**Scope note:** This module is the master source of supplier identity, contracts, compliance, risk, and the Vendor 360 record — the supplier-side counterpart to Customers ([10-customers.md](10-customers.md)). It closes several forward-references from Purchase ([08-purchase.md](08-purchase.md)): Supplier Performance metrics feeding Quotation Comparison (08 §9/§16) and Primary Supplier data feeding Product Detail (06 §12) are both owned and computed here, not duplicated in Purchase.

---

## 1. Module Objective

Manage the complete supplier lifecycle — Master Data, Vendor Qualification, Contracts, Approved Vendor Lists, Performance, Purchase History, Payments, Compliance, Risk, Quality — as one authoritative record every procurement decision draws from, mirroring the structure and discipline already established for Customers on the demand side.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin, Owner | Full access, Blacklist/Suspend authority |
| Procurement Manager | Full CRUD, Vendor Approval, contract sign-off |
| Purchasing Officer | Read/edit operational fields (contact, lead time, pricing agreements); cannot approve new vendors |
| Warehouse Manager | Read-only (receiving-relevant fields: lead time, preferred warehouse) |
| Inventory Controller | Read-only, informs Replenishment supplier selection ([07-inventory.md](07-inventory.md) §14) |
| Finance Manager | Full Payment/Credit/Bank Information access, approves payment terms changes |
| Quality Manager | Full Quality Management (§10) access, initiates Corrective Actions |
| Compliance Officer | Full Compliance (§12) and Risk Management (§13) access, Blacklist/Watchlist authority |

---

## 3. Supplier Lifecycle

```
Prospective Supplier → Qualification → Approval → Active Supplier
→ Performance Monitoring → Contract Renewal → Preferred Supplier
→ Suspended Supplier → Archived
```

**Qualification → Approval** is a formal gate (§23's Vendor Approval) — a supplier cannot receive a Purchase Order while still Prospective; this is the supplier-side equivalent of Product Management's Draft→Published validation gate (05 §12/§18). **Suspended** is reachable directly from Active (e.g., a critical quality failure or compliance lapse, §10/§12) without passing back through the full lifecycle, since suspension is often urgent and reactive rather than a scheduled step.

---

## 4. Module Structure

```
Supplier Dashboard (§5)
↓
Supplier List (§6) ──→ Supplier Detail / Vendor 360 (§7)
                              ↓
                    Contracts (§8) · Purchase History (§9, read view)
                    Quality Management (§10, read view) · Payments (§11, read view)
                    Compliance (§12) · Risk Assessment (§13)
                              ↓
                    Supplier Analytics (§14)
```

---

## 5. Supplier Dashboard

Lightweight header pattern (Dashboard §4), KPI cards: Total Suppliers · Active Suppliers · Preferred Suppliers · Pending Approval · Expiring Contracts · Average Lead Time · On-Time Delivery Rate · Quality Score · Purchase Value · Outstanding Payables — plus Supplier Rating (ranked) and Top Suppliers (by spend).

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15). "Expiring Contracts" and "Pending Approval" cards deep-link to their filtered views (§8, §3), consistent with the KPI-card-as-navigation rule (03 §6).

---

## 6. Supplier List

Enterprise data table (Design System §12): Supplier Code · Supplier Name · Company Name · Contact Person · Phone · Email · Country · City · Category · Brands Supplied · Currency · Payment Terms · Lead Time · Supplier Rating · Status · Created Date.

Toolbar: Search · Advanced Filter (§15) · Sort · Pagination · Saved Views · Column Visibility · Bulk Actions (§16) · Export · Print — the standard platform table toolbar. Row click → Vendor 360 (§7).

---

## 7. Supplier 360 Profile (Vendor 360)

Structurally identical to Customer 360 ([10-customers.md](10-customers.md) §7) and Product Detail ([06-product-detail.md](06-product-detail.md) §3) — sticky condensing Summary Header + Tabs, same pattern reused a third time rather than reinvented.

**Summary Header:** Company logo/photo · Supplier Name · Supplier Code · Status badge · Supplier Rating (stars/score) · Quick stats (Lead Time, On-Time Delivery %, Outstanding Balance).

**Tabs:** Overview (Company Information, Primary Contact, Multiple Contacts, Addresses, Bank Information, Tax Information, Payment Terms, Supported Brands/Categories, Lead Time, Preferred Warehouse/Branch, Notes, Attachments) · Contracts (§8) · Purchase History (§9) · Quality Performance (§10) · Payments (§11) · Compliance (§12) · Risk Assessment (§13) · Analytics (per-supplier view of §14).

**Bank Information / Tax Information** are PII-adjacent financial fields — masked by default per the same pattern established for customer PII (10 §2/§24), visible only to Finance Manager/Procurement Manager on explicit reveal, logged to the Audit Log (§18).

---

## 8. Contract Management

Purchase Contracts · Blanket Agreements (standing orders/pricing over a period, without a PO for each instance) · Pricing Agreements (negotiated rates that Purchase Orders, [08-purchase.md](08-purchase.md) §10, should default to for this supplier) · Contract Start/End Date · Renewal Reminder (auto-notification per configurable lead time before expiry, feeding the Dashboard's "Expiring Contracts" KPI, §5) · Attachments · Approval Workflow (contract sign-off, per §23) · Contract History (versioned, mirroring the immutable-revision pattern established for PO Amendments, 08 §10, and Price History, 05 §9 — a contract's original terms remain reconstructable even after renewal/amendment).

Pricing Agreements here are what Purchase's Quotation Comparison (08 §9) and PO creation should check first — a standing agreement pre-fills pricing rather than requiring a fresh RFQ cycle for routine reorders under contract.

---

## 9. Purchase History (Read View)

Purchase Orders · Goods Receipts · Purchase Invoices · Supplier Returns · Average Purchase Value · Purchase Frequency · Top Products.

This tab is a *view* into Purchase module records ([08-purchase.md](08-purchase.md)), filtered to this supplier — consistent with the read/write ownership discipline established between Product Detail and Inventory (06/07): Suppliers never duplicates Purchase's transactional data, only surfaces it in supplier-scoped context.

---

## 10. Quality Management (Read View + Corrective Actions)

Inspection Pass Rate · Inspection Fail Rate · Rejected Items · Replacement Rate · Defect Rate · Quality Trend — aggregated from Purchase's Quality Inspection records ([08-purchase.md](08-purchase.md) §12) scoped to this supplier. **Corrective Actions** (the one write surface on this tab): a formal action plan initiated by Quality Manager following a quality failure pattern — tracked to resolution, and a factor in Risk Assessment's Quality Risk score (§13).

This is the exact Supplier Performance data Purchase's Quotation Comparison (08 §9) references — computed once here, consumed there, never independently recalculated in two places.

---

## 11. Payment Management (Read View)

Outstanding Balance · Paid Amount · Credit Limit (the org's extended-credit arrangement *from* the supplier, distinct from Sales' customer-facing Credit Limit) · Payment History · Payment Terms · Overdue Payments · Early Payment Discounts (terms like "2/10 net 30" — surfaced here so Finance can act on early-payment savings opportunities before they lapse).

Pulls from Purchase's Payment Management ([08-purchase.md](08-purchase.md) §15) and Finance's Accounts Payable (module 16) — a read view, not a duplicate ledger, consistent with §9's rule.

---

## 12. Compliance

Business License · Tax Registration · Certificates (material/safety/factory compliance — cross-referenced with Product Detail's Documents tab, 06 §21, for product-specific certificates this supplier provides) · Insurance · Factory Audit (results/reports) · Compliance Expiry (per document) · **Document Expiry Alerts** (auto-notification, feeding the Notification Center, Navigation §13, well before lapse — a supplier with an expired business license should be flagged before their next PO, not discovered after).

Expired mandatory compliance documents can be configured to soft-block new Purchase Order creation for that supplier (a Procurement Manager override is available, logged as a Sensitive Action, §23) — a deliberate friction point given the legal/reputational risk of sourcing from a non-compliant vendor.

---

## 13. Risk Assessment

Risk Score (composite) · Financial Risk (payment default likelihood, credit history) · Delivery Risk (from on-time performance trend, §14) · Quality Risk (from §10's Corrective Actions and defect trend) · Compliance Risk (from §12's expiry status) · **Blacklist** (hard-block — no new POs, existing ones flagged for review) · **Watchlist** (soft flag — visible warning banner on the supplier's record and at PO creation, but not blocking) · Risk Trend (improving/stable/worsening, over time).

Blacklist/Watchlist status is enforced at PO creation time in Purchase ([08-purchase.md](08-purchase.md) §10) — this module is the source of truth for that status; Purchase checks it, never maintains its own separate restricted-supplier list.

---

## 14. Supplier Analytics

Purchase Spend · Supplier Rating · Lead Time Trend · Delivery Performance · Quality Performance · Cost Trend · Price Variance (vs. contract/agreement pricing, §8) · Contract Utilization (how much of a Blanket Agreement's committed volume has been used) · **Supplier Comparison** (side-by-side, reusing the same comparison-table pattern as Purchase's Quotation Comparison, 08 §9, applied across a supplier's full history rather than a single RFQ moment).

This is the metrics engine Purchase's Quotation Comparison recommendation (08 §9) and Replenishment supplier suggestions ([07-inventory.md](07-inventory.md) §14) both consume — computed once, surfaced in three places.

---

## 15. Search & Filter

Supplier Name · Supplier Code · Category · Brand · Country · Status · Rating · Contract Status · Payment Status · Risk Level · Date Range — same combinable filter+chip+Saved View pattern used platform-wide.

---

## 16. Bulk Operations

Bulk Import · Bulk Export · Bulk Update · Bulk Approval (Vendor Approval, §23, applied to multiple Prospective suppliers at once) · Bulk Archive · Bulk Assign Category — same preview-before-commit rule as every other bulk action platform-wide. Suppliers with transaction history use Bulk Archive, never Bulk Delete (no Bulk Delete is offered at all for suppliers, consistent with the Archive-over-Delete principle, since even a "mistaken" supplier entry typically has at least an RFQ or quotation attached worth preserving).

---

## 17. Activity Timeline

Supplier Created · Supplier Approved · Contract Signed · Purchase Completed · Inspection Recorded · Payment Completed · Risk Updated · Compliance Updated — same human-readable actor+timestamp+link pattern used throughout the platform.

---

## 18. Audit Log

User · Action · Timestamp · Old Value · New Value · Approval Status · Reference Document — generated from the same event stream as §17, restricted to management/finance/compliance roles; Bank/Tax Information reveals (§7) are themselves logged here, consistent with the PII-reveal audit rule established for Customers (10 §19).

---

## 19. Validation

| Rule | Behavior |
|---|---|
| Duplicate Supplier | Warns with a link to the existing record, not a hard block (legitimate re-registration under a new contact happens) |
| Duplicate Tax Number | Hard-blocked — tax registration numbers must be unique |
| Duplicate Email / Duplicate Phone | Soft warning, consistent with Customers' equivalent rule (10 §20) |
| Expired Contract | Auto-flags the supplier record (not hard-blocked); new POs against an expired Blanket Agreement fall back to standard pricing with a visible notice |
| Missing Required Documents | Blocks Approval (§3) — a Prospective supplier needs minimum compliance documentation (§12) before promotion to Active |
| Invalid Payment Terms | Blocked at entry — must match a configured valid terms format (e.g., Net 30/60/90, COD) |

---

## 20. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton table (List) / skeleton Summary Header + tab content (Vendor 360) |
| Skeleton | Shape-matched per view |
| No Suppliers | New tenant: icon + "No suppliers yet" + "Add your first supplier" CTA — blocks Purchase Order creation until at least one exists (mirrors Inventory's "no warehouse" blocking rule, 07 §21) |
| No Contracts | Neutral, common for suppliers operating purely on a PO-by-PO basis without a standing agreement |
| No Purchase History | Neutral, common for a newly approved supplier |
| Offline | Read-only cached view; edits queue, relevant mainly for field visits (e.g., Quality Manager conducting a factory audit on a tablet) |
| Permission Denied | Standard Navigation §19 pattern; Bank/Tax fields masked per §7 rather than the whole record hidden |
| Server Error | Inline retry, per-tab isolation on the Vendor 360 (mirrors Product Detail §24) |
| Retry | Consistent retry affordance throughout |

---

## 21. Responsive Design

| Breakpoint | List | Vendor 360 |
|---|---|---|
| Desktop/Laptop | Full table | Full two-column Summary Header + full tab bar |
| Tablet | Priority columns + scroll | Condensed header, scrollable tab strip — this is the primary form factor for Quality Manager factory-audit field work |
| Mobile | Card-per-supplier stacked list | Slim sticky header, tabs become a dropdown selector |

---

## 22. Accessibility

Standard platform baseline: keyboard navigation, visible focus, screen reader labels (especially Bank/Tax PII-reveal toggles), accessible forms (Contract/Compliance document entry), accessible tables (Purchase History, Payment History), WCAG AA contrast on all status/risk/rating badges.

---

## 23. Security

Role Permission per §2. **Vendor Approval:** the formal Qualification→Active gate (§3), restricted to Procurement Manager+, requiring minimum compliance documentation (§19) — reuses the shared Manager Override/Approval component pattern established platform-wide, parameterized for vendor-approval context. **Approval Workflow:** applies equally to Contract sign-off (§8) and payment-terms changes. **Audit Trail:** immutable, per §18. **Sensitive Action Confirmation:** required for Blacklist/Suspend actions, Bank Information edits, and Bulk Approval.

---

## 24. Performance

Optimized for millions of supplier records and large procurement networks: List virtualizes rows, search is server-side indexed, server-side pagination throughout, Supplier Analytics (§14) aggregates via precomputed rollups (consistent with Inventory/Purchase's approach, 07 §25, 08 §26) rather than scanning full purchase history on each Vendor 360 load.

---

## 25. Advanced Enterprise Features

**Supplier Portal** and **Self-Service Supplier Registration** (external-facing, suppliers submit/update their own compliance documents and view PO status without staff manual entry) · Vendor Scorecards (formalized periodic performance review, combining §10/§14's metrics into a shareable report) · Preferred Vendor Program (formal designation beyond the Preferred Supplier lifecycle stage, §3, often with associated benefits like faster payment terms) · Multi-Currency Suppliers · Multi-Language Support (relevant for international sourcing) · **Electronic Data Interchange (EDI)** (automated PO/invoice exchange with large suppliers' own systems) · **Vendor Managed Inventory (VMI)** (supplier monitors and replenishes stock directly, integrating with Inventory's Replenishment engine, 07 §14, as an alternate trigger source) · Consignment Suppliers (ties into Sales' Consignment Sales feature, 09 §27 — stock remains supplier-owned until sold) · Supplier SLA Monitoring (formalizes §14's performance tracking against contractually committed service levels) · AI Supplier Recommendations · AI Supplier Risk Prediction (feeds §13) · Contract Renewal Forecast · Supplier API Integration · Supplier Webhooks.

Additive/opt-in per the platform-wide principle — a small retailer sourcing from a handful of suppliers manually manages Contracts/Purchase History/Payments without ever engaging Supplier Portal/EDI/VMI.

---

## 26. Developer Implementation Notes

- Purchase History (§9), Quality Management (§10), and Payment Management (§11) must be read-only *views* querying Purchase's ([08-purchase.md](08-purchase.md)) own tables filtered by supplier — this module never maintains parallel copies, exactly mirroring the read/write discipline established between Product Detail and Inventory (06/07).
- Supplier Performance/Rating (§14) should be one computed metrics service, consumed by this module's Analytics tab, Purchase's Quotation Comparison recommendation (08 §9), and Inventory's Replenishment supplier suggestions (07 §14) — never three independently calculated scores that could disagree.
- Blacklist/Watchlist status (§13) must be checked server-side at PO creation in Purchase, not merely surfaced as a UI warning here — a blocked/flagged supplier should be enforced at the point of the actual procurement action, consistent with the segregation-of-duties enforcement pattern established in Purchase (08 §27).
- Pricing Agreements (§8) should be checked automatically by Purchase Order creation (08 §10) as the default price source for a given supplier+product combination, before falling back to standalone Quotation/RFQ pricing — implement as a priority-ordered price resolution, mirroring Promotions' Price List layering approach (12 §13).
- Document Expiry Alerts (§12) should subscribe to the same notification infrastructure Inventory (07 §16) and Purchase (08) already use, rather than a bespoke supplier-specific alert channel.

---

**Next:** 16-finance.md
