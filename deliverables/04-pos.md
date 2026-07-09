# POS (Point of Sale) Module Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md, [01-design-system.md](01-design-system.md), [02-navigation.md](02-navigation.md), [03-dashboard.md](03-dashboard.md)
**Consumed by:** fashion-ui-prompts/02-pos-ui.md

---

## 1. Module Goals

A cashier must be able to complete a standard single-item sale in **≤4 interactions**: scan/search → confirm cart → select payment → confirm payment. Every other capability (variants, promotions, loyalty, split payment, holds) layers on top without adding steps to that golden path.

This is the one module designed **touch/tablet-first**, not desktop-first (per [01-design-system.md](01-design-system.md) §19 exception) — real registers are touchscreens or touch+keyboard hybrids. Desktop remains fully supported as a secondary form factor (e.g., back-office "virtual POS" for phone orders).

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Cashier | Full transaction flow; discounts/price overrides require Manager Override (§24) |
| Sales Associate | Same as Cashier |
| Store Manager | Full transaction flow + unrestricted discount/override authority + Shift management for all cashiers + Void/Refund approval |
| Branch Manager | Store Manager scope across all registers in branch + cross-register shift reports |
| Business Owner | Read/reporting access; typically does not transact, but can if granted |

---

## 3. POS Layout

Departs from the standard app shell ([02-navigation.md](02-navigation.md) §2) — POS replaces Sidebar + standard Page Header with a dedicated full-screen transactional layout to maximize workspace and minimize distraction during a sale:

```
POS Header (56px) — compact, POS-specific (§4)
┌─────────────────────────┬──────────────────┬────────────────┐
│                         │                  │                │
│  LEFT: Product Search    │  CENTER:         │  RIGHT:        │
│  + Product Grid/List     │  Shopping Cart   │  Checkout      │
│  (§5–§7)                 │  (§8)            │  Panel         │
│                          │                  │  (§9–§11)      │
│  ~45% width              │  ~30% width      │  ~25% width    │
│                         │                  │                │
├─────────────────────────┴──────────────────┴────────────────┤
│ Bottom Status Bar (40px) — sync, network, shift, quick keys  │
└──────────────────────────────────────────────────────────────┘
```

Global Sidebar collapses to an icon-only 72px rail (or hides entirely in "Register Mode," a distraction-free full-screen toggle) — Cashier role defaults to Register Mode; Manager roles can exit to the full shell to access other modules without leaving the POS session (cart state persists).

---

## 4. Header (POS-Specific, 56px)

Left → right: Store Name + Branch (from Workspace Switcher, inherited) · Shift status chip (Open/Closed, with elapsed time) · Cashier Name + avatar · Global Search (context-aware — searches products first in POS, per §5) · Sync Status icon (✓ synced / ↻ syncing / ⚠ pending) · Network Status icon (online/offline) · Current Time/Date · Settings shortcut.

Sync and Network status are always visible (never collapsed to overflow, even on tablet) since transaction integrity depends on the cashier knowing this at a glance — see §15.

---

## 5. Product Search

Unified search box supports, in priority order: **Barcode scan** (hardware scanner input, terminates on scan character, auto-submits) → **QR scan** (camera-based, opens scanner overlay on tablet/mobile) → SKU → Product Name → Brand → Category → Collection → Color → Size → Variant attribute.

- **Autocomplete:** typeahead begins at 2 characters, results grouped (Products first, then Customers if the query looks like a phone/name — shared with Customer Panel §9).
- **Recent Searches / Popular Products:** shown as a default grid when the search field is empty and focused — recent purchases in this shift, plus store-wide top sellers, so a cashier rarely needs to type for common items.
- Barcode scan of an item already in cart increments quantity rather than adding a duplicate line (see §8 merge rule).
- Barcode scan of an unknown/unrecognized code shows an inline error toast ("Barcode not found — try manual search?") without blocking further scanning.

---

## 6. Product Grid

**Grid view** (default, touch-optimized): card per product — image, name, SKU (small, secondary), price (prominent), badges (Promotion, New Arrival, Low Stock, Out of Stock — reusing Design System badge/chip tokens). Tapping a card with a single variant adds directly to cart; a card with multiple variants opens the Variant Picker (§7) instead of adding blindly.

