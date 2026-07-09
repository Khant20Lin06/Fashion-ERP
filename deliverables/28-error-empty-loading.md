# UX State Management System Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved
**Depends on:** 00-master-system.md through [27-api-webhook.md](27-api-webhook.md) (all prior modules)
**Consumed by:** Every module in the platform
**Scope note:** Unlike every prior module, this one is not a business domain — it's the formal, reusable pattern library that every module's own "Loading / Empty / Error States" section (present in all 26 prior modules) has been instantiating locally, module by module. This document retroactively names and systematizes what was already consistently applied — the shape-matched skeleton, the icon+headline+body+CTA empty state, the per-widget error isolation — as first-class, versioned components, so a 27th module (or a redesign of the first) draws from one library rather than re-deriving the pattern from scratch.

---

## 1. Module Objective

Provide standardized UX states — Loading, Skeleton, Empty, Success, Error, Offline, Permission, Maintenance, Retry & Recovery — as reusable components every module consumes identically, so a user's mental model of "what does 'this is loading' look like" or "what does 'you don't have access' look like" never varies module to module.

---

## 2. Design Principles

Consistency · Clarity · Accessibility · Fast Feedback · Minimal Cognitive Load · **Action-oriented Recovery** (every negative state pairs with a concrete next step — retry, adjust filters, contact support — never a dead end) · Reusable Components.

These principles were already implicit in every prior module's state tables (e.g., Dashboard §16's "never a blank gap that looks like a bug," POS §21's distinguishing "Empty Cart" as a rest state rather than an error) — this module makes them explicit, named rules rather than an emergent pattern.

---

## 3. State Categories

```
Loading → Skeleton → Empty → Success → Warning → Error → Offline
→ Permission Denied → Maintenance
```

This is a rough severity/lifecycle ordering, not a strict linear flow — a given screen might move Loading→Skeleton→Empty (no data found) or Loading→Skeleton→Success (data found), and any state can transition to Error or Offline at any point given a network/server failure.

---

## 4. Module Structure

```
Loading States (§5) ──→ Skeleton States (§6)
↓
Empty States (§7) ──→ Success States (§8) ──→ Warning States (§9)
↓
Error States (§10) ──→ Offline States (§11)
↓
Permission States (§12) ──→ Maintenance States (§13)
↓
Recovery Flows (§14)
```

---

## 5. Loading States

Page Loading · Section Loading · Card Loading · Table Loading · Chart Loading · List Loading · Button Loading · Form Submission Loading · Infinite Scroll Loading · Background Sync Loading.

**Rule:** loading granularity matches the unit of data being fetched — a single failing/slow widget shows Card/Section Loading, never blocking the whole Page, per the widget-isolation principle established since the Dashboard module (03 §16/§21) and repeated in every subsequent module's own state table (Purchase §22, Sales §22, Suppliers §20, Finance §24, Reports §24, and more). Button Loading specifically disables the button and shows an inline spinner replacing the label (per Design System §10's Button loading state) — the button's width never changes, preventing layout jump.

---

## 6. Skeleton States

Dashboard Skeleton · Table Skeleton · Card Skeleton · Chart Skeleton · Product Grid Skeleton · List Skeleton · Profile Skeleton · Detail Page Skeleton.

**Rule:** every skeleton is shape-matched to its real content's final layout (per Design System §17's original definition, referenced verbatim in every subsequent module) — a skeleton is never a generic gray box; a Table Skeleton has the right number of visible columns, a Profile Skeleton has the Summary Header's actual proportions (per the pattern established in Product Detail 06 §24, Customer 360 10 §21, Vendor 360 15 §20). Skeleton shimmer animation follows §17's motion rules (subtle, `motion-base` duration).

---

## 7. Empty States

No Data · No Search Results · No Products · No Customers · No Orders · No Notifications · No Reports · No Employees · No Inventory · No Activity.

