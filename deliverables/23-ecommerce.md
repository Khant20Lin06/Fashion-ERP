# Omnichannel Commerce Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [22-barcode-label.md](22-barcode-label.md) (all prior modules)
**Consumed by:** Reports, AI Analytics, Mobile Manager
**Scope note:** This module owns online/digital sales channels — Website, Mobile Commerce, Marketplaces, Social Commerce — as an *additional selling surface* over the same Product, Inventory, Sales, Customer, Loyalty, and Promotions data every other module already owns. It never re-implements product data, stock truth, pricing rules, customer identity, or loyalty mechanics — it channels them outward and brings online orders back in through Sales' existing Order-to-Cash pipeline ([09-sales.md](09-sales.md)). This closes Product Detail's SEO Information field (06 §7) and Sales' Sales Channel dimension (09 §7) into an actual owning module.

---

## 1. Module Objective

Provide enterprise omnichannel commerce — Brand Website, Mobile Commerce, Marketplace Integration, Social Commerce, Click & Collect, Ship From Store, Unified Inventory, Order Fulfillment, Customer Accounts, Digital Promotions — as the digital storefront layer sitting atop the platform's existing commerce infrastructure, not a parallel commerce system.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Super Admin | Full access, all channels/marketplaces |
| E-commerce Manager | Storefront/Catalog Publishing/Marketplace configuration, full order visibility |
| Digital Marketing Manager | Storefront content (Landing Pages, SEO, Campaign Pages), Commerce Analytics |
| Store Manager | Click & Collect / Ship From Store fulfillment for their branch |
| Warehouse Manager | Fulfillment Center operations for warehouse-sourced online orders |
| Customer Service | Online Order Management (§8), Returns (§13), Customer Portal support view |
| Order Fulfillment Team | Pick/Pack/Ship execution across assigned channels |
| Customers (Portal) | Self-service only — their own Customer Portal (§14) |

---

## 3. Commerce Lifecycle

```
Product Published → Customer Browses → Cart → Checkout → Payment
→ Order Created → Inventory Reserved → Fulfillment → Shipping → Delivery
→ Returns / Exchange
```

**Product Published** is not a separate publishing action from Product Management's own Published status ([05-product-management.md](05-product-management.md) §12) — Catalog Publishing (§7) is this module's channel-visibility toggle layered on top of that same status, per product per channel (a product can be Published for POS but Hidden from the website, using the exact Hidden-status mechanism 05 §12 already defines). **Order Created** through **Returns/Exchange** are executed by Sales' existing Order-to-Cash pipeline (09 §3) — this module is the front-end that originates the order, not a second fulfillment engine.

---

## 4. Module Structure

```
Commerce Dashboard (§5)
↓
Storefront Management (§6) ──→ Catalog Publishing (§7)
↓
Online Orders (§8) ──→ Unified Inventory (§9)
↓
Marketplace Integration (§10) ──→ Social Commerce (§11)
↓
Fulfillment Center (§12) ──→ Returns Management (§13)
↓
Customer Portal (§14)
↓
Commerce Analytics (§15)
```

---

## 5. Commerce Dashboard

Lightweight header pattern (Dashboard §4): Online Revenue · Orders Today · Conversion Rate · Average Order Value · Cart Abandonment · Inventory Availability · Marketplace Sales · Return Rate · Fulfillment SLA · Top Products.

Reuses Dashboard KPI Card/chart components verbatim (03 §6/§15); Online Revenue here is a Sales Channel-filtered slice of the same revenue figure Sales Analytics (09 §15) and the BI Dashboard (17 §5) report — never an independently tallied number, consistent with the platform-wide rule against divergent revenue calculations.

---

## 6. Storefront Management

