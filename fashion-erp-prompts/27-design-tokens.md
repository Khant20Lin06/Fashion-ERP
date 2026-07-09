# 27-design-tokens.md
# Enterprise Fashion ERP/POS Design Tokens Specification

This document defines the global Design Tokens for the Fashion ERP/POS platform.

Design Tokens are the single source of truth for every UI component, layout, page, and module.

Every future module must inherit these tokens.

Never hard-code visual values.

Always use tokens.

Maintain complete consistency across the entire platform.

--------------------------------------------------
1. DESIGN TOKEN PRINCIPLES
--------------------------------------------------

All visual properties must be token-based.

Support:

Scalability

Maintainability

Theme Switching

Dark Mode

Light Mode

Brand Customization

Developer Handoff

Figma Variables

Frontend CSS Variables

--------------------------------------------------
2. COLOR TOKENS
--------------------------------------------------

Define semantic tokens.

Include:

Primary

Primary Hover

Primary Active

Primary Disabled

Secondary

Secondary Hover

Secondary Active

Accent

Success

Warning

Error

Info

Background

Surface

Card

Border

Divider

Overlay

Text Primary

Text Secondary

Text Disabled

Icon Primary

Icon Secondary

Focus Ring

Selection

Chart Colors

Sidebar Background

Header Background

Table Header

Table Row

Table Hover

Badge Colors

Notification Colors

Dark Theme

Light Theme

--------------------------------------------------
3. TYPOGRAPHY TOKENS
--------------------------------------------------

Define typography variables.

Include:

Font Family

Display

Headline

Title

Subtitle

Body

Body Small

Caption

Overline

Label

Button

Table Header

Table Cell

Helper Text

Error Text

Letter Spacing

Line Height

Font Weight

Text Transform

--------------------------------------------------
4. SPACING TOKENS
--------------------------------------------------

Use an 8pt spacing system.

Create tokens for:

0

2

4

8

12

16

20

24

32

40

48

56

64

80

96

120

Apply consistently to:

Padding

Margin

Gap

Section Spacing

Card Spacing

Form Spacing

Grid Gutter

--------------------------------------------------
5. SIZE TOKENS
--------------------------------------------------

Define reusable sizes.

Include:

Icon Sizes

Avatar Sizes

Button Heights

Input Heights

Table Row Heights

Card Widths

Modal Widths

Drawer Widths

Sidebar Width

Header Height

--------------------------------------------------
6. BORDER RADIUS TOKENS
--------------------------------------------------

Define:

None

Small

Medium

Large

Extra Large

Pill

Circle

Reuse throughout all modules.

--------------------------------------------------
7. BORDER TOKENS
--------------------------------------------------

Define:

Border Width

Border Style

Border Color

Focus Border

Selected Border

Error Border

Success Border

--------------------------------------------------
8. SHADOW TOKENS
--------------------------------------------------

Create elevation levels.

Include:

None

Small

Medium

Large

Extra Large

Modal

Dropdown

Tooltip

Popover

Use shadows sparingly.

--------------------------------------------------
9. OPACITY TOKENS
--------------------------------------------------

Support:

Disabled

Overlay

Hover

Pressed

Loading

Modal Background

--------------------------------------------------
10. ICON TOKENS
--------------------------------------------------

Define:

Default Size

Small

Medium

Large

Stroke Width

Alignment

Spacing

Only one icon style is allowed across the system.

--------------------------------------------------
11. BUTTON TOKENS
--------------------------------------------------

Define tokens for:

Height

Padding

Radius

Font

Gap

Icon Size

Loading Spinner

Disabled

Hover

Focus

Pressed

--------------------------------------------------
12. INPUT TOKENS
--------------------------------------------------

Define:

Height

Padding

Border

Radius

Focus Ring

Placeholder

Label

Helper Text

Validation

--------------------------------------------------
13. TABLE TOKENS
--------------------------------------------------

Support:

Header Height

Row Height

Cell Padding

Border

Hover

Selected

Striped Rows

Sticky Header

Sticky Column

--------------------------------------------------
14. CARD TOKENS
--------------------------------------------------

Define:

Padding

Radius

Shadow

Gap

Header Height

Footer Height

--------------------------------------------------
15. CHART TOKENS
--------------------------------------------------

Define:

Grid Line

Axis

Legend

Tooltip

Primary Series

Secondary Series

Positive

Negative

Neutral

--------------------------------------------------
16. MOTION TOKENS
--------------------------------------------------

Create animation variables.

Include:

Duration

Fast

Normal

Slow

Ease In

Ease Out

Ease In Out

Hover

Fade

Slide

Expand

Collapse

--------------------------------------------------
17. Z-INDEX TOKENS
--------------------------------------------------

Define stacking order.

Example:

Base

Dropdown

Sticky Header

Drawer

Modal

Popover

Tooltip

Toast

Loading Overlay

--------------------------------------------------
18. BREAKPOINT TOKENS
--------------------------------------------------

Support:

Desktop

Laptop

Tablet

Mobile

Small Mobile

Every component must respond consistently.

--------------------------------------------------
19. ACCESSIBILITY TOKENS
--------------------------------------------------

Define tokens for:

Focus Ring

Accessible Contrast

Touch Target

Keyboard Navigation

ARIA Support

Reduced Motion

--------------------------------------------------
20. FIGMA VARIABLES
--------------------------------------------------

Organize all tokens into variable collections.

Examples:

Colors

Typography

Spacing

Radius

Borders

Elevation

Opacity

Motion

Sizing

Z-Index

Breakpoints

Support:

Light Theme

Dark Theme

Future Brand Themes

--------------------------------------------------
21. DEVELOPER HANDOFF
--------------------------------------------------

Every token must be implementation-ready.

Support:

Figma Variables

CSS Variables

Tailwind Config

Design System Libraries

Frontend Component Libraries

--------------------------------------------------
FINAL INSTRUCTION
--------------------------------------------------

Never use hard-coded values in future modules.

Always reference Design Tokens.

Reuse tokens consistently.

Apply these tokens to every component, page, and module.

Memorize this Design Token system.

Wait for the next prompt.