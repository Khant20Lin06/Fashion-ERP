# Global Design Tokens System — Figma Variable Architecture
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Reconciliation note:** `29-design-tokens.md` already defined every raw value in this platform (colors, spacing, typography, motion, etc.) using a `token-name` (kebab-case) convention, e.g., `color-primary`, `space-6`, `radius-lg`. This document is the **Figma Variables / frontend-token architecture layer** on top of those same values — it does not introduce a second set of numbers, only a dot-notation naming structure (`color.brand.primary`) and Variable Collection organization appropriate for Figma's and modern frontend tooling's conventions. Wherever this document names a token, assume it resolves to the exact value already fixed in `29-design-tokens.md` §3–§19 unless otherwise noted.

---

## 1. Purpose

A scalable token system enabling consistent UI, faster development, theme management (Light/Dark/High Contrast), brand customization (multi-company/franchise white-labeling per Multi-Branch's Company Branding), accessibility, and multi-product scaling (web back-office, POS, Mobile Manager, Customer/Supplier Portals) — all consuming one Figma Variable source rather than parallel token sets per platform.

---

## 2. Token Architecture (Three Layers)

Matches `29-design-tokens.md` §2's hierarchy exactly, restated in this document's dot-notation form:

```
1. Primitive Tokens   — raw values (color.blue.600, spacing.16, fontSize.14)
       ↓
2. Semantic Tokens    — role-mapped (color.brand.primary, color.status.error)
       ↓
3. Component Tokens   — component-scoped (component.button.primary.background)
```

**Rule, restated:** a component always references a Semantic or Component token, never a Primitive directly — this is what lets a rebrand or a new theme mode propagate by remapping Semantic tokens alone.

---

## 3. Color System

### 3.1 Primitive Tokens
```
color.blue.100 … color.blue.900        (anchored: color.blue.600 = #1A56DB)
color.slate.100 … color.slate.900       (neutral ramp)
color.violet.500, color.green.500, color.amber.600, color.red.600, color.cyan.600
```
Full 9-step ramps per hue, matching `29-design-tokens.md` §3.1's Global Palette.

### 3.2 Semantic Tokens (Brand)
```
color.brand.primary        → color.blue.600 (light) / color.blue.400 (dark)
color.brand.secondary      → #4B5768 / #A6B0C3
color.brand.accent         → color.violet.500 / color.violet.400
```

### 3.3 Semantic Tokens (Neutral)
```
color.background            color.surface              color.border
color.divider                color.text.primary          color.text.secondary
color.text.disabled
```

### 3.4 Semantic Tokens (Status)
```
color.status.success        color.status.warning
color.status.error           color.status.info
```

### 3.5 Data Visualization Tokens
```
color.chart.categorical.1 … color.chart.categorical.8    (the 8-color sequence, 29 §3.4)
color.chart.revenue          → color.chart.categorical.1 (Primary-anchored)
color.chart.profit           → color.status.success
color.chart.loss             → color.status.error
color.chart.growth           → color.status.success       (trend-positive alias)
color.chart.risk              → color.status.warning        (or .error at critical severity)
```
**Note:** "Chart Primary/Secondary/Revenue/Profit/Loss/Growth/Risk" from this prompt's Data Visualization Colors section are semantic **aliases** onto the one categorical palette and Success/Error/Warning tokens already defined in `29-design-tokens.md` §3.4 — never a second, independently-chosen chart palette. Revenue/Profit/Growth reuse Positive coloring; Loss/Risk reuse Negative/Warning coloring, consistent with the platform-wide rule that trend colors are always reused, never redefined per chart.

### 3.6 Interaction State Tokens
```
color.state.hover            color.state.pressed         color.state.selected
color.state.disabled          color.state.focus
```

---

## 4. Dark Mode System

**Modes:** `Light`, `Dark` (Figma Variable modes on every Semantic/Component Collection) + `High Contrast` as a third mode remapping only the Semantic layer to higher-contrast Primitive values (per `29-design-tokens.md` §18) — Primitive, Typography, Spacing, and Motion tokens are unaffected by mode switching; only Semantic-layer color bindings change per mode.

**Switching:** Automatic (`prefers-color-scheme` / OS-level), User Preference (explicit toggle in Settings/Profile, persisted), System Preference (default follow-OS behavior until a user override is set) — the three switching triggers named in this prompt map to the same single mode-selection mechanism, not three separate implementations.

---

## 5. Typography System

This prompt's scale names (Display Large/Medium/Small, H1–H4, Body Large/Medium/Small, Label Large/Medium/Small) map onto the platform's existing 14-style scale from `29-design-tokens.md` §4 as follows — **no new sizes are introduced**, only aliases matching common design-tool naming conventions for teams more familiar with Material's scale vocabulary:

| This prompt's name | Maps to (`29-design-tokens.md` §4) |
|---|---|
| Display Large | `type.display` (36/44, 700) |
| Display Medium | `type.headline` (28/36, 700) — used as a secondary display size |
| Display Small | `type.title` (20/28, 600) |
| H1 | `type.headline` |
| H2 | `type.title` |
| H3 | `type.subtitle` |
| H4 | `type.subtitle` (13px-down variant, or `type.label` where a smaller heading is needed) |
| Body Large | `type.subtitle` (16/24, 600) — or `type.body` at emphasis weight |
| Body Medium | `type.body` (14/20, 400) |
| Body Small | `type.body-small` (13/18, 400) |
| Label Large | `type.label` (13/16, 500) |
| Label Medium | `type.caption` (12/16, 400) |
| Label Small | `type.overline` (11/16, 600, uppercase) |

Font Family (`Inter` UI / `Roboto Mono` numeric), Font Weight, Line Height, Letter Spacing all inherit exactly from `29-design-tokens.md` §4 — this section exists purely to reconcile naming vocabulary, not to redefine values.

---

## 6. Spacing System (8pt Grid)

```
spacing.4   spacing.8   spacing.12   spacing.16   spacing.24
spacing.32  spacing.40  spacing.48   spacing.64
```
Identical values to `29-design-tokens.md` §5's `space-1` through `space-16` (renamed here to spacing.[px-value] dot-notation — `spacing.16` = `space-4` = 16px). Applied uniformly to Padding, Margin, Gap, and Layout Spacing contexts — one scale, four usage categories, never a second spacing scale for "layout" vs. "component" contexts.

---

## 7. Grid System

```
grid.desktop.columns = 12       grid.tablet.columns = 8        grid.mobile.columns = 4
grid.container.maxWidth = 1440px
grid.gutter.desktop = 24px      grid.gutter.tablet = 16px       grid.gutter.mobile = 12px
grid.margin.desktop = 24px       grid.margin.tablet = 20px        grid.margin.mobile = 16px
```
Identical to `29-design-tokens.md` §6's grid tokens, dot-notation aliased.

---

## 8. Border System

```
border.default    → color.border, 1px, solid
border.strong      → color.text.secondary, 1px, solid   (higher-emphasis dividers)
border.divider       → color.divider, 1px, solid
border.focus          → color.state.focus, 2px, solid, 2px offset
border.error           → color.status.error, 1px, solid
```

---

## 9. Radius System

```
radius.none = 0        radius.small = 4px       radius.medium = 8px
radius.large = 12px    radius.xlarge = 16px      radius.full = 9999px
```
Identical to `29-design-tokens.md` §7/§8's `radius-sm` through `radius-full`. Applied consistently: Buttons/Inputs/Cards default to `radius.medium`, Dialogs/Drawers/large Cards to `radius.large`, Chips/Badges to `radius.small`, Avatars/Pills/FAB to `radius.full` — per that document's explicit "a card is always radius-lg everywhere" consistency rule.

---

## 10. Shadow System

```
shadow.level0 = none
shadow.level1 = 0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)
shadow.level2 = 0 2px 4px rgba(16,24,40,0.08), 0 4px 8px rgba(16,24,40,0.10)
shadow.level3 = 0 4px 8px rgba(16,24,40,0.10), 0 8px 16px rgba(16,24,40,0.12)
shadow.level4 = 0 8px 16px rgba(16,24,40,0.12), 0 16px 32px rgba(16,24,40,0.14)
```
Identical to `29-design-tokens.md` §9's `elevation-0` through `elevation-4`. Applied to: Cards (level0 resting / level1 hover), Dropdowns (level2), Modals (level4), Floating Elements — FAB, Command Palette (level4–level5).

---

## 11. Motion System

```
motion.duration.fast = 100ms         motion.duration.normal = 200ms
motion.duration.slow = 300–400ms

motion.easing.standard = cubic-bezier(0.2,0,0,1)
motion.easing.decelerate = cubic-bezier(0,0,0,1)
motion.easing.accelerate = cubic-bezier(0.3,0,1,1)

motion.animation.fade | .scale | .slide | .expand | .collapse
```
Identical to `29-design-tokens.md` §11/§12. **Transition Rules:** Fade for tab/content swaps, Scale for modal/dialog entry, Slide for drawer/sheet entry, Expand/Collapse for accordions and expandable table rows — one animation type per interaction category, applied consistently platform-wide rather than chosen ad hoc per component instance. All degrade to opacity-only ≤100ms under `prefers-reduced-motion`.

---

## 12. Icon System

```
icon.size.16   icon.size.20   icon.size.24   icon.size.32   icon.size.48
icon.strokeWidth = 1.5px
```
Library: Phosphor (Regular default, Bold for emphasis/active) — identical to `29-design-tokens.md` §10. **48px** is a new size tier beyond the earlier document's 32px maximum, reserved for large empty-state/illustration-accent contexts where 32px reads too small (e.g., a full-page Empty State's centered icon). Alignment: icons align to the same baseline/optical-center rules as their adjacent text; Usage Rules: never icon-only without `aria-label` or a tooltip, one library only (Design System §9's rule, restated as this token system's binding constraint).

