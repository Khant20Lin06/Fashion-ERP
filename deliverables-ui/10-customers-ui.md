# Customer Management — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [10-customers.md](../deliverables/10-customers.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Covers Customer Dashboard, Customer List, and the Customer 360 profile. Per `10-customers.md`'s own scope boundary, Loyalty program configuration (tier rules, rewards catalog) belongs to a dedicated Loyalty UI — this document covers only the customer-level *view* of that standing (Membership tab, Loyalty summary), matching the read/view split fixed in that spec. The Customer 360 reuses the same Summary-Header-+-Tabs structural pattern already built for Product Detail ([06-product-detail-ui.md](06-product-detail-ui.md)), applied to a customer record.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Customers
↓
Page Header (Title + Toolbar)
↓
Customer Dashboard (KPI strip, collapsible)
↓
Filter Bar + Segment Chips
↓
Customer List (Table / Card view)
```

Row click → Customer 360 (§7), same navigation pattern as Product List → Product Detail.

---

## 2. Page Header & Toolbar

```
Customers                                             [Import] [Export] [+ New Customer]
24,180 customers · 1,204 new this month

[🔍 Search name, phone, email…]  [Segment ▾] [Membership ▾] [Branch ▾] [Filters ▾] [Saved Views ▾]     [⚏][▦]
```

---

## 3. Customer Dashboard (Collapsible KPI Strip)

9 KPI cards (condensed variant): Total Customers · New Customers · Active Customers · VIP Customers · Loyalty Members · Returning Customers · Inactive Customers · Customer Lifetime Value (avg) · Average Spend.

- VIP/Loyalty Members cards use `color-primary`/tier-color accents rather than status-alert colors — these are positive-signal metrics, not warnings
- Each card deep-links to the List, pre-filtered

---

## 4. Customer Segmentation (Chip Row, above the Filter Bar)

Distinct from generic Filters — a dedicated horizontal chip row for the platform's named segments: **VIP** · **New** · **Returning** · **High Value** · **Inactive** · **Birthday This Month** · **+ Custom Segments** (opens a saved-segment picker/creator). Selecting a segment chip applies its underlying computed rule as a filter, shown identically to a manual filter in the active-chips row beneath — segments and manual filters combine (AND), not mutually exclusive modes.

---

## 5. Customer List

**Columns:** Avatar + Customer ID · Full Name (linked) · Phone · Email · Membership Tier (badge, tier-colored: Standard=neutral, Silver=`slate-400`, Gold=`amber-500`, Platinum=`slate-600`+shimmer accent, VIP=`color-accent`) · Loyalty Points (right-aligned, tabular-nums) · Wallet Balance · Total Orders · Total Spending (right-aligned) · Last Purchase (relative + tooltip exact) · Status (badge: Active/Inactive/Blocked) · Assigned Salesperson (avatar).

**Row anatomy:**
```
☐  [avatar]  Sarah Chen              +66 81 234 5678   sarah@email.com   [Gold]   1,240   ฿350   18   ฿48,200   3d ago   [● Active]   [avatar]   ⋮
             CUST-00482
```

Row overflow `⋮`: View, Edit, New Sale (deep-links to POS/Sales Order creation with this customer pre-attached), Assign Salesperson, Archive. Bulk-action bar: `[Bulk Tag] [Bulk Membership Update] [Bulk Communication] [Export] [Bulk Delete]` — Bulk Delete only enabled when 100% of selected rows have zero transaction history, greyed with tooltip otherwise, same pattern as every other module's Archive-over-Delete rule.

---

## 6. Customer List — Card View

3-up grid at Desktop, `space-5` gutters: avatar (48px) + name + tier badge (top row), phone/email (compact), 3-stat row (Orders / Spending / Points), Last Purchase caption, overflow menu bottom-right — same structural pattern as Product Management's Card View, applied to customer content.

---

## 7. Customer 360 Profile

**Summary Header** (same `State=Full|Condensed` component pattern as Product Detail's, per `06-product-detail-ui.md` §2):

```
[Avatar 80px]  Sarah Chen                                    [Edit] [⋮]
               CUST-00482   [Gold Member]   [● Active]
               +66 81 234 5678 · sarah@email.com
                                                    18 orders   ฿48,200 lifetime   ฿1,200 outstanding
                                                    Last purchase: 3 days ago
