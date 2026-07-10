# Barcode, QR Code, RFID & Label Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [22-barcode-label.md](../deliverables/22-barcode-label.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Per `22-barcode-label.md`'s own boundary, this module generates identifiers and designs/prints physical labels — it does not own the scan-to-action business logic already specified in POS/Inventory/Purchase. The **Scan Center** here is a generic scan-and-identify utility (what is this code?), distinct from those modules' transactional scanning, which this module's identifier-resolution service underlies but never duplicates.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Barcode & Labels
↓
Page Header (Title + Toolbar)
↓
Barcode Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Barcode List (default) · Label Templates · Batch Printing · Print Queue · Scan Center · RFID · Print History · Analytics
```

---

## 2. Page Header & Toolbar

```
Barcode & Labels                                       [+ Generate Barcode] [+ New Template]
120,482 SKUs · 118,940 with barcode (98.8%)

[🔍 Search product, barcode, SKU…]  [Brand ▾] [Category ▾] [Barcode Status ▾] [Filters ▾]
```

---

## 3. Barcode Dashboard (Collapsible KPI Strip)

8 KPI cards: Total SKUs · Generated Barcodes · Printed Labels · Pending Print Jobs · Failed Print Jobs · Active Templates · Scanner Devices (online count) · Recent Activity (mini feed, not a numeral card — shows last 3 print/generate events inline).

- "Total SKUs" vs. "Generated Barcodes" deliberately shown as two separate cards (not one ratio) so the gap itself is visible — clicking the gap between them deep-links to a filtered Barcode List (Missing Barcode)
- Failed Print Jobs in `color-error`

---

## 4. Barcode List (Barcode Management)

**Columns:** Barcode Number (Roboto Mono) · SKU · Product Name (thumbnail + name) · Variant (color/size chip) · Brand · Status (badge: Assigned/Unassigned/Duplicate Flagged).

Row overflow `⋮`: View in Product Detail, Regenerate, Print Label, Deactivate. Bulk-action bar: `[Bulk Generate] [Bulk Print] [Bulk Assign Barcode] [Export]`.

**Duplicate Detection banner** (non-blocking, appears above the list when the system flags a collision): `⚠ Barcode 8901234567890 is assigned to 2 products — [Review]` — never auto-resolves, always surfaces for manual review.

---

## 5. Barcode Generator

**Format Selection:** segmented control or dropdown — EAN-13 · UPC-A · UPC-E · EAN-8 · Code 39 · Code 128 · ITF · QR Code · Data Matrix (GS1 Standards compliance indicator shown as a small badge when the selected format/configuration meets that standard).

**Generation modes** (tabs within this panel):
- **Auto Generate:** Product/Variant search-select (single or "Apply to all variants of this product") → format → "Generate" → live preview of the resulting barcode image + number
- **Manual Entry:** direct number input, live format-validation (check-digit verification shown inline — a green check or red "invalid EAN-13 checksum" message as the user types)
- **Bulk Barcode Generation:** Product/Category/Brand filter (which SKUs to target) → format → preview count ("This will generate barcodes for 340 SKUs currently missing one") → async Generate with progress bar

Fashion-specific barcode types (Product/Variant/Size/Color/Collection/Batch/Serial Barcode) are simply the **scope** at which a generated barcode applies — selected via the search-select target in Auto Generate, not a separate generation mode each.

---

## 6. Label Designer

Full-screen canvas (Sidebar auto-collapses, matching the platform's "focus mode" pattern for POS Register Mode and the Journey Builder):

```
┌───────────────────────────────────────────────────┐
│ [Template Name]                    [Preview] [Save Template] │
├───────────┬─────────────────────────────┬───────────┤
│ Elements   │ Canvas (label-sized, e.g.     │ Properties │
│ (drag from │  40mm × 30mm shelf label)      │ (selected  │
│ here)      │                               │  element)   │
│            │  ┌─────────────────────┐        │            │
│ Text        │  │ Denim Jacket          │        │ Font: Inter │
│ SKU         │  │ ▐▐▐▐ 8901234567890    │        │ Size: 8pt   │
│ Barcode     │  │ ฿1,350                 │        │ Align: Left │
│ QR Code     │  └─────────────────────┘        │            │
│ Price        │                               │ [Delete]    │
│ Discount     │                               │            │
│ Size/Color   │                               │            │
│ Brand Logo   │                               │            │
│ Country      │                               │            │
└───────────┴─────────────────────────────┴───────────┘
```

- **Elements panel (left):** draggable element chips — Product Name, SKU, Barcode, QR Code, Price, Discount Price, Size, Color, Brand Logo, Collection, Country of Origin, plus generic Text/Variable blocks
- **Canvas (center):** the actual label dimensions rendered to scale (selectable label size presets: shelf label, price tag, clothing tag, warehouse label, shipping label — each with real-world mm dimensions); dropped elements are draggable/resizable with alignment guides (snap-to-grid, snap-to-other-elements) and a ruler along the canvas edges
- **Properties panel (right):** contextual to the currently-selected element — font/size/alignment for Text, size/error-correction-level for QR/Barcode, crop/scale for Brand Logo
- **Preview Mode:** toggle switches the canvas from edit-mode (element outlines visible) to a true print-preview rendering with sample data substituted for variables (e.g., "Denim Jacket" instead of a generic "{{product_name}}" placeholder)
- **Keyboard-operable alternative** (per the platform-wide visual-builder accessibility rule): an "Add Element" menu + arrow-key positioning/resizing, since this is drag-and-drop-primary but must remain fully operable without a mouse

**Save Template** names the design and assigns it to a Label Type category (§7).

---

## 7. Label Templates Tab

Card grid (filterable by Type: Clothing Tag/Price Tag/Shelf Label/Warehouse Label/Shipping Label): each card shows a thumbnail render of the template, name, last-modified, "Used in N print jobs." Row/card overflow: Edit (opens Label Designer, §6), Duplicate, Archive. "+ Create Template" opens the Label Designer blank, pre-selecting a Label Type's standard dimensions as the starting canvas size.

---

## 8. Batch Printing Tab

**Batch configuration form:** Scope selector (Bulk Product Labels / Variant Labels / Branch Labels / Warehouse Labels / Carton Labels / Pallet Labels) → target picker (matching the scope — e.g., Variant Labels shows a product search-select + "all variants" toggle) → Template (searchable select from §7) → Quantity per item (default 1, or "match current stock quantity") → **Print Selection** (a checklist preview of exactly which items/quantities will print, individually deselectable before committing) → "Send to Print Queue" (Primary button).

Same preview-before-commit rule as every other bulk action platform-wide — nothing prints without the operator seeing the exact batch first.

---

## 9. Print Queue Tab

Table: Job ID, Template, Quantity, Printer (assigned), Status (Queued/Printing/Completed/Failed badge), Created By, Date. Row actions: Retry (Failed only), Cancel (Queued only). **Printer Selection** dropdown available per-job (reassign to a different configured printer if the original is offline) — a Failed job's row shows the specific failure reason on hover (paper jam, printer offline, out of labels).

Bulk-action bar: `[Retry Selected] [Cancel Selected] [Export]`.

---

## 10. Scan Center Tab

A genuine lookup utility, distinct from POS/Inventory/Purchase's embedded transactional scanning:

```
Scan or enter a code…

