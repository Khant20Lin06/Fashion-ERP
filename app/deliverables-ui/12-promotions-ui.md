# Promotions & Pricing Rule Engine — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [12-promotions.md](../deliverables/12-promotions.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** This module is a back-office **configuration console** — the customer/cashier-facing redemption experience lives in POS ([02-pos-ui.md](02-pos-ui.md) §5.2) and Sales, not duplicated here, per `12-promotions.md` §23's own scope note. The Rule Builder (§6) and Promotion Simulator (§9) are given the most detailed treatment in this document since they are the spec's highest-value, highest-risk surfaces — a mis-configured stacking rule reaching production is the costly failure mode this UI exists to prevent.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Promotions
↓
Page Header (Title + Toolbar)
↓
Promotion Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Promotions (default) · Coupons · Vouchers · Bundles · Member Pricing · Price Lists · Campaign Scheduling · Analytics
```

---

## 2. Page Header & Toolbar

```
Promotions                                            [Import] [Export] [+ New Promotion]
14 active · 3 scheduled · ฿284,000 discount given this month

[🔍 Search promotion, coupon code…]  [Type ▾] [Status ▾] [Branch ▾] [Channel ▾] [Filters ▾] [Saved Views ▾]
```

---

## 3. Promotion Dashboard (Collapsible KPI Strip)

10 KPI cards: Active Promotions · Scheduled Promotions · Expired Promotions · Coupon Usage · Voucher Usage · Promotion Revenue · Average Discount · Redemption Rate · Campaign ROI · Conversion Rate.

- Promotion Revenue paired with Promotion Cost as a two-line stat (not two separate cards) — "฿1.2M revenue · ฿284K cost" — keeping the margin trade-off visible at a glance rather than requiring a mental subtraction across two cards
- Each card deep-links to the Promotions list pre-filtered

---

## 4. Promotion Directory (List)

**Columns:** Promotion ID · Name (linked) · Campaign Type (icon + label) · Discount Type (badge) · Start/End Date · Status (badge: Draft/Scheduled/Active/Expired/Archived) · Priority (numeral, sortable) · Target Audience (badge: All/Segment name/Tier) · Branch · Usage Count · Budget (progress bar: spent vs. allocated) · ROI (color-coded: `color-success` if positive, `color-error` if negative).

**Row anatomy:**
```
☐  Summer Flash Sale          Flash Sale    20% Off    Jun 1–Jun 7    [● Active]   3   All Customers   All   1,204   ▓▓▓▓░░ 68%   +142%   ⋮
```

Row overflow `⋮`: View, Edit, Duplicate, Pause/Resume (context-sensitive label), Archive. Bulk-action bar: `[Bulk Activate] [Bulk Deactivate] [Bulk Delete] [Export]` — Bulk Delete restricted to zero-redemption-history promotions only, greyed with tooltip otherwise.

**Priority column is drag-reorderable** (the one legitimate drag-and-drop interaction in this module, per the prompt's "Drag & Drop Campaign Priority" requirement) — dragging a row up/down updates its Priority numeral live, with a toast confirming "Priority updated — this promotion now resolves before 'Member Pricing' in conflicts."

---

## 5. Promotion Types (Create Flow — Type Selection Step)

First step of Create Promotion: a searchable grid of type cards (icon + label), not a plain dropdown, given the breadth (16 types): Percentage Discount, Fixed Amount Discount, Buy X Get Y, Buy X Get X, Mix & Match, Bundle Discount, Category/Brand/Collection/Season Discount, Tier Pricing, Volume Pricing, Spend & Save, Gift With Purchase, Free Shipping, Manual Discount, Automatic Discount.

Selecting a type pre-configures the subsequent Rule Builder step with that type's relevant condition/action defaults (e.g., "Buy X Get Y" pre-populates a Quantity condition + a Free/Discounted-item action pairing) rather than presenting a fully blank builder every time.

---

## 6. Promotion Rule Builder (Core Configuration Step)

This is the platform's canonical visual rule-builder — the same condition/action-tree interaction pattern later reused by Marketing Automation's Journey Builder condition nodes, so its interaction model is specified here in full detail.

**Layout:** two-column — Conditions (left, 6 cols) → Actions (right, 6 cols), connected by a visual "THEN" divider.

**Conditions panel:**
```
IF  [Category ▾] [is] [Outerwear ▾]                    [✕]
AND [Branch ▾] [is any of] [Flagship, Downtown ▾]        [✕]
OR  [Membership Tier ▾] [is] [Gold ▾]                    [✕]
    [+ Add condition]      [Group: AND ▾]