---

## 13. Component Tokens

Dot-notation restatement of `29-design-tokens.md` §15's component indirection layer:

```
component.button.primary.height          = 40px (medium)
component.button.primary.padding          = 16px horizontal
component.button.primary.radius            = radius.medium
component.button.primary.background         = color.brand.primary
component.button.primary.background.hover    = color.brand.primary + color.state.hover (composited)
component.button.primary.text                 = color.surface
component.button.primary.disabled              = opacity 38%

component.input.height              = 44px
component.input.border                = color.border
component.input.border.focus           = color.brand.primary
component.input.radius                  = radius.medium
component.input.error                    = color.status.error

component.card.padding              = spacing.24
component.card.radius                 = radius.large
component.card.shadow                  = shadow.level0 (resting) / shadow.level1 (hover)
component.card.background               = color.surface

component.table.rowHeight            = 48px (comfortable) / 36px (compact)
component.table.headerHeight           = 40px
component.table.border                   = color.divider
component.table.hover                     = color.state.hover

component.modal.width               = 400px (sm) / 560px (md) / 800px (lg)
component.modal.padding                = spacing.24–32
component.modal.overlay                  = color.scrim, 48%/64% opacity
component.modal.radius                    = radius.large
```

Every value above resolves to the identical figure already specified in `29-design-tokens.md` §15 — this section exists solely to express those same bindings in the dot-notation Figma Variable naming convention this prompt specifies.

