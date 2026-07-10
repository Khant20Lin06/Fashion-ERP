# Omnichannel Commerce — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [23-ecommerce.md](../deliverables/23-ecommerce.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Per `23-ecommerce.md`'s ownership boundary, this module is a digital storefront layer over Product/Inventory/Sales/Customer/Loyalty/Promotions data — it never re-implements product data, stock truth, pricing rules, or customer identity. This document covers the **back-office management console**; the customer-facing storefront/checkout itself is out of scope for this ERP/POS UI set (it's a separate consumer-facing product), but is referenced where this console configures it. **This is the one module where "Mobile" means something different**: per §21's responsive table, back-office screens follow the platform's usual essentials-only mobile scoping, but any customer-facing surface this module configures must itself achieve full mobile parity when actually built, since Mobile Commerce is explicitly a first-class channel.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > E-Commerce
↓
Page Header (Title + Toolbar: Channel Selector, Store Selector)
↓
Commerce Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Storefront · Catalog Publishing · Online Orders (default) · Unified Inventory · Marketplace Integration · Social Commerce · Fulfillment · Returns · Customer Portal · Analytics
```

---

## 2. Page Header & Toolbar

```
E-Commerce                                            [Sync Now] [+ Connect Marketplace]
3 channels connected · Last sync: 1m ago