```
- Each condition row: dimension dropdown (Product/Variant/Brand/Category/Collection/Season/Gender/Color/Size/Warehouse/Branch/Customer/Membership Tier/Segment/Channel/Order Amount/Order Quantity/Payment Method/Day of Week/Time Range/Holiday/Birthday/Anniversary/Referral/Coupon Code) → operator → value picker (context-sensitive: multi-select for Category, range slider for Order Amount, date-range picker for Time Range)
- AND/OR grouping is visually bracketed (a subtle left-border bracket connecting grouped rows) so nested logic reads clearly without needing to parse text
- "+ Add condition" always available; a condition group can itself be nested via "+ Add group"

**Actions panel:**
```
Apply Percentage Discount    [20]%
Award Loyalty Points          [2x] multiplier
Apply Free Shipping           [✓]

[+ Add action]
```
- Each action row: action-type dropdown (Apply %/Fixed Discount, Apply Bundle Price, Add Free Product, Issue Coupon, Issue Voucher, Award Loyalty Points, Award Cashback, Apply Free Shipping, Unlock VIP Offer) → its own value/config input
- Multiple actions chain visually as a stacked list — the UI makes explicit that a rule can trigger several actions atomically, per the spec's chaining rule

**Below both panels — Stacking & Priority:**
```
Stacking:  ○ Non-stackable (default)   ○ Stackable with: [select promotions ▾]   ○ Exclusive (blocks all others)
Priority:  [3]  (lower resolves first; ties broken by Best Discount)
```

**Conflict Detection banner** (appears live as conditions/stacking are configured, if an overlap with an existing active promotion is detected): `⚠ This overlaps with "Member Pricing" for Gold-tier customers — Best Discount will apply automatically.` — non-blocking, informational, matching the spec's resolution-not-rejection behavior for stacking conflicts.

---

## 7. Coupons Tab

**Coupon Generator:** Code pattern (prefix + auto-suffix, e.g., `SUMMER-XXXXXX`) → Type (Single-use/Multi-use/Unique-per-customer) → Format (Text code/QR/Barcode — QR and Barcode render a live preview thumbnail) → Usage Limits (per-code, per-customer) → Expiration → linked Promotion (which rule this coupon activates) → **Bulk Coupon Generation** option (quantity input, generates a downloadable batch + CSV export).

**Coupon list:** Code, Linked Promotion, Type, Usage (X of Y used, progress bar), Expiration, Status. Coupon Validation is not a separate screen — it's demonstrated live via the Simulator (§9).

**Coupon Usage History:** filterable table (Code, Customer, Order reference, Date, Discount Applied) beneath the list.

---

## 8. Vouchers, Bundles, Member Pricing, Price Lists, Campaign Scheduling Tabs (Concise Coverage)

- **Vouchers:** table (Voucher ID, Type [Gift/Cash/Discount/Promotional], Format [Digital/Printed], Balance, Status, Expiry) + "Issue Voucher" action; balance mechanics render identically to Loyalty's Gift Card UI component, reused not rebuilt
- **Bundles:** card grid (Bundle name, member products thumbnail strip, Bundle Price vs. sum-of-components struck-through, Type badge [Product Bundle/Mix & Match/Complete Look/Cross-Sell/Upsell/Season/Gift]) — bundle *composition* edits deep-link to Product Management's Bundle product type; this tab configures the *pricing rule* only, per the spec's ownership split
- **Member Pricing:** a read-mostly matrix (Tier × Price Field) showing which tier maps to which Product Management price field — "Gold → Gold Price," editable mapping, not per-product pricing (that remains in Product Management)
- **Price Lists:** table (List Name, Type [Default/Branch/Channel/Seasonal/Campaign/Multi-Currency], Scope, Active Date Range, Priority) — Priority column shares the identical drag-reorder pattern from §4, since Price List resolution follows the same most-specific-wins layering logic as Promotion priority
- **Campaign Scheduling:** calendar view (month grid) plotting every scheduled/active promotion by date range as colored bars, alongside a list view toggle — Flash Sale entries show a countdown chip when within 24 hours of starting

---

## 9. Promotion Simulator

Reached via a persistent "🧪 Simulate" button in the Rule Builder's header (§6) and the Promotion Directory's toolbar (for testing an existing live promotion against a hypothetical scenario):

```
Simulate Cart                                                    [Run Simulation]
Customer: [Search or select ▾]  (or: Anonymous / Walk-in)
Branch: [Flagship ▾]   Channel: [POS ▾]   Date/Time: [Now ▾]

