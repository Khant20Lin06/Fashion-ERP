# 00-master-system.md
# Fashion ERP/POS — Master System Specification

This document defines the complete business architecture, system scope, information architecture, functional requirements, and user workflows for the Fashion ERP/POS platform.

This specification becomes the foundation for every future module.

Every future screen, component, workflow, and interaction must follow this document.

Never ignore these requirements.

--------------------------------------------------
1. PROJECT OVERVIEW
--------------------------------------------------

Design a Production-Ready Enterprise Fashion ERP/POS platform for:

• Fashion Retail Stores
• Fashion Chains
• Multi-Branch Businesses
• Franchise Businesses
• Wholesalers
• Fashion Distributors

The platform must support businesses from a single boutique to hundreds of branches.

The design must prioritize:

• Speed
• Scalability
• Simplicity
• Productivity
• Business Intelligence
• User Experience

--------------------------------------------------
2. BUSINESS OBJECTIVES
--------------------------------------------------

The system should help businesses:

• Sell products faster
• Manage inventory accurately
• Reduce stock loss
• Improve warehouse operations
• Improve purchasing
• Improve customer retention
• Increase loyalty
• Increase sales
• Monitor business performance
• Make better decisions using reports

--------------------------------------------------
3. CORE MODULES
--------------------------------------------------

The system contains these modules:

01 Dashboard

02 POS (Cashier)

03 Product Management

04 Product Detail

05 Inventory

06 Purchase

07 Sales

08 Customers

09 Loyalty

10 Promotions

11 Suppliers

12 Finance

13 Reports

14 Employees

15 Multi-Branch

16 Settings

17 Notifications

18 Barcode & Label

19 E-commerce Integration

20 Mobile Manager

21 AI Analytics

22 Role & Permission

23 API & Webhooks

24 System Logs

25 Error Handling

26 Design Tokens

Each module must be independent but fully integrated with every related module.

--------------------------------------------------
4. USER ROLES
--------------------------------------------------

Support role-based access control (RBAC).

Roles include:

• Super Admin
• Owner
• Branch Manager
• Store Manager
• Cashier
• Warehouse Staff
• Purchasing Officer
• Accountant
• HR
• Marketing
• Customer Service

Every role must only access authorized features.

--------------------------------------------------
5. INFORMATION ARCHITECTURE
--------------------------------------------------

Design a clear navigation hierarchy.

Primary Navigation

Dashboard

Sales

POS

Products

Inventory

Purchase

Customers

Suppliers

Finance

Reports

Employees

Marketing

Settings

Secondary Navigation

Each module must contain:

Overview

List

Detail

Create

Edit

History

Analytics

Activity

Settings

--------------------------------------------------
6. PRODUCT STRUCTURE
--------------------------------------------------

Fashion products support:

Brand

Category

Subcategory

Collection

Season

Gender

Age Group

Material

Fabric

Pattern

Style

Color

Size

Variant

SKU

Barcode

QR Code

Cost Price

Selling Price

Wholesale Price

Retail Price

Promotion Price

Images

Videos

Supplier

Warehouse

Stock

Status

Each product must support unlimited variants.

--------------------------------------------------
7. INVENTORY PRINCIPLES
--------------------------------------------------

Support:

Multi Warehouse

Multi Branch

Stock Transfer

Stock Adjustment

Cycle Count

Stock Reservation

Incoming Stock

Outgoing Stock

Damaged Stock

Returned Stock

Low Stock

Out of Stock

Stock Aging

Inventory Valuation

--------------------------------------------------
8. SALES WORKFLOW
--------------------------------------------------

Typical workflow:

Customer

↓

Cart

↓

Promotion

↓

Discount

↓

Payment

↓

Invoice

↓

Receipt

↓

Inventory Update

↓

Loyalty Update

↓

Reports

Support:

Cash

Card

QR

Bank Transfer

Wallet

Gift Card

Split Payment

Partial Payment

Returns

Exchange

--------------------------------------------------
9. PURCHASE WORKFLOW
--------------------------------------------------

Supplier

↓

Purchase Request

↓

Purchase Order

↓

Approval

↓

Goods Receipt

↓

Purchase Invoice

↓

Payment

↓

Inventory Update

--------------------------------------------------
10. CUSTOMER MANAGEMENT
--------------------------------------------------

Store:

Customer Profile

Membership

Purchase History

Loyalty Points

Wallet Balance

Favorite Products

Address

Birthday

Customer Notes

Credit Limit

Customer Timeline

--------------------------------------------------
11. REPORTING
--------------------------------------------------

Provide reports for:

Sales

Purchase

Inventory

Profit

Expenses

Customer

Supplier

Employee

Branch

Finance

Promotion

Loyalty

Inventory Aging

Top Products

Slow Moving Products

Forecast

Every report must support:

Filtering

Sorting

Export

Print

Charts

Comparison

--------------------------------------------------
12. DESIGN REQUIREMENTS
--------------------------------------------------

Every future module must include:

Desktop Layout

Tablet Layout

Mobile Layout

Responsive Behavior

Loading State

Empty State

Error State

Success State

Confirmation Dialogs

Validation

Accessibility

Keyboard Navigation

Search

Filter

Pagination

Bulk Actions

--------------------------------------------------
13. SECURITY REQUIREMENTS
--------------------------------------------------

Support:

Authentication

Authorization

Role Permission

Audit Logs

Activity Logs

Session Management

Password Policies

Secure Actions

Confirmation for destructive operations.

--------------------------------------------------
14. PERFORMANCE REQUIREMENTS
--------------------------------------------------

Every module should be optimized for:

Fast Search

Large Datasets

Virtual Tables

Lazy Loading

Pagination

Efficient Forms

Efficient Filtering

Minimal Clicks

--------------------------------------------------
15. CONSISTENCY RULES
--------------------------------------------------

Every future module must:

Reuse existing components.

Reuse navigation.

Reuse layouts.

Reuse design tokens.

Reuse typography.

Reuse spacing.

Reuse colors.

Maintain the same interaction patterns.

Never redesign previous modules.

Never introduce inconsistent UI.

--------------------------------------------------
16. OUTPUT FORMAT
--------------------------------------------------

When generating future modules:

Generate complete UX architecture.

Generate complete UI hierarchy.

Generate user flows.

Generate interactions.

Generate validations.

Generate empty states.

Generate loading states.

Generate success states.

Generate error states.

Generate responsive behavior.

Generate accessibility considerations.

Generate edge cases.

Generate implementation-ready specifications.

--------------------------------------------------
FINAL INSTRUCTION
--------------------------------------------------

Do not generate any module yet.

Read every requirement carefully.

Understand the complete system architecture.

Memorize this document.

Apply it to every future module.

Wait for my next prompt.