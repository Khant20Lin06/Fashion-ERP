# POS (Point of Sale) — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [04-pos.md](../deliverables/04-pos.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This is the one screen in the platform designed **tablet-first**, per Design System §19's documented exception and `04-pos.md` §1/§3 — every dimension below targets 1024px landscape tablet as primary, with Desktop as a secondary denser variant. This document does not redecide the transaction flow, payment logic, or offline model already fixed in `04-pos.md`.

---

## 1. Screen Anatomy (Tablet Landscape, 1024px primary target)

```
POS Header (56px) — compact, POS-specific
┌──────────────────┬─────────────────┬───────────────┐
│                  │                 │               │
│  LEFT: Search +   │  CENTER:         │  RIGHT:        │
│  Product Grid     │  Shopping Cart   │  Checkout      │
│  ~45% (460px)     │  ~30% (307px)    │  Panel         │
│                  │                 │  ~25% (257px)  │
├──────────────────┴─────────────────┴───────────────┤
│ Bottom Status Bar (40px) — sync, network, shift, keys │
└────────────────────────────────────────────────────┘
```

Sidebar is hidden entirely in **Register Mode** (Cashier default) — the global app shell is suppressed in favor of this full-screen transactional layout, per `04-pos.md` §3. Manager roles can toggle out to the standard shell without losing cart state (persisted).

---

## 2. POS Header (56px, compact variant)

Single row, `space-4` horizontal padding, `elevation-1`:

| Zone | Content |
|---|---|
| Left | Store Name (`type-title`) + Branch chip · Shift status pill (`radius-full`, `color-success-container` bg if open, label "Shift Open · 2h 14m") |
| Center-left | Cashier avatar (24px) + name (`type-body`) |
| Center | Global Search / Barcode input (see §4) |
| Right | Sync Status icon (✓/↻/⚠, `icon-size-md`, tooltip on hover) · Network Status icon (online/offline, color-coded) · Time/Date (`type-body-small`) · Settings gear (icon button, 40×40 hit area) |

Sync and Network icons are never collapsed to overflow, on any breakpoint — per `04-pos.md` §4, transaction-integrity visibility takes priority over header density.

---

## 3. Left Panel — Product Search & Grid

**Search bar** (top, 48px height, full panel width): combined barcode/text input, `input-height` 44px, leading search icon + trailing barcode-scan icon (24px). Placeholder: "Scan barcode or search products…". On hardware scanner input, field auto-submits on scan-terminator without requiring Enter.

**Filter row** (below search, `space-2` gap): horizontal scrollable chip row — Category · Brand · Collection — each a Dropdown chip, 32px height, `radius-sm`.

**View toggle:** Grid/List icon-button pair, top-right of the filter row, 40×40 each, `Selected` state = `color-primary-container` bg on the active view.

**Product Grid** (default view): responsive card grid, 2 columns at 1024px tablet / 3 columns at Desktop ≥1440px, `space-4` gutters. Each card:

```
┌─────────────────┐
│   [Product Img]  │  120×120, radius-md
│                  │
│ Denim Jacket      │  type-body, 2-line clamp
│ SKU: DJ-001       │  type-caption, color-text-secondary
│ ฿1,350            │  type-title (Roboto Mono, tabular-nums)
│ [Promo] [New]      │  badge row, radius-sm chips
└─────────────────┘
```

- Out-of-stock cards: 60% opacity (`opacity-disabled`), tap surfaces "Check other branches" instead of adding to cart.
- Single-variant product: tap adds directly to cart (brief `motion-fast` scale-pulse on the card as confirmation).
- Multi-variant product: tap opens Variant Picker (§3.1, bottom sheet on tablet).
- Long-press (touch) / hover-and-click-info-icon (desktop): opens Quick Preview popover (larger image, description, variant/stock mini-matrix).
- **Recent/Favorites/Quick Products:** three horizontally-scrollable chip-card rails above the main grid, shown when search is empty/unfocused — same card component, condensed (80×80 image).

### 3.1 Variant Picker (Bottom Sheet, tablet / Modal, desktop)

`radius-lg` top corners (sheet) or full `radius-lg` (modal), `elevation-4`, scrim `color-scrim` behind.

- One row per attribute dimension (Color, Size, etc.), each value rendered as a chip (`radius-sm`, 40px min touch target)
- Zero-stock combinations: chip disabled (`opacity-disabled`), small "Out of stock" caption beneath
- Stock count badge (`type-caption`, corner of chip) appears once ≤5 combinations remain in a narrowed dimension
- "Check other branches" text link beneath the matrix if the exact combination is locally out of stock
- Footer: Quantity stepper (−/+, 40×40 buttons) + "Add to Cart" Primary button (full-width on sheet, 48px height)

