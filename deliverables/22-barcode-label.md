# Barcode, QR Code, RFID & Label Management Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [21-notifications.md](21-notifications.md) (all prior modules)
**Consumed by:** Product Management, Inventory, Purchase, Sales, POS, Employees, Multi-Branch, Mobile Manager
**Scope note:** This module is the full implementation Product Management deferred to when it said "full template and print-layout detail lives in module 22-barcode-label.md" ([05-product-management.md](05-product-management.md) §11). It owns barcode/QR/RFID generation and label templating/printing; it does not own the scan-to-action *business logic* already specified elsewhere (POS's scan-to-cart, 04 §5; Inventory's Cycle Count scanning, 07 §10; Purchase's Goods Receipt scanning, 08 §11) — this module provides the identifiers and the Scan Center's generic validation, those modules define what happens after a successful scan in their own context.

---

## 1. Module Objective

Provide enterprise product identification and labeling — Barcode Generation, QR Code Generation, RFID Tags, Price/Shelf/Warehouse/Shipping/Asset Labels, Membership Cards, Gift Cards — as the single generation and printing engine every other module's "generate barcode," "print label," or "scan" reference resolves to.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin | Full access, template design, printer configuration |
| Store Manager | Print/reprint for their branch, RFID assignment |
| Warehouse Manager | Warehouse/carton/pallet label printing, RFID inventory operations |
| Inventory Controller | Barcode assignment/regeneration, bulk label operations |
| Purchasing Officer | Barcode assignment during receiving (ties into Purchase's Goods Receipt, 08 §11) |
| Cashier | Scan Center use (Price Check, Stock Check — per POS §18), no template/printer administration |
| Operations Manager | Label Templates (§9), Print Queue oversight across branches |

---

## 3. Label Lifecycle

```
Product Created → Barcode Assigned → Label Generated → Printed → Applied
→ Scanned → Updated → Archived
```

**Product Created** is the trigger from Product Management ([05-product-management.md](05-product-management.md) §6/§7) — this module never originates a barcode need independently; it responds to a product/variant being created there (or a Purchase Order line needing a receiving label, or a Sales return needing a return label). **Updated** covers the case where a product's price changes and its already-printed shelf label is now stale — this module tracks that staleness (§15's "Missing Labels" concept extends to "outdated labels") so a reprint can be triggered.

---

## 4. Module Structure

```
Barcode Dashboard (§5)
↓
Barcode Generator (§6) ──→ QR Code Generator (§7) ──→ RFID Management (§8)
↓
Label Templates (§9) ──→ Label Designer (§10)
↓
Batch Printing (§11) ──→ Print Queue (§12)
↓
Scan Center (§13)
↓
Print History (§14) ──→ Analytics (§15)
```

---

## 5. Barcode Dashboard

Lightweight header pattern (Dashboard §4): Products with Barcode · Products Missing Barcode · Labels Printed Today · Failed Print Jobs · RFID Tags Active · Scan Count · Printer Status.

"Products Missing Barcode" deep-links to a filtered Product Management List (05 §5) — this module surfaces the gap, Product Management remains where the actual product/variant record is edited to receive a barcode, maintaining the read/write ownership boundary (this module generates/prints; Product Management owns the product record the barcode is assigned to).

---

## 6. Barcode Generator

Automatic Barcode (sequential, per Settings' Number Series configuration, [20-settings.md](20-settings.md) §9) · Manual Barcode · SKU-based Barcode (derived from the SKU pattern Product Management's Variant Matrix already generates, 05 §7) · **GS1 Standards** compliance · Format support: EAN-13 · EAN-8 · UPC-A · UPC-E · Code 39 · Code 128 · ITF · Custom Formats · **Duplicate Detection** (the live, debounced uniqueness check already specified as a requirement in Product Management, 05 §18 — this module is where that check's actual barcode-format validation and collision logic lives, called by Product Management's form).

Barcode assignment here writes back to the product/variant record in Product Management (05 §6/§7) — this module never maintains a second, parallel barcode field; it's the generation service, Product Management is the field's home.

---

## 7. QR Code Generator

Product QR · Variant QR · Warehouse QR (Inventory's Warehouse/Zone/Bin identifiers, 07 §6) · Shelf QR · Promotion QR (Promotions' Coupon QR, [12-promotions.md](12-promotions.md) §9) · Customer QR (Loyalty membership card scanning, [11-loyalty.md](11-loyalty.md) §6) · Membership QR · Gift Card QR (Loyalty's Gift Card balance check, 11 §11) · **Dynamic QR** (content resolves at scan-time — e.g., a promotion QR that always points to whatever the *current* active promotion is, rather than encoding a fixed URL) vs. **Static QR** (fixed content, e.g., a product's permanent detail-page link).

Every QR type listed here was already specified as needed by its owning module — this section is the literal generation service fulfilling each of those forward-references from one shared QR engine, rather than each module implementing its own QR generation independently.

---

## 8. RFID Management

RFID Tag Assignment · RFID Inventory (bulk read — scanning an entire rack/shelf at once without individual barcode scans, feeding Inventory's Cycle Count, 07 §10, as an alternative to manual/barcode-driven counting) · RFID Scan · RFID Reader Integration · RFID Status (Active/Inactive/Lost) · Tag Replacement (when a physical tag is damaged, preserving the item's history under the new tag ID via a linked-replacement record, mirroring the reversing-entry-not-edit pattern used for corrections platform-wide).

RFID is presented as an *alternative/supplementary* identification layer to barcode/QR, not a replacement — a product can have both a barcode (universal, low-cost scanning) and an RFID tag (bulk/proximity scanning) simultaneously, and Inventory's Cycle Count (07 §10) can use either method interchangeably depending on what a given warehouse has deployed.

---

## 9. Label Templates

Price Labels · Product Labels · Shelf Labels · Warehouse Labels · Shipping Labels (feeding Sales' Delivery Management, 09 §10) · Return Labels (feeding POS/Sales Returns, 04 §13, 09 §13) · Asset Labels (feeding Employees' Uniform & Asset Assignment, 18 §26, and Finance's Fixed Assets, 16 §14) · Custom Templates · Logo/Branding (pulling from Settings' General Settings logo, 20 §6, and Multi-Branch's Company Branding, 19 §6, for consistent brand presentation across every printed label/receipt/document).

---

## 10. Label Designer

Drag & Drop Editor supporting: Text · Barcode · QR Code · RFID Identifier · Product Image · Price · Brand · Color · Size · Variables (merge-field system, consistent with Marketing/Notification's template Variables, 13 §11, 21 §11, applied here to physical label fields instead of message content) · Preview.

This is a WYSIWYG canvas (Auto Layout-based, per Design System §21's Figma-implementation conventions) for designing the physical layout of a label — a Store Manager configuring a shelf-label template for a new store format, for instance, without engineering involvement, mirroring the self-service design philosophy already established for Reports' Dashboard Builder (17 §16) and Marketing's Journey Builder (13 §8).

---

## 11. Batch Printing

Bulk Product Labels · Variant Labels (all variants from a Product Management Variant Matrix in one batch, 05 §7) · Branch Labels · Warehouse Labels · Carton Labels · Pallet Labels (for Purchase's Goods Receipt, 08 §11, and Inter-Branch Operations' Stock Transfer, 19 §13, at the shipping-unit level rather than per-item) · **Print Selection** (choosing which subset of a larger batch actually needs printing — e.g., only the 3 variants that were short-stocked in a prior run, not the full original batch).

Same preview-before-commit rule as every other bulk action platform-wide — a batch print job shows exactly what will print (count, template, destination printer) before committing.

---

## 12. Print Queue

Queued · Printing · Completed · Failed · Retry · Cancel · **Printer Assignment** (routing a given print job to a specific physical printer, relevant when a branch has multiple printers for different label types — e.g., a thermal printer for shelf labels and a different one for shipping labels).

A Failed print job (paper jam, printer offline, per §19) surfaces in the Notification Center ([21-notifications.md](21-notifications.md) §7-adjacent operational alert) rather than silently sitting in a failed state unnoticed.

---

## 13. Scan Center

Barcode Scanner · Camera Scanner (mobile device camera as a scan input) · QR Scanner · RFID Scanner · Keyboard Scanner (hardware scanner emulating keyboard input, the standard POS/warehouse scanner mode) · **Real-time Validation** (confirms the scanned code resolves to a known, active record and shows what it is — product, warehouse bin, customer, etc. — before any owning module acts on it).

This is a **generic scan-and-identify utility**, distinct from the scan-driven business actions already specified in POS (add to cart, 04 §5), Inventory (cycle count, 07 §10), and Purchase (goods receipt, 08 §11) — the Scan Center is where a Warehouse Manager might scan an unfamiliar code just to find out what it is, without triggering any transactional consequence, whereas those other modules' scanning is embedded directly in their transactional flow and immediately acts on the result.

---

## 14. Print History

Printed By · Print Date · Printer · Template · Copies · Status.

Feeds this module's Audit Log (§18) and Analytics (§15) — the canonical record of every physical label ever generated, useful for tracing "who printed 500 shelf labels for Branch 3 last Tuesday."

---

## 15. Analytics

Labels Printed · Scan Frequency · **Missing Labels** (products lacking any printed label, cross-referenced against the Dashboard's "Products Missing Barcode," §5, but specifically tracking print status rather than barcode-assignment status — a product can have a barcode assigned but never actually have a label printed for it) · Print Failures · Printer Usage · RFID Coverage (% of active SKUs with an assigned RFID tag, relevant for organizations using RFID inventory counting, §25).

---

## 16. Search & Filter

Product · Barcode · SKU · Branch · Warehouse · Template · Print Status · Date Range — same combinable filter+chip pattern used platform-wide.

---

## 17. Bulk Operations

Bulk Generate · Bulk Print · Bulk Export · Bulk Assign Barcode · Bulk Reprint — same preview-before-commit rule as every other bulk action platform-wide.

---

## 18. Audit Log

Barcode Created · Label Updated · Print Started · Print Completed · RFID Assigned — standard audit coverage; barcode/QR generation is logged given how foundational these identifiers are to inventory/sale accuracy platform-wide.

---

## 19. Validation

| Rule | Behavior |
|---|---|
| Duplicate Barcode | Hard-blocked, same live-check rule as Product Management (05 §18) — this module implements the actual check that spec referenced |
| Duplicate QR | Hard-blocked for Static QR (unique content); not applicable to Dynamic QR, which resolves at scan-time rather than encoding a fixed unique value |
| Invalid Barcode Format | Blocked if a manually-entered barcode doesn't match the selected format's check-digit/length rules (e.g., an EAN-13 failing its checksum) |
| Printer Offline | Blocked at print-time with a clear status, job remains Queued rather than silently failing, per §12 |
| Template Missing | Blocked — a print job referencing a deleted/unavailable template is caught before queueing |

---

## 20. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton dashboard/queue/list per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Labels | New tenant: icon + "No labels printed yet" + "Generate your first label" CTA |
| No Print Jobs | Neutral, common between batch printing sessions |
| Printer Offline | Distinct, actionable state — "Printer unreachable" + troubleshooting link + option to reroute the job to a different configured printer (§12) |
| Retry | Consistent retry affordance, especially for Failed print jobs |
| Permission Denied | Standard Navigation §19 pattern |

---

## 21. Responsive Design

| Breakpoint | Dashboard / Templates / Queue | Mobile (Scanning) |
|---|---|---|
| Desktop/Laptop | Full Label Designer canvas, full batch-print configuration | N/A |
| Tablet | Condensed Designer (simplified drag targets), full Print Queue/History tables with scroll | Scan Center fully supported — this is a primary tablet use case for warehouse/receiving staff |
| Mobile | View-only template browsing, Print Queue status checking | **Explicitly supported per the prompt's own note** — Scan Center (§13) is a core Mobile capability via device camera, used by Warehouse Staff/Cashiers/Operations Manager for on-the-go identification lookups |

---

## 22. Accessibility

Standard platform baseline: keyboard navigation, screen reader labels, visible focus indicators, accessible forms (Label Designer's field/variable configuration), WCAG AA. The Label Designer's drag-and-drop canvas requires a keyboard-operable alternative (add-element menu + arrow-key positioning), consistent with the same accessibility requirement established for every other visual builder in the platform (Promotions' rule-builder 12 §24, Marketing's Journey Builder 13 §22, CRM's Kanban 14 §24, Reports' Dashboard Builder 17 §26).

---

## 23. Security

**Role-Based Printing:** per §2 — a Cashier can use the Scan Center but not administer templates/printers. **Print Approval (Optional):** for high-value Asset Labels or bulk reprints above a configured volume, reusing the shared Manager Override/Approval component pattern, configured in Settings (20 §11). **Audit Trail:** per §18. **Secure Barcode Generation:** sequential barcode generation should not be trivially predictable/guessable in a way that would allow barcode-based fraud (e.g., predicting a not-yet-issued gift card barcode) — a concern specifically relevant to Gift Card QR/barcode generation (§7), which should incorporate sufficient entropy beyond simple sequential numbering.

---

## 24. Performance

Optimized for millions of products and high-speed scanning: barcode/QR lookups in the Scan Center (§13) must resolve at the same sub-100ms budget already established for POS's scan-to-cart (04 §25) and Inventory's Cycle Count scanning (07 §25) — this module's identifier-resolution service is the shared dependency those speed targets rely on, so it cannot itself be the bottleneck. Batch Printing (§11) and large Print Queues process asynchronously with progress indication, consistent with the async-for-large-operations pattern established since Product Management's bulk operations (05 §13). Lazy loading, server-side pagination for History/Analytics.

---

## 25. Advanced Enterprise Features

RFID Inventory Counting (§8's bulk-read capability, formalized as a full alternative counting method for Inventory's Cycle Count, 07 §10) · GS1 Compliance (§6) · Serial Number Labels (feeding Inventory's Serial tracking, 07 §12) · Batch Labels · Lot Labels (feeding Inventory's Batch tracking, 07 §12) · **Electronic Shelf Labels (ESL)** (wirelessly-updating digital price tags — when a price changes in Product Management, 05 §9, an ESL-equipped shelf label updates automatically without a physical reprint, closing the "stale label" problem noted in §3) · Bluetooth Label Printers · Zebra/Brother/TSC Printer Integration (the specific hardware integrations behind Settings' printer configuration, 20 §17) · Offline Printing (relevant for warehouse/store environments with intermittent connectivity — print jobs queue locally and sync/print once connectivity or printer availability returns) · Cloud Print · AI Label Layout Optimization · AI Duplicate Barcode Detection (an AI-assisted layer atop §19's rule-based duplicate check, catching near-duplicates or format-confusable codes a strict equality check might miss).

Additive/opt-in per the platform-wide principle — a small retailer uses Barcode Generator/Label Templates/Batch Printing/Scan Center without ever engaging RFID/ESL/AI-driven features.

---

## 26. Developer Implementation Notes

- Barcode/QR assignment (§6/§7) must write back to Product Management's product/variant record ([05-product-management.md](05-product-management.md) §6/§7) as the field's single home — this module is a generation *service* called by that form (and by Purchase's receiving flow, Loyalty's gift card issuance, etc.), never a parallel barcode data store requiring reconciliation.
- The Scan Center's identifier-resolution service (§13/§24) should be the same shared lookup POS's scan-to-cart (04 §5), Inventory's Cycle Count (07 §10), and Purchase's Goods Receipt (08 §11) call into for the "what does this code mean" step — those modules then apply their own business logic to the result; they should never re-implement code-format parsing/lookup independently.
- Label Templates (§9/§10) should store layout as structured, versioned data (element positions, bound variables) rather than a rendered image — enabling both the reprint-with-updated-price scenario (§3) and the ESL live-update capability (§25) to work from the same template definition without regenerating a design from scratch.
- Print Queue (§12) should be a proper job queue with retry/backoff, not a synchronous print-and-wait UI flow — critical for Batch Printing (§11) at scale and for Offline Printing (§25), where the initiating user's session shouldn't need to stay open until every label in a large batch has physically printed.
- RFID Tag Replacement (§8) should follow the same reversing-entry-not-edit pattern used for Inventory adjustments and Finance corrections — the old tag's history is preserved and linked to the new tag, never overwritten.

---

**Next:** 23-ecommerce.md