---

## 14. Accessibility Tokens

```
a11y.contrast.textMin = 4.5:1        a11y.contrast.largeTextMin = 3:1
a11y.focusRing.width = 2px            a11y.focusRing.offset = 2px
a11y.touchTarget.min = 40px            a11y.touchTarget.minMobile = 44px
a11y.fontScaling = supports OS-level scaling (mobile) / browser zoom (web), reflow required, no fixed-height text containers
a11y.reducedMotion = true → all motion.duration values resolve to ≤100ms, all easing resolves to linear opacity-only
```
Identical to `29-design-tokens.md` §17.

---

## 15. Responsive Tokens

```
breakpoint.mobile = 360px       breakpoint.tablet = 768px
breakpoint.laptop = 1024px       breakpoint.desktop = 1440px
breakpoint.largeDesktop = 1920px   (new tier, for ultra-wide monitors — content remains centered at container.maxWidth=1440px, per §7, with additional canvas simply becoming background per Design System §6's "background fills viewport" rule)
```

**Container Rules:** content never exceeds `grid.container.maxWidth` regardless of viewport width beyond Desktop. **Responsive Spacing:** `grid.gutter`/`grid.margin` step down per breakpoint (§7). **Responsive Typography:** `type.display`/`type.headline` step down one tier on Mobile per `29-design-tokens.md` §4's responsive rule — a `Headline` renders at `Title`'s size on narrow viewports to preserve line-length readability.

---

## 16. Figma Variable Structure