Homepage · Category Pages · Landing Pages · Product Pages · Collections · Lookbooks · Campaign Pages (linking to Promotions' Campaign Pricing, [12-promotions.md](12-promotions.md) §14, and Marketing's Campaigns, [13-marketing-automation.md](13-marketing-automation.md) §7, for the announcing-content side) · **SEO Settings** (meta title/description/slug — the same fields Product Detail's Overview tab already surfaces per-product, 06 §7; this section is where site-wide SEO defaults and non-product page SEO are configured) · Theme Configuration (visual storefront design — distinct from and independent of the platform's own internal Design System, 01, since a public storefront's brand presentation is a separate concern from the ERP/POS back-office UI).

---

## 7. Catalog Publishing

Publish Products/Variants · Categories · Brands · Collections · Pricing (channel-specific price list, per Promotions' Channel Price List, [12-promotions.md](12-promotions.md) §13 — e.g., an E-commerce price distinct from in-store Retail Price) · Inventory Visibility (§9's ATP-driven show/hide, e.g., hiding a product once availability drops to zero rather than showing an unfulfillable "add to cart") · Product Images/Videos (reading directly from Product Management's Media gallery, 05 §8 — never a separately uploaded set of assets for the online channel).

Publishing here is fundamentally a *visibility and channel-price* decision over already-existing Product Management data — it is never where a product's core identity, description, or variant structure is authored.

---

## 8. Online Order Management

Order Queue · Order Status · Order Approval (for orders requiring review — e.g., high-value or fraud-flagged, per §23) · Payment Status · Packing · Shipping · Delivery · Cancellation · Exchange · Returns (§13).

Every online order is a Sales Order in [09-sales.md](09-sales.md) with Sales Channel = "E-commerce"/"Marketplace"/"Social" — this section is a channel-filtered view and channel-specific queue management over that same Sales Order data, not a separate order table. Order Approval, Cancellation, and Exchange reuse Sales' existing statuses and approval mechanics (09 §7/§13) rather than a parallel workflow.

---

## 9. Unified Inventory

Real-time Inventory · Inventory Reservation (writing through to Inventory's Reservation engine, [07-inventory.md](07-inventory.md) §11, Reservation Source = "Online Order," exactly the same integration pattern Sales' own Inventory Reservation section established, 09 §8) · Store Inventory · Warehouse Inventory · Safety Stock · **Available to Promise (ATP)** (the computed sellable quantity shown to online customers — On-Hand minus Reserved minus Safety Stock buffer, ensuring the website never oversells past what the business is willing to commit online while still holding some buffer for in-store walk-in demand).

ATP is this module's channel-facing application of Inventory's existing Available Stock derivation (07 §26: `On-Hand − Reserved`) with an additional Safety Stock buffer layer specific to online channel risk tolerance — computed from the same source data, never a separately tracked stock number.

---

## 10. Marketplace Integration

Amazon · Shopee · Lazada · TikTok Shop · Facebook Shop · Instagram Shop · Custom Marketplace APIs.

Each marketplace connection syncs Catalog (§7, outbound) and Orders (§8, inbound) via that marketplace's own API — configured/credentialed in Settings' Integration Settings ([20-settings.md](20-settings.md) §17), with connection health surfaced on this module's Dashboard (§5) and any sync failures routed through the Notification Center ([21-notifications.md](21-notifications.md)).

---

## 11. Social Commerce

Facebook · Instagram · TikTok · LINE · WhatsApp Catalog · **Live Shopping** (real-time streamed selling sessions, typically with a time-boxed flash-inventory allocation — ties into Promotions' Flash Sale mechanics, 12 §14, and requires tighter real-time inventory sync given the compressed sales window).

Functions as a specialized marketplace-adjacent channel (§10) — same Catalog/Order sync pattern, differentiated primarily by the platform-specific content format (shoppable posts, live-stream product pinning) rather than a fundamentally different commerce mechanism.

---

## 12. Fulfillment Center

Pick List · Packing · Shipping Labels (generated via the Barcode & Label module's Label Templates, [22-barcode-label.md](22-barcode-label.md) §9, Shipping Label type) · Courier Assignment · Tracking Number · **Ship From Store** (a physical retail branch fulfills an online order from its own stock, rather than a dedicated warehouse — requires Store staff to execute a Pick/Pack flow using the same interaction pattern as Sales' Order Fulfillment, 09 §9) · **Click & Collect** (customer picks up an online order in-store — generates a store-side notification when ready, and a simple in-store handoff flow rather than a shipping step at all).

This section is the E-commerce-specific entry point into Sales' existing Order Fulfillment mechanics (09 §9) — Pick List/Packing/Dispatch execute identically to a wholesale Sales Order's fulfillment, just sourced from an online-originated order and, for Ship From Store, from branch stock rather than warehouse stock.

---

## 13. Returns & Exchange

Return Request (customer-initiated via Customer Portal, §14) · Approval · Inspection (reusing Purchase's Quality Inspection pattern conceptually — Pass/Fail/Conditional, applied here to a returned item's resellable condition) · Refund · Exchange · **Store Return** (an online purchase returned in-person at a physical branch — requires POS/Sales Returns, 04 §13, 09 §13, to recognize and process an order that didn't originate at that register) · **Mail Return** (shipped back, processed at a returns-receiving location).

Both paths converge on the same Returns & Exchange mechanics already specified in Sales (09 §13) — this section's job is routing (which path a given return takes) and Store Return's cross-channel recognition, not a duplicated returns engine.

---

## 14. Customer Portal

Profile · Order History · Wishlist · Addresses · Payment Methods · Loyalty Points · Gift Cards · Support Tickets.

This is the customer-facing self-service surface over Customers' own record ([10-customers.md](10-customers.md)), Loyalty's points/tier data ([11-loyalty.md](11-loyalty.md) §11), and Sales' order history (09) — a customer logging into the Portal sees the same underlying data a Customer Service agent sees in Customer 360 (10 §7), presented in a self-service format, never a separate customer-identity record requiring reconciliation. Support Tickets link into Customer Service's workflow (CRM-adjacent, or a dedicated ticketing capability if the organization uses one), logged to the customer's Communication Timeline (10 §12).

---

## 15. Commerce Analytics

Sales Trend · Channel Performance · Conversion Funnel · Traffic Sources · Customer Retention · Product Performance · Return Analysis.

Reuses Dashboard/Sales/Customer Analytics chart components (03 §15, 09 §15, 10 §15); Channel Performance specifically must be sliceable consistently with Sales' own Sales by Payment Method/Sales Channel views and Reports' cross-functional rollup (17 §7), so "how is E-commerce doing" gives the same answer whether checked here, in Sales, or in Reports.

---

## 16. Search & Filter

Order · Customer · Marketplace · Channel · Product · Branch · Warehouse · Status · Date Range — same combinable filter+chip pattern used platform-wide.

---

## 17. Bulk Operations

Bulk Publish · Bulk Price Update (channel-scoped, writing to Promotions' Channel Price List, 12 §13) · Bulk Inventory Sync (force-refresh ATP across a marketplace connection) · Bulk Order Processing · Bulk Export — same preview-before-commit rule as every other bulk action platform-wide.

---

## 18. Audit Log

Product Published · Order Updated · Inventory Synced · Marketplace Connected · Promotion Applied — standard audit coverage, with Marketplace Connected specifically significant given it represents a new external system gaining API access to catalog/order data.

---

## 19. Validation

| Rule | Behavior |
|---|---|
| Inventory Availability | Blocked at Add-to-Cart/Checkout if ATP (§9) is insufficient — mirrors Sales' Insufficient Stock→Backorder handling (09 §21) for channels that support backorder, or a hard block for channels that don't |
| Duplicate Listings | Warned if the same product is already published to a marketplace connection (§10), avoiding an accidental double-listing |
| Price Conflicts | Blocked if a channel-specific price would violate a configured minimum-margin business rule (Settings, 20 §10) |
| Invalid Shipping Address | Inline validation at checkout, consistent with Customers' Address Validation (10 §8) |
| Payment Validation | Delegated to the configured Payment Gateway integration (Settings, 20 §17) — failures surface with Retry, consistent with POS's Payment Failure handling pattern (04 §20) |

---

## 20. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton dashboard/catalog/order-queue per Design System §17 |
| Skeleton | Shape-matched to the active view |
| No Orders | New channel launch: icon + "No online orders yet" + link to Catalog Publishing (§7) if the catalog itself isn't live yet |
| No Products | Blocks most of Storefront Management with "Publish your first product" CTA linking to §7 |
| Marketplace Offline | Distinct, actionable state — connection health shown on the Dashboard (§5), affected marketplace's orders/catalog sync paused with a clear reason, Notification Center alerted |
| Retry | Consistent retry affordance throughout |
| Permission Denied | Standard Navigation §19 pattern |

---

## 21. Responsive Design

| Breakpoint | Back-Office Views (Dashboard, Catalog, Orders, Analytics) | Customer-Facing (Storefront, Portal) |
|---|---|---|
| Desktop/Laptop | Full tables, full Storefront/Theme configuration | Full desktop storefront experience |
| Tablet | Priority columns + scroll; Fulfillment (Pick/Pack) is a primary tablet flow for Store/Warehouse staff | Responsive storefront, tablet-optimized checkout |
| Mobile | Card-per-row stacked lists for back-office order management | **Mobile Commerce is a first-class channel, not a degraded view** — the customer-facing storefront/checkout must be fully mobile-native (per §1's own "Mobile Commerce" objective), distinct from every other module's back-office-only Mobile scoping |

This module is unusual among the platform's specs in that its **customer-facing** surface (Storefront, Customer Portal, Mobile Commerce) demands full parity across breakpoints — unlike back-office modules where Mobile is deliberately "essentials only," a shopper's mobile checkout experience must be complete, not reduced.

---

## 22. Accessibility

Standard platform baseline for back-office views: keyboard navigation, screen reader labels, accessible forms, WCAG AA. **Accessible Checkout** specifically — the customer-facing checkout flow (Cart→Payment, §3) must meet WCAG AA independently of the back-office Design System's own accessibility rules, since it's experienced by the general public (a broader and less predictable set of assistive-technology configurations than internal staff users), including accessible form validation, clear error recovery, and full keyboard operability through payment.

---

## 23. Security

Role-Based Permissions per §2. **PCI-aware Payment Integration:** payment data never transits or stores directly within this module's own infrastructure — delegated entirely to the PCI-compliant Payment Gateway integration (Settings, 20 §17), consistent with Finance's Financial Data Encryption standard (16 §27) applied to the customer-facing collection point. **Secure Checkout:** HTTPS/TLS throughout, session security for the Customer Portal (§14) distinct from and less privileged than internal staff authentication. **Fraud Detection Hooks:** integration points for flagging suspicious orders (unusual velocity, mismatched billing/shipping, high-value first-time orders) for Order Approval (§8) review — extends the fraud-detection pattern already established in Loyalty (11 §24) and Finance (16 §29) to the higher-exposure online storefront context. **Audit Trail:** per §18.

---

## 24. Performance

Optimized for millions of products, high order volume, and real-time inventory sync: catalog browsing performance (product listing/search on the storefront) is a distinct concern from back-office search — typically served via a dedicated, cache-friendly read layer rather than hitting Product Management's transactional database directly, given public storefront traffic patterns differ substantially from internal staff usage. ATP (§9) calculation must stay current enough to avoid overselling without recalculating from scratch on every page view — an incrementally-updated cached figure, invalidated on relevant Inventory/Reservation events. Server-side pagination, lazy loading for back-office order/catalog management, consistent with the platform-wide approach.

---

## 25. Advanced Enterprise Features

Omnichannel Inventory (§9's full unification across all channels/locations) · **Endless Aisle** (an in-store associate ordering an out-of-stock-locally item for home delivery via the online channel, unifying otherwise-lost in-store sales) · **BOPIS** (Buy Online Pickup In Store, formalizing §12's Click & Collect) · **ROPIS** (Reserve Online Pickup In Store — reserve without paying online, complete purchase at pickup) · Ship From Store (§12) · **Distributed Order Management (DOM)** (intelligent order-routing logic deciding which location/warehouse fulfills a given online order based on proximity, stock, and cost — the sophisticated version of the sourcing decision Sales' Drop Shipping/Inter-Branch Sales features touch on, 09 §27, generalized here for omnichannel-scale routing) · Customer 360 (10 §7, the same profile, not a duplicate) · Personalized Recommendations / AI Product Recommendations (shared engine with Product Management's Related Products, 05 §17, and Marketing's AI Product Recommendations, 13 §25) · AI Search · AI Merchandising · Headless Commerce (API-first storefront architecture, decoupling this module's commerce logic from any specific storefront presentation layer) · Progressive Web App (PWA) · Multi-language/Multi-currency/Multi-country (ties into Settings' Localization/Currency Management, 20 §8/§12, and Finance's Exchange Rate Management, 16 §29) · CDN Image Optimization · A/B Testing (shared concept with Promotions' A/B Promotion Testing, 12 §27, and Marketing's A/B Testing, 13 §25, applied here to storefront/merchandising experiments) · Product Feed API · Webhook Events.

Additive/opt-in per the platform-wide principle — a retailer with POS-only operations never engages this module at all; one running a basic branded website uses Storefront/Catalog/Orders without DOM/Headless/PWA.

---

## 26. Developer Implementation Notes

- Catalog Publishing (§7) must read Product Management's product/variant/media/pricing data live ([05-product-management.md](05-product-management.md)) — this module stores only channel-visibility and channel-price-override flags per product, never a duplicated product catalog that could drift from the source.
- Every online/marketplace/social order must be created as a standard Sales Order in [09-sales.md](09-sales.md) with a Sales Channel attribute distinguishing its origin — Online Order Management (§8) is a filtered view/queue over that same table, not a second orders schema requiring reconciliation with Sales/Finance/Reports.
- ATP (§9) should be implemented as an incrementally-maintained cached value (updated on relevant Inventory Reservation/Movement events, per [07-inventory.md](07-inventory.md) §26) rather than computed fresh on every storefront page load — critical given public storefront traffic volume.
- Marketplace/Social Commerce integrations (§10/§11) should each be an adapter implementing one common sync interface (catalog-push, order-pull, inventory-update) — adding a new marketplace should mean writing one new adapter, not touching this module's core order/catalog logic.
- Store Return (§13) requires POS/Sales' Returns flow (04 §13, 09 §13) to look up an order by channel-agnostic reference (order number, not register/session-specific data) — a returns-processing cashier must be able to find and process an online order's return using the same interface as any in-store sale's return.
- Distributed Order Management (§25) should be a pluggable sourcing-decision service consulted at Order Created (§3) — Inventory (07), Multi-Branch (19), and this module all need to agree on which location's stock a given order line will be decremented from, so this decision must be made once, authoritatively, and referenced (not re-decided) by Fulfillment (§12).

---

**Next:** 24-mobile-manager.md