**List view** (toggle, better for desktop/keyboard flows): denser rows, same data, keyboard-navigable (arrow keys + Enter to add).

- **Quick Add:** a `+` affordance on hover/long-press adds the default/last-used variant directly, skipping the picker for repeat items.
- **Quick Preview:** tap-and-hold (touch) or hover info icon (desktop) opens a lightweight popover with larger image, description, and full variant/stock matrix without leaving the grid.
- Out-of-stock products remain visible (grayed, 60% opacity per Disabled token) rather than disappearing — cashiers need to tell customers "we don't have that" rather than have it look unlisted; tapping shows a "Notify when available" / "Check other branches" action instead of adding to cart.

---

## 7. Product Variants

Variant Picker (bottom sheet on tablet, modal on desktop) supports unlimited attribute dimensions — Color, Size, Fit, Length, Material, Pattern, etc. — rendered as chip-selector rows, one row per dimension.

- Selecting a combination with **zero stock** disables that specific chip combination (not the whole product) and shows "Out of stock" inline — prevents selling unavailable variants at the point of selection, not after attempting checkout.
- Stock count per variant shown as a small badge on the chip once a dimension is narrowed to ≤5 remaining combinations (avoids clutter on a full untouched matrix).
- "Check other branches" link surfaces available stock elsewhere for a sold-out-locally variant — supports a manual transfer/ship-to-customer flow (deep-links to Inventory module).

---

## 8. Shopping Cart

Each cart line: thumbnail, product name + variant summary (e.g., "Denim Jacket — Blue / M"), quantity stepper, unit price, line discount (if any), tax, line subtotal.

**Interactions:** increase/decrease quantity (stepper, per Design System §11 retail rule), manual quantity entry (tap the number, numeric keypad appears on touch), remove item (swipe-to-delete on touch, trailing icon on desktop — always with an "Undo" snackbar for 5s, never instant unrecoverable removal), per-line note (e.g., "gift wrap requested").

**Merge rule:** scanning/adding an identical SKU+variant already in the cart increments that line's quantity rather than creating a duplicate row — keeps the cart scannable during fast multi-unit sales.

**Cart-level summary** (footer, always visible, sticky): Subtotal → Discount total → Tax total → **Grand Total** (largest, Headline-weight) → item count.

---

## 9. Customer Panel

Collapsed by default to a "Walk-in Customer" chip at the top of the Checkout Panel; expands to full panel on tap.

- **Search Customer:** phone number (primary lookup key at register), name, or loyalty card scan.
- **Walk-in Customer:** default state, zero friction — a sale never blocks on customer identification.
- **Create Customer:** inline quick-create (name + phone minimum) without leaving the sale; full profile completed later in the Customers module.
- Once attached: shows Membership tier badge, Loyalty Points balance, Wallet/Store Credit balance, a condensed Purchase History (last 3 orders), and Customer Notes (e.g., "prefers size runs small — verify fit") surfaced prominently since these directly affect the current sale.

---

## 10. Promotions

Automatic discounts (member pricing, active flash sale, happy hour) apply silently and show as a labeled line-item discount — never a surprise at payment. Manual discount, Coupon, and Voucher entry available via a "+ Discount" action on the cart footer, requiring Manager Override above a configurable threshold (§24).

Supported types: Automatic Discount · Manual Discount · Coupon · Voucher · Buy X Get Y · Bundle Promotion · Flash Sale · Happy Hour · Member Pricing.

- Applied promotions show as their own cart line-item type (distinct visual treatment — Success-colored text, strikethrough on the original price) rather than silently altering the unit price, so the receipt and cart both show what was discounted and why.
- Stacking rules (which promotions combine vs. which are mutually exclusive) are enforced silently — an ineligible coupon shows a clear inline reason ("Already applying Member Pricing — higher discount kept automatically") rather than a generic rejection.

---

## 11. Payment

Payment methods: Cash · Credit Card · Debit Card · QR Payment · Bank Transfer · Wallet · Gift Card · Store Credit — each as a large touch-target tile in the Checkout Panel.

- **Split Payment:** select 2+ methods, allocate amount per method (remaining balance auto-calculates as each is entered); grand total must reconcile to zero before "Complete Sale" activates.
- **Partial Payment:** for layaway/deposit scenarios — records amount tendered vs. amount due, creates a Balance Due record linked to the sale (visible in Sales/Customer history).
- **Cash payment:** numeric keypad + quick-tender buttons (exact amount, common denominations, next round number) → auto-calculates Change Due (large, prominent display) → triggers cash drawer open (§18).
- **Card/QR payment:** integrates with connected payment terminal; shows a "Waiting for terminal…" progress state; on terminal failure, offers Retry or Switch Payment Method without losing cart state.
- Payment confirmation is the single hardest-to-reverse step in the flow — "Complete Sale" is a distinct, prominent Primary button, separated visually from adjustment controls so it's never accidentally triggered mid-edit.

---

## 12. Receipt

Formats: Thermal Receipt (default, auto-prints on sale completion if a thermal printer is configured) · A4 Invoice (for B2B/wholesale customers requiring formal invoices) · Gift Receipt (no prices shown) · Email Receipt · PDF Receipt · QR Receipt (scannable code linking to a digital copy — reduces paper, supports the "no receipt" preference).

Post-sale confirmation screen offers all applicable formats as explicit choices (not just an auto-print-and-done) — reprint is always available from Quick Actions (§18) for a configurable trailing window (e.g., current shift) to handle "can I get another copy" requests.

---

## 13. Returns & Exchange

Distinct mode (toggled from Quick Actions or a dedicated tab), not a variant of the sale screen, since the mental model and required inputs differ:

- **Full Return / Partial Return:** look up original sale (receipt number, QR scan, or customer history) → select item(s) and quantities to return → select Return Reason (required, dropdown: Defective, Wrong Size, Changed Mind, Wrong Item Shipped, Other) → select resolution: **Refund** (to original payment method where possible, or Store Credit) or **Store Credit**.
- **Exchange:** return flow immediately followed by a fresh product search to select the replacement item(s); the system nets the price difference (additional payment or partial refund) rather than treating it as two disconnected transactions.
- Return automatically triggers the same Inventory Update rules as a sale, in reverse (§16).
- Returns beyond a configurable window or without a found original sale require Manager Override (§24).

---

## 14. Shift Management

**Open Shift:** cashier enters starting cash count (denomination breakdown or single total) before the register accepts any sale.
**Close Shift:** system calculates Expected Cash (opening float + cash sales − cash refunds/payouts) → cashier enters Actual Cash (counted) → Difference auto-calculates and is flagged (Warning color) if it exceeds a small tolerance threshold, (Error color) if it exceeds a larger one requiring Manager sign-off before the shift can close.
**Cash Adjustment:** mid-shift entry for till adjustments (petty cash out, safe drop) — always requires a reason and, above threshold, Manager Override.
**Shift Report:** generated on close — total sales, payment method breakdown, discounts given, returns processed, cash reconciliation — printable and archived, linked from the Finance module.

A register cannot process a sale without an open shift — attempting to do so surfaces an "Open Shift to begin" blocking state, not a workaround.

---

## 15. Offline Mode

The POS is designed offline-first for the transactional core: Offline Sales · Offline Customer lookup (cached) · Offline Product catalog (cached, refreshed on sync) · Offline Inventory Cache (last-known stock levels, clearly timestamped) · Automatic Sync (background, retries with backoff) · Conflict Resolution · Sync Queue.

- **Entering offline mode:** Network Status icon (§4) switches to a clear Warning-colored "Offline" state; a non-blocking banner confirms "You're offline — sales will sync automatically when reconnected." Transactions continue uninterrupted.
- **Conflict resolution:** the most common conflict is a stock oversell across two offline registers selling the last unit of a variant simultaneously — resolved server-side on sync via a "first sync wins, second flagged for manager review" rule; the affected cashier/manager gets a Notification Center alert (Navigation §13, Inventory category) rather than a silent adjustment.
- **Sync Queue:** visible from Settings/Sync Status icon — shows pending offline transactions count, allows manual "Sync now" retry, and surfaces any failed items requiring manual reconciliation.
- Offline product/customer data is refreshed opportunistically whenever online, not just at shift-open, so the cache doesn't silently go stale across a long shift.

