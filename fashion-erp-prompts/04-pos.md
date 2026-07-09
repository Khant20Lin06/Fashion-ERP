# 04-pos.md
# Enterprise Fashion ERP/POS
# POS (Point of Sale) Module Specification

Design the complete POS (Point of Sale) module for the Enterprise Fashion ERP/POS platform.

This module is used by cashiers and store staff for high-speed retail transactions.

Use every previously defined specification including:

• Master Context
• Master System
• Design System
• Navigation
• Design Tokens
• Dashboard Architecture

Never redesign previous components.

Always reuse existing UI patterns.

Maintain complete visual consistency.

The POS must be optimized for speed, accuracy, and productivity.

--------------------------------------------------
1. MODULE GOALS
--------------------------------------------------

The POS must allow a cashier to complete a sale with the minimum number of clicks.

The interface should support:

Fast Selling

Barcode Scanning

Touch Screen

Keyboard Shortcuts

Offline Mode

Multi Branch

Multi Warehouse

Fashion Variants

Loyalty

Gift Cards

Returns

Exchange

Split Payment

--------------------------------------------------
2. TARGET USERS
--------------------------------------------------

Cashier

Store Manager

Branch Manager

Owner

Support role-based permissions.

--------------------------------------------------
3. POS LAYOUT
--------------------------------------------------

Desktop Layout

Top Header

↓

Left Product Panel

↓

Center Shopping Cart

↓

Right Checkout Panel

↓

Bottom Status Bar

--------------------------------------------------
4. HEADER
--------------------------------------------------

Display:

Store Name

Branch

Current Shift

Cashier Name

Search

Sync Status

Network Status

Current Time

Current Date

Settings Shortcut

--------------------------------------------------
5. PRODUCT SEARCH
--------------------------------------------------

Support:

Barcode Scan

QR Scan

SKU Search

Product Name

Brand

Category

Collection

Color

Size

Variant

Autocomplete

Recent Searches

Popular Products

--------------------------------------------------
6. PRODUCT GRID
--------------------------------------------------

Display:

Product Image

Product Name

SKU

Available Stock

Price

Promotion Badge

New Arrival Badge

Low Stock Badge

Out of Stock Indicator

Support:

Grid View

List View

Quick Add

Quick Preview

--------------------------------------------------
7. PRODUCT VARIANTS
--------------------------------------------------

Support unlimited variants.

Examples:

Color

Size

Fit

Length

Material

Pattern

Display stock for each variant.

Prevent selling unavailable variants.

--------------------------------------------------
8. SHOPPING CART
--------------------------------------------------

Each cart item displays:

Image

Product

Variant

Quantity

Price

Discount

Tax

Subtotal

Allow:

Increase Quantity

Decrease Quantity

Manual Quantity

Remove Item

Notes

--------------------------------------------------
9. CUSTOMER PANEL
--------------------------------------------------

Support:

Search Customer

Walk-in Customer

Create Customer

Membership

Loyalty Points

Wallet Balance

Purchase History

Customer Notes

--------------------------------------------------
10. PROMOTIONS
--------------------------------------------------

Support:

Automatic Discount

Manual Discount

Coupon

Voucher

Buy X Get Y

Bundle Promotion

Flash Sale

Happy Hour

Member Pricing

--------------------------------------------------
11. PAYMENT
--------------------------------------------------

Support:

Cash

Credit Card

Debit Card

QR Payment

Bank Transfer

Wallet

Gift Card

Store Credit

Split Payment

Partial Payment

--------------------------------------------------
12. RECEIPT
--------------------------------------------------

Generate:

Thermal Receipt

A4 Invoice

Gift Receipt

Email Receipt

PDF Receipt

QR Receipt

--------------------------------------------------
13. RETURNS & EXCHANGE
--------------------------------------------------

Support:

Full Return

Partial Return

Exchange

Store Credit

Refund

Return Reason

Inventory Update

--------------------------------------------------
14. SHIFT MANAGEMENT
--------------------------------------------------

Support:

Open Shift

Close Shift

Cash Count

Cash Adjustment

Expected Cash

Actual Cash

Difference

Shift Report

--------------------------------------------------
15. OFFLINE MODE
--------------------------------------------------

Support:

Offline Sales

Offline Customer

Offline Products

Offline Inventory Cache

Automatic Sync

Conflict Resolution

Sync Queue

--------------------------------------------------
16. INVENTORY UPDATE
--------------------------------------------------

Automatically update:

Branch Stock

Warehouse Stock

Reserved Stock

Inventory Ledger

Stock History

--------------------------------------------------
17. LOYALTY
--------------------------------------------------

Support:

Earn Points

Redeem Points

Membership Upgrade

Rewards

Coupons

Birthday Rewards

--------------------------------------------------
18. QUICK ACTIONS
--------------------------------------------------

New Customer

Hold Sale

Resume Sale

Price Check

Stock Check

Open Cash Drawer

Print Receipt

Reprint Receipt

--------------------------------------------------
19. KEYBOARD SHORTCUTS
--------------------------------------------------

Support shortcuts for:

Search

Add Product

Checkout

Payment

Hold

Resume

Print

Cancel

New Sale

--------------------------------------------------
20. ERROR HANDLING
--------------------------------------------------

Handle:

Out of Stock

Insufficient Stock

Duplicate Barcode

Offline

Payment Failure

Network Error

Sync Failure

Permission Denied

--------------------------------------------------
21. LOADING / EMPTY STATES
--------------------------------------------------

Define:

Loading

Skeleton

No Product Found

No Customer

No Internet

Empty Cart

No Promotions

--------------------------------------------------
22. RESPONSIVE DESIGN
--------------------------------------------------

Desktop

Laptop

Tablet

Mobile POS

Touch Friendly Layout

--------------------------------------------------
23. ACCESSIBILITY
--------------------------------------------------

Support:

Keyboard Navigation

Screen Reader Labels

Accessible Forms

Accessible Tables

Visible Focus States

WCAG AA

--------------------------------------------------
24. SECURITY
--------------------------------------------------

Support:

Role Permission

Price Override Approval

Discount Approval

Manager Override

Audit Log

Session Timeout

--------------------------------------------------
25. PERFORMANCE
--------------------------------------------------

The POS must support:

100,000+ Products

100,000+ Customers

Instant Search

Barcode <100ms

Fast Checkout

Minimal Loading

--------------------------------------------------
26. OUTPUT REQUIREMENTS
--------------------------------------------------

Generate:

Complete screen architecture

Complete UI hierarchy

Complete user flow

Component hierarchy

Interaction details

Validation rules

Loading states

Empty states

Error states

Responsive behavior

Accessibility considerations

Implementation-ready specification

--------------------------------------------------
FINAL INSTRUCTION
--------------------------------------------------

Generate a production-ready Enterprise Fashion ERP/POS module.

The output must be detailed enough for a frontend engineering team to implement without redesign.

Reuse every previously defined Design System, Navigation, Components, and Design Tokens.

Never introduce inconsistent UI.

Maintain enterprise SaaS quality throughout.