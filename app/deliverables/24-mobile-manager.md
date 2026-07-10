# Enterprise Mobile Workforce & Manager Platform Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [23-ecommerce.md](23-ecommerce.md) (all prior modules)
**Consumed by:** N/A (this is a client application consuming every other module's APIs)
**Scope note:** This is the actual native mobile app every prior module's "Mobile (Managers)," "Mobile Approvals & Dashboards," or "Admin Essentials" scoping note has been referring to (Finance 16 §25, Settings 20 §25, Employees 18 §22, Multi-Branch 19 §21, Suppliers 15 §21, CRM 14 §23). It is not a responsive breakpoint of the web back-office — it's a separate, purpose-built manager-facing app that reads/writes the exact same underlying data via API, reusing this platform's Design System tokens adapted to native mobile idiom rather than a shrunk desktop layout.

---

## 1. Module Objective

Provide production-ready mobile experiences for managers, executives, supervisors, owners, and operational staff — Executive Dashboard, Branch Monitoring, Sales/Inventory Monitoring, Approval Center, Task Management, Employee Monitoring, Real-time Notifications, Reports, Business Intelligence — so that every "essentials-only Mobile" carve-out named throughout this spec set has one concrete, well-designed home rather than being left as an unfulfilled promise in each module's own responsive section.

---

## 2. Target Users & Permissions

| Role | Access |
|---|---|
| Owner, CEO | Full cross-branch access, all approval tiers |
| Regional Manager, Area Manager | Region/area-scoped, per Multi-Branch's Branch/Region-level Access (19 §23) |
| Branch Manager, Store Manager | Branch-scoped |
| Warehouse Manager | Inventory Overview (§8) and Transfer Approval (§6), warehouse-scoped |
| Finance Manager | Approval Center (§6) financial thresholds, Financial Summary (§12) |
| Sales Manager | Sales Overview (§7), Discount Approval (§6) |
| Department Manager | Department-scoped Employee Overview (§10), Task Management (§11) |

Permission scoping here is not reimplemented — it consumes the exact same Role-Based Permissions and Branch/Region/Company-level Access services already established in every back-office module (Multi-Branch 19 §23, Settings 20 §27), since this app authenticates as the same user with the same role, just through a different client.

---

## 3. Mobile User Journey

```
Secure Login → Home Dashboard → Notifications → Approvals → Operations
→ Reports → Analytics → Settings
```

**Secure Login** (§22) is the one step genuinely specific to this client — biometric/PIN unlock after an initial device-bound authentication, distinct from the web back-office's session model given the mobile app is expected to be opened dozens of times a day for quick checks, not once per work session.

---

## 4. Module Structure

```
Mobile Dashboard (§5)
↓
Approval Center (§6)
↓
Sales Overview (§7) · Inventory Overview (§8) · Branch Performance (§9)
↓
Employee Overview (§10) · Task Management (§11)
↓
Reports (§12) · Notification Center (§13)
↓
Profile & Preferences (§14)
```

Bottom tab bar navigation (native mobile idiom, distinct from the web back-office's sidebar, per Design System §21's platform-appropriate adaptation principle) — five primary tabs: Home (§5), Approvals (§6), Operations (§7-§10 consolidated under one entry), Reports (§12), and Notifications (§13), with Profile (§14) reached via a header avatar tap rather than consuming a tab slot.

---

## 5. Mobile Dashboard

Today's Revenue · Today's Orders · Profit · Inventory Alerts · Low Stock · Pending Approvals · Branch KPI · Employee Attendance · Active Promotions · Top Products · Top Stores.

This is a mobile-native rendering of the same data the web Dashboard (03) and BI Dashboard (17 §5) show — same KPI Card semantics (value, trend, comparison) adapted to a single-column scrollable card stack rather than a multi-column grid, since mobile screens don't have the width for side-by-side KPI rows. Cards remain tappable, deep-linking to the relevant detail screen within this app (not out to the web back-office).

---

## 6. Approval Center

Purchase Approval (08 §10) · Sales Approval (09 §7) · Discount Approval (multiple modules) · Expense Approval (16) · Leave Approval (18 §11) · Transfer Approval (07 §8, 19 §13) · Price Override Approval · Stock Adjustment Approval (07 §9).

This is the single most important screen in the app — it's the concrete fulfillment of every prior module's shared Manager Override/Approval component's "notify the approver" step (Notifications §7's Approval Alerts) landing somewhere an approver can actually act on it in seconds. Each approval card shows the minimum context needed to decide (requester, amount, reason) with swipe or button Approve/Reject actions, and a "View full details" expansion for anything needing deeper review before deciding — never forcing a full context-switch to the web app just to approve a routine request.

---

## 7. Sales Overview

Revenue · Orders · Average Order Value · Returns · Top Products · Top Customers · Sales Trend · Branch Comparison.

Same figures as Sales Analytics (09 §15), mobile-rendered — a Sales Manager checking "how are we doing today" without opening a laptop.

---

## 8. Inventory Overview

Stock Levels · Low Stock · Out of Stock · Incoming Stock · Transfers · Warehouse Status · Inventory Value.

Same figures as Inventory Analytics (07 §15/§16's Alerts) — a Warehouse Manager can review Low Stock alerts and approve a Transfer (§6) without being at a workstation.

---

## 9. Branch Performance

Branch Revenue · Profit · Traffic · Conversion · Inventory · Employee Productivity · Ranking.

Same figures as Multi-Branch's Organization Analytics (19 §14) and the Dashboard's Regional Manager view (03 §2) — a Regional Manager's primary screen for comparing branches under their oversight while traveling between locations.

---

## 10. Employee Overview

Attendance · Late Employees · Open Tasks · Leave Requests (with inline Approve, §6) · Sales Performance · Commission Summary.

Same figures as Employees' Dashboard (18 §5) — enables a Branch Manager to check who's present/late and clear pending leave approvals from their phone before arriving at the store.

---

## 11. Task Management

Assign Tasks · Approve Tasks · Priority · Due Date · Comments · Attachments · Task Progress.

Same Task entity used throughout the platform (Employees 18 §12, CRM 14 §12) — a manager assigning a quick task ("restock the front display") while walking the floor, rather than needing to return to a desktop.

---

## 12. Reports

Daily Summary · Weekly Summary · Monthly Summary · Executive KPI · Financial Summary · Inventory Summary · Sales Summary.

These are pre-built, mobile-optimized renderings of Reports module report categories (17 §6-§14) — not the full Custom Report Builder/Dashboard Builder (17 §15/§16), which remain explicitly Desktop/Tablet-oriented per that module's own responsive scoping (17 §25) — this app surfaces curated summaries, not an authoring surface.

---

## 13. Notification Center

Real-time Alerts · Approvals (deep-linking to §6) · Reminders · Announcements · Critical System Alerts.

This is the mobile-native client for Notifications' engine ([21-notifications.md](21-notifications.md)) — push notifications are this app's primary delivery channel for that module's Channel selection (21 §10), and this screen is the in-app equivalent of the web's bell panel (Navigation §13), same underlying data.

---

## 14. Profile & Preferences

Profile · Language · Theme · Biometric Login (§22) · Notification Preferences (writing to Notifications' per-user preferences, 21 §23) · Device Management (viewing/revoking other devices logged into this account, tying into §22's Device Binding).

---

## 15. Offline Capabilities

Cached Dashboard · Offline Reports (last-synced snapshot) · **Offline Approvals** (a manager can review and decide on an approval while offline; the decision queues and applies once reconnected — critical given managers are frequently in low-connectivity environments like a warehouse basement or a store's stockroom) · Offline Tasks (create/update, syncs later) · Automatic Sync · **Conflict Resolution** (if an approval was already actioned by another authorized approver before this device's offline decision syncs, the queued action is voided with a clear notification explaining why, rather than double-processing or erroring silently — mirrors the "first sync wins, flagged for review" pattern established for POS's offline inventory conflicts, 04 §15).

This app's offline model is read-heavy-cache-plus-write-queue, consistent with the offline-tolerance pattern already established for POS (04 §15) and Inventory/Purchase's field operations (07 §21, 08 §22) — the difference here is that nearly everything a manager does on this app (reviewing, approving, checking) is exactly the kind of action that benefits from offline tolerance, unlike back-office modules where offline was a secondary concern.

---

## 16. Search & Filter

Global Search (the same engine as the web's Global Search, Navigation §9, mobile-rendered) · Branch · Department · Employee · Date Range · Status.

---

## 17. Audit Log

Login · Approval · Task Updates · Profile Changes · Device Registration — feeds the same platform-wide Audit Log infrastructure every other module writes to (each prior module's own §-numbered Audit Log section), with Device Registration specifically unique to this client given its device-bound security model (§22).

---

## 18. Validation

| Rule | Behavior |
|---|---|
| Permissions | Enforced identically to the web app — server-side, per §2, never a mobile-specific relaxed check |
| Offline Conflicts | Per §15's Conflict Resolution rule |
| Session Expiry | Biometric/PIN re-auth required after a configurable idle period, shorter than a typical web session given the device leaves the user's hand more often (set down, handed to someone else) |
| Approval Rules | Same thresholds/tiers as Settings' Approval Configuration (20 §11) — this app never has its own separate approval-rule configuration |
| Invalid Requests | Standard error handling, consistent with the platform-wide pattern |

---

## 19. Loading / Empty / Error States

| State | Treatment |
|---|---|
| Loading | Skeleton screens matching each screen's final layout, per Design System §17's pattern adapted to native mobile shimmer conventions |
| Skeleton | Shape-matched per screen |
| Offline | Persistent, unmissable but non-blocking banner (distinct from a web banner given mobile's smaller viewport — likely a slim top bar) — "Offline — showing cached data from [time]" |
| No Data | Positive-framed where appropriate (e.g., "No pending approvals — you're all caught up," mirroring Notifications' §18 empty-state philosophy) |
| Permission Denied | A screen/tab a role cannot access is omitted from the tab bar/navigation entirely, consistent with the Sidebar's permission-based-visibility rule (Navigation §4) |
| Server Error | Inline retry per screen/card, never a full-app blocking error for one failed data source |
| Retry | Consistent retry affordance throughout |

---

## 20. Responsive Design (Device Support)

Android Phones · iPhone · Foldables · Small Tablets · Large Tablets · Landscape · Portrait.

Unlike every other module's "Desktop/Laptop/Tablet/Mobile" breakpoint table, this module's entire responsive concern is device-class adaptation *within* mobile/tablet form factors — phone-portrait is the primary design target (single-column card stack, bottom tab bar), tablet sizes get a two-column adaptation of the same screens (not a different information architecture), and foldables must handle the fold-transition gracefully (content reflows rather than being clipped or stretched awkwardly across the hinge).

---

## 21. Accessibility

Large Touch Targets (following platform-native minimum sizes — 44pt iOS / 48dp Android, both meeting or exceeding the Design System's 40px baseline, 01 §10) · VoiceOver / TalkBack (native screen reader support, the mobile-platform equivalent of the web's ARIA requirements) · Dynamic Font Size (respecting the OS-level text-scaling setting, distinct from the web's fixed typography scale, 01 §4 — this app must reflow gracefully as users increase system font size) · Keyboard Navigation (for external keyboard use, e.g., tablet + keyboard case setups) · WCAG AA.

---

## 22. Security

**Biometric Authentication** (Face ID/Touch ID/fingerprint as the primary unlock after initial login) · **PIN Lock** (fallback for devices/users without biometric hardware or as an additional factor) · **Device Binding** (a login session is tied to a specific registered device; a new device requires fresh authentication, visible/revocable in Device Management, §14) · **Secure Token Storage** (auth tokens in platform-native secure storage — iOS Keychain / Android Keystore — never plain local storage) · **Remote Logout** (an admin, or the user themselves from another device, can invalidate a specific device's session) · Session Timeout (§18) · **Encrypted Local Storage** (offline-cached data, §15, is encrypted at rest on-device, consistent with the Financial Data Encryption standard established in Finance, 16 §27, given how much sensitive dashboard/approval data this app caches locally).

---

## 23. Performance

Optimized for Slow Networks · **Offline-first** (§15's caching-plus-queue architecture as the default assumption, not a fallback) · Background Sync (refreshing cached data and processing queued actions without requiring the app to be in the foreground) · Push Notifications (native OS push, the primary delivery mechanism for Notifications' real-time alerts, 21 §22) · **Battery Optimization** (background sync frequency tuned to balance freshness against battery drain — a concern genuinely unique to this client among all platform modules, since a laptop-based web session has no equivalent battery-life constraint).

---

## 24. Advanced Enterprise Features

**Live KPI Dashboard** (real-time-updating figures via push/websocket rather than pull-refresh) · **Geo-fenced Branch Monitoring** (location-aware alerts, e.g., notifying a Regional Manager when they're physically near an underperforming branch — extends the Geo-fencing concept already established for Employees' Attendance, 18 §26) · Executive Scorecards (mobile rendering of Reports' Executive KPI Scorecards, 17 §29) · Digital Approvals (§6, formalized) · **AI Business Summary** and **AI Daily Briefing** (a generated plain-language morning summary — "Yesterday's revenue was up 8%, Branch 3 has 2 pending approvals, Stock levels are healthy" — extending Reports' AI Insights, 17 §29, into a proactive push rather than something a user has to go look for) · Voice Commands · Offline Analytics (§15) · Camera-based Barcode Scanning / QR Scanning (using the device camera as a Scan Center input, [22-barcode-label.md](22-barcode-label.md) §13 — e.g., a manager scanning a product on the shelf to pull up its stock/pricing detail) · Mobile Printing (initiating a Barcode & Label print job, 22 §11, from the phone to a connected/networked printer) · Location-based Alerts · Wearable Notification Support (smartwatch mirroring of critical push notifications).

Additive/opt-in per the platform-wide principle — a smaller organization's managers use Dashboard/Approvals/Notifications without ever engaging Voice Commands or Wearable support.

---

## 25. Developer Implementation Notes

- This app must consume the exact same backend APIs/services every web back-office module exposes — Approval Center (§6) calls the identical approval-processing endpoint the web app's Approval dialogs use (per the security principle established in Notifications §24: "a click from an email/push notification is not a separate, potentially less-secure code path"), extended here to mobile-originated approval actions.
- Permission/role scoping (§2) must be enforced server-side identically regardless of client — this app has no elevated or relaxed trust simply because it's a "manager convenience" app; a request from this client passes through the exact same Role-Based Permissions and Branch/Region-level Access checks as a web request.
- Offline queue and Conflict Resolution (§15) should reuse the same "first sync wins, flagged for review" architecture already implemented for POS (04 §15) and Inventory/Purchase field operations (07 §21, 08 §22) — one conflict-resolution strategy across every offline-tolerant client in the platform, not a fourth bespoke implementation.
- Push Notification delivery (§13/§23) is this app registering as a delivery channel with the Notifications engine ([21-notifications.md](21-notifications.md) §10) — this app does not implement its own separate alerting/trigger logic; it's a consumer of that module's existing pipeline.
- Camera-based scanning (§24) should call the same identifier-resolution service specified in Barcode & Label's Scan Center ([22-barcode-label.md](22-barcode-label.md) §13/§26) — this app's camera is simply an additional scan-input modality feeding that shared service, not a separate scanning implementation.
- Given this is explicitly scoped for Flutter/React Native/native implementation (per the prompt's own Final Instruction), the design token consumption should follow Design System §21's Figma-to-code guidance — reusing the same color/spacing/typography *values* via platform-appropriate theme objects (Flutter ThemeData, React Native StyleSheet tokens), never re-deriving a separate visual language for mobile.

---

**Next:** 25-ai-analytics.md