**Anatomy (fixed across every instance platform-wide):** Illustration/Icon → Headline → Body (one line, explains why it's empty and what to do) → Primary CTA → optional Secondary CTA. This is the exact pattern named generically in the Design System (01 §17: "icon + headline + explanation + primary CTA") and applied identically in every module since — Product Management's "No Products yet / Add your first product" (05 §19), Multi-Branch's "Set up your organization" (19 §20), IAM's first-run states (26 §20).

**Critical distinction always maintained:** a **genuine empty state** (first use, zero data — encouraging, action-oriented) is never conflated with **No Search Results** (data exists, current filters just don't match it — offers "clear filters," not "create your first X"). This distinction was explicitly called out in nearly every module's own state table and is formalized here as a hard rule: these are two different components, never one component with swapped copy.

---

## 8. Success States

Save Success · Create Success · Update Success · Delete Success · Import Success · Export Success · Sync Success · Payment Success · Approval Success.

**Rule:** success feedback scales to the action's significance — a routine field save gets a brief inline confirmation or toast (Design System §14's Toast component, auto-dismiss); a consequential action (Payment Success at POS, 04 §11; Approval Success for a large Purchase Order, 08) gets a more deliberate confirmation (a dedicated Success Dialog, per Design System §14) that requires acknowledgment rather than auto-dismissing, since the user needs a moment to register that a hard-to-reverse action truly completed.

---

## 9. Warning States

Unsaved Changes · Low Stock · Expiring Promotion · Near Credit Limit · Pending Approval · Validation Warning.

**Rule:** Warning is visually and semantically distinct from Error (Design System §3's Warning vs. Error color tokens) — a Warning informs without blocking (e.g., Low Stock still allows a sale at POS, 04 §6, just flags the risk), while an Error (§10) blocks the current action until resolved. Unsaved Changes specifically triggers a confirmation dialog on navigation-away, consistent with the platform-wide "never silently lose work" principle first established for POS's Hold Sale (04 §18) and echoed in every form-heavy module since.

---

## 10. Error States

Validation Error · Network Error · Server Error · Authentication Error · Authorization Error · Payment Failed · Import Failed · Export Failed · Unexpected Error.

**Rule:** every Error state is Action-oriented Recovery (§2) — never a bare "Something went wrong." Validation Errors are inline, field-adjacent (Design System §11's Error state for form fields), never a separate dialog interrupting flow. Server/Network Errors show a Retry action, per-widget/per-section scoped (never full-page blocking unless the entire page's data genuinely depends on the failed call) — the exact pattern independently arrived at and repeated in Dashboard (03 §16), Product Management (05 §19), Inventory (07 §21), and every module since. Authentication/Authorization Errors route through IAM's ([26-role-permission.md](26-role-permission.md) §20) specific distinct messaging (a locked account needs a different message/next-step than an expired session, which needs a different one than insufficient permissions).

---

## 11. Offline States

No Internet · Offline Mode · Sync Pending · Cached Data · Reconnect Flow · Conflict Resolution.

**Rule:** offline tolerance is not uniform across the platform by design — POS (04 §15), Inventory/Purchase field operations (07 §21, 08 §22), and Mobile Manager (24 §15) are offline-first (full read/write with a queue), while back-office configuration modules like Settings (20 §24), Multi-Branch (19 §20), and IAM (26 §20) are deliberately offline-*tolerant* only (read-only cache, since structural/security configuration changes are inherently low-frequency, HQ-side actions). This section names both tiers explicitly as intentional, not inconsistent: **Offline-First** modules show the full state set below; **Offline-Tolerant** modules show only Cached Data + a staleness indicator.

**Conflict Resolution** follows the single strategy established once (POS 04 §15: "first sync wins, second flagged for manager review") and explicitly reused rather than reinvented in every subsequent offline-tolerant context (Inventory transfers, 07; Mobile Manager approvals, 24 §15) — this document is where that reuse is made an explicit rule rather than an incidental convergence.

---

## 12. Permission States

Access Denied · Role Restriction · Feature Disabled · Subscription Restricted · Hidden Actions.

**Rule, inherited from Navigation §4's original sidebar-visibility principle:** wherever possible, prefer **omission over denial** — a user without access to a module/feature should not see a greyed-out, clickable-looking dead end; the item is absent from navigation entirely (Sidebar, tabs, menu items). Access Denied (an explicit blocking page) is reserved for direct-link/deep-link access attempts where omission isn't possible (e.g., a bookmarked URL to a page the user's role no longer permits). Feature Disabled corresponds to Settings' Feature Flags (20 §16) being off for the tenant — distinct copy from Role Restriction, since "your plan doesn't include this" is a different message than "your role doesn't include this."

---

## 13. Maintenance States

Scheduled Maintenance · Emergency Maintenance · System Upgrade · **Read-only Mode** · Service Unavailable.

**Rule:** Maintenance Mode, as specified in Settings (20 §18), must exclude POS's offline-capable transactional core — this section's Read-only Mode is the pattern by which back-office modules gracefully degrade (viewable but not editable) during a maintenance window while a register keeps selling. Scheduled Maintenance is always pre-announced (via the Notification Center, 21, and a persistent Banner component, Design System §14) with a countdown, never a surprise interruption.

---

## 14. Recovery Flows

Retry · Refresh · Reconnect · **Restore Draft** (recovering unsaved form input after a crash/accidental navigation — ties to §9's Unsaved Changes protection, extended to actual data loss prevention) · Contact Support · Go Back · Fallback Actions.

**Rule:** Recovery Flows are the concrete implementation of §2's "Action-oriented Recovery" principle — every Error/Offline/Permission state (§10-§12) must resolve to at least one of these, never a state with no way forward. Contact Support specifically deep-links with pre-filled context (what page, what error, what timestamp — per §19) so a user doesn't have to manually describe what went wrong.

---

## 15. Microcopy Guidelines

Titles · Descriptions · Action Labels · Error Messages · Recovery Messages · **Tone of Voice** · Localization-ready Content.

**Tone of Voice, as a formal rule (implicit throughout every prior module's copy examples):** plain language over technical jargon ("We couldn't load this page" not "Error 500: Internal Server Error" — the technical detail lives in §19's diagnostics, not the user-facing message), calm and non-alarming even for genuine errors, and consistently first-person-plural ("we couldn't," "let's try again") rather than passive/blaming phrasing. Localization-ready means no copy concatenates fragments in a way that breaks in languages with different word order (relevant given Settings' Multi-language support, 20 §8) — every message is a complete, independently-translatable string.

---

## 16. Visual Design

Illustrations · Icons (Phosphor, per Design System §9) · Animations (per §17 below) · Progress Indicators (Design System §14) · Status Colors (Design System §3's semantic Success/Warning/Error/Info tokens, applied consistently — never a state using an off-palette color) · Accessible Contrast (WCAG AA, per Design System §20).

Illustrations are a single consistent style system (line-weight, color treatment matching the brand-neutral palette) — never mixed illustration styles across different empty/error states, consistent with the Design System's "never mix multiple icon styles" rule (01 §9) extended to illustrations.

---

## 17. Motion & Feedback

Skeleton Animation (shimmer, `motion-base`) · Progress Indicators (linear/circular per Design System §14) · Button Feedback (pressed state scale, `motion-fast`) · Toast Messages (slide/fade in, auto-dismiss per Design System §14's Toast spec) · Success Animations (a brief, subtle check-mark or confirmation motion — never celebratory/attention-grabbing enough to distract from the next task) · **Error Shake (Subtle)** (a small, restrained horizontal shake on a rejected form submission — subtle enough to not feel punitive) · **Reduced Motion Support** (every animation listed here degrades to an opacity-only fade at ≤100ms when `prefers-reduced-motion` is set, per Design System §18's original rule, restated here as it applies specifically to state-transition motion).

---

## 18. Search & Filter States

No Search Results (§7's distinct-from-empty rule) · No Matching Filters · Reset Filters (a one-click action always paired with either state) · Saved Filter Empty (a Saved View, per the pattern established across every module's List/Table toolbar, that currently matches zero records — distinct copy: "This saved view has no current matches" rather than implying the view itself is broken).

---

## 19. Audit & Diagnostics

Client Error Logging · **Crash Reference ID** (a short, user-facing, support-quotable identifier generated per error occurrence) · Error Timestamp · Support Reference (the combination of the above, pre-filled into §14's Contact Support flow).

This is what feeds the technical detail deliberately kept out of user-facing copy per §15 — a user sees "We couldn't load this page. Reference: ERR-2847291" while the full stack trace/request context is logged to the Integration Platform's Logs ([27-api-webhook.md](27-api-webhook.md) §13) or an equivalent client-error-logging pipeline, retrievable by support staff via that reference ID.

---

## 20. Responsive Design

Desktop · Laptop · Tablet · Mobile · Foldable.

**Rule:** every state component in this library must render correctly at every breakpoint any module needing it operates at — including POS/Inventory/Purchase's tablet-first contexts and Mobile Manager's phone-first, foldable-aware context (24 §20). A state component is not "done" until its Mobile Executive View and its Desktop Dashboard rendering have both been verified, since this library is deliberately breakpoint-agnostic — modules consume it, they don't reimplement it per breakpoint.

---

## 21. Accessibility

Screen Readers · ARIA Labels · Keyboard Navigation · **Focus Management** (a critical, universally-applicable rule: when a state changes — a modal opens, an error appears, a toast fires — focus moves predictably, either to the new content or is announced via `aria-live` without stealing focus from the user's current task, per the live-region pattern established consistently since Dashboard 03 §18 and repeated through Notifications 21 §20 and AI Analytics 25 §21) · High Contrast · Reduced Motion (§17) · WCAG AA.

---

## 22. Performance

Fast Perceived Performance · Lazy Loading · **Progressive Rendering** (showing available content immediately while slower sections still load, rather than waiting for the complete page — the practical implementation of the widget-isolation principle from §5) · Background Fetch · **Optimistic UI** (reflecting an action's expected outcome immediately — e.g., a toggled switch flips instantly — while the actual server confirmation happens asynchronously, with a graceful rollback-plus-error-toast if the optimistic assumption turns out wrong).

---

## 23. Advanced Enterprise Features

**Global Error Boundary** (a top-level catch-all preventing any single component's crash from blanking the entire application — every module's page renders within a boundary that, on failure, shows this library's Error state locally rather than a white screen) · **Smart Retry** (backoff-aware, context-sensitive retry — e.g., not immediately re-hammering a rate-limited endpoint, per Integration Platform's Rate Limiting, 27 §22) · Auto Recovery (silently retrying a transient failure once before ever surfacing an error to the user) · **Offline Queue** (the formalized, shared implementation behind every module's own offline-write-queue reference — POS 04 §15, Inventory/Purchase 07/08, Mobile Manager 24 §15) · **Conflict Resolution UI** (the visual component implementing §11's "first sync wins, flagged for review" rule) · Crash Recovery (§14's Restore Draft, generalized) · **AI Error Explanation** and **AI Troubleshooting Suggestions** (surfacing a plain-language "here's likely why this happened and what to try," sourced from AI Analytics, 25, applied to technical error diagnosis rather than business insight) · Health Status Banner (surfacing Settings'/Integration Platform's System Health, 20 §5, 27 §5, as a platform-wide banner when a known degradation is in progress) · Status Page Integration (linking to an external status page for transparency during incidents).

Additive/opt-in per the platform-wide principle — the core state library (§5-§14) is mandatory baseline for every module; these advanced capabilities layer on for organizations/deployments that want them.

---

## 24. Developer Implementation Notes

- Every state category (§5-§14) must ship as an actual shared component library (not just a documented convention) — Skeleton, EmptyState, ErrorState, PermissionDenied, OfflineBanner, etc., each with the props needed to parameterize copy/icon/CTA per instance, so the 27 modules that already specified these states in prose consume one implementation rather than 27 hand-rolled equivalents.
- The Empty-vs-No-Search-Results distinction (§7) should be enforced at the component API level — a single `EmptyState` component should require the caller to explicitly pass a `variant` (`empty` | `no-results`) rather than leaving it to convention, preventing the two from silently blurring together in a future module's implementation.
- Offline-First vs. Offline-Tolerant (§11) should be a per-module configuration flag consumed by this library's Offline components, not a decision each module's frontend team re-derives independently — the platform-wide list of which modules are which (established across §11's examples) should live in one config Settings (20) or this module maintains.
- Global Error Boundary (§23) should wrap at multiple levels — one platform-wide boundary as the ultimate fallback, and one per major section/widget (consistent with the widget-isolation principle, §5) so a single failing Dashboard card, for instance, is caught locally before ever reaching the platform-wide boundary.
- Crash Reference ID (§19) generation and the Integration Platform's Logs (27 §13) or a dedicated client-error-logging service must share a correlation ID scheme, so a support agent given a Reference ID can look up the full technical context in one place, not by cross-referencing multiple disconnected logging systems.

---

**Next:** 29-design-tokens.md
