# Enterprise Mobile Workforce & Manager Platform — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [24-mobile-manager.md](../deliverables/24-mobile-manager.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Unlike every prior module in this UI set, this is not a responsive breakpoint of a web screen — it's a separate native app consuming the same backend APIs, using the same Design System tokens adapted to native mobile idiom per `24-mobile-manager.md` §1. This document specifies phone-portrait as the primary target (bottom tab bar, single-column card stack), with tablet as a two-column adaptation of the same screens, not a different information architecture.

---

## 1. App Structure

```
Splash Screen → Login (biometric/PIN unlock after initial credential auth) → Home Dashboard
                                                                                   ↓
                                                          Bottom Tab Bar: Home · Approvals · Operations · Reports · Notifications
                                                                                   ↓
                                                          Profile reached via header avatar tap (not a tab slot)
```

**Splash Screen:** logo centered on `color-background`, brief (≤800ms), transitions to Login or directly to Home if a valid session/biometric unlock succeeds.

**Login:** Email/Phone + Password (first-time or after Remote Logout) → **Biometric Login** (Face ID/Touch ID/fingerprint icon, large centered touch target, "Use PIN instead" fallback link) for all subsequent app opens — this is the primary unlock path given how many times a day this app gets opened for quick checks.

---

## 2. Mobile Design Principles Applied

One-hand usage: primary actions (Approve/Reject, tab bar) sit in the lower two-thirds of the screen, reachable by thumb without regrip. Fast decision making: Approval cards show only the minimum context needed to decide, with "View full details" as an explicit secondary action, not the default. Quick actions: every list screen's most common action is a single tap, never buried in a menu. Real-time information: KPI values and Pending Approval counts update live via push/websocket, not pull-refresh-only. Low cognitive load: one primary metric per card, never a dense multi-column table squeezed onto a phone screen. Touch-friendly: all targets meet or exceed 44pt(iOS)/48dp(Android).

---

## 3. Home Dashboard

Single-column scrollable card stack, `space-4` horizontal margin:

```
[Header: Avatar] Good morning, Priya          [🔔 3]
Downtown Branch ▾

┌─────────────────────┐
│ Today's Revenue        │
│ ฿142,850                │
│ ▲ 8.2% vs yesterday      │
│ [sparkline]              │
└─────────────────────┘
┌─────────────────────┐
│ Today's Orders          │  ← swipeable card stack (Today's Sales,
│ 84                        │    Revenue, Profit, Orders, Customers,
└─────────────────────┘     Inventory Status, Low Stock, Pending
     ● ○ ○ ○ ○ ○ ○ ○         Approvals, Branch Performance)

⚠ 3 Pending Approvals               [View All →]
📦 5 Low Stock Alerts                [View All →]

Quick Actions
[Approve] [Scan] [Reports] [Contact] [+ Task]
```

- **Swipe Cards:** KPI cards render as a horizontally swipeable carousel (one full-width card visible at a time, dot-indicator beneath) rather than a scrollable row of partial cards — a deliberate mobile-native pattern distinct from the web Dashboard's horizontal-scroll KPI row, since full-width single-card focus reads better on a narrow screen than a peek-preview strip
- Each card: Label → Value (large, `type-headline`-equivalent scaled for mobile) → Trend (▲/▼ + % + comparison text) → optional sparkline — same KPI Card semantics as the web Dashboard, native-adapted layout
- **Quick Summary** banner rows (Pending Approvals, Low Stock) sit below the swipeable cards as persistent, tappable alert rows — always visible without swiping, since these are the two most action-critical signals

---

## 4. Quick Actions (Persistent Row)

Approve Request · View Sales · Check Inventory · Scan Barcode · View Reports · Contact Employee · Create Task — rendered as a horizontally scrollable icon+label chip row beneath the Home Dashboard's alert banners, and also reachable via a **Floating Action Button** (bottom-right, thumb-reachable) that expands into the same action set on tap — giving two equally-fast paths to the same shortcuts depending on where in the app the user currently is.

---

## 5. Approvals Tab

**List:** card-per-request, most-urgent/oldest-first — each card:

```
┌─────────────────────────┐
│ Discount Request              ฿1,200 │
│ Nina L. · Order #4790                 │
│ 2h ago                                  │
│                                         │
│ [Reject]              [Approve]         │
└─────────────────────────┘
```

