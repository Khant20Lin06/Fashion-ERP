# Finance, Accounting & Record-to-Report — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [16-finance.md](../deliverables/16-finance.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Scope note:** Finance carries the platform's strictest security posture (Segregation of Duties is its defining architectural principle, not one rule among several). This UI reflects that throughout — Journal Entry balance validation is live and blocking, Period Locking is visually unambiguous, and Approval gates are never bypassable client-side conveniences.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > Finance
↓
Page Header (Title + Toolbar)
↓
Finance Dashboard (KPI strip, collapsible)
↓
Secondary Tabs: Chart of Accounts · General Ledger (default) · Journal Entries · Accounts Receivable · Accounts Payable · Cash & Bank · Budget · Fixed Assets · Cost Centers · Tax · Financial Statements · Period Closing
```

---

## 2. Page Header & Toolbar

```
Finance                                               [Import] [Export] [+ New Journal Entry]
FY2026 · Period: July (Open)

[🔍 Search account, journal#, reference…]  [Fiscal Year ▾] [Branch ▾] [Currency ▾] [Filters ▾] [Saved Views ▾]
```

**Period indicator** ("Period: July (Open)") is pinned directly beside the Fiscal Year selector — Open in `color-success` text, Closed/Locked in `color-text-secondary` with a small lock icon — since knowing whether the current period accepts new postings is load-bearing context for every action on this screen.

---

## 3. Finance Dashboard (Collapsible KPI Strip)

10 KPI cards: Total Revenue · Total Expenses · Gross Profit · Net Profit · Cash Balance · Bank Balance · Accounts Receivable · Accounts Payable · Monthly Cash Flow · Budget Utilization.

- AR/AP cards deep-link to their respective aging views (§7/§8)
- This dashboard's figures reconcile exactly with the business-wide Dashboard's Financial Overview widget (visible there only to Owner/Finance Manager/Regional Manager) — this is the detailed, full-access counterpart to that summarized view

---

## 4. Chart of Accounts Tab

**Account Tree** (left panel, 4 cols): expandable hierarchy — Assets / Liabilities / Equity / Revenue / COGS / Operating Expenses / Other Income / Other Expenses, each expandable into Parent → Child accounts. Selected account highlights and populates the right panel.

**Account Detail** (right panel, 8 cols): Account Code, Account Name, Account Type (badge), Currency, Opening Balance, Active Status (toggle), plus a mini running-balance chart and a "View in General Ledger →" link scoped to this account.

"+ Add Account" opens a form dialog: Parent Account (searchable select, or none for a top-level account), Code (validated unique live), Name, Type, Currency, Opening Balance. New accounts default to Active; deactivating an account with existing postings requires a confirmation explaining that historical entries remain intact.

---

## 5. General Ledger Tab

Enterprise data table: Journal Number (link) · Posting Date · Account Code · Account Name · Debit (right-aligned, tabular-nums) · Credit (right-aligned) · Balance (running, right-aligned) · Branch · Cost Center · Reference (link to source document — Sale/PO/Payroll/Manual) · Status (Posted/Reversed badge).

- This table is **read-only by design** — no inline edit affordance anywhere, no row-level Edit action, consistent with the append-only ledger principle; the only row action is "View source document →"
- Debit/Credit columns never both populated on the same row visually — whichever side is zero renders as an em-dash, not "0.00," keeping the table scannable
- Filterable by Account/Journal/Branch/Cost Center/Date Range/Status; exportable

---

## 6. Journal Entries Tab

**List:** Journal Number, Date, Description, Total Debit/Credit, Status badge (Draft/Submitted/Approved/Posted/Reversed), Created By, Approved By.

**Create/Edit Journal Entry (full-page form):**

```
Journal Entry — Draft                                          [Save Draft] [Submit for Approval]
Date: [Jul 8, 2026]   Reference: [___________]   Cost Center: [Marketing ▾]

Account                          Description              Debit         Credit
[Marketing Expense ▾]            Q3 campaign spend         ฿12,000
[Bank — Main Account ▾]          Q3 campaign spend                        ฿12,000
[+ Add line]

────────────────────────────────────────────────────
Total:                                                     ฿12,000       ฿12,000     ✓ Balanced
```

- **Live balance validation:** the "Balanced" indicator updates on every keystroke — `✓ Balanced` in `color-success` when Debit total = Credit total, `⚠ Out of balance by ฿X` in `color-error` otherwise. **"Submit for Approval" is disabled while out of balance** — this is the one hard client-side gate in Finance that's also independently re-verified server-side, per the spec's validation rule
- Attachments: drag-and-drop zone beneath the line-items table
- **Recurring Journal:** a toggle in the header exposes Frequency (Monthly/Quarterly/etc.) + End Condition (Never/After N occurrences/On date) — recurring entries still individually route through the same Approval flow each time they generate, never auto-posting unapproved
- **Reverse Journal:** available only on Posted entries — opens a confirmation showing the exact mirrored reversing entry that will be created, with a required reason; the original entry remains untouched and visibly linked to its reversal

**Approval Workflow:** the same shared Approval component used platform-wide, with one Finance-specific addition — the Approve button is **hidden entirely** (not shown-disabled) if the current user is the entry's own creator and self-approval would violate configured Segregation of Duties, reinforcing that this is a structural boundary, not a permission the UI merely discourages.

---

## 7. Accounts Receivable Tab

Customer Invoices (read view into Sales' own Invoice records) · Outstanding Invoices (filtered) · **Aging Report** (the visual centerpiece): a stacked bar or bucketed table — 0-30 / 31-60 / 61-90 / 90+ days, color intensity increasing with age (`color-warning` at 31-60 escalating to `color-error` at 90+), each bucket's total clickable to drill into its invoice list · Payment Collection (Sales' payment recording, referenced not duplicated) · Credit Notes (list, linked to source Invoice/Return).

Customer Aging summary row at the top: total AR, % current vs. overdue — the figure every "Outstanding Payments" KPI card platform-wide references.

---

## 8. Accounts Payable Tab

Mirrors AR's structure exactly (same Aging Report visual pattern, same bucket coloring) applied to the opposite direction: Supplier Bills (read view into Purchase's Invoice records) · Outstanding Bills · **Payment Scheduling** (the one AP-specific write action — a calendar/list view of planned payment dates, optimizing for Early Payment Discounts shown as a small `color-success` savings badge next to any bill with an active discount window) · Vendor Aging · Debit Notes.

---

## 9. Cash & Bank Management Tab

Bank Accounts / Cash Accounts as a card row (balance, account number masked, institution logo/icon) → Bank Transfers (simple form: From/To account, amount, date) → **Reconciliation** (the primary workflow here): a two-column matching interface — Bank Statement lines (left) vs. System Transactions (right), with matched pairs shown connected/greyed and unmatched lines highlighted `color-warning`; a "Match" button pairs a selected line from each side, "Flag for Review" for genuine discrepancies. Deposits/Withdrawals as simple transaction-entry forms. **Petty Cash** as a distinct small-fund tracker (separate from POS's per-register cash drawer, per the spec's explicit distinction) — a running balance + transaction log + "Record Expense" quick-add.

---

## 10. Budget Management Tab

Annual/Monthly/Department/Cost Center Budget as a filterable, tabbed view over one underlying Budget entity. **Budget vs. Actual** (the centerpiece visualization): grouped bar chart per Cost Center/Department, Budget bar in `color-border`-outlined ghost style, Actual bar in solid `chart-cat-1`, overage portion (Actual exceeding Budget) rendered in `color-error` as a distinct visual segment atop the bar rather than just a longer bar — making overspend immediately legible without reading exact numbers. **Budget Alerts** list beneath (approaching/exceeded thresholds, linking to the specific Cost Center).

"+ Create Budget" opens a form: scope (Company/Branch/Department/Cost Center), period, line-item allocation grid, Approval Workflow gate before activation (CFO/Finance Director tier).

---

## 11. Fixed Assets & Cost Centers Tabs (Concise Coverage)

- **Fixed Assets:** table (Asset Name, Category, Purchase Date, Cost, Accumulated Depreciation, Net Book Value, Status) → Asset Detail drill-in showing Depreciation Schedule (table + line chart), Transfer/Disposal/Maintenance history
- **Cost Centers:** simple hierarchy list (Department/Branch/Project/Warehouse/Marketing Campaign/Custom) each showing its own mini Budget vs. Actual sparkline — this is the tagging dimension every Journal Entry line (§6) references, configured here

---

## 12. Tax Management Tab

Tax Groups/Codes (table: Code, Rate, Type [VAT/GST/Sales/Purchase], Region, Active) → Tax Templates (the same templates Product Management's Tax Class field consumes, configured here) → **VAT/GST Reports** (period-scoped summary: Output Tax − Input Tax = Net Payable, exportable in the region's standard filing format) → Tax Filing Status tracker (Filed/Pending per period, with filing deadline countdown).

---

## 13. Financial Statements Tab

Report picker (segmented control or dropdown): Trial Balance · Balance Sheet · Profit & Loss · Cash Flow Statement · General Ledger Report · AR Aging · AP Aging · Budget vs. Actual.

Each renders as a formatted, print-ready document layout (not a generic data table) — proper statement typography (section headers, subtotal/total rows in bold, indentation for account hierarchy) matching real accounting-statement conventions, since these are frequently exported/printed for external stakeholders (auditors, banks, investors). Period selector + "Compare to prior period" toggle (side-by-side columns) + Export (PDF/Excel) + a **period-lock indicator** in the header confirming the statement reflects fully-posted, locked data only.

---

## 14. Period Closing Tab

**Closing Checklist:** a literal checklist UI (checkbox per required step — reconciliation complete, all invoices posted, depreciation run, etc.) with progress ("4 of 6 complete") — the "Lock Period" button remains disabled until every item is checked, making the gate visually self-evident rather than a rule the user has to remember.

**Lock Period:** confirmation dialog summarizing what will happen (no further postings accepted into this period) → once locked, the period appears in a **Period History** list with a padlock icon, permanently.

**Reopen Period (Permission Controlled):** available only to CFO/Super Admin from a locked period's row — requires a documented reason (textarea, required) and generates a prominent, non-dismissible banner across all Finance screens while that period remains reopened: `⚠ Period June 2026 has been reopened for correction — re-lock when complete.`

---

## 15. Search Experience

Instant Search (account/journal#/reference) · Advanced Search · Saved Searches · Recent Searches · Filter Chips — identical component set reused platform-wide.

---

## 16. Dialogs

| Dialog | Contents |
|---|---|
| **Create Journal Entry** | Full-page form per §6, not a modal, given its line-item table complexity |
| **Add Account** | Per §4 |
| **Reconcile Bank** | Opens the full Reconciliation interface (§9) as a large modal or dedicated page |
| **Create Budget** | Per §10 |
| **Approve Entry** | The shared Approval component, with the self-approval-hiding rule from §6 |
| **Delete Confirmation** | Never offered for Posted journal entries (immutable) — only for Draft entries never submitted; Reverse Journal is the only path for anything posted |

---

## 17. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Row `color-hover`, no hover-reveal edit affordances on the General Ledger (nothing there is editable) |
| Focus | 2px `color-focus` ring throughout, including rapid Tab-through on Journal Entry line items |
| Selection | Checkbox multi-select on list tabs (Journal Entries, Fixed Assets) |
| Keyboard Navigation | Journal Entry line-item table supports Tab-through-fields and arrow-key cell traversal for rapid entry — a genuinely keyboard-optimized data-entry flow given how often Accountants build multi-line journals |
| Context Menu | Right-click a Journal Entry row: View, Duplicate (as a new Draft), Reverse (if Posted) |
| Quick Actions | "+ New Journal Entry" always the Primary action in the header; period-lock status always visible, never requiring a click to check |

---

## 18. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton table/dashboard; Financial Statements show a document-shaped skeleton matching the final report's section layout |
| Empty Finance Data | New tenant: "No financial activity yet" — expected before the business's first sale/purchase posts, not an error |
| No Search Results | Distinct — "No entries match '[query]'" + Clear filters |
| Offline | Not a primary use case; back-office Finance work assumes connectivity. Mobile Approvals (§19) function offline-queued per the platform's general offline-approval pattern |
| Permission Denied | Standard pattern, strictly binary here (no partial/masked-field fallback the way PII has elsewhere) — access to a Finance section is granted or it isn't |
| Validation Error | **Unbalanced Journal Entry** is the signature validation state (§6) — live, inline, blocking; **Closed Period posting attempt** shows a clear redirect message ("This period is locked — posting to the next open period instead") rather than a bare rejection |
| Server Error | Inline retry, per-section isolation |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for routine saves; dedicated confirmation dialog for Journal Posting, Period Lock, and Reconciliation completion given their significance |

---

## 19. Responsive Design

| Breakpoint | Ledger / Statements / Lists | Mobile Approvals & Dashboards |
|---|---|---|
| Desktop/Laptop | Full tables, full statement layouts, side-by-side journal line-item entry | N/A |
| Tablet | Priority columns + horizontal scroll for wide tables (e.g., multi-column Trial Balance) | Approval actions fully supported |
| Mobile Finance Manager View | Card-per-row stacked lists | **Approvals & Dashboards only**, per the spec's explicit scoping — a CFO reviews/approves journals/budgets from a phone; journal *creation* and Financial Statement generation remain Desktop/Tablet-oriented |

---

## 20. Accessibility

Standard baseline: keyboard navigation (critical for rapid Journal Entry line entry — full tab-through and keyboard-only debit/credit field switching), visible focus, screen reader labels, accessible tables (every ledger/statement uses proper header scope — especially important given how often Auditors use assistive technology with this exact module), accessible forms, WCAG AA. Financial Statement PDF exports maintain a tagged/accessible structure, not just visual formatting.

---

## 21. Figma Build Notes

- Frame: `Finance/GeneralLedger/Desktop/1440`, `Finance/JournalEntry/Create/Desktop/1440`, `Finance/Statements/ProfitLoss/Desktop/1440`
- Journal Entry line-item table is a distinct table variant (`Density=DataEntry`) from the read-only list tables elsewhere, since it needs editable cells, live totals, and the Balanced/Unbalanced indicator as a persistent footer row
- Financial Statement layouts are their own frame type — not the standard enterprise table component, given their formatted-document requirements (section headers, indentation, bold subtotals)
- Aging Report bucket visualization is a new small chart variant, reusing the platform's `chart-categorical` intensity-ramp approach from Design Tokens §16
- Layer naming: `Finance/JournalEntry/LineItem-Row`, `Finance/AgingReport/Bucket-90Plus`, `Finance/PeriodClosing/ChecklistItem`, per convention

---

## 22. Developer Handoff Notes

- Journal Entry balance validation (§6) must be enforced identically client-side (live UX feedback) and server-side (authoritative gate) — the client check exists for responsiveness, not as the actual guarantee, per `16-finance.md` §23.
- Period Locking (§14) must be enforced at the same transaction-write layer Automatic Posting uses — a late-arriving POS sale for a closed period must be rejected/redirected server-side, exactly as specified in `16-finance.md` §30, not merely warned about in a UI a cashier will never see.
- Segregation of Duties (§6's self-approval hiding) must be enforced server-side at the approval-transition endpoint — this UI's hidden-not-disabled treatment is a courtesy; the server independently and always re-checks regardless of what the client renders.
- AR/AP (§7/§8) are read views into Sales' and Purchase's own invoice/payment tables — this screen adds oversight/scheduling/aging computation on top, never a duplicated invoice record, per `16-finance.md` §30.
- The append-only, reverse-don't-edit posting model (§5/§6) must be the same architectural pattern as Inventory's Stock Movement ledger — one immutable event log, corrections as new linked entries, never in-place mutation of Posted records.

---

**Next:** 17-reports-ui.md
