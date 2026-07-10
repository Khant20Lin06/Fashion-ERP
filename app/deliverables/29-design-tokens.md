# Design Token Foundation Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Final Module, Canonical Source of Raw Values
**Depends on:** [01-design-system.md](01-design-system.md) (this module tokenizes that document's values) and, implicitly, every module 02–28 whose components consume these tokens
**Consumed by:** Every screen, component, and platform client (web back-office, POS, Mobile Manager, Customer/Supplier Portals) across every export format below
**Scope note:** [01-design-system.md](01-design-system.md) defined semantic roles and their required relationships in prose/tables ("Primary color," "space-6," "radius-lg"). This module is where those same values become versioned, machine-readable tokens exported to every platform (Figma Variables, CSS, SCSS, Tailwind, Flutter, Android, iOS) — the literal fulfillment of that document's repeated "raw hex values live in the Design Tokens module (29)" and "full chart color tokens defined in module 29" deferrals. This document does not introduce new values; it packages 01's values for implementation.

---

## 1. Token Philosophy

Single Source of Truth · Reusable · Scalable · Themeable · Semantic Naming · Platform Independent · Developer Friendly · Figma Variables Compatible · Material Design 3 Compatible.

No screen, component, or module implementation may hardcode a raw value (a hex code, a pixel number, a duration in ms) — every such value is a reference to a token defined here. This is the enforcement mechanism behind Design System §1's "consistency beats novelty" principle and the Final Rules' "modules must reference these tokens by name, not redefine them."

---

## 2. Token Hierarchy

```
Global Tokens (raw values — e.g., blue-600 = #1A56DB)
↓
Semantic Tokens (role-mapped — e.g., color-primary = blue-600 in light, blue-400 in dark)
↓
Component Tokens (component-scoped — e.g., button-primary-bg = color-primary)
↓
Screen Tokens (screen/module-scoped overrides, used sparingly — e.g., pos-touch-target-min = 48px, overriding the global 40px baseline per Design System §19's documented POS exception)
```

**Rule:** a component should always reference a Semantic or Component token, never a Global token directly — this is what allows a theme change (e.g., rebranding, or a white-label deployment) to propagate by remapping Semantic tokens without touching component code. Screen Tokens are the only sanctioned place for a documented, intentional exception (like POS's touch target) — never an ad hoc override.

---

## 3. Color Tokens

### 3.1 Global Palette (raw values)

| Global Token | Hex |
|---|---|
| `blue-100` – `blue-900` | Ramp anchored at `blue-600 = #1A56DB` (Primary, light mode) |
| `blue-dark-100` – `blue-dark-900` | Ramp anchored at `blue-dark-400 = #5B8DEF` (Primary, dark mode) |
| `slate-100` – `slate-900` | Neutral ramp underlying Surface/Background/Border/Text tokens |
| `violet-500` / `violet-dark-400` | `#7C3AED` / `#A78BFA` (Accent) |
| `green-500` / `green-dark-400` | `#0E9F6E` / `#3FCF8E` (Success) |
| `amber-600` / `amber-dark-400` | `#D97706` / `#F5A524` (Warning) |
| `red-600` / `red-dark-400` | `#E02424` / `#F87171` (Error) |
| `cyan-600` / `cyan-dark-400` | `#0891B2` / `#22D3EE` (Info) |

Full 9-step ramps (100–900) generated per color per Design System §3's contrast requirements, giving component-token authors headroom beyond the single default value each role shows in §3.1's table there.

### 3.2 Semantic Tokens (Light / Dark modes, per Design System §3.1 — restated here as the token names implementations bind to)

| Semantic Token | Light | Dark |
|---|---|---|
| `color-primary` | `blue-600` (`#1A56DB`) | `blue-dark-400` (`#5B8DEF`) |
| `color-primary-container` | `#E8EFFD` | `#16233D` |
| `color-secondary` | `#4B5768` | `#A6B0C3` |
| `color-accent` | `violet-500` | `violet-dark-400` |
| `color-success` | `green-500` | `green-dark-400` |
| `color-warning` | `amber-600` | `amber-dark-400` |
| `color-error` | `red-600` | `red-dark-400` |
| `color-info` | `cyan-600` | `cyan-dark-400` |
| `color-surface` | `#FFFFFF` | `#12151C` |
| `color-background` | `#F4F6F9` | `#0A0C10` |
| `color-border` | `#E2E5EA` | `#242832` |
| `color-divider` | `#EAECEF` | `#1C1F27` |
| `color-text-primary` | `#111827` | `#F3F4F6` |
| `color-text-secondary` | `#6B7280` | `#9CA3AF` |
| `color-text-disabled` | `#9CA3AF` @60% | `#6B7280` @60% |
| `color-link` | = `color-primary` | = `color-primary` |
| `color-focus` | `color-primary` @100%, 2px | `color-primary` @100%, 2px |
| `color-selection` | `color-primary` @12% | `color-primary` @16% |
| `color-hover` | `color-primary` @8% | `color-primary` @12% |
| `color-pressed` | `color-primary` @16% | `color-primary` @20% |
| `color-disabled` | `slate-300` @38% | `slate-600` @38% |
| `color-overlay` | `#0F172A` @48% | `#000000` @64% |
| `color-scrim` | = `color-overlay` | = `color-overlay` |

### 3.3 Gradient Tokens

`gradient-primary` (Primary → Accent, 135°, used sparingly per Design System §1's no-decoration rule — reserved for onboarding/marketing surfaces only, per §17's Figma note on Display typography's similarly restricted usage).

### 3.4 Chart Palette (fulfills Design System §3.2's deferral)

**Categorical (8-color sequence, colorblind-safe, WCAG-validated pairwise against `color-surface`):**

| Index | Token | Hex (Light) |
|---|---|---|
| 1 | `chart-cat-1` | `#1A56DB` (Primary) |
| 2 | `chart-cat-2` | `#7C3AED` (Accent) |
| 3 | `chart-cat-3` | `#0891B2` (Info) |
| 4 | `chart-cat-4` | `#D97706` (Warning) |
| 5 | `chart-cat-5` | `#0E9F6E` (Success) |
| 6 | `chart-cat-6` | `#DB2777` |
| 7 | `chart-cat-7` | `#65A30D` |
| 8 | `chart-cat-8` | `#78716C` |

**Trend/Semantic:** `chart-positive` = `color-success`, `chart-negative` = `color-error`, `chart-neutral` = `color-text-secondary` — per Design System §3.2's rule, these are always reused, never redefined per chart.

**Sequential** (single-hue ramps for heatmaps/intensity, e.g., Inventory's Stock Aging heatmap, 07 §15) and **Diverging** (two-hue ramps for above/below-baseline data, e.g., Finance's Budget Variance) palettes are each a 5–7 step ramp anchored on `chart-cat-1` and `chart-negative`/`chart-positive` respectively, generated via the same validated-contrast method as §3.1.

---

## 4. Typography Tokens

| Token | Font Family | Size/Line | Weight | Tracking |
|---|---|---|---|---|
| `type-display` | Inter | 36/44 | 700 | -0.02em |
| `type-headline` | Inter | 28/36 | 700 | -0.01em |
| `type-title` | Inter | 20/28 | 600 | 0 |
| `type-subtitle` | Inter | 16/24 | 600 | 0 |
| `type-body` | Inter | 14/20 | 400 | 0 |
| `type-body-small` | Inter | 13/18 | 400 | 0 |
| `type-caption` | Inter | 12/16 | 400 | 0.01em |
| `type-overline` | Inter | 11/16 | 600 | 0.08em, uppercase |
| `type-label` | Inter | 13/16 | 500 | 0 |
| `type-button` | Inter | 14/20 | 600 | 0.01em |
| `type-table-header` | Inter | 12/16 | 600 | 0.02em, uppercase |
| `type-table-cell` | Roboto Mono (numeric) / Inter (text) | 13/20 | 400 | 0 |
| `type-helper` | Inter | 12/16 | 400 | 0 |
| `type-error` | Inter | 12/16 | 500 | 0 |

Font stack token: `font-family-ui` = `Inter, -apple-system, "Segoe UI", sans-serif`; `font-family-mono` = `"Roboto Mono", ui-monospace, monospace`.

**Responsive Typography:** on Mobile breakpoints, `type-display`/`type-headline` step down one tier (e.g., Headline renders at Title's size) to preserve line-length/readability on narrow viewports — the one place typography tokens branch by breakpoint, applied uniformly rather than per-module discretion.

---

## 5. Spacing Tokens

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-14` | 56px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

**Component Gaps / Section Spacing / Grid Gutters** are semantic aliases, not new values: `gap-component` = `space-2`, `gap-section` = `space-8`, `gutter-grid` = `space-6` (Desktop) / `space-5` (Laptop) / `space-4` (Tablet) / `space-3` (Mobile), per Design System §6's breakpoint gutter table.

---

## 6. Grid Tokens

| Token | Value |
|---|---|
| `grid-columns-desktop` / `grid-columns-laptop` | 12 |
| `grid-columns-tablet` | 8 |
| `grid-columns-mobile` | 4 |
| `container-max-width` | 1440px |
| `sidebar-width-expanded` | 264px |
| `sidebar-width-collapsed` | 72px |

Breakpoint tokens: `breakpoint-desktop` = `1440px`, `breakpoint-laptop` = `1024px`, `breakpoint-tablet` = `768px`, `breakpoint-mobile` = `360px` — the exact values from Design System §6's table, now as named, referenceable tokens rather than table cells.

---

## 7. Size Tokens

| Token | Value |
|---|---|
| `icon-size-sm` | 16px |
| `icon-size-md` | 20px |
| `icon-size-lg` | 24px |
| `icon-size-xl` | 32px |
| `button-height-sm` / `-md` / `-lg` | 32px / 40px / 48px |
| `input-height-default` | 44px |
| `touch-target-min` | 40px (44px on touch/tablet contexts — see Screen Token override, §2) |
| `avatar-size-sm` / `-md` / `-lg` | 24px / 32px / 48px |
| `modal-width-sm` / `-md` / `-lg` | 400px / 560px / 800px |
| `drawer-width-default` | 360px |
| `nav-header-height` | 64px |
| `nav-page-header-height` | variable (content-driven, min 80px) |

---

## 8. Border Tokens

| Token | Value |
|---|---|
| `border-width-default` | 1px |
| `border-width-focus` | 2px |
| `border-style-default` | solid |
| `radius-sm` | 4px |
| `radius-md` | 8px |
| `radius-lg` | 12px |
| `radius-xl` | 16px |
| `radius-full` | 9999px |
| `outline-focus` | 2px solid `color-focus`, 2px offset |

---

## 9. Shadow Tokens

| Token | Value |
|---|---|
| `elevation-0` | none |
| `elevation-1` | `0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)` |
| `elevation-2` | `0 2px 4px rgba(16,24,40,0.08), 0 4px 8px rgba(16,24,40,0.10)` |
| `elevation-3` | `0 4px 8px rgba(16,24,40,0.10), 0 8px 16px rgba(16,24,40,0.12)` |
| `elevation-4` | `0 8px 16px rgba(16,24,40,0.12), 0 16px 32px rgba(16,24,40,0.14)` |
| `elevation-5` | `0 12px 24px rgba(16,24,40,0.16), 0 24px 48px rgba(16,24,40,0.18)` |

`shadow-dialog` = `elevation-4`, `shadow-dropdown` = `elevation-2` (semantic aliases for the common component call sites named in Design System §8).

---

## 10. Icon Tokens

`icon-library` = Phosphor · `icon-weight-default` = Regular · `icon-weight-emphasis` = Bold · `icon-stroke-width` = 1.5px · Sizes per §7 above. No "Filled/Outlined/Sharp" variant tokens are defined beyond Regular/Bold — Design System §9 fixed a single library/weight pair deliberately, and this module does not introduce optionality that document didn't specify.

---

## 11. Motion Tokens

| Token | Duration | Easing |
|---|---|---|
| `motion-fast` | 100ms | `ease-standard` |
| `motion-base` | 200ms | `ease-standard` |
| `motion-moderate` | 300ms | `ease-decelerate` |
| `motion-slow` | 400ms | `ease-decelerate` |
| `ease-standard` | — | `cubic-bezier(0.2,0,0,1)` |
| `ease-decelerate` | — | `cubic-bezier(0,0,0,1)` |
| `ease-accelerate` | — | `cubic-bezier(0.3,0,1,1)` |

`motion-reduced` token: when `prefers-reduced-motion` is set, every duration above resolves to `≤100ms` and every easing resolves to a linear opacity fade — implemented as a token-level override (a "reduced motion" theme mode), not a per-component conditional.

---

## 12. Animation Tokens

`anim-fade` (opacity 0→1, `motion-base`) · `anim-scale` (0.96→1 + fade, `motion-base`) · `anim-slide-up` / `anim-slide-down` (drawer/sheet entry, `motion-moderate`, `ease-decelerate`) · `anim-expand` / `anim-collapse` (accordion/expandable row, height auto-transition, `motion-base`) · `anim-toast-enter` (slide + fade from bottom-right, `motion-moderate`) · `anim-modal-enter` (scale + fade, `motion-moderate`) · `anim-drawer-enter` (slide, `motion-moderate`).

---

## 13. Z-Index Tokens

| Token | Value |
|---|---|
| `z-base` | 0 |
| `z-sticky` | 10 |
| `z-dropdown` | 20 |
| `z-popover` | 30 |
| `z-tooltip` | 40 |
| `z-drawer` | 50 |
| `z-modal` | 60 |
| `z-snackbar` | 70 |
| `z-notification` | 80 |
| `z-fullscreen` | 90 |

Strictly ordered so a later-opened overlay (e.g., a Command Palette, `z-modal`, opened over an already-visible Drawer, `z-drawer`) always stacks correctly without per-instance z-index tuning.

---

## 14. Opacity Tokens

| Token | Value |
|---|---|
| `opacity-disabled` | 38% |
| `opacity-hover-layer` | 8% (light) / 12% (dark) |
| `opacity-pressed-layer` | 16% (light) / 20% (dark) |
| `opacity-overlay` | 48% (light) / 64% (dark) |
| `opacity-backdrop` | = `opacity-overlay` |

---

## 15. Component Tokens

Each platform component (Design System §10–§15) resolves its visual properties from Semantic tokens via a component-scoped indirection layer, e.g.:

```
button-primary-bg        = color-primary
button-primary-bg-hover  = color-primary + color-hover (composited)
button-primary-text      = color-surface (light) / color-text-primary (on light-primary-dark edge case)
button-radius            = radius-md
button-height-md         = 40px  (→ size token)

input-border             = color-border
input-border-focus       = color-primary
input-radius             = radius-md
input-height             = 44px

card-radius              = radius-lg
card-elevation-rest      = elevation-0
card-elevation-hover     = elevation-1
card-padding             = space-6

table-row-height-comfortable = 48px
table-row-height-compact     = 36px
table-header-bg              = color-surface
table-row-hover-bg            = color-hover

dialog-radius             = radius-lg
dialog-elevation          = elevation-4
dialog-scrim              = color-scrim

badge-radius              = radius-sm
chip-radius               = radius-sm

tab-indicator-color       = color-primary
tab-active-text           = color-primary
```

This indirection (Component tokens reference Semantic tokens, never Global tokens directly, per §2's hierarchy rule) is what allows, for instance, a rebrand that changes `color-primary` to propagate through every button/input/tab across all 29 modules without touching a single component implementation.

---

## 16. Data Visualization Tokens

`chart-categorical` = the 8-color array from §3.4 · `chart-positive` / `chart-negative` / `chart-neutral` (§3.4) · `chart-heatmap-scale` (sequential ramp, §3.4) · `chart-gauge-track` = `color-border` · `chart-gauge-fill` = context-dependent (`color-success`/`color-warning`/`color-error` by threshold, per Inventory/Finance gauge usage) · `chart-grid-line` = `color-divider` · `chart-axis-text` = `color-text-secondary` · `chart-tooltip-bg` = `color-surface` + `elevation-2`.

---

## 17. Accessibility Tokens

`focus-ring-width` = 2px · `focus-ring-offset` = 2px · `focus-ring-color` = `color-focus` · `contrast-min-text` = 4.5:1 · `contrast-min-large-text-ui` = 3:1 · `touch-target-min` = 40px (§7) · `touch-target-min-mobile` = 44px · `motion-reduced` (§11) · `focus-visible-only` = true (focus ring shows only for keyboard/assistive-tech navigation, not mouse click, per modern `:focus-visible` convention — refining Design System §20's "visible 2px focus ring" rule with the specific interaction-mode scoping that makes it not visually noisy for mouse users while remaining fully present for keyboard users).

---

## 18. Dark Mode Tokens

Light Theme and Dark Theme are the two shipped modes, implemented as Figma Variable modes / CSS custom property overrides at the Semantic token layer (§3.2) — never a separate token set requiring parallel maintenance. **High Contrast Theme** (§25) is a third mode, boosting all text/border contrast ratios beyond WCAG AA minimums (targeting AAA where feasible) by remapping Semantic tokens to higher-contrast Global values, without altering typography/spacing/motion tokens at all — proving the hierarchy in §2 actually works (a full accessibility theme ships by remapping one token layer).

---

## 19. Brand Tokens

`brand-logo-light` / `brand-logo-dark` (asset references, consumed by Navigation's header, 02 §3, and Settings' General Settings logo, 20 §6) · `brand-color-primary` = `color-primary` by default, overridable per Multi-Branch's Company Branding (19 §6) for multi-company/franchise deployments needing distinct brand marks · Illustration Style token (a single line-weight/color-treatment spec referenced by every Empty State illustration, per the UX State Management System's §16 rule against mixed illustration styles) · Marketing Colors (a small, separate palette used only in Storefront Theme Configuration, E-commerce 23 §6, explicitly isolated from the internal Design System palette per that module's own note that storefront branding is a distinct concern from back-office UI).

---

## 20. Export Format

| Format | Purpose |
|---|---|
| Figma Variables | Design source of truth; Global/Semantic tokens as variable collections with Light/Dark/High-Contrast modes |
| Design Token JSON | Platform-neutral intermediate format (W3C Design Tokens Community Group spec-aligned), the build source every other export generates from |
| CSS Variables | Web back-office consumption (`--color-primary`, `--space-4`, etc.) |
| SCSS Variables | Build-time theming for the web app where compile-time tokens are preferred over runtime CSS custom properties |
| Tailwind Config | `tailwind.config` theme extension mapping every token above into Tailwind's utility-class system, for teams building screens with Tailwind |
| Flutter Theme Extensions | `ThemeData`/`ThemeExtension` classes for Mobile Manager ([24-mobile-manager.md](24-mobile-manager.md)) if built in Flutter |
| Android XML | `colors.xml`/`dimens.xml` resource files, native Android consumption |
| iOS Swift | `UIColor`/`CGFloat` static token definitions, native iOS consumption |

**Single build pipeline:** Design Token JSON is generated first (from Figma via API/plugin export), and every other format is a transform of that one JSON source — never hand-maintained in parallel, which would reintroduce exactly the drift risk this entire token system exists to prevent.

---

## 21. Governance

**Versioning:** this token set is semantically versioned (major.minor.patch) — a breaking change (removing/renaming a token) is a major version bump requiring coordinated updates across every consuming platform; adding a new token is minor; adjusting a value within an already-validated contrast/accessibility range is a patch. **Naming Convention:** `category-property-variant-state` (e.g., `button-primary-bg-hover`), consistent with Design System §21's Figma naming convention (`Category/Component/Variant`) translated into token-name form. **Deprecation:** a token slated for removal is marked deprecated (still functional) for at least one minor version before removal, with its replacement referenced in the deprecation notice — mirroring the API Deprecation policy already established in the Integration Platform (27 §6). **Migration:** major version bumps ship with a migration guide and, where feasible, a codemod/find-replace script for consuming codebases. **Documentation:** every token's usage/rationale is documented inline in the Design Token JSON (`description` field per the W3C spec), not only in this document, so tooling (IDE autocomplete, Figma variable descriptions) surfaces the same guidance developers see here.

---

## 22. Output Summary

This document delivers: the complete token hierarchy (§2), every token category with concrete values (§3–§19), naming conventions and governance (§21), and the eight-format export pipeline (§20) — fulfilling Design System's repeated deferrals ("raw hex values live in the Design Tokens module (29)," "full chart color tokens defined in module 29") and closing the dependency chain that began with 01-design-system.md.

---

## Final Rules

This is the last module in the `fashion-erp-prompts` sequence. Every one of modules 01–28 is now fully specified, cross-referenced, and — via this module — reduced to concrete, exportable, versioned values with no remaining forward-references. The parallel `fashion-ui-prompts/` sequence (00-master-ui.md onward) is the next phase: translating these 29 specifications into actual screen-by-screen UI, strictly reusing every component, token, and pattern established across this deliverables set — never redesigning, never introducing a new value outside this token system.

**Sequence complete.**