- Card types: Purchase Approval, Discount Approval, Leave Approval, Refund Approval, Transfer Approval — same card anatomy, type-specific icon/color accent (matching each type's web-equivalent status color)
- **Swipe gesture:** swipe-right on a card to Approve, swipe-left to Reject (with a confirming haptic + brief undo-toast before the action commits, given how easy an accidental swipe is) — buttons remain the primary, always-visible path; swipe is an accelerator, never the only way
- Tapping a card (not the action buttons) expands to a detail view: full context, a **Comment** field (optional, attached to the approval decision), and **History** (this approver's or others' prior decisions on similar requests, for pattern reference)
- Approve/Reject call the identical authenticated endpoint the web app's Approval dialogs use — no separate mobile-only approval code path

---

## 6. Operations Tab (Consolidated Branch/Sales/Inventory Monitoring)

Segmented control at the top: **Branches** · **Sales** · **Inventory** — one screen, three content modes, rather than three separate tabs (preserving the 5-tab bottom nav budget for Home/Approvals/Operations/Reports/Notifications).

### 6.1 Branches
Branch List (card-per-branch: name, revenue, status dot) → tap opens Branch Performance (KPI cards + Sales Comparison bar chart, mobile-native single-column) → Staff Status (present/absent/on-leave counts, tap-through to Employee Management, §9) → Inventory Overview (branch-scoped stock health summary).

### 6.2 Sales
Daily Sales (large stat + sparkline) → Sales Trend (swipeable Day/Week/Month chart, same segmented-toggle pattern as web) → Top Products / Top Categories (ranked mini-lists) → Sales Target (progress ring) → Employee Performance (ranked list, tap for individual detail).

### 6.3 Inventory
Stock Overview (KPI cards: Total Value, Available, Reserved) → Low Stock Alert / Out of Stock (filtered list, each row with a "Reorder" quick action) → Inventory Value (trend) → Stock Movement (recent ledger entries, condensed single-line rows).

---

## 7. Reports Tab

Mobile-optimized report cards: Sales Reports, Revenue Reports, Inventory Reports, Employee Reports — each a summary card (key figure + one chart) rather than a full data table; tapping opens a scrollable detail view with the chart re-rendered larger and a "View Full Report on Desktop" link (since deep Report Builder authoring stays Desktop/Tablet-oriented per Reports UI's own scoping).

**Chart mobile optimization:** every chart type from the web (Line/Bar/Donut/Funnel) renders single-series or top-N-only on mobile — a multi-series comparison chart that works at 1440px collapses to a swipeable series-by-series view on a phone screen, never a squeezed, illegible miniature of the desktop version.

---

## 8. Barcode Scanner

Full-screen camera view (accessed via Quick Actions or the FAB): live camera feed with a scan-target overlay frame, auto-detects and processes a code without requiring a manual capture tap. Modes (segmented control overlay at the bottom of the camera view): **Product Scan** (opens Product Detail summary), **Stock Check** (shows quantity across locations), **Inventory Count** (adds to a running count session, shows a tally overlay), **Price Check** (shows price + any active promotion).

Every mode calls the same Barcode & Label module's identifier-resolution service the web Scan Center uses — the device camera is simply another scan-input modality feeding that one shared service.

---

## 9. Employee Management Mobile

Employee List (card-per-person: avatar, name, position, status dot) → Attendance Status (today's present/absent/late, tap for detail) → Shift Schedule (this week's roster, condensed calendar strip) → **Contact Employee** (tap-to-call or tap-to-message, using the device's native phone/messaging capability — not an in-app chat system).

---

## 10. Notifications Tab

Mirrors the web Bell Panel's content exactly (Real-time Alerts, Approval Alerts, Inventory Alerts, Sales Alerts), rendered as a full-screen list (this app's primary in-app notification surface, alongside native OS push) rather than a slide-in panel, since mobile doesn't have a persistent header bell icon the way desktop does. Same priority-dot + category-icon + inline-action-button anatomy as the web version.

---

## 11. Profile & Settings

Reached via header avatar tap: Profile (photo, name, role) → Language → Theme (Light/Dark/System) → Biometric Login toggle → Notification Preferences (deep-links to the same preference matrix as web) → Device Management (view/revoke other logged-in devices) → Logout.

---

## 12. Offline Mode

**Offline Indicator:** a slim, persistent top banner (not a full-page takeover) — "Offline — showing cached data from 12m ago" — appears the instant connectivity drops and disappears the instant it's restored, with a brief "Back online — synced" confirmation toast.

**Cached Data:** every screen continues rendering its last-fetched data with a small staleness timestamp badge rather than blanking.

**Sync Queue:** accessible from Settings or a badge on the Offline Indicator itself — a simple list of queued actions (e.g., "Approve Discount #4790 — pending sync") awaiting reconnection.

**Sync Status / Retry Sync:** automatic on reconnect; a manual "Retry Sync" button available if auto-sync stalls, per the platform-wide conflict-resolution model (first sync wins, conflicting queued actions flagged and voided with a clear notification explaining why, per `24-mobile-manager.md` §15).

---

## 13. Search Experience

Global Search (same engine as web, mobile-rendered as a full-screen search overlay on tap) · **Voice Search** (microphone icon in the search bar, a mobile-native addition beyond the web's search) · Recent Search · Search Suggestions.

---

## 14. Filter Experience

**Bottom Sheet Filters:** tapping "Filter" on any list screen slides up a bottom sheet (not a dropdown, which doesn't suit touch) containing Branch/Date/Category/Employee/Status selectors as large touch-friendly rows; "Apply" button fixed at the sheet's bottom. Active filters shown as removable chips atop the list once the sheet closes.

---

## 15. Interaction Design

| Interaction | Behavior |
|---|---|
| Swipe Gesture | Approval cards (§5), horizontal KPI card carousel (§3) |
| Pull To Refresh | Standard on every list/dashboard screen — pull-down gesture triggers a manual data refresh with the platform's native refresh-spinner animation |
| Bottom Sheet | Filters (§14), node/action pickers, any secondary menu that would be a dropdown on web |
| Floating Action Button | Quick Actions shortcut (§4), persists across Home/Operations screens |
| Long Press | On a list row, reveals a quick-action context menu (e.g., long-press an Approval card for "Snooze" without opening full detail) |
| Touch Feedback | Every tappable element shows an immediate ripple/scale-down (`motion-fast`) confirming the touch registered, before any resulting navigation/action completes |

---

## 16. States

| State | Treatment |
|---|---|
| Loading | Skeleton screens matching each screen's final layout, native shimmer convention |
| Skeleton | Shape-matched per screen |
| Empty State | Positive-framed where appropriate ("No pending approvals — you're all caught up") mirroring the platform-wide empty-state philosophy |
| Offline State | Per §12 |
| No Permission | A tab/screen a role cannot access is simply absent from the bottom nav — never a visible-but-blocked tab |
| Error State | Inline retry per card/screen, never a full-app blocking error for one failed data source |
| Retry | Consistent retry affordance |
| Success Feedback | Brief toast or haptic + checkmark for routine actions; a fuller confirmation screen for Approval decisions given their significance |

---

## 17. Responsive Requirements

| Device | Layout |
|---|---|
| iPhone (Portrait, primary target) | Single-column card stack, bottom tab bar |
| Android Phone (Portrait) | Identical layout, platform-native component styling (Material ripple vs. iOS's subtler press state) where the OS convention differs |
| Tablet (Portrait/Landscape) | Two-column adaptation of the same screens (e.g., Approval list + detail side-by-side in landscape) — same information architecture, not a redesign |
| Landscape (phone) | Supported but secondary — most screens reflow to a wider single-column or two-column layout without content loss |

Foldables: content reflows gracefully across the fold rather than being clipped, per `24-mobile-manager.md` §20.

---

## 18. Accessibility

WCAG AA · Large Touch Targets (44pt iOS / 48dp Android minimum, exceeding the web Design System's 40px baseline) · Screen Reader (VoiceOver/TalkBack native support) · **Font Scaling** (respects OS-level text-size settings — every screen must reflow gracefully as a user increases system font size, distinct from the web's fixed typography scale) · High Contrast · Accessible Charts (every mobile chart has a "View as Table" equivalent, consistent with the web's mandatory chart-accessibility rule, adapted to a mobile-friendly scrollable table).

---

## 19. Figma Build Notes

- Frame: `MobileManager/Home/iPhone`, `MobileManager/Approvals/iPhone`, `MobileManager/Approvals/Tablet-Landscape`
- Bottom Tab Bar is a new base component for this app specifically (not shared with the web Sidebar, which serves an analogous but platform-appropriate-different role) — 5 fixed slots (Home/Approvals/Operations/Reports/Notifications), active-state per Design System's active-nav-item color treatment
- KPI Card carousel reuses the same KPI Card component/tokens as the web Dashboard, wrapped in a new `Carousel` container component with swipe/dot-indicator behavior
- Layer naming: `MobileManager/Home/KPICarousel/Card-Revenue`, `MobileManager/Approvals/Card-Discount`, `MobileManager/Scanner/Mode-StockCheck`, per convention

---

## 20. Developer Handoff Notes

- This app must consume the exact same backend APIs every web back-office module exposes — Approval actions (§5) call the identical approval-processing endpoint the web app's Approval dialogs use, per `24-mobile-manager.md` §25's explicit security principle that a mobile-originated approval is not a separate, less-secure code path.
- Permission/role scoping must be enforced server-side identically regardless of client — no elevated or relaxed trust simply because a request originates from this "manager convenience" app.
- Offline queue and Conflict Resolution (§12) should reuse the exact "first sync wins, flagged for review" architecture already implemented for POS and Inventory/Purchase field operations — one conflict-resolution strategy across every offline-tolerant client in the platform, not a fourth bespoke implementation.
- Push Notification delivery (§10) is this app registering as a delivery channel with the Notifications engine ([21-notifications-ui.md](21-notifications-ui.md)) — this app does not implement its own separate alerting/trigger logic.
- Camera-based scanning (§8) must call the same identifier-resolution service specified in Barcode & Label's Scan Center ([22-barcode-label-ui.md](22-barcode-label-ui.md) §10) — the device camera is an additional scan-input modality feeding that shared service, not a separate scanning implementation.
- Given this is explicitly scoped for Flutter/React Native/native implementation, design-token consumption should follow Design Tokens §20's export-pipeline guidance — reusing the same color/spacing/typography values via platform-appropriate theme objects, never re-deriving a separate visual language for mobile.

---

**This concludes the fashion-ui-prompts UI Generation sequence for modules with a corresponding UI prompt.**
