Build a Next.js page route for /management:

# 📊 Management Factor Dashboard — Widget Specification (Single File)

This document defines all frontend widgets shown in the Management Factor UI.

The dashboard is generated after summarizing an earnings call using:

- Transcript Text
- PPT Text
- Quarterly Result Text

Each widget is populated from extracted entities, promises, milestones, disclosures, and metrics.

---

# 1. 🏢 Company Header Widget

### Purpose
Top-level context for the earnings call being analyzed.

### Displays
- Company Name
- NSE/BSE Ticker
- Industry Classification
- Call Date
- Confidence Badge

### UI Elements
- Company logo placeholder
- Company title (large)
- Metadata row (ticker, sector)
- Badge: `HIGH CONFIDENCE`
- Button: `FULL LLM`

### Component
`<CallHeader />`

---

# 2. ✅ Score Summary Cards (Factor Cards Row)

### Purpose
Quick investor snapshot of management quality across key dimensions.

### Widgets Included
| Factor | Meaning |
|-------|---------|
| Guidance Accuracy | Did management deliver what they guided? |
| Disclosure Honesty | Did they disclose bad news early? |
| Capital Allocation | Are they deploying capital efficiently? |

### Output Format
- Rating: High / Moderate / Low
- Short descriptor line

### Component
`<ScoreOverviewCards />`

---

# 3. 🛡 Management Quality Summary Panel (Trust Score)

### Purpose
Overall management trustworthiness score aggregation.

### Displays
- Overall Trust Level: HIGH
- Trust bar scale (Low → Moderate → High)
- Subfactor breakdown bars:
  - Governance Accuracy
  - Disclosure Honesty
  - Capital Allocation

### Component
`<TrustPanel />`

---

# 4. 📌 Governance Signals & Evidence Widget

### Purpose
Evidence-backed governance indicators extracted from transcripts.

### Example Signals
- Bad news disclosed early and explicitly
- Capex communicated 2 years in advance
- No pledging or recent stake sales
- Margin compression explained transparently

### Layout
- 2-column evidence pills
- Green check icons for positive governance

### Component
`<GovernanceSignals />`

---

# 5. 📈 Commentary Consistency Analysis Section

### Purpose
Measures consistency of management commentary over multiple quarters.

### Widgets Inside
| Metric | Meaning |
|-------|---------|
| Consistency Score | Stability of claims vs outcomes |
| Hit Rate % | % of guidance items met |
| Bad News Disclosure Pattern | Early vs delayed honesty |

### Component
`<ConsistencyAnalysis />`

---

# 6. 🎯 Consistency Metrics Strip

### Purpose
Top-line KPIs for investor scanning.

### Displays
- Consistency Score (e.g., 3.5 / 4.0)
- Hit Rate (e.g., 78%)
- Disclosure Tag: Early & Explicit

### Component
`<ConsistencyStatsRow />`

---

# 7. 📊 Guidance Track Record Table

### Purpose
Core widget: compares what management promised vs what happened.

### Table Columns
| Period | Metric | Guided | Actual | Variance | Status |
|-------|--------|--------|--------|----------|--------|
| FY25 | Revenue | ₹4200 Cr | ₹4050 Cr | -3.6% | MET |
| FY25 | Capex | ₹800 Cr | ₹920 Cr | +15% | MISS |

### Status Types
- ✅ MET
- ⚠️ MISS
- 📉 UNDERPERFORM

### Component
`<GuidanceTrackTable />`

---

# 8. 🧠 Notable Patterns Widget (Insight Sidebar)

### Purpose
Automatically surfaces recurring management behavioral patterns.

### Example Patterns
- Management consistently under-promises and over-delivers
- Capex guidance tends to be underestimated by 10–20%
- Early disclosure of margin compression due to leverage
- Proactive supply chain communication

### Layout
- Vertical stacked insight cards
- Highlight marker on left

### Component
`<NotablePatterns />`

---

# 9. 📅 Rolling Analysis Toggle (Top Right)

### Purpose
Investor can switch timeframe for analysis.

### Options
- Current Quarter Only
- Rolling 3-Year Consistency
- Full History

### UI Element
Small pill button: `Rolling 3-Year Analysis`

### Component
`<TimeframeSelector />`

---

# 10. 🔍 Confidence & Explainability Controls

### Purpose
Transparency layer for AI outputs.

### Displays
- Confidence badge (High / Medium / Low)
- Button: "FULL LLM" to open full transcript reasoning

### Component
`<ConfidenceControls />`

---

# 11. 🏁 Final Dashboard Output Summary

When all widgets are populated, the dashboard provides:

✅ Trust Score  
✅ Governance Evidence  
✅ Guidance vs Actual Performance  
✅ Disclosure Honesty Signals  
✅ Capital Allocation Strength  
✅ Multi-quarter Commentary Consistency  
✅ Extracted Patterns + Behavioral Flags  

---

# 12. Widget-to-Data Mapping (Backend Contract)

| Widget | Data Source |
|-------|------------|
| Header | earnings_calls table |
| Score Cards | summary.scores JSON |
| Trust Panel | summary.management_score |
| Governance Signals | extracted governance evidence |
| Consistency Analysis | rolling quarter evaluation |
| Guidance Table | promises vs financial actuals |
| Notable Patterns | clustering of repeated claims |

---

# ✅ Final Widget List (UI Complete)

1. Company Header  
2. Score Summary Cards  
3. Trust Score Panel  
4. Governance Signals Evidence  
5. Commentary Consistency Analysis  
6. Consistency KPI Strip  
7. Guidance Track Record Table  
8. Notable Patterns Sidebar  
9. Rolling Analysis Toggle  
10. Confidence + Full LLM Explainability  

---