# AI Decision Intelligence & Predictive Analytics — UI Specification
## Enterprise Fashion ERP/POS Platform

**Status:** Approved — Implementation Ready
**Source of truth:** [00-master-ui.md](../fashion-ui-prompts/00-master-ui.md), [01-design-system.md](../deliverables/01-design-system.md), [02-navigation.md](../deliverables/02-navigation.md), [25-ai-analytics.md](../deliverables/25-ai-analytics.md), [28-error-empty-loading.md](../deliverables/28-error-empty-loading.md), [29-design-tokens.md](../deliverables/29-design-tokens.md)
**Note on provenance:** No `25-ai-analytics-ui.md` prompt exists in `fashion-ui-prompts/` — the UI-generation prompt sequence stops at module 24 (Mobile Manager). This document was authored directly from the approved `25-ai-analytics.md` specification and the UI conventions already established across modules 01–24, following the same "transform the approved spec into implementation-ready UI, never redesign business logic" discipline as every prior document in this set.
**Scope note:** Per `25-ai-analytics.md`'s own framing, this module is the single ML engine every prior module's forecast/recommendation/anomaly reference resolves to. Its UI surface is split between (a) a dedicated AI Analytics console (this document's primary focus) and (b) contextual embeds already specified elsewhere — the Dashboard's AI Insight Card ([01-dashboard-ui.md](01-dashboard-ui.md) §7), Reports' AI Insights within report tabs ([17-reports-ui.md](17-reports-ui.md) §9), and Mobile Manager's AI Daily Briefing ([24-mobile-manager-ui.md](24-mobile-manager-ui.md) §3) — none of which are re-specified here.

---

## 1. Screen Anatomy

```
Top Header → Sidebar → Breadcrumb: Dashboard > AI Analytics
↓
Page Header (Title + Toolbar)
↓
AI Dashboard (KPI/insight strip, collapsible)
↓
Secondary Tabs: Executive Briefing · Forecasting Center (default) · Recommendation Engine · Anomaly Detection · Customer Intelligence · Inventory Intelligence · Financial Intelligence · Natural Language Analytics · Model Monitoring
```

---

## 2. Page Header & Toolbar

```
AI Analytics                                          [Export] [Ask a question…]
Last model refresh: 6h ago

[Branch ▾] [Date Range ▾] [Category ▾] [Supplier ▾] [Customer Segment ▾]
```

"Ask a question…" is a persistent, always-visible entry point into Natural Language Analytics (§9) — not buried as a tab, since conversational query is this module's most distinctive capability and deserves header-level prominence, mirroring how Global Search is always visible in the platform's main Top Header.

---

## 3. AI Dashboard (Collapsible Strip)

Distinct from every other module's KPI-card strip: this one leads with a **narrative AI Summary card** (full-width, `space-6` padding) before any numeric cards:

```
┌───────────────────────────────────────────────────────┐
│ 🤖 AI Summary                                    Confidence: High │
│ Revenue is trending up 8% this month, primarily driven by         │
│ Branch 3's Outerwear category. Denim Jacket stock will run out    │
│ in approximately 4 days at current sell-through. 2 pending        │
│ approvals need your attention.                                    │
└───────────────────────────────────────────────────────┘
```

Beneath it, a KPI card row: Business Health Score (composite gauge) · Risk Score · Revenue Forecast · Demand Forecast · Inventory Health · Customer Health · Growth Opportunities (count, tap to expand) · Recommended Actions (count).

**Every predictive/AI-sourced card carries a small Confidence badge** (High/Medium/Low, or a numeric %) in its top-right corner — this is the platform-wide mandatory visual distinction between AI-sourced figures and deterministic ones, applied consistently across every card in this module.

---

## 4. Executive Briefing Tab

Daily Briefing (today's narrative, same content as the Dashboard's AI Summary but with fuller detail and a "Read aloud" affordance for accessibility) → Weekly Summary / Monthly Executive Summary (tab-toggle within the section) → Critical Business Alerts (list, Error-severity items surfaced first) → Growth Opportunities (card grid: opportunity description, estimated impact, "Explore" action) → Operational Risks (card grid, same anatomy, Warning-accented).

Each Briefing has a "Share" action (generates a scoped read-only link, same pattern as the Dashboard module's Share Dashboard) since these narrative summaries are frequently forwarded to stakeholders who don't need full platform access.

---

## 5. Forecasting Center

**Forecast type selector** (chips): Sales · Demand · Revenue · Cash Flow · Inventory · Staffing · Promotion.

```
[Sales ▾]  Branch: [All ▾]  Horizon: [Next 30 days ▾]

[Line chart: historical (solid) + forecast (dashed) + confidence band (shaded)]

Forecast Accuracy (last period): 91%          Confidence: High
```

- The forecast line renders **dashed**, distinct from the solid historical line, with a shaded confidence-interval band around it — a consistent visual grammar applied to every forecast type in this tab so a user learns the pattern once
- "Forecast Accuracy" caption beneath every chart shows how the model has performed historically for this specific forecast type — transparency baked into the default view, not hidden in a separate Model Monitoring tab
- Clicking into a forecast deep-links to the relevant owning module's data (e.g., Demand Forecast → Inventory's Replenishment view) since this module computes the prediction but the owning module acts on it

---

## 6. Recommendation Engine

Card grid, grouped by type: Reorder Recommendations · Promotion Suggestions · Price Optimization · Cross-sell/Upsell Opportunities · Branch Inventory Rebalancing · Employee Scheduling Suggestions.

**Recommendation card:**
```
┌─────────────────────────┐
│ Reorder Suggestion            Confidence: High │
│ Denim Jacket — Blue/M           │
│ Reorder 40 units from Levi's Co.  │
│ Estimated stockout: 4 days         │
│                                   │
│ [Dismiss]         [Create PO →]   │
└─────────────────────────┘
```

- Every card's primary action deep-links to the owning module's actual creation flow (Create PO → Purchase UI, pre-filled; Apply Promotion → Promotions UI's Rule Builder, pre-populated) — this module never executes the recommendation itself, only originates it
- **Dismiss** requires no reason (low-friction) but is logged as "Recommendation Ignored" per the spec's feedback-loop requirement; accepting via the primary action logs "Recommendation Accepted" — both silently, without interrupting the user's flow with a survey

---

## 7. Anomaly Detection

Table/card hybrid: Anomaly type (Sales Spike/Drop, Inventory Shrinkage, Stock-out, Fraud Indicator, Abnormal Discount, Suspicious Return, Payment Irregularity — icon + label), Affected entity (linked), Detected date, Severity (badge), Confidence, Status (New/Reviewing/Resolved/Dismissed).

- Each row expands to show **why** it was flagged — a short explanation (e.g., "This discount (45%) is 3x higher than this employee's typical average") rather than a bare anomaly label, directly serving the Explainable AI requirement
- **Never auto-blocks anything** — every anomaly here is "flag for review," with a "Mark Reviewed" / "Escalate" action pair, consistent with the spec's explicit reasoning that false positives on legitimate transactions carry real customer-friction cost
- Fraud Indicator rows specifically link into IAM's Security Events where the anomaly involves an identity/access dimension

---

## 8. Customer / Inventory / Financial Intelligence Tabs

Each follows the same content template: ranked/segmented lists relevant to that domain, each list item carrying a Confidence indicator where the underlying figure is predictive (Churn Risk, ABC Classification-driven Dead Stock flag, Cash Flow Health projection) and no indicator where the figure is a straightforward aggregate (current Inventory Turnover, actual current Cash Flow).

- **Customer Intelligence:** Churn Risk (ranked list, high-risk customers first, each linking to Customer 360) · Next Best Offer (per-customer suggestion card) · Personalized Campaign suggestions (deep-links to Marketing Automation)
- **Inventory Intelligence:** Fast/Slow/Dead Stock (three ranked lists) · ABC/XYZ Classification (a 2D scatter/matrix visualization plotting products by revenue-contribution × demand-variability) · Reorder Points (feeds Forecasting Center §5)
- **Financial Intelligence:** Profitability trend · Expense Trend · Cash Flow Health (projection, Confidence-tagged) · Budget Variance (cross-referenced with Finance UI's own Budget vs. Actual, never recalculated independently)

---

## 9. Natural Language Analytics

Full-screen conversational interface (reached via the header's "Ask a question…" or this tab directly):

```
┌───────────────────────────────────────────────────────┐
│ 🤖  Ask anything about your business…                    │
│                                                           │
│ You: Why did sales decrease this month?                  │
│                                                           │
│ 🤖: Sales decreased 6% this month, primarily due to a      │
│     12% drop in Branch 3's Outerwear category, which        │
│     coincided with 3 stock-out days for your top-selling      │
│     SKU. [View Branch 3 Sales →]                              │
│                                                           │
│     [📊 chart]                                              │
│                                                           │
│ [Type your question…]                                       │
└───────────────────────────────────────────────────────┘
```

- Streams the response progressively (text appears incrementally, not all-at-once) with `aria-live="polite"` announcing new content without stealing focus
- Responses combine Narrative Explanation + an embedded Chart/Table + deep-links to the relevant module — never a bare text answer when a visual would clarify
- **Simple lookup questions** ("Show today's sales") resolve near-instantly via Reports' faster deterministic path; **causal/explanatory questions** ("why did sales decrease") route through this module's heavier reasoning pipeline — the UI shows a brief "Thinking…" state only for the latter, never for simple lookups, so the interface itself communicates which kind of question was asked
- Conversation history persists in a left rail (collapsible on mobile), reusable/revisitable like a chat history

---

## 10. Model Monitoring Tab

Table: Model Name (Sales Forecast/Demand Forecast/Churn Prediction/etc.), Version, Prediction Accuracy (trend sparkline), Training Status (Active/Retraining/Needs Attention badge), Confidence Score (aggregate), Last Refresh.

This is the transparency backstop for every Confidence badge shown throughout the rest of this module — a user questioning "why did the system suggest reordering 200 units" can trace that recommendation's originating model here and see its current accuracy track record, directly serving the spec's Explainable AI requirement as a concrete, always-available answer path rather than an abstract principle.

---

## 11. Interaction Design

| Interaction | Behavior |
|---|---|
| Hover | Card/row `color-hover`; Confidence badge shows a tooltip on hover explaining what it means ("Based on 6 months of sales history with consistent accuracy") |
| Focus | 2px `color-focus` ring throughout, including chat input and recommendation card actions |
| Selection | Filter chips, forecast type selector |
| Keyboard Navigation | Full Tab-through on every form/chat interface; conversation history rail arrow-key navigable |
| Drill Down | Every forecast/recommendation/anomaly deep-links to its owning module's live record |
| Quick Actions | Recommendation cards' primary action (Create PO, Apply Promotion, etc.) always one tap away, never requiring a second confirmation screen before landing in the target module's pre-filled flow |

---

## 12. States

| State | Treatment |
|---|---|
| Loading / Skeleton | Skeleton dashboard/chart per Design System §17; predictions may show a marginally longer loading state given computation cost, with a determinate progress indicator rather than an indefinite spinner |
| No Insights | New tenant with insufficient historical data: icon + "Building your business insights" + a patient, expectation-setting message ("Predictions improve as more data accumulates") — never implies something is broken |
| Model Unavailable | A specific model temporarily down/retraining shows "This insight is temporarily unavailable" on just that card/section, per §10's monitoring — never a generic error |
| Insufficient Data (per-forecast) | A forecast requiring more history than exists (e.g., a just-launched product) is withheld with "Not enough history yet for a reliable forecast" rather than extrapolating from nothing |
| Low Confidence | Predictions below a configured minimum confidence are visually de-emphasized (muted color, smaller type) or hidden behind a "Show low-confidence insights" toggle, never presented with the same visual weight as high-confidence figures |
| Permission Denied | Standard pattern; scoped per role per §2 of the spec — a Branch Manager's AI Dashboard shows only their branch's data |
| Server Error | Inline retry, per-section isolation — a failed Anomaly Detection fetch never blocks Forecasting Center from rendering |
| Retry | Consistent retry affordance |
| Success Confirmation | Toast for Recommendation actions ("Purchase Order created"); no confirmation needed for Dismiss (logged silently) |

---

## 13. Responsive Design

| Breakpoint | Full AI Console | Mobile Executive View |
|---|---|---|
| Desktop/Laptop | Full charts, full Natural Language Analytics chat interface | N/A |
| Tablet | Priority content + scroll | Condensed cards, chat interface supported |
| Mobile Executive View | N/A | **AI Dashboard and Executive Briefing specifically** — this is the same content Mobile Manager's AI Daily Briefing surfaces ([24-mobile-manager-ui.md](24-mobile-manager-ui.md) §3); deep Forecasting Center/Recommendation Engine configuration remains Desktop/Tablet-oriented |

---

## 14. Accessibility

Standard baseline: keyboard navigation, screen reader labels, WCAG AA. **Accessible Charts:** every forecast/prediction chart has a "View as Table" fallback that explicitly includes the Confidence value as a column, not just the visual chart — per the platform-wide rule that AI-sourced figures carry their confidence context everywhere they appear, including the accessible fallback. **Natural Language Analytics** (§9) streams responses via `aria-live="polite"` so incremental content is announced without interrupting the user's current focus, consistent with the live-region pattern established since the Dashboard module.

---

## 15. Figma Build Notes

- Frame: `AIAnalytics/Dashboard/Desktop/1440`, `AIAnalytics/ForecastingCenter/Desktop/1440`, `AIAnalytics/NaturalLanguage/Desktop/1440`
- **Confidence Badge** is a new small component (`Level=High|Medium|Low`, color-mapped: High=`color-success`, Medium=`color-warning`, Low=`color-text-secondary`) — used across every card in this module and embedded wherever AI-sourced figures appear elsewhere in the platform (Dashboard's AI Insight Card, Reports' AI Insights, Product Detail's Analytics tab Forecast sparkline)
- Forecast chart's dashed-line + confidence-band treatment is a new chart variant (`Series=Historical|Forecast`) built once, reused across every forecast type in §5
- Recommendation Card is a new small component, structurally similar to a Notification card (icon + primary text + secondary text + action buttons) but with the Confidence badge and dual Accept/Dismiss actions
- Layer naming: `AIAnalytics/Forecasting/Chart-SalesForecast`, `AIAnalytics/Recommendations/Card-Reorder`, `AIAnalytics/NaturalLanguage/ResponseBubble`, per convention

---

## 16. Developer Handoff Notes

- Every forecast/recommendation/anomaly type shown across this module's tabs must be computed exactly once by the backend AI Analytics service and exposed via API — this UI never computes a prediction client-side; it renders whatever the service returns, per `25-ai-analytics.md` §25.
- The Confidence Score must be a first-class field returned alongside every prediction from the API — this UI is responsible for displaying it consistently (§3's mandatory badge rule), and the backend is responsible for ensuring it's always present, never an afterthought.
- Recommendation Accepted/Ignored (§6) must be reported back to the AI service via a shared feedback API whenever a user taps a recommendation's primary action or Dismiss — this is what makes the model's Continuous Learning loop real; without this wired in, the model has no signal to improve from.
- Natural Language Analytics (§9) should route through an intent-classification layer deciding whether a question needs this module's heavier causal-reasoning pipeline or can be answered by Reports' faster deterministic data retrieval — critical for the UI's "Thinking…" state to correctly appear only when actually needed.
- Model Monitoring's Confidence Score/Accuracy figures (§10) must be the exact same numbers driving every Confidence Badge shown elsewhere in this module — one source, many display surfaces, never independently recalculated per screen.

---

**This document has no prompt-file counterpart in `fashion-ui-prompts/` and was generated directly from the approved specification per user request.**