---

## 4. Center Panel — Shopping Cart

Sticky footer summary (always visible) + scrollable line-item list above it.

**Cart line item row** (72px height, swipe-left reveals delete on touch / trailing icon on desktop):

```
[Thumb 56px] Denim Jacket — Blue / M          ฿1,350
             SKU: DJ-001-BLU-M          [−] 2 [+]
             ↳ 10% off (Member Price)   [note icon]
```

- Quantity stepper: 32×32 −/+ buttons flanking a tappable numeral (opens numeric keypad overlay on tap for manual entry)
- Line discount shown as a distinct `color-success` text row beneath the item, strikethrough on original unit price
- Remove: swipe-left (touch) reveals a `color-error` background + trash icon; desktop shows a trailing ✕ icon button. Either path triggers a 5s Undo snackbar, never instant unrecoverable removal
- Merge rule: scanning an identical SKU+variant already present increments its row (brief highlight flash, `color-primary` @ 8%, `motion-base`) rather than adding a duplicate row

**Cart footer** (sticky, `elevation-3` top-border shadow to separate from scrolling list above):

```
Subtotal              ฿2,700
Discount             −฿270
Tax                    ฿177
──────────────────────────
Total                 ฿2,607    (type-headline, largest element on screen)
3 items
```

"+ Discount" text button above the totals block opens the Discount Dialog (§9).

**Empty Cart state:** centered icon + "Scan or search a product to begin" (`type-subtitle`, `color-text-secondary`) — the default rest state of a fresh register, not styled as an error/warning.

---

## 5. Right Panel — Checkout

Fixed 257px (tablet) / 320px (desktop), independently scrolling if content overflows, `elevation-0` with left border.

**Customer chip (top, collapsed by default):**
```
[avatar] Walk-in Customer         [Search icon]
```
Tap expands to full Customer Panel (§5 continued below); once a customer is attached, chip shows name + Membership tier badge (`radius-full` pill, tier-colored) + Loyalty Points count.

### 5.1 Customer Panel (Expanded)

- Search field (phone/name/loyalty-card scan) → results list (avatar, name, phone, last-visit)
- "Create Customer" quick-add (name + phone fields only, inline form, `space-3` field gaps)
- Once attached: Membership tier badge, Loyalty Points balance (`type-title` numeral + "pts" label), Wallet/Store Credit balance, condensed Purchase History (last 3 orders, single-line rows), Customer Notes (Warning-tinted callout box if present, e.g., "prefers size runs small")

### 5.2 Promotions

Collapsible section, "Available Promotions" header (omitted entirely if none apply — not an empty placeholder). Applied promotions render as their own labeled row in the Cart footer area (§4), `color-success` text, never silently folded into unit price.

### 5.3 Payment Methods

Grid of large touch-target tiles (2 columns, 88px height each): Cash · Card · QR · Bank Transfer · Wallet · Gift Card · Store Credit — icon (24px) + label (`type-label`) stacked, `radius-md`, `color-surface` bg with `1px color-border`, `Selected` state = `color-primary` border + `color-primary-container` fill.

- **Split Payment:** "+ Add another method" text link beneath the tile grid; each added method shows its own amount-entry row with a running "Remaining: ฿X" indicator
- **Cash tile selected:** numeric keypad (4×3 grid, 56×56 buttons) + quick-tender row (exact amount, common denominations, next round number as chip buttons) → "Change Due" displayed in `type-headline`, `color-success`, once tendered amount covers total
- **Card/QR selected:** "Waiting for terminal…" progress state (circular indeterminate spinner + message), with Retry / Switch Method buttons appearing after a timeout

**Complete Sale button:** full-width, 56px height, Primary variant, fixed at the bottom of the Right Panel, disabled until payment fully reconciles to zero remaining balance — visually and spatially separated (`space-4` gap + divider) from the payment-method tiles above it so it's never accidentally triggered mid-selection.

---

## 6. Bottom Status Bar (40px)

Full-width, `color-surface` bg, `1px color-border` top divider. Quick Actions as icon+label button pairs, evenly distributed: New Customer · Hold Sale · Resume Sale · Price Check · Stock Check · Open Cash Drawer · Print Receipt · Reprint Receipt. Each 40×40 minimum, `type-caption` label beneath icon on tablet/desktop widths; icon-only with tooltip if space-constrained.

---

## 7. Receipt Screen (Post-Sale)