[🔍 Search order, product…]  [Channel ▾] [Store ▾] [Filters ▾] [Saved Views ▾]
```

**Channel Selector** (E-commerce/Marketplace/Social/POS-for-comparison) is pinned prominently since nearly every view in this module is channel-sliceable — mirroring Sales UI's own Channel selector prominence.

---

## 3. Commerce Dashboard (Collapsible KPI Strip)

10 KPI cards: Online Revenue · Orders · Conversion Rate · Average Order Value · Website Visitors · Cart Abandonment Rate · Customer Growth · Product Views · Return Rate · Online Profit.

- Online Revenue reconciles exactly with Sales Analytics' channel-filtered revenue figure — never independently tallied, per the spec's explicit rule
- Cart Abandonment Rate rendered with a "Recover" quick-link into the Abandoned Cart Recovery campaign (Marketing Automation)

---

## 4. Storefront Tab

Card-based configuration list, not a live page builder (that lives in a separate storefront-authoring tool this console links out to): Homepage settings summary → Category Pages → Landing Pages → Banner Management (image upload + link target + active date range per banner, drag-reorderable priority) → Content Blocks (reusable modular sections) → SEO Settings (site-wide defaults) → Theme Configuration (a "Preview Storefront →" external link, since storefront visual branding is explicitly a separate concern from this back-office Design System).

**Banner Management** gets the most detailed in-console treatment: a card grid of active/scheduled banners, each with image thumbnail, link target, date range, and a live/scheduled/expired status badge — drag-to-reorder priority (keyboard-operable "Move up/down" alternative available per the platform's drag-and-drop accessibility rule).

---

## 5. Catalog Publishing Tab

**Columns:** Product (thumbnail + name) · SKU · Variant count · Price (channel-specific, editable inline) · Stock (ATP, read-only, sourced from §7) · Status (Published/Draft/Hidden per channel — a small multi-channel indicator showing which channels this product is live on: `● POS ● Web ○ Marketplace`) · Channel.

Row overflow `⋮`: View in Product Detail, Publish/Unpublish per channel (opens a channel-checklist popover rather than a single toggle, since a product's visibility is independently configurable per channel), Edit Channel Price. Bulk-action bar: `[Bulk Publish] [Bulk Price Update] [Bulk Inventory Sync] [Export]`.

**Publish action** never opens a product-editing form here — it deep-links to Product Management/Product Detail for actual content changes, since this tab only controls channel-visibility and channel-price overrides, per the spec's ownership split.

---

## 6. Product Content (within Catalog Publishing — drill-in, not a separate tab)

Clicking a product opens a **read-mostly review panel**: Product Images/Gallery/Videos (thumbnail grid, sourced live from Product Management's Media tab — an "Edit in Product Management →" link for any change, never edited here) → Description/Size Guide/Material Information (same read-with-deep-link pattern) → **SEO Metadata** (SEO Title, Meta Description, Keywords, URL Slug — these fields ARE editable here, since they're channel/publishing-specific rather than core product content) → Sitemap Status indicator (Included/Excluded, Last Crawled).

---

## 7. Online Orders Tab

**Columns:** Order Number (linked — same Sales Order component instance as [09-sales-ui.md](09-sales-ui.md) §4, filtered to Channel=E-commerce/Marketplace/Social) · Customer · Channel (icon) · Payment Status (badge) · Fulfillment Status (badge) · Shipping Status (badge) · Total Amount · Order Date.

This table is explicitly **the same Sales Order List component**, pre-filtered — not a parallel order table — so clicking any row opens the identical Sales Order Detail page ([09-sales-ui.md](09-sales-ui.md) §5), with Confirm/Cancel/Refund/Exchange/Print Invoice actions all being the exact same actions specified there. This tab exists purely as a channel-scoped queue/view, per the spec's explicit rule against a duplicated order schema.

---

## 8. Unified Inventory Tab

Real-time ATP (Available to Promise) view: Product/Variant, Store Inventory, Warehouse Inventory, Reserved (online), **ATP** (the computed sellable-online quantity — On-Hand minus Reserved minus Safety Stock buffer, shown with a small formula tooltip: "142 on-hand − 8 reserved − 20 safety buffer = 114 ATP"). This is a read view into Inventory's own Reservation/Stock Movement data — no write affordance exists on this tab beyond a manual "Force Sync" action per row (for troubleshooting a stuck sync).

**Stock Reservation** entries created by online orders appear identically in Inventory's own Reservations tab ([07-inventory-ui.md](07-inventory-ui.md) §11) with Source="Online Order" — this tab is simply a channel-filtered lens on that same data.

---

## 9. Marketplace Integration Tab

**Connection cards** (one per marketplace: Shopee, Lazada, Amazon, TikTok Shop, Facebook Shop, Instagram Shop, Custom API): each shows connection status (● Connected/Error/Not Connected badge), last sync time, and a "Configure →" / "Reconnect" action.

**Product Mapping:** a table matching this platform's SKUs to each marketplace's own listing IDs — Product, Marketplace Listing ID, Sync Status (Matched/Unmatched/Conflict badge), "Map" action for Unmatched rows (search-select the corresponding marketplace listing).

**Order Sync** status: a small live feed of recent inbound order syncs per marketplace, with **Error Logs** (a filterable table: Marketplace, Error Type, Product/Order reference, Timestamp, Retry action) surfaced prominently since marketplace sync failures are a common, important operational issue.

"+ Connect Marketplace" opens a connection wizard: select marketplace → OAuth/API credential entry (delegates to Settings' Integration Settings for actual secret storage) → initial catalog sync preview → confirm.

---

## 10. Social Commerce Tab

Mirrors Marketplace Integration's card/connection pattern (§9) for Facebook, Instagram, TikTok, LINE, WhatsApp Catalog — plus a distinct **Live Shopping** sub-section: scheduled/past live-selling sessions (Date, Platform, Duration, Peak Viewers, Orders Generated, linked Flash Sale promotion if applicable) — reusing Promotions' Flash Sale countdown-chip visual treatment for upcoming sessions.

---

## 11. Fulfillment Tab

**Pick List / Packing** views reuse Sales UI's own Fulfillment components ([09-sales-ui.md](09-sales-ui.md) §7) exactly — this tab is the channel-scoped entry point, not a separate fulfillment implementation.

**Ship From Store** and **Click & Collect** get their own distinct queue views since they're operationally different from warehouse-sourced fulfillment:
- **Ship From Store queue:** Order, Assigned Store (branch), Stock availability confirmation, Pick/Pack/Ship steps identical to warehouse fulfillment but executed by store staff
- **Click & Collect queue:** Order, Store, Status (Preparing/Ready for Pickup/Collected badge) — "Mark Ready" triggers a customer notification automatically (via Notifications), and a simple in-store handoff confirmation (no shipping step at all) once the customer arrives

---

## 12. Returns Tab

Reuses Sales UI's Returns & Refunds components ([09-sales-ui.md](09-sales-ui.md) §9) exactly, with two additional channel-specific paths surfaced as filter chips: **Store Return** (an online purchase returned in-person — this tab and POS's own Returns flow must recognize the same order by a channel-agnostic reference) and **Mail Return** (shipped back, processed at a returns-receiving location, with a tracking-number field for the inbound shipment).

---

## 13. Customer Portal Tab (Admin View of the Customer-Facing Portal)

Not the portal itself (that's customer-facing, outside this back-office console) — this tab is where E-commerce Manager/Customer Service staff can preview/troubleshoot a customer's portal experience: a searchable customer lookup → read view of that customer's Profile/Order History/Wishlist/Addresses/Payment Methods/Loyalty Points/Gift Cards/Support Tickets exactly as the customer would see them, sourced live from Customer 360/Loyalty ([10-customers-ui.md](10-customers-ui.md)) rather than a separate portal-specific data copy. A "View as Customer" mode toggle is the closest this tab gets to the actual portal, used for support troubleshooting.

Support Tickets specifically: a lightweight ticket list (Subject, Status, Created Date) linking into whatever ticketing capability the organization uses, logged to the customer's Communication Timeline.

---

## 14. Promotion Integration (Reference, not a separate tab)

Online Discount/Coupon/Campaign/Flash Sale/Bundle Offer configuration all happens in Promotions UI ([12-promotions-ui.md](12-promotions-ui.md)) and Marketing Automation UI ([13-marketing-automation-ui.md](13-marketing-automation-ui.md)) — this module has no separate promotion-authoring surface; Catalog Publishing (§5) and Storefront (§4) simply display which promotions are currently affecting a given product/page, with a "Configure in Promotions →" link, consistent with those modules' explicit ownership of pricing/campaign mechanics.

---

## 15. SEO Management (Reference, within Catalog Publishing and Storefront)

Per-product SEO fields live in §6's product drill-in; site-wide SEO defaults live in §4's Storefront tab — there is no separate "SEO Management" screen, since SEO configuration is contextual to the content it describes rather than a standalone destination.

---

## 16. Analytics Tab

12-col grid: Sales Analytics (channel-filtered, 6 cols) + Product Performance (ranked list, 6 cols) → Customer Behavior + Conversion Funnel (funnel chart, 6-col each) → Traffic Source (donut/bar, 6 cols) + Campaign Performance (cross-referenced with Marketing Automation's own Analytics, 6 cols).

Reuses Dashboard/Sales/Marketing Analytics chart components throughout — no new visualization type introduced here.

---

## 17. Search Experience

Instant Search (order/product/customer) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 18. Dialogs

| Dialog | Contents |
|---|---|
| **Publish Product** | Channel checklist (POS/Web/Marketplace/Social, per channel) + channel-price override fields → Confirm |
| **Sync Inventory** | Manual "Force Sync" trigger — scope selector (this product / this channel / all) + confirmation showing estimated affected item count |
| **Connect Channel** | The connection wizard per §9 |
| **Refund Order** | Same Refund dialog instanced from Sales UI ([09-sales-ui.md](09-sales-ui.md) §11) — not rebuilt |
| **Delete Product** | Not offered from this module — product deletion is a Product Management concern; this dialog is replaced with "Unpublish from all channels" instead, consistent with the spec's channel-visibility-only ownership |

---

## 19. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row/card `color-hover`, overflow reveal |
| Focus | 2px `color-focus` ring throughout |
| Selection | Checkbox multi-select on Catalog/Orders tables, Shift/Ctrl-click |
| Keyboard Navigation | Tab through form fields, table cell arrow-key traversal |
| Drag & Drop Content Builder | Banner Management's priority reordering (§4) — the only drag interaction in this module, with the keyboard-operable "Move up/down" alternative always available |
| Quick Actions | "Force Sync" and "View Order" kept always-visible on relevant rows given how frequently sync troubleshooting and order lookups happen |

---

## 20. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton dashboard/table per active view |
| Empty Store | New channel launch: icon + "No online orders yet" + link to Catalog Publishing if the catalog itself isn't live yet |
| No Products | Blocks most of Storefront/Catalog with "Publish your first product" CTA linking to §5 |
| Sync Failed | Marketplace connection card shows a clear `● Error` badge + reason; affected marketplace's catalog/order sync pauses with Error Logs (§9) capturing detail; Notification Center alerted |
| Payment Failed | Reflected within the Online Orders tab (same Payment Status badge treatment as Sales UI) — resolution happens through Sales' own payment-failure flow, not duplicated here |
| Permission Denied | Standard pattern; Marketplace credential fields masked/restricted per Settings' Integration Settings access rules |
| Validation Error | Inline — Invalid Shipping Address at checkout-adjacent contexts (Fulfillment tab), Price Conflict warnings when a channel price would violate a configured minimum-margin rule |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation for Marketplace Connection and Bulk Publish given their broader visibility/reach implications |

---

## 21. Responsive Design

| Breakpoint | Back-Office Views (this console) | Customer-Facing Surfaces (out of this UI set's scope) |
|---|---|---|
| Desktop/Laptop | Full tables, full Storefront/Theme configuration | Full desktop storefront experience (built separately) |
| Tablet | Priority columns + scroll; Fulfillment (Pick/Pack) is a primary tablet flow for Store/Warehouse staff | Responsive storefront, tablet-optimized checkout |
| Mobile Commerce Manager View | Card-per-row stacked lists for back-office order/catalog management — **this console itself follows the platform's usual essentials-only mobile scoping** | **Mobile Commerce is a first-class channel** — the customer-facing storefront/checkout (a separate product from this admin console) must achieve full mobile-native parity, not a degraded view, per the spec's explicit exception |

The distinction in the right column is important: this back-office admin console is scoped like every other management screen in the platform (essentials on mobile), but the actual shopper-facing experience it configures is held to full-parity standards elsewhere.

---

## 22. Accessibility

Standard baseline: keyboard navigation, screen reader labels, accessible tables, accessible forms (Banner/Product Mapping/Connection Wizard entry), visible focus, WCAG AA. Banner Management's drag-reorder requires the keyboard-operable "Move up/down" alternative per §19, consistent with every other drag-and-drop surface in the platform.

---

## 23. Figma Build Notes

- Frame: `Ecommerce/Dashboard/Desktop/1440`, `Ecommerce/CatalogPublishing/Desktop/1440`, `Ecommerce/MarketplaceIntegration/Desktop/1440`
- Online Orders table **instances** the exact Sales Order List/Detail components from Sales UI — never redrawn as a second order table
- Connection cards (Marketplace/Social) are a new small component (`ConnectionCard`, `Status=Connected|Error|NotConnected` variant), reused identically across both tabs
- Layer naming: `Ecommerce/CatalogPublishing/Row-MultiChannel`, `Ecommerce/Marketplace/ConnectionCard-Shopee`, `Ecommerce/Fulfillment/ClickCollect-Row`, per convention

---

## 24. Developer Handoff Notes

- Catalog Publishing (§5) must read Product Management's product/variant/media/pricing data live — this module stores only channel-visibility and channel-price-override flags per product, never a duplicated product catalog, per `23-ecommerce.md` §26.
- Every online/marketplace/social order must be created as a standard Sales Order with a Sales Channel attribute — Online Orders (§7) is a filtered view/queue over that same table, never a second orders schema requiring reconciliation with Sales/Finance/Reports.
- ATP (§8) must be an incrementally-maintained cached value, updated on relevant Inventory Reservation/Movement events, not computed fresh on every view load — critical given potential storefront traffic volume once the customer-facing surface is built.
- Marketplace/Social Commerce integrations (§9/§10) should each be an adapter implementing one common sync interface (catalog-push, order-pull, inventory-update) — adding a new marketplace should mean writing one new adapter, never touching this module's core order/catalog logic.
- Store Return (§12) requires POS/Sales' Returns flow to look up an order by channel-agnostic reference (order number) — a returns-processing cashier must be able to find and process an online order's return using the identical interface as any in-store sale's return.

---

**Next:** 24-mobile-manager-ui.md