[Recent scans]
8901234567890 → Denim Jacket — Blue/M     Stock: 142 available    [View Product]
WH-A-04-B2     → Warehouse Zone: Main WH, Aisle A, Bin 04-B2       [View Warehouse]
```

- Accepts Barcode Scanner (keyboard-emulation) input, Camera Scanner (device camera, for tablet/mobile), QR Scanner, RFID Scanner (if hardware present) — all resolving through the same identifier-lookup service and rendering whatever the code identifies (product, warehouse location, customer loyalty card, gift card)
- **Real-time Validation:** an unrecognized code shows "Unknown code — not found in system" rather than a bare error, with a "Try manual search" fallback
- No transactional consequence occurs from a Scan Center lookup — this is explicitly a "what is this" tool, never an "add to cart" or "receive stock" action

---

## 11. RFID Tab

RFID Tag Assignment: Product/Variant search-select → "Assign New Tag" (waits for a tag to be presented to a connected RFID writer, shows a live "Waiting for tag…" state) → confirmation. RFID Inventory: a "Start Bulk Scan" mode for reading an entire rack/shelf of tags at once, showing a live-populating count as tags are detected, feeding directly into Inventory's Cycle Count as an alternative counting method. Tag Replacement: links the old tag's history to a new one via a simple "Replace Tag" action, never silently overwriting.

---

## 12. Print History & Analytics Tabs

**Print History:** table (Printed By, Print Date, Printer, Template, Copies, Status) — the audit trail of every physical label ever generated.

**Analytics:** Labels Printed (trend) · Scan Frequency · **Missing Labels** (distinct from missing-barcode, §4 — products with a barcode assigned but never actually printed) · Print Failures · Printer Usage · RFID Coverage (% of active SKUs with an assigned tag, gauge).

---

## 13. Dialogs

| Dialog | Contents |
|---|---|
| **Generate Barcode** | Per §5's Auto/Manual modes, as a compact dialog when triggered from a single product's context (e.g., Product Detail's "Generate Barcode" quick action) rather than the full tab |
| **Create Label Template** | Opens the full-screen Label Designer (§6) directly, not a modal |
| **Select Printer** | Printer picker + a "Test Print" action, triggered from Print Queue or Batch Printing |
| **Print Confirmation** | Final "Print N labels to [Printer Name]?" confirm before a batch job is sent, showing estimated print time |
| **Delete Template** | Only offered for templates with zero print-job history; Archive is the default otherwise |

---

## 14. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring, including Label Designer's element selection |
| Selection | Checkbox multi-select on Barcode List/Print Queue, Shift/Ctrl-click; single-element selection on the Label Designer canvas |
| Keyboard Navigation | Tab through form fields; arrow-key nudge for selected Label Designer elements (1px per press, 10px with Shift) |
| Drag & Drop Editor | Label Designer's element placement/resizing (§6) — the canonical drag-and-drop surface for this module |
| Scanner Input | Scan Center's input field auto-submits on scan-terminator character, identical interaction to POS's barcode field |
| Quick Actions | "Print Label" kept always-visible on Barcode List rows (not buried in overflow), given how frequently a single reprint is needed |

---

## 15. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton dashboard/list/queue; Label Designer shows a faint canvas-grid skeleton while loading a saved template |
| Empty Barcode | New tenant: icon + "No barcodes generated yet" + "Generate your first barcode" CTA |
| No Search Results | Distinct — "No results for '[query]'" + Clear filters |
| Printer Offline | Distinct, actionable state in Print Queue: "Printer unreachable" + troubleshooting link + "Reassign to another printer" option |
| Scanner Disconnected | Scan Center shows a clear "Scanner not detected" state with a reconnect/retry action, falling back gracefully to manual text entry |
| Validation Error | Inline — invalid barcode checksum shown live during Manual Entry (§5); Label Designer shows an inline warning if an element overflows the label's physical bounds |
| Print Failed | Per-job in Print Queue (§9), with Retry always offered |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine actions (barcode generated, template saved); a brief confirmation for Batch Printing submission showing the job now in the Print Queue |

---

## 16. Responsive Design

| Breakpoint | Dashboard / Templates / Queue | Tablet Warehouse View / Mobile Scanner View |
|---|---|---|
| Desktop/Laptop | Full Label Designer canvas, full batch-print configuration | N/A |
| Tablet Warehouse View | Condensed Label Designer (simplified drag targets), full Print Queue/History tables with scroll | **Scan Center fully supported** — this is a primary tablet use case for warehouse/receiving staff, per the spec's explicit note |
| Mobile Scanner View | View-only template browsing, Print Queue status checking | **Scan Center is a core Mobile capability via device camera** — used by Warehouse Staff/Cashiers/Operations Manager for on-the-go identification lookups |

---

## 17. Accessibility

Standard baseline: keyboard navigation, screen reader labels, accessible forms (Label Designer's field/variable configuration), visible focus, WCAG AA. The Label Designer's drag-and-drop canvas requires the keyboard-operable alternative per §6 (Add Element menu + arrow-key positioning) — consistent with the identical accessibility requirement established for every other visual builder in the platform (Promotions' Rule Builder, Marketing's Journey Builder, CRM's Kanban, Reports' Dashboard Builder).

---

## 18. Figma Build Notes

- Frame: `Barcode/List/Desktop/1440`, `Barcode/LabelDesigner/Desktop/Fullscreen`, `Barcode/ScanCenter/Tablet/1024`
- Label Designer canvas elements (Text/Barcode/QR/Image blocks) are new small components with resize handles — a genuinely new interaction pattern for this platform (physical-layout, not rule-tree), built here for the first time
- Selectable-card pattern (Format Selection in §5, Label Type in §7) reuses the same selected-card visual treatment as POS's Payment Method tiles and Product Management's Product Type cards
- Layer naming: `Barcode/LabelDesigner/Element-Barcode`, `Barcode/PrintQueue/Row-Failed`, `Barcode/ScanCenter/RecentScan-Row`, per convention

---

## 19. Developer Handoff Notes

- Barcode/QR assignment (§5) must write back to Product Management's product/variant record as the field's single home — this module is a generation service, never a parallel barcode data store, per `22-barcode-label.md` §26.
- The Scan Center's identifier-resolution service (§10) must be the same shared lookup POS's scan-to-cart, Inventory's Cycle Count, and Purchase's Goods Receipt call into — those modules apply their own business logic to the result; they never re-implement code-format parsing/lookup independently.
- Label Templates (§6/§7) must store layout as structured, versioned data (element positions, bound variables), not a rendered image — enabling both reprint-with-updated-price and Electronic Shelf Label live-update scenarios to work from the same template definition without regenerating a design from scratch.
- Print Queue (§9) must be a proper job queue with retry/backoff, not a synchronous print-and-wait flow — critical for Batch Printing at scale and for Offline Printing, where the initiating user's session shouldn't need to stay open until every label physically prints.
- RFID Tag Replacement (§11) must follow the same reversing-entry-not-edit pattern used for Inventory adjustments and Finance corrections — the old tag's history is preserved and linked to the new tag, never overwritten.

---

**Next:** 23-ecommerce-ui.md