**Collections** (8, matching this prompt's requested structure): `Color` · `Typography` · `Spacing` · `Radius` · `Shadow` · `Motion` · `Breakpoints` · `Components`.

**Modes per Collection:**
- `Color`: Light, Dark, High Contrast
- `Typography`, `Spacing`, `Radius`, `Shadow`, `Motion`, `Breakpoints`: single mode (these don't vary by theme, only Color does, per §4's rule that only the Semantic color layer remaps per mode)
- `Components`: inherits mode from `Color` (component tokens reference Color variables, so switching the Color collection's mode cascades automatically)

Each Collection's variables are organized Primitive → Semantic → Component in that folder order within Figma's Variables panel, matching §2's three-layer architecture exactly, so a designer browsing the panel encounters the tokens in dependency order.

---

## 17. Frontend Token Structure

```
tokens/
├── colors/
│   ├── primitive.json       (color.blue.*, color.slate.*, etc.)
│   ├── semantic.json         (color.brand.*, color.status.*, color.text.*)
│   └── component.json         (component.button.*.background, etc.)
├── typography/
├── spacing/
├── radius/
├── shadows/
├── motion/
├── breakpoints/
└── components/
```

Generated from the single Figma Variables source (per `29-design-tokens.md` §20's build pipeline: Figma → Design Token JSON → every platform format) — **this folder structure is a projection of that one JSON export**, never a hand-maintained parallel set. `colors/component.json` and the standalone `components/` folder both source from Figma's `Components` Collection; the split exists only to let a frontend build system tree-shake color-only vs. full-component token imports independently, not because two different sources of truth exist.

---

## 18. Naming Convention

```
color.brand.primary
color.text.primary
spacing.16
radius.medium
shadow.level2
component.button.primary.background
```

**Rule:** `category.property.variant.state` for Semantic tokens, `component.name.variant.property` for Component tokens — this is the dot-notation equivalent of `29-design-tokens.md` §21's `category-property-variant-state` kebab-case convention (e.g., `button-primary-bg-hover` there = `component.button.primary.background.hover` here). Both namings resolve to the same underlying value; the dot-notation is what Figma Variables and most modern frontend token tooling (Style Dictionary, Tokens Studio) expect natively, while the kebab-case form remains what's emitted into CSS Custom Properties (`--color-brand-primary`) per platform export conventions.

---

## 19. Governance

Inherits `29-design-tokens.md` §21 in full: semantic versioning (major/minor/patch), deprecation with a minimum one-minor-version grace period and a stated replacement, migration guides/codemods for breaking changes, and inline `description` fields on every token (surfaced in Figma's Variable description field and in generated tooling documentation) — one governance model for both naming conventions, since they're two views onto the same versioned token set, not two independently-versioned systems.

---

## 20. Developer Handoff Notes

- This document's dot-notation names and `29-design-tokens.md`'s kebab-case names must resolve to the exact same underlying values, generated from the exact same Figma Variables source — never maintain two separate token definition files that could drift apart. Treat this document as the Figma/frontend-tooling-facing naming layer, and the earlier document as the platform-wide conceptual/value reference.
- Component token bindings (§13) must be implemented as references (Figma Variable aliases, or `var()`/design-token-reference syntax in code), never resolved-and-copied literal values — this is what allows a single Semantic token change (e.g., rebranding `color.brand.primary`) to cascade through every Component token and every consuming screen automatically.
- The three Color modes (Light/Dark/High Contrast, §4/§16) must be implemented as genuine Figma Variable modes (and their code equivalent — CSS `[data-theme]` attribute or platform ThemeData), never three duplicated component sets — every one of the 29 prior UI documents' components must support all three modes via this one mode-switching mechanism, not per-module theme handling.
- `largeDesktop` (§15) is a new breakpoint tier not present in `29-design-tokens.md`'s original four — since content is capped at `container.maxWidth` regardless, this breakpoint should only affect background/canvas treatment, never trigger a distinct layout, avoiding a fifth responsive layout system to maintain.
- Given this prompt explicitly targets React/Next.js, Flutter, Web, and Mobile output, the build pipeline from `29-design-tokens.md` §20 (Figma → JSON → per-platform transforms) is the single source every one of those four targets consumes — no platform should hand-author its own token file independent of that pipeline.

---

**This concludes the Global Design Tokens System — the final document in both the `fashion-erp-prompts` specification sequence and its corresponding `fashion-ui-prompts` UI-generation sequence.**