Cart Items:
[+ Add item]  Denim Jacket × 2 (Outerwear, ฿1,350 each)          [✕]
              Wool Scarf × 1 (Accessories, ฿450)                  [✕]

──────────────────────────────────────────
Result:
✓ "Summer Flash Sale" applied — 20% off Outerwear         −฿540
✓ "Gold Member Pricing" evaluated — not applied (Best Discount kept the larger one)
  Loyalty Points awarded: 324 pts
──────────────────────────────────────────
Subtotal: ฿3,150   Discount: −฿540   Total: ฿2,610
```

- Runs against the **exact production resolution engine** (per the spec's explicit requirement that a simulator using separate logic would give false confidence) — this is not a separately-coded preview calculator
- Every applied AND every evaluated-but-not-applied rule is shown, with the reason the latter didn't win (critical for a Marketing Manager debugging "why didn't my new promotion apply")
- This screen is presented as a **required step** (not optional) within the Approval gate for any promotion crossing the configured margin-impact threshold — the Create/Edit flow's "Submit for Approval" button is disabled until at least one simulation has been run against the final rule configuration

---

## 10. Campaign Management Actions

Create/Edit Campaign reuses the Type Selection (§5) → Rule Builder (§6) → Review flow. Schedule Campaign: a date/time picker step with Immediate/Scheduled/Recurring options (Recurring exposes a frequency picker — Daily/Weekly/specific weekday, e.g., "every Saturday"). Pause/Resume: single-click row action, immediately reflected in Status badge, logged to Activity Timeline. Duplicate: clones the full rule configuration into a new Draft. Archive: reversible, default over Delete per the platform-wide rule.

---

## 11. Performance Analytics Tab

12-col grid: Revenue Impact + Redemption Trend (6-col each, line/area charts) → Conversion Funnel (funnel chart, 6 cols) + Customer Participation (6 cols) → Best Performing Campaigns / Worst Performing Campaigns (two ranked lists, side-by-side, 6-col each — showing both intentionally, since underperformers are as actionable as winners) → ROI Dashboard strip (per-campaign ROI bar chart, sortable ascending/descending).

---

## 12. Search Experience

Instant Search (promotion name, coupon code) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 13. Dialogs

| Dialog | Contents |
|---|---|
| **Create Promotion** | Not a modal — full-page flow: Type Selection (§5) → Rule Builder (§6) → Review & Simulate (§9 embedded) → Submit |
| **Edit Promotion** | Same flow, pre-filled; locked once Active with redemption history — an Amendment pattern applies (mirroring Purchase Order's locked-field-edit behavior) rather than free in-place editing of a live, already-redeemed promotion |
| **Generate Coupon** | Per §7 |
| **Configure Rules** | The Rule Builder (§6) itself, reachable standalone for adjusting an existing promotion's conditions/actions without re-running the full creation flow |
| **Schedule Campaign** | Per §10 |
| **Delete Confirmation** | Zero-redemption-history promotions only |

---

## 14. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover` |
| Focus | 2px `color-focus` ring throughout, including every Rule Builder input row |
| Selection | Checkbox multi-select on Directory, Shift/Ctrl-click |
| Keyboard Navigation | Tab through condition/action rows in order; Rule Builder's dropdowns fully keyboard-operable (no interaction requires a mouse) |
| Context Menu | Right-click a Directory row: View, Edit, Duplicate, Pause |
| Quick Actions | Pause/Resume as a single always-visible row icon (not buried in overflow), given how frequently a Marketing Manager needs to react quickly to an underperforming or erroring promotion |
| Drag & Drop Campaign Priority | Per §4/§8 — the only drag interaction in this module, applied consistently to both Promotion Priority and Price List Priority given their shared resolution-order semantics |

