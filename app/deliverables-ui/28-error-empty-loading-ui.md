# Global UX States & Feedback System — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md), and every prior UI document (01–27), each of which has already instantiated these exact states in its own "States" section
**Scope note:** Unlike every prior document in this set, this is not a screen — it's the formal component library specification behind states already used informally 27 times over. Every "Loading / Skeleton / Empty / Error" table in documents 01–27 was a *usage* of these components; this document is where each component is actually defined once, with every variant, so no module ever hand-builds its own version.

---

## 1. Purpose & Governing Rule

One unified feedback system for Loading, Empty, Error, Success, Warning, Offline, Permission, and System Feedback states, used identically by every module. **Every state must answer three questions:** What happened? Why did it happen? What can the user do next? A state component that can't answer all three (a bare spinner with no context, an error with no recovery path) is incomplete, per the spec's core principle.

---

## 2. Loading System

**`LoadingIndicator`** component, `Scope` variant property: `FullPage | Section | Card | Table | Button | Inline | BackgroundSync`.

| Scope | Rendering |
|---|---|
| Full Page | Centered, full-viewport spinner (circular, indeterminate, `color-primary`) + optional `type-body` caption below — used only for genuine full-app blocking states (initial auth check), never for a single slow widget |
| Section | A `Section`-scoped spinner overlay with a subtle backdrop, confined to that section's bounds — used when part of a page depends on a slower fetch than the rest |
| Card | The card renders its Skeleton variant (§3) instead of a spinner — cards never show a bare spinner, always a shape-matched skeleton |
| Table | Skeleton rows (§3), never a spinner replacing the whole table |
| Button | Spinner replaces the button's label, button width preserved (no layout jump), pointer-events disabled — per Design System §10's Button loading state, referenced here as the canonical spec |
| Inline | A small 16px spinner adjacent to inline text (e.g., "Validating SKU… ⟳") |
| Background Sync | No visible blocking indicator at all — reflected only via the Sync Status icon (Notifications' pattern) and, where relevant, the Offline system's Sync Queue (§7) |

**Rule:** loading granularity always matches the fetch granularity — a slow single widget shows Card/Section-scoped loading, never Full Page, per the widget-isolation principle established since the Dashboard module and repeated in every subsequent module's own state table.

---

## 3. Skeleton System

**`Skeleton`** component, `Shape` variant property: `Dashboard | Table | Card | Form | Profile | Chart | List`.

Each shape is a composed Auto Layout arrangement of grey shimmer blocks matching that content type's actual final proportions — not a generic placeholder:
- `Table`: header row + N body rows, column widths matching the real table's configured columns
- `Card`: image block (if the real card has one) + title bar + 2-line body + footer bar
- `Profile`: matches the Summary Header component's exact layout (avatar circle + name bar + metadata line) — the same shape used across Product Detail, Customer 360, Vendor 360, Employee Profile, Branch Profile
- `Chart`: axis-shaped grey block with a shimmer sweep, sized to the chart's configured height
- `Form`: label-bar + input-bar pairs matching the real form's field count/grouping

**Shimmer animation:** a soft left-to-right gradient sweep, `motion-base` (200ms) duration per sweep cycle, looping — degrades to a static pulse-opacity animation under `prefers-reduced-motion`, never removed entirely (a completely static grey block reads as frozen/broken rather than loading).

---

## 4. Empty State System

**`EmptyState`** component, `Variant` property: `FirstTimeUser | NoData | NoSearchResult | NoPermission | NoConnection | NoActivity`.

**Fixed anatomy for every variant:** Illustration/Icon (centered, 64–96px depending on context) → Title (`type-subtitle`, bold) → Description (`type-body`, `color-text-secondary`, one line explaining why and what to do) → Primary Action (button) → optional Secondary Action (text link) → optional Help Link ("Learn more →").

| Variant | Title pattern | Primary Action pattern |
|---|---|---|
| First Time User | "No [items] yet" | "Add your first [item]" / "Import [items]" |
| No Data Available | "No data for this period" | "Adjust date range" |
| No Search Result | "No results for '[query]'" | "Clear filters" |
| No Permission | "You don't have access to this" | "Request access" (if Permission Request Workflow is enabled) |
| No Connection | "You're offline" | "Retry" (disabled until connectivity returns, auto-retries on reconnect) |
| No Activity | "Nothing here yet" (positive-framed, e.g., "No pending approvals — you're all caught up") | none required — absence can be the desired state |

**Hard rule, restated from the source spec:** First Time User (genuine zero-data) and No Search Result (data exists, filters just don't match) are **never the same component instance with swapped copy** — the component API requires an explicit `variant` prop precisely so these can't blur together in a future module's implementation.

---

## 5. Error State System

**`ErrorState`** component, `Type` property: `Validation | Server | Network | Permission | Authentication | DataSync | Payment | Upload`.

**Fixed anatomy:** Error Icon (semantic, never alarmist — a simple outlined icon, not a large red X) → Error Title (plain language, e.g., "We couldn't load this page" not "Error 500") → Explanation (one line, the "why," in plain language) → Recovery Action (the primary path forward) → Retry Button (where applicable) → Support Contact (a "Contact Support" link, pre-filled with the Crash Reference ID per §14).

| Type | Rendering context | Recovery pattern |
|---|---|---|
| Validation | Inline, field-adjacent (never a separate dialog) | Correct the field; error clears on valid re-entry |
| Server | Section/card-scoped inline block | Retry button, per-section isolation (never blocks sibling content) |
| Network | Same as Server, plus the Offline system takes over if connectivity is actually down | Retry, or automatic once reconnected |
| Permission | Standard Access Denied pattern (§8) | Request access / Contact admin |
| Authentication | Distinct, actionable copy per failure reason (wrong password vs. locked account vs. expired session each get a different message and different next step) | Re-enter credentials / Contact admin for a lock |
| Data Sync | Distinct from generic Server Error — shows sync-specific detail (which records failed) | Retry Sync, links to the Sync Queue (§7) |
| Payment | Inline on the payment method tile (POS/Sales pattern) — cart/order state fully preserved | Retry / Switch Payment Method |
| Upload | Inline on the specific file/row that failed (§13) | Retry that file only, others in a batch unaffected |

---

## 6. Success Feedback

**`SuccessToast`** (bottom-right, auto-dismiss 4s, stackable max 3) for routine saves. **`SuccessBanner`** (page-top, dismissible) for a broader confirmation relevant to the whole page. **`SuccessDialog`** (blocking, requires acknowledgment) reserved for consequential/hard-to-reverse completions — Payment Completed, Sale Completed, Journal Posted, Period Locked — per the platform-wide rule that feedback weight scales to action significance. **Inline Success Message** (a brief `color-success` checkmark flash, `motion-fast`) for individual inline-edited fields (Product Detail's Overview tab, Customer 360, etc.). **Completion Screen** (full-page, e.g., POS's post-sale Receipt screen) for the small set of flows where the "what's next" choice itself is the point of the screen, not an afterthought toast.

---

## 7. Warning States

**`Alert`** component (Design System §14's base), `Severity=Warning` variant, used for: Confirmation Warning (paired with a Confirmation Dialog, §11), Data Loss Warning ("You have unsaved changes" on navigation-away), Permission Warning (a soft restriction notice, distinct from a hard Permission Denied), Expiration Warning (contract/document/token expiring soon — the pattern used across Suppliers' Compliance tab and IAM's password expiry), Low Stock Warning (Inventory's own alert badges), Security Warning (IAM's Suspicious Activity flag).

**Rule:** Warning is visually and semantically distinct from Error — it informs without blocking the current action (Low Stock still permits a sale), while Error blocks until resolved.

---

## 8. Permission States

**`PermissionDenied`** component: Explanation ("You don't have access to [X]") → Required Permission (naming which role/permission would grant access, for transparency) → Contact Admin Action (a mailto/deep-link to request access, tying into IAM's Permission Request Workflow where enabled).

**Governing rule, restated from Navigation's original principle:** prefer **omission over denial** everywhere possible — a user without access to a feature should not see a visible, clickable-looking dead end; the item is simply absent from navigation (Sidebar, tabs, menu items, bottom nav). This `PermissionDenied` component is reserved for the one case omission can't cover: direct/deep-link access to a page the user's role doesn't permit.

---

## 9. Form Validation System

Field states (Design System §11's base Input component, referenced here as the canonical states this system's Error/Success feedback plugs into): Default, Focused (2px `color-focus` ring), Filled, Error (border + text → `color-error`, trailing error icon, error text below via `aria-describedby`), Success (trailing check, e.g., validated SKU/barcode), Disabled, Read Only.

**Inline Error** (per-field, immediate on blur or live for critical fields like Journal Entry balance) · **Helper Text** (neutral, below the field, `type-helper`) · **Validation Message** (replaces Helper Text with Error styling when invalid) · **Error Summary** (a consolidated list at the top of a long form, e.g., Product Create's 6-step Review screen, each entry deep-linking back to its field — used only for multi-step/long forms, never a short form where inline errors are already visible without scrolling).

---

## 10. Table States

**`TableState`** wrapping the base Table component: Loading (skeleton rows, §3), Empty (the `EmptyState` component rendered within the table's body region, not a separate page), Error (an inline error row spanning all columns, with Retry), No Result (the `EmptyState` NoSearchResult variant, same table-body placement), Permission Restricted (columns the viewer can't see are simply omitted from the table entirely — field-level permission applied at render, per the pattern established since Product Management's field-level permission model — never shown as a "Restricted" placeholder cell).

---

## 11. Modal & Dialog System

**`Dialog`** base component, `Type` variant: `Confirmation | DeleteConfirmation | Warning | Error | Success | Permission`.

- **Confirmation Dialog:** the general reversible-action pattern
- **Delete Confirmation:** requires the target's name typed or re-stated for destructive/irreversible actions (Bulk Delete, Blacklist), per Design System §14's rule — visually identical to Confirmation Dialog but with the typed-confirmation requirement as a distinguishing property, not a separate component
- **Warning Dialog:** for actions with a significant-but-not-destructive consequence (e.g., reopening a locked Finance period)
- **Error Dialog:** blocking, for critical failures requiring acknowledgment before the user can continue (rare — most errors use inline `ErrorState`, §5)
- **Success Dialog:** per §6's SuccessDialog
- **Permission Dialog:** the Manager Override/Approval component's PIN/badge entry modal — the single shared instance referenced across every module in this entire platform (POS, Product Management, Inventory, Purchase, Sales, Loyalty, Promotions, Marketing, CRM, Suppliers, Finance, Employees, and more)

All dialogs: `radius-lg`, `elevation-4`, scrim backdrop (`color-scrim`), focus-trapped, closable via Escape or scrim-tap (except Delete/Permission dialogs, which require an explicit Cancel click to prevent accidental dismissal of a security-relevant flow), focus returns to the triggering element on close.

---

## 12. Notification Components

**`Toast`** (bottom-right, auto-dismiss 4s, stackable max 3, `Severity=Success|Info|Warning|Error`) · **`Snackbar`** (bottom-center, action + dismiss, for actions with an Undo affordance — e.g., cart line removal, per POS's 5s Undo pattern) · **`Banner`** (page-top, dismissible, for system-wide notices — "Store offline — syncing," Maintenance Mode notices, Reopened Period warnings) · **`Alert`** (inline, persistent, the 4 severities) · **`Badge`** (small status/count indicator, non-interactive) · **`StatusIndicator`** (a colored dot + label pairing, e.g., "● Active," used consistently across every status column platform-wide).

**Rule:** every one of these carries its meaning via icon + text + color together — never color alone, per the platform's accessibility baseline restated once more here as the final, canonical source.

---

## 13. File Upload States

**`UploadState`** component, `Status` property: `Ready | Uploading | Success | Failed | Invalid | TooLarge`.

Ready (dashed dropzone, `radius-md` border) → Uploading (per-file progress bar/ring + percentage) → Success (checkmark + filename) → Failed (error icon + "Retry" scoped to just that file) → Invalid (wrong file type, explains accepted formats) → Too Large (states the size limit clearly). Batch uploads show this state per-file in a list, never one aggregate status hiding which specific file failed — directly serving the "what happened, why, what next" rule at file-level granularity.

---

## 14. Sync States

**`SyncState`** component, `Status` property: `Started | Processing | Completed | Failed | Partial`.

Reflected primarily via the Sync Status icon (header-level, per Navigation/POS's pattern) plus, where a user needs detail, a Sync Queue panel: pending item count, per-item status, manual "Retry Sync" action. **Partial Sync** specifically shows exactly which items succeeded vs. failed (never a bare "some items failed" without specifics) — consistent with the file-level granularity rule in §13.

---

## 15. Offline Experience

**`OfflineBanner`** (persistent while offline, non-blocking, "You're offline — showing last synced data from [time]") + **`OfflineIndicator`** (a small header/status-bar icon, always visible regardless of whether the banner is dismissed) + **Cached Data View** (every screen continues showing its last-fetched content with a staleness timestamp, never blanking) + Sync Queue/Progress/Retry per §14.

**Two-tier model, restated from the source spec:** Offline-First modules (POS, Inventory/Purchase field operations, Mobile Manager) show this full state set with genuine offline read/write; Offline-Tolerant modules (Settings, Multi-Branch, IAM, Finance back-office) show only Cached Data View + staleness badge, with writes disabled until reconnection — both are intentional configurations of this same component system, not two different implementations.

---

## 16. Network States

`Connecting` (brief, on app/session start) · `Slow Connection` (a subtle indicator, not a blocking state — content still loads, just flagged as slower than expected) · `Connection Failed` (routes into the Offline system, §15) · `Reconnecting` (automatic, shown as a small animated icon state) · `Server Maintenance` (a distinct full-page state when Maintenance Mode is active, per Settings' configuration — explicitly excludes POS's offline-capable transactional core, which continues operating normally per that module's own carve-out).

---

## 17. Responsive Design

Every component in this library renders correctly at Desktop/Laptop/Tablet/Mobile — this library is deliberately breakpoint-agnostic infrastructure; individual modules are responsible for *which* scope of loading/empty/error to show at a given breakpoint (e.g., Mobile often collapses Section-scoped loading to Full Page given less on-screen real estate at once), but the component definitions themselves don't change shape per breakpoint, only their placement/sizing within the consuming module's layout.

---

## 18. Accessibility

WCAG AA baseline for every component: Screen Reader support (all icons carry `aria-label` or adjacent text, per Design System §9's icon rule), Keyboard Navigation (every dialog/toast dismiss action reachable via keyboard), **Focus Management** (state transitions move focus predictably — a Dialog opening traps and moves focus in; closing returns it to the trigger; a Toast/Banner appearing announces via `aria-live="polite"` without stealing focus from the user's current task, per the live-region pattern established consistently since the Dashboard module), **Color Independent Meaning** (every Success/Warning/Error state pairs its color with an icon and/or text label — never color alone, restated as the platform's single most-repeated accessibility rule), **Reduced Motion** (every animated state — Skeleton shimmer, Toast slide-in, Success checkmark, Error shake — degrades to an opacity-only fade ≤100ms under `prefers-reduced-motion`, per Design System §18).

---

## 19. Figma Build Notes

- These components live in the platform's base Component Library (not a per-module frame) — every one of modules 01–27's own frames **instances** these components, never redraws them
- Component set: `EmptyState`, `ErrorState`, `LoadingIndicator`, `Skeleton`, `Toast`, `Snackbar`, `AlertBanner`, `ConfirmationDialog`, `PermissionDenied`, `UploadState`, `SyncState`, `OfflineBanner`, `StatusIndicator` — each built with the `Variant`/`Type`/`Status` component properties specified in §2–§16, never as separately named one-off components per module
- Variables bound throughout — every color/spacing/radius/motion value in this library references a Design Tokens (29) variable, with zero hardcoded values, since this library is itself the reference implementation every other module's component instances derive their state-styling from
- Layer naming: `UXStates/EmptyState/Variant-NoSearchResult`, `UXStates/Skeleton/Shape-Table`, `UXStates/Dialog/Type-Permission`, per the `Category/Component/Variant` convention

---

## 20. Developer Handoff Notes

- Every state component here must ship as an actual shared implementation (not a documented convention modules independently rebuild) — `EmptyState`, `ErrorState`, `Skeleton`, etc. each need the props specified in §2–§16 to parameterize copy/icon/CTA per call site, so the 27 modules that already specified these states in prose consume one implementation.
- The Empty-vs-No-Search-Results distinction (§4) must be enforced at the component API level — `EmptyState` requires an explicit `variant` prop, never left to convention, preventing the two from silently blurring together in a future module's usage.
- Offline-First vs. Offline-Tolerant (§15) should be a per-module configuration flag this library's Offline components read, not a decision each module's frontend team re-derives independently.
- Global Error Boundary should wrap at multiple levels — one platform-wide fallback, and one per major section/widget (consistent with the widget-isolation principle) — so a single failing component is caught locally by its nearest boundary before ever reaching the platform-wide one.
- Crash Reference ID generation (referenced in §5's Support Contact) and the Integration Platform's own Logs must share a correlation ID scheme, so a support agent given a Reference ID can look up the full technical context in one place.

---

**This concludes the formal UX State component library specification consumed by every module in this UI set.**