---

## 16. Inventory Update

Every completed sale/return automatically updates, in this order: Reserved Stock (released or consumed) → Branch Stock (decremented/incremented) → Warehouse Stock (if branch fulfills from warehouse-linked stock) → Inventory Ledger entry (immutable audit record: SKU, variant, quantity delta, reason=Sale/Return, linked transaction ID, timestamp, user) → Stock History (visible in Inventory module's per-product timeline).

This update is atomic with the sale transaction — a sale is never recorded as "complete" while its inventory decrement is pending; offline sales queue both together and sync as a single unit (§15).

---

## 17. Loyalty

Earn Points (auto-calculated on sale total per active loyalty rules) · Redeem Points (as a payment method or discount at checkout, §11) · Membership Upgrade (auto-detected and celebrated with a brief in-flow congratulations state when a sale crosses a tier threshold) · Rewards/Coupons (auto-suggested at checkout if the attached customer has eligible unredeemed rewards — "Sarah has a $10 reward available — apply?") · Birthday Rewards (auto-surfaced if applicable in the customer's current month, non-intrusive banner in the Customer Panel).

Full program rules/tier configuration live in module 11-loyalty; POS only *applies and displays* them, never configures them.

---

## 18. Quick Actions

Persistent action bar (bottom status bar or a dedicated side rail on tablet): New Customer · Hold Sale · Resume Sale · Price Check · Stock Check · Open Cash Drawer · Print Receipt · Reprint Receipt.

- **Hold Sale:** parks the current cart (with customer/discounts intact) under a label (auto: time + item count, or cashier-named) and clears the register for a new transaction — critical for "let me grab one more thing" customers without losing another customer's queued sale.
- **Resume Sale:** lists held sales (this register, or store-wide for managers) — resuming restores full cart state.
- **Price Check / Stock Check:** lightweight lookup modes that search and display info without adding to any cart — used constantly for customer questions ("how much is this," "do you have this in another size") without disrupting an in-progress sale.
- **Open Cash Drawer:** manual trigger (e.g., to make change without a sale) — always logged to the audit trail (§24) since it's a common theft vector if unlogged.

---

## 19. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `F2` / click search | Focus product search |
| `F4` | Add currently focused/scanned product |
| `F9` | Go to Payment / Checkout |
| `F5` | Hold Sale |
| `F6` | Resume Sale |
| `F8` | Print Receipt |
| `Esc` | Cancel current action / close modal |
| `Ctrl/Cmd + N` | New Sale (clears current cart after confirmation if non-empty) |

Consistent with the global shortcut philosophy (Navigation §18) — accelerators for visible actions, discoverable via the `?` overlay, never the only path (essential on touch registers with no physical keyboard).

---

## 20. Error Handling

| Error | Handling |
|---|---|
| Out of Stock | Blocked at variant selection (§7), not at checkout — item simply isn't addable |
| Insufficient Stock (partial quantity available) | Inline warning at quantity entry: "Only 3 available" — quantity clamps, doesn't silently oversell |
| Duplicate Barcode (scanned twice rapidly) | Debounced 300ms; second scan within window is ignored with a subtle "already added" toast rather than double-adding |
| Offline | Non-blocking (§15) — sale continues, syncs later |
| Payment Failure (terminal decline/timeout) | Inline error on the payment tile, cart/state fully preserved, Retry or Switch Method offered |
| Network Error (non-payment, e.g., customer lookup fails) | Toast + fallback to offline-cached data where available, sale not blocked |
| Sync Failure | Surfaced via Sync Status icon + Notification Center, queued item retried with backoff, never silently dropped |
| Permission Denied (e.g., Cashier attempting an over-threshold discount) | Manager Override modal (§24) — PIN/badge entry, not a dead-end block |

---

## 21. Loading / Empty States

| State | Treatment |
|---|---|
| Loading (catalog fetch on shift start) | Skeleton product grid, search remains disabled until minimum catalog cache is ready |
| Skeleton | Card-shaped shimmer placeholders matching real product card layout |
| No Product Found | "No results for '[query]'" + suggestion to check spelling/try SKU + "Search all branches" link |
| No Customer (search empty) | "No customer found" + prominent "Create Customer" and "Continue as Walk-in" actions |
| No Internet | Handled as Offline Mode (§15), not a dead-end error |
| Empty Cart | Friendly centered state: icon + "Scan or search a product to begin" — this is the default/rest state of a fresh register, not an error |
| No Promotions | Discount panel simply omits the "Available Promotions" section rather than showing an empty placeholder — absence is the normal case for most transactions |

---

## 22. Responsive Design

| Breakpoint | Layout |
|---|---|
| Tablet (primary target, 1024px landscape) | 3-column layout as specified in §3, large touch targets (48px min), bottom sheet modals |
| Desktop/Laptop (secondary, virtual/phone-order POS) | Same 3-column layout, denser (List view default), full keyboard shortcut reliance |
| Mobile POS (handheld scanner devices, e.g., roaming associate checkout) | Single-column, sequential flow: Search → Cart → Checkout as swipeable/steppable screens rather than side-by-side panels |

Touch-friendly layout rules apply platform-wide on Tablet/Mobile: 48×48px minimum targets (exceeding the Design System's 40px baseline per §10, justified by register environment — gloved hands, fast repeated taps), generous spacing between adjacent tappable cart-line actions to prevent mis-taps.

---

## 23. Accessibility

Full keyboard operability maintained even though touch is primary (§19). Screen reader labels on all icon-only controls (scan status, sync status icons). Accessible forms for manual quantity/discount entry (labeled, error-described). Accessible tables for Shift Report and cart line-item list (proper header association). Visible focus states preserved even in Register Mode's distraction-free chrome. WCAG AA contrast maintained on all status badges (Low Stock, Out of Stock, Promotion) — verified against both light and any high-contrast register-environment display settings.

---

## 24. Security

- **Role Permission:** discount/override thresholds, void authority, and returns-without-receipt are all permission-gated per role (§2).
- **Price Override Approval / Discount Approval / Manager Override:** a consistent modal pattern across all three — requests a Manager PIN or badge scan, logs the approving manager's identity against the transaction, never just a toggle a cashier can self-approve.
- **Audit Log:** every override, cash drawer open without a sale, void, and return is written to an immutable audit trail, visible in Finance/Reports, filterable by cashier/register/date.
- **Session Timeout:** register auto-locks after a configurable idle period (shorter than back-office modules, given public-facing terminal exposure) — requires cashier PIN/badge to resume; an in-progress unsaved cart is preserved, not discarded, on lock.

---

## 25. Performance

- Product/customer catalogs (100,000+ records each) are indexed and cached client-side for offline support (§15) — search hits the local index first, with instant (<100ms) results; barcode scan-to-cart-add is a local-index operation, never a network round-trip, so it meets the <100ms target even offline.
- Product Grid virtualizes rendering (windowed list) so catalog size never degrades scroll/render performance.
- Checkout completion (cart → inventory update → receipt) is optimized to feel instantaneous (<500ms perceived) — inventory sync and analytics events fire asynchronously after the receipt is already shown, never blocking the "sale complete" confirmation.

---

## 26. Developer Implementation Notes

- POS state (cart, held sales, offline queue) should be a local-first state store (e.g., IndexedDB-backed) that syncs opportunistically — the UI never blocks on network for any action described in §11–§18 except live payment terminal calls.
- Variant Picker (§7) and Quantity stepper must share the same stock-validation logic used by the Inventory module to avoid divergent "available stock" rules between POS and back-office.
- Held Sales (§18) and Offline Queue (§15) are conceptually separate persistence layers — a held sale is a deliberate cashier pause; an offline queue entry is a completed sale awaiting server sync. Do not conflate their storage or lifecycle.
- Manager Override (§24) should be a single shared component invoked with a context parameter (discount / price / void / return) rather than four separate modals, to guarantee the audit-log behavior stays consistent across all four triggers.
- Receipt generation (§12) should template from one canonical sale-data model across all six output formats, so a change to tax display logic, for instance, can't drift between the thermal and PDF renderers.

---

**Next:** 05-product-management.md