---

## 15. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Shape-matched skeletons throughout, including the Rule Builder (condition/action row placeholders) |
| Empty Promotions | New tenant: icon + "No promotions yet" + "Create your first promotion" CTA |
| No Search Results | Distinct — "No promotions match '[query]'" + Clear filters |
| Offline | Read-only cached view; automatic/eligible promotions still apply at POS using the last-synced rule set (per the spec's bounded-staleness note) — this admin console itself has minimal offline write tolerance, consistent with other configuration-heavy back-office modules |
| Permission Denied | Standard pattern; Promotion Approval and margin-sensitive fields hidden/shown-disabled per role |
| Validation Error | Inline within the Rule Builder — an invalid date range, a Stacking conflict requiring resolution, or a missing required action all surface as field-adjacent errors before the flow can proceed |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; a dedicated confirmation screen after Create Promotion's final submit, showing the Simulator's last-run result summary as a final sanity check before the promotion goes live |

---

## 16. Responsive Design

| Breakpoint | Directory / Analytics | Rule Builder / Simulator |
|---|---|---|
| Desktop/Laptop | Full tables, full charts | Full two-column Conditions/Actions canvas |
| Tablet | Condensed cards instead of side-by-side tables where relevant | Condensed builder — stacked Condition/Action cards instead of side-by-side tree, per the spec's tablet adaptation note |
| Mobile Marketing Manager View | Card-per-row stacked lists | Simplified rule creation; viewing/activating/deactivating fully supported, advanced multi-condition authoring recommended on larger screens per the spec |

This module is primarily a back-office configuration console — no customer/cashier-facing surface exists here, per §0's scope note.

---

## 17. Accessibility

Standard baseline: keyboard navigation, screen reader labels, visible focus, accessible forms, accessible tables, WCAG AA compliance. The Rule Builder's condition/action tree specifically requires full keyboard operability for add/remove-condition and add/remove-action interactions (not just the dropdowns within each row) — consistent with the same accessibility requirement already established for every other visual rule/journey builder in the platform (Marketing's Journey Builder, CRM's Kanban, Reports' Dashboard Builder, Barcode's Label Designer).

---

## 18. Figma Build Notes

- Frame: `Promotions/Directory/Desktop/1440`, `Promotions/RuleBuilder/Desktop/1440`, `Promotions/Simulator/Desktop/1440`
- Condition Row and Action Row are new small components (not yet defined in the base Design System) — built here as the first instance of this pattern, then reused by Marketing Automation's Journey Builder condition nodes per that module's own developer note referencing this one
- Priority drag-handle uses the same interaction affordance as any other platform drag-reorder context (Product Media gallery reordering) — a 6-dot grip icon, consistent icon language
- Layer naming: `Promotions/RuleBuilder/ConditionRow`, `Promotions/RuleBuilder/ActionRow`, `Promotions/Simulator/ResultLine-Applied`, per convention

---

## 19. Developer Handoff Notes

- The Rule Builder (§6) and Simulator (§9) must both compile to / execute against the exact same eligibility/stacking resolution service specified in `12-promotions.md` §15/§28 — the Simulator is not a UI-only mock calculation; it is a real call to the production engine with a hypothetical input, which is the entire reason it's trustworthy.
- Coupons/Vouchers (§7/§8) share a base "stored value / redeemable code" schema with Loyalty's Gift Cards, per `12-promotions.md` §28 — this UI's Voucher balance component should be the identical component instance used in Loyalty's Gift Card UI, not a parallel implementation.
- Price List resolution and Promotion stacking (§8/§6) should share one "effective price" computation pipeline — this UI never independently calculates a final cart-line price; it displays whatever the shared pipeline returns.
- Real-time rule execution performance (§9's simulation, and the live engine POS/Sales actually call) depends on a precomputed, channel-and-branch-scoped active rule set per `12-promotions.md` §28 — this UI's Simulator should be understood as exercising that same cached rule set, not triggering a full-table re-evaluation.
- Submit-for-Approval gating on "at least one simulation run" (§9) must be enforced server-side at the approval-request endpoint, not merely as a disabled button state client-side — a client-only gate could be bypassed by a direct API call.

---

**Next:** 13-marketing-automation-ui.md