Full-screen modal takeover (not a small dialog — this is a deliberate, unhurried confirmation moment per UX State System §8's rule on scaling feedback to action significance):

```
✓  (56px check icon, color-success, brief scale-in animation)
Sale Completed
Total: ฿2,607

[Receipt preview thumbnail — thermal-format proportions]

[Print Receipt]  [Email]  [SMS]  [QR Receipt]  [Gift Receipt]
                 (button row, Secondary/Outlined variants)

[New Sale]  (Primary, full-width, 56px — the clear default next action)
```

Auto-prints to a configured thermal printer on arrival at this screen (if connected) without blocking the format-choice buttons from remaining available.

---

## 8. Returns & Exchange (Distinct Mode)

Reached via a dedicated tab/toggle from Quick Actions, not a variant of the sale screen (per `04-pos.md` §13). Layout replaces the Left Panel's Product Grid with:

1. **Order Lookup:** receipt number / QR scan / customer search — result shows the original sale's line items as a selectable list (checkbox per line + quantity stepper capped at originally-purchased quantity)
2. **Return Reason:** required Dropdown (Defective/Wrong Size/Changed Mind/Wrong Item Shipped/Other) per selected line
3. **Resolution:** segmented control — Refund (to original method) / Store Credit — surfaced once lines+reasons are set
4. Exchange flow: after resolution, Left Panel reverts to the normal Product Grid to select replacement items; Cart/Checkout panels show a net difference line ("Additional payment due: ฿150" or "Refund due: ฿80") instead of a plain total

---

## 9. Dialogs

All dialogs: `radius-lg`, `elevation-4`, scrim backdrop, focus-trapped, closable via Escape/scrim-tap, centered on tablet, full-width bottom sheet on narrower touch contexts where noted.

| Dialog | Key Contents |
|---|---|
| **Discount** | Toggle: Percentage / Fixed Amount → numeric input → live-calculated new total preview → requires Manager Approval sub-flow if above threshold |
| **Coupon** | Code input field + "Apply" button → inline success/error state within the dialog (no separate confirmation) |
| **Promotion** | Read-only list of currently-eligible promotions with "Apply" per row (most are automatic, this covers manual-eligible ones) |
| **Gift Card** | Card number/QR-scan input → balance display → "Apply to Sale" |
| **Manual Price** | Numeric keypad + reason dropdown (required) → routes to Manager Approval if below cost or beyond threshold |
| **Manager Approval** | PIN pad (6-digit) or badge-scan prompt, requester context shown ("Cashier requesting ฿200 discount on Order #1234"), Approve/Deny buttons — shared component, reused identically across every trigger context |
| **Customer Lookup** | Same as §5.1's expanded search, presented as a modal when triggered mid-flow rather than via the collapsed chip |
| **Cash Drawer** | Confirmation before manual open ("Reason for opening without a sale" required field) — always logged |
| **Shift Closing** | Denomination-breakdown entry grid → Expected vs. Actual → Difference (color-coded: `color-success` if within tolerance, `color-warning`/`color-error` beyond) → Shift Report preview → Confirm Close |

---

## 10. Tables (Held Sales / Shift History views)

Standard enterprise table component (Design System §12) instanced for: Resume Sale's held-sales list, Shift History. Supports Sorting, Filtering, Pagination, Bulk Selection (Shift History export), Quick row Actions — same component used platform-wide, not a POS-specific table variant.

---

## 11. Interaction Design

| Interaction | Behavior |
|---|---|
| Barcode Scan | Auto-submits on scan-terminator; <100ms local-index lookup; duplicate rapid scan (300ms debounce) shows "already added" toast rather than double-adding |
| Keyboard Shortcuts | `F2` search focus · `F4` add scanned item · `F9` go to payment · `F5` hold · `F6` resume · `F8` print · `Esc` cancel · `Ctrl/Cmd+N` new sale — per `04-pos.md` §19 |
| Mouse | Standard hover/click on Desktop variant |
| Touch | Primary input mode on tablet — all targets ≥48×48px (exceeding the platform's 40px baseline per the documented POS exception) |
| Drag & Drop | Not used on this screen — cart reordering isn't a supported operation |
| Context Menu | Right-click (desktop only) on a cart line: Edit Note, Duplicate, Remove |
| Hover | `color-hover` overlay, Desktop only |
| Focus | 2px `color-focus` ring, full keyboard operability maintained even though touch is primary |
| Selection | Payment tile `Selected` state per §5.3 |

---

## 12. States

| State | Treatment |
|---|---|
| Loading (shift start, catalog fetch) | Skeleton product grid (shape-matched cards), search disabled until minimum catalog cache ready |
| Skeleton | Card-shaped shimmer placeholders |
| Empty Cart | Per §4 — friendly rest state, not an error |
| No Products (search) | "No results for '[query]'" + "Check spelling" hint + "Search all branches" link |
| Offline Mode | Network icon switches to Warning color; non-blocking banner "You're offline — sales will sync automatically"; transaction flow fully uninterrupted |
| Sync Pending | Sync icon shows pending count badge; Sync Queue accessible from Settings icon |
| Payment Success | Per §7's full-screen confirmation |
| Payment Failed | Inline error on the selected payment tile, cart/state fully preserved, Retry / Switch Method buttons |
| Permission Denied | Manager Approval dialog (§9) surfaces instead of a dead-end block, for any cashier action exceeding their authority |
| Server Error | Toast + fallback to offline-cached data where available; sale is never blocked by a non-critical lookup failure |
| Retry | Consistent retry affordance across barcode-lookup, customer-lookup, and payment failures |

---

## 13. Responsive Design

| Breakpoint | Layout |
|---|---|
| **Tablet (primary target, 1024px landscape)** | 3-panel side-by-side as specified above, 48px touch targets, bottom-sheet dialogs |
| Desktop/Laptop (secondary, virtual/phone-order POS) | Same 3-panel layout, denser (List view default for product search, Grid view still available), full keyboard-shortcut reliance, standard 40px targets acceptable given mouse/keyboard primary input |
| Mobile POS (handheld scanner device) | Sequential single-column flow: Search screen → Cart screen → Checkout screen, swipeable/steppable rather than side-by-side panels; bottom nav dots indicate current step |

Touch-friendly spacing rule: minimum `space-3` (12px) gap between adjacent tappable cart-line actions on Tablet/Mobile to prevent mis-taps, exceeding the Desktop-only `space-2` minimum used elsewhere in the platform.

---

## 14. Accessibility

- Full keyboard operability preserved despite touch-primary design — every action reachable via Tab + Enter/Space, not only tap
- Screen reader labels on all icon-only controls (scan-status icon, sync-status icon, quantity stepper buttons)
- Accessible forms: Manual Price/Discount/Cash-tender numeric entry all labeled, errors `aria-describedby`-linked
- Accessible tables: Held Sales / Shift History use proper header scope and sort-state announcement
- WCAG AA contrast verified on all status badges (Promotion, New Arrival, Low Stock, Out of Stock chips) against both `color-surface` (light) and any high-contrast register-display mode
- Focus trapping + Escape-to-close + focus-return-to-trigger on every dialog (§9)

---

## 15. Figma Build Notes

- Frame: `POS/Tablet/1024` as the primary artboard; `POS/Desktop/1440` as a secondary variant sharing the same component instances at adjusted column counts
- Product Card, Cart Line Item, Payment Tile, and every Dialog are **instances** of Design System base components (Card, List Row, Button/Toggle, Dialog respectively) with POS-specific variant properties, never detached one-off frames
- Layer naming: `POS/ProductGrid/Card-Default`, `POS/Cart/LineItem`, `POS/Checkout/PaymentTile-Cash`, `POS/Dialogs/ManagerApproval`, per the `Category/Component/Variant` convention
- Touch-target override (48px) is applied via a `Screen=POS` component property/variable scope rather than editing the base component's default 40px — implementing Design Tokens' §2 Screen Token exception mechanism exactly as specified
- Variant Picker, Discount Dialog, and Manager Approval share Auto Layout structures with the platform's Bottom Sheet / Modal base components — distinguished by content, not by a separate sheet/modal implementation

---

## 16. Developer Handoff Notes

- Barcode/QR scan resolution must call the shared identifier-resolution service specified in the Barcode & Label module ([22-barcode-label.md](../deliverables/22-barcode-label.md) §13/§26) — this screen is a consumer of that service, not a separate scanning implementation.
- Variant stock-validation (§3.1) and the Cart's quantity stepper must share the exact validation logic used by the Inventory module and Product Management's own Variant Matrix, per `04-pos.md` §26 — never a locally re-derived "is this available" check.
- Manager Approval (§9) is a single shared component invoked with a context parameter (discount/price/void/return) per `04-pos.md` §26 — this UI must not implement four separate approval modals.
- Payment tile selection and Split Payment reconciliation logic must match `04-pos.md` §11 exactly — the Complete Sale button's disabled/enabled state is driven by that reconciliation, not a separately-tracked UI-only flag that could drift from the actual payment total.
- Offline-cached catalog/customer data (§12) and the local-first indexed search (§11's <100ms barcode target) both depend on the client-side store architecture specified in `04-pos.md` §26 — this UI assumes that store exists and is populated before the screen renders its first frame.

---

**Next:** 05-product-management-ui.md