```

- `⋮` overflow: Merge Customer, Archive, Block Customer, Export, New Sale
- Outstanding Balance renders in `color-warning` if non-zero, otherwise omitted from the stat row entirely rather than showing "฿0"

**Tabs:** Overview · Addresses · Membership · Wallet & Store Credit · Loyalty · Purchase History · Communication · Analytics — 8 tabs, all fit inline at Desktop width without overflow (unlike Product Detail's 17).

### 7.1 Overview Tab
Two-column (8+4): Left — Basic Information (editable inline, click-to-edit fields), Marketing Consent toggles (per-channel: Email/SMS/Push, each a Switch component), Tags (chip input), Notes (rich text, `color-warning` accent box if containing service-relevant flags like "prefers size runs small"). Right — Documents card (uploaded ID/contract files, if applicable for B2B).

### 7.2 Addresses Tab
Card grid of saved addresses (labeled "Home"/"Office"/etc.), each showing the full address + a small map-pin thumbnail, Default badge on the primary one per type (Billing/Shipping), "+ Add Address" card as the grid's final tile.

### 7.3 Membership Tab
Current tier (large badge + tier benefits list) → Tier Progress (progress bar toward next tier, with the specific threshold shown: "฿4,800 more to reach Platinum") → Membership History (accordion: tier changes, Auto/Manual badge + approving user if manual) → "Override Tier" action (Customer Service/Sales Manager only, opens a reason-required dialog, writes into Loyalty's own tier-change event stream per the spec's shared-source rule).

### 7.4 Wallet & Store Credit Tab
Three stat cards (Wallet Balance / Store Credit / Refund Credit) → Transaction History table (Date, Type badge, Amount [signed, color-coded], Balance After, Reference link) → "Top-up" / "Manual Adjustment" buttons (Finance Manager/authorized Cashier only, routes through Approval component above threshold).

### 7.5 Loyalty Tab
Points balance (large stat) + Tier Progress (duplicated from §7.3 for convenience) → Available Rewards (card grid, eligible-only shown, ineligible ones grayed with a tooltip reason) → Reward History table → Point Expiration nudge banner if applicable ("500 points expire in 14 days").

### 7.6 Purchase History Tab
Unified table: POS Sales / Sales Orders / Invoices / Payments / Returns / Exchanges, filterable by type via chip toggles above the table — every row deep-links to its source record in POS/Sales. Below: Favorite Products and Most Purchased Categories as two ranked mini-lists (4-col each), and a Wishlist card (product thumbnails grid) alongside Favorite Categories/Brands as read-derived signals from this same history.

### 7.7 Communication Tab
Channel tabs: **All** · Email · SMS · Push · Call Log · Chat — unified Communication Timeline beneath (same component as Marketing/Notifications' Communication History), each entry showing channel icon + subject/preview + timestamp + delivery status. "Log a Call" quick-add button (Customer Service manually logging a phone interaction) opens a compact form (date/time auto-filled, notes field).

### 7.8 Analytics Tab
Per-customer view of the same Customer Analytics metric set (CLV, Purchase Frequency, RFM position shown as a small quadrant-chart marker, Churn Risk score with AI Confidence indicator per the platform-wide AI-figure distinction rule).

---

## 8. Dialogs

| Dialog | Contents |
|---|---|
| **Create Customer** | Compact form: Name + one contact method (phone or email) minimum required, additional fields optional/collapsible — mirrors POS's quick-create, full profile completed later |
| **Edit Customer** | Same field set as Create, pre-filled, full-page or large modal |
| **Merge Customer** | Side-by-side before/after preview of the two records being merged (which fields/history will combine), explicit confirmation, reversible undo-window notice shown |
| **Import Customers** | Same 3-step pattern (template → preview → validation report) as every other module's Import |
| **Export Customers** | Format + scope + column picker — PII fields respect masking rules unless the exporting role has explicit PII access |
| **Assign Tags** | Multi-select chip picker + "+ create new tag" inline option |
| **Delete Confirmation** | Reserved for zero-history customers only, per §5's Bulk Delete rule |

---

## 9. Search Experience

Instant Search (name/phone/email/Customer ID/loyalty card) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide; phone-number search specifically must resolve near-instantly given its role as the primary POS lookup key (per the spec's performance note).

---

## 10. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring, including inline-editable Overview fields |
| Selection | Checkbox multi-select, Shift/Ctrl-click |
| Keyboard Navigation | Arrow-key tab switching on Customer 360, Tab through inline-editable fields |
| Context Menu | Right-click a List row: View, Edit, New Sale, Archive |
| Quick Actions | Row-level "New Sale" is the highest-frequency action, always visible inline (not buried in overflow) — reflecting how often Sales/Customer Service staff jump straight from a customer lookup into a transaction |

---

## 11. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table (List) / skeleton Summary Header + tab content (360 Profile), shape-matched |
| Empty Customers | New tenant: icon + "No customers yet" + "Add your first customer" / "Import customers" dual CTAs |
| No Search Results | Distinct — "No customers match '[query]'" + Clear filters |
| Offline | Cached read view on store devices (Cashier searching a customer), consistent with POS's offline-cache pattern; profile edits queue |
| Permission Denied | Standard pattern; PII fields (full address, ID numbers) masked inline with a reveal-icon rather than the whole record hidden |
| Validation Error | Inline field-adjacent (duplicate phone/email shown as a soft warning with a link to the existing record, per the spec's non-blocking rule) |
| Server Error | Inline retry, per-tab isolation on the 360 Profile |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; a brief `color-success` checkmark flash on inline-edited fields |

---

## 12. Responsive Design

| Breakpoint | List | Customer 360 |
|---|---|---|
| Desktop/Laptop | Full table, 3-up Card view | Full two-column Summary Header + full tab bar |
| Tablet | Priority columns + scroll, 2-up Card view | Condensed header, scrollable tab strip |
| Mobile CRM View | Card-per-customer stacked list | Slim sticky header, tabs become a dropdown selector |

---

## 13. Accessibility

Standard baseline: keyboard navigation, visible focus, screen reader labels (click-to-call/email icons, PII-reveal toggles), accessible forms (Address/Profile edit), accessible tables (List, Purchase History, Transaction History), WCAG AA contrast on all tier/status badges — tier badges specifically verified for contrast even with their tier-color accent treatment (Gold/Platinum shimmer must not compromise text legibility).

---

## 14. Figma Build Notes

- Frame: `Customers/List/Desktop/1440`, `Customers/360/Desktop/1440` with per-tab nested frames
- Summary Header instances the same base component/variant property (`State=Full|Condensed`) built for Product Detail — not rebuilt
- Tier badge is a new small variant set on the base Badge component (`Tier=Standard|Silver|Gold|Platinum|VIP`), each mapping to its color token per §5
- Layer naming: `Customers/List/Row-VIP`, `Customers/360/Tabs/Membership/TierProgress`, per convention

---

## 15. Developer Handoff Notes

- Wallet/Store Credit (§7.4), Loyalty (§7.5), and Purchase History (§7.6) tabs must be *views* into Loyalty's and Sales/POS's own ledgers/records — this screen never duplicates those write paths, per `10-customers.md` §27.
- Membership Tier Override (§7.3) writes into the same tier-change event stream Loyalty's engine manages — this tab never maintains a separately-tracked tier value.
- Segmentation chips (§4) should read from the same rules-engine-computed-plus-manual-tag-overlay segment field Marketing Automation and Loyalty Campaigns also consume — one unified segments source, not redefined here.
- Communication Timeline (§7.7) aggregates from each sending module's own send-log (Sales reminders, Loyalty campaigns, Marketing blasts, Notifications) rather than writing into a shared table directly — a read aggregator, per the pattern established since Marketing/Notifications' developer notes.
- PII masking/reveal (§11) must be enforced at the API/query layer, not just hidden in this UI — an export or API response must respect masking server-side regardless of what this screen displays.

---

**Next:** 11-loyalty-ui.md
