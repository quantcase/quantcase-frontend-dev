import Link from "next/link";

// ── Static brief data (keyed by clientId) ────────────────────────────────────

const BRIEFS: Record<string, BriefData> = {
  "priya-venkat": {
    initials: "PV",
    tagType: "asked",
    tagLabel: "Client asked",
    eyebrow: "Conversation Brief · Generated 09:41 IST · 90-sec read",
    title: "Priya Venkat",
    titleEmphasis: "the NPS conversation she asked for",
    meta: ["₹4.6 Cr book", "Client since Mar 2022", "Last met 11 Apr 2026", "Next meeting today, 11:30"],
    fit: "92%",
    fitPct: 92,
    situation: {
      cells: [
        { label: "Stage of life",               value: "Dual-income · 41",  sub: "Husband 43 · 2 kids (8, 11)" },
        { label: "Tax slab",                    value: "30% bracket",       sub: "FY26 estimated TI ₹38L+"     },
        { label: "Retirement provision",        value: "EPF only",          sub: "No NPS, no PPF maxed"        },
        { label: "Risk profile",                value: "Moderate",          sub: "Onboarding RPQ · Sept 2023"  },
      ],
      quoteDate: "Her words · last call · 11 Apr 2026",
      quote: "My husband mentioned NPS at his office — should we be doing that? What's the actual tax benefit at our slab?",
    },
    recommendation: {
      eyebrow: "Primary recommendation",
      title: "Tier-1 NPS · ₹50,000/yr under Sec 80CCD(1B)",
      detail: "Active choice · 75% Equity (E) · 15% Corporate Bond (C) · 10% G-Sec (G) · matching her moderate profile",
      amountLabel: "Annual contribution",
      amount: "₹50,000",
      amountSub: "Tax saved: ₹15,600",
      whyCells: [
        { label: "Why now",          text: "She raised it herself on the last call. The longer the gap, the more it feels like the conversation didn't matter to you." },
        { label: "Why this product", text: "Only NPS gives the additional ₹50K deduction under 80CCD(1B). PPF and ELSS share the 80C ₹1.5L bucket she's already using." },
        { label: "Why this amount",  text: "₹50K is the full 80CCD(1B) limit. Anything less leaves tax benefit on the table; anything more crowds her existing SIPs." },
      ],
    },
    opener: {
      text: "Priya, you'd asked me last month about NPS. I went and looked at your specific situation — at your tax slab, this is actually one of the few moves that adds real value, and I want to walk you through what makes sense.",
      footnote: "Frames as a follow-up to her question · positions you as having done the work",
    },
    talkingPoints: [
      {
        headline: "Lead with the tax math, not the product",
        body: "At your 30% slab, ₹50,000 in NPS saves you ₹15,600 in tax this year — that's an immediate, guaranteed 31% return before the market does anything. The investment compounds on top.",
      },
      {
        headline: "Position it as in addition to, not instead of",
        body: "She's already maxing 80C through ELSS and PPF. Critical to clarify: NPS uses a separate 80CCD(1B) limit. This is genuinely additional headroom, not a reshuffle.",
      },
      {
        headline: "Acknowledge the lock-in honestly",
        body: "Don't hide it. Yes, it's locked till 60. But Priya, you're 41 — anything you put in for retirement should be locked till 60. The lock-in is the feature, not the bug.",
      },
      {
        headline: "Suggest active choice, 75/15/10",
        body: "Auto choice glide-path is too conservative for her age. Active choice with 75% equity matches her moderate risk profile and her 19-year horizon to age 60.",
      },
      {
        headline: "Close with the direct ask",
        body: "If this lands well, I can have the eNPS account opened today and your first contribution sent before March 31. Should we do that? Don't leave her to come back to you.",
      },
    ],
    objections: [
      {
        q: "Why now? I haven't needed NPS for the last 19 years.",
        a: "You're right — but two things changed. Your tax slab has moved up, so the ₹15,600 deduction is meaningfully larger now. And every year you don't contribute is one less year of compounding. ₹50K/yr at 11% over 19 years is ~₹32 lakh. The cost of waiting is real.",
      },
      {
        q: "Locked till 60 sounds scary. What if I need the money?",
        a: "That's a fair concern. But here's the framing — you already have ₹4.6 Cr of liquid assets with me. NPS is for the part of your portfolio that should be locked. Even at ₹50K/yr, by 60 it's ~₹32L — meaningful but not so large that lock-in becomes a problem.",
      },
      {
        q: "My husband says he doesn't trust government schemes.",
        a: "NPS isn't really a government scheme in that sense — it's a regulated retirement account managed by private fund managers like HDFC, ICICI, SBI. Government just sets the structure. The returns track the underlying equity and bond markets, not government promises.",
      },
      {
        q: "Can I do this directly online without you?",
        a: "You absolutely can — eNPS is open to anyone. What I'm offering is the fund-manager selection, asset-allocation choice, and annual rebalancing. Most people who do it themselves end up in Auto Choice and over time leave 1-2% return on the table.",
      },
    ],
    snapshot: [
      [{ label: "AUM",          value: "₹4.6 Cr", sub: "+₹38L · 12mo",       mono: true  },
       { label: "Pulse",        value: "76/100",   sub: "+2 vs last week",     mono: true  }],
      [{ label: "Last review",       value: "Q4 FY25", sub: "14 Jan 2026",          mono: false },
       { label: "Touchpoints · 90d", value: "7",       sub: "3 calls, 4 messages",  mono: false }],
    ],
    portfolio: [
      { label: "Equity (direct + MF)", value: "₹2.8 Cr", pct: "61%" },
      { label: "Debt / Liquid",        value: "₹1.1 Cr", pct: "24%" },
      { label: "Real estate (REITs)",  value: "₹40 L",   pct: "9%"  },
      { label: "Cash / Savings",       value: "₹30 L",   pct: "6%"  },
    ],
    portfolioStatus: "on track",
    conversations: [
      { date: "11 Apr", ago: "16d ago", topic: "Call · 32min",       text: "Quarterly review. Discussed infra holding. Asked about NPS; husband mentioned at office. Mentioned EV interest for son." },
      { date: "28 Mar", ago: "30d ago", topic: "WhatsApp",           text: "Shared Q4 portfolio statement. She acknowledged: looks good, talk in April." },
      { date: "14 Jan", ago: "3mo ago", topic: "Meeting · in person", text: "Q3 review. Rebalanced into infra (5% allocation). Discussed daughter's school fees structure." },
    ],
    actions: [
      { primary: true,  icon: "meeting",  label: "Bring up in 11:30 meeting",   desc: "Pinned to today's call agenda" },
      { primary: false, icon: "file",     label: "Generate one-pager",           desc: "PDF with tax math, fund options · branded" },
      { primary: false, icon: "message",  label: "Draft WhatsApp follow-up",     desc: "If call doesn't happen today" },
      { primary: false, icon: "schedule", label: "Schedule a dedicated NPS call", desc: "If she wants the deep dive separately" },
    ],
  },
  "rahul-mehta": {
    initials: "RM",
    tagType: "critical",
    tagLabel: "Critical",
    eyebrow: "Conversation Brief · Generated 09:41 IST · 90-sec read",
    title: "Rahul Mehta",
    titleEmphasis: "the portfolio drift conversation",
    meta: ["₹3.2 Cr book", "Client since Jan 2021", "Last met 2d ago", "Anxious · needs callback today"],
    fit: "88%",
    fitPct: 88,
    situation: {
      cells: [
        { label: "Portfolio drift",   value: "+6% mid-cap",    sub: "Vs 30% target — now at 36%"  },
        { label: "Risk profile",      value: "Moderate",       sub: "RPQ Nov 2023"                },
        { label: "Last allocation",   value: "Q3 FY25",        sub: "Brief never sent post-review" },
        { label: "Sentiment",         value: "Anxious",        sub: "Mentioned volatility on call" },
      ],
      quoteDate: "His words · last call · 2d ago",
      quote: "I keep seeing the news about mid-caps correcting. Are we overexposed? Should we be doing something right now?",
    },
    recommendation: {
      eyebrow: "Recommended action",
      title: "Trim mid-cap by 6% · redirect to large-cap index",
      detail: "Sell ₹19.2L of mid-cap holdings · buy Nifty 50 index fund · restores 30/20/50 target allocation within 1 trade",
      amountLabel: "Rebalance size",
      amount: "₹19.2 L",
      amountSub: "Back to target in 1 trade",
      whyCells: [
        { label: "Why now",        text: "Rahul raised it himself — two days of no callback erodes trust. He's anxious and already watching news." },
        { label: "Why this trade", text: "Mid-cap at 36% vs his 30% target is the single biggest risk flag. Large-cap index restores balance without exit load." },
        { label: "Why this size",  text: "₹19.2L trims exactly 6% drift. Smaller rebalance doesn't fix the problem; larger disrupts his equity allocation." },
      ],
    },
    opener: {
      text: "Rahul, I saw your message and I've looked at the numbers — you're right to flag it. Mid-caps have drifted and I want to walk you through exactly what I'd do and why.",
      footnote: "Validates his concern · signals you acted · positions the rebalance as pre-planned",
    },
    talkingPoints: [
      {
        headline: "Name the drift — don't minimise it",
        body: "Your mid-cap allocation has drifted to 36% against your 30% target. That's a ₹19L overweight. Not a crisis, but meaningful enough to act on now while markets are still holding.",
      },
      {
        headline: "Explain the fix — one trade, not a restructure",
        body: "We trim ₹19.2L from your mid-cap fund and move it into a Nifty 50 index fund. One transaction, no exit load, restores your allocation to exactly where you signed off on it.",
      },
      {
        headline: "Address the news — separate signal from noise",
        body: "Mid-cap corrections happen. What matters is that your portfolio was already at the upper edge of tolerance before this. Acting now is risk management, not reaction to headlines.",
      },
      {
        headline: "Reassure on the broader picture",
        body: "Your large-cap and debt positions are clean. This one adjustment and your book is back on track. Nothing else needs to change today.",
      },
    ],
    objections: [
      {
        q: "Should we just wait and see if mid-caps recover?",
        a: "We could. But your target allocation exists precisely because you told us you don't want to take on more mid-cap risk than 30%. If we wait, we're implicitly deciding to hold a higher-risk position. That's a choice — but it should be a deliberate one, not a default.",
      },
      {
        q: "Won't selling now lock in losses?",
        a: "You're not down on this position — mid-caps have returned well over your holding period. You'd be trimming a gain, not realising a loss. And the Nifty 50 you'd be buying has actually outperformed mid-caps over the last 3 months.",
      },
      {
        q: "Can we do a smaller rebalance?",
        a: "We can trim 3% instead of 6% if you prefer a half-step. That leaves you at 33% mid-cap — within the upper band of your IPS. Worth discussing what feels right to you.",
      },
    ],
    snapshot: [
      [{ label: "AUM",         value: "₹3.2 Cr", sub: "-₹18L · 30d",       mono: true  },
       { label: "Pulse",       value: "58/100",   sub: "-4 vs last week",   mono: true  }],
      [{ label: "Last review",      value: "Q3 FY25", sub: "21 Oct 2025",         mono: false },
       { label: "Touchpoints · 90d", value: "9",      sub: "6 calls, 3 messages", mono: false }],
    ],
    portfolio: [
      { label: "Mid-cap equity",     value: "₹1.15 Cr", pct: "36%" },
      { label: "Large-cap / index",  value: "₹0.80 Cr", pct: "25%" },
      { label: "Debt / liquid",      value: "₹0.96 Cr", pct: "30%" },
      { label: "Cash",               value: "₹0.29 Cr", pct: "9%"  },
    ],
    portfolioStatus: "drift alert",
    conversations: [
      { date: "25 Apr", ago: "2d ago",  topic: "Call · 18min",  text: "Rahul called unprompted. Concerned about mid-cap volatility. Mentioned seeing CNBC coverage. Asked if we should act." },
      { date: "10 Apr", ago: "17d ago", topic: "WhatsApp",      text: "Sent monthly statement. He replied: looks red this month, should I be worried?" },
      { date: "21 Oct", ago: "6mo ago", topic: "Meeting · Zoom", text: "Q3 review. Agreed 30% mid-cap target. Allocation brief never followed up after meeting." },
    ],
    actions: [
      { primary: true,  icon: "meeting",  label: "Call Rahul now",               desc: "He's waiting — 2 days since last contact" },
      { primary: false, icon: "file",     label: "Send rebalance proposal",       desc: "One-pager with before/after allocation" },
      { primary: false, icon: "message",  label: "Draft WhatsApp reassurance",    desc: "If call doesn't connect" },
      { primary: false, icon: "schedule", label: "Book Q4 review",                desc: "Overdue — last review was Q3 FY25" },
    ],
  },
  "suresh-nair": {
    initials: "SN",
    tagType: "idle",
    tagLabel: "Idle cash",
    eyebrow: "Conversation Brief · Generated 09:41 IST · 90-sec read",
    title: "Suresh Nair",
    titleEmphasis: "the idle cash conversation",
    meta: ["₹2.4 Cr book", "Client since Jun 2020", "Last met 3w ago", "Conservative profile"],
    fit: "78%",
    fitPct: 78,
    situation: {
      cells: [
        { label: "Idle cash",       value: "₹62 L",    sub: "HDFC SB since Dec 2025"   },
        { label: "Risk profile",    value: "Conservative", sub: "RPQ Jun 2023"          },
        { label: "Current yield",   value: "~3.5%",    sub: "Savings account rate"      },
        { label: "Opportunity",     value: "~7.2%",    sub: "Liquid + ultra-short split" },
      ],
      quoteDate: "Observation · balance history · since Dec 2025",
      quote: "₹62L has sat in a savings account for 4 months. At his tax slab, that's roughly ₹2L/yr in foregone returns vs a simple liquid + ultra-short split.",
    },
    recommendation: {
      eyebrow: "Recommended action",
      title: "Liquid fund ₹40L + ultra-short ₹22L",
      detail: "Overnight liquidity on ₹40L · slightly higher yield on ₹22L · no lock-in · suits his conservative profile · single transaction",
      amountLabel: "Annual uplift",
      amount: "₹2.1 L",
      amountSub: "vs current SB rate",
      whyCells: [
        { label: "Why now",        text: "4 months of foregone yield. Every month we wait is another ~₹17K left in the bank." },
        { label: "Why this split", text: "Liquid fund for full overnight liquidity. Ultra-short for the stable ₹22L he won't need instantly. Both fit his conservative IPS." },
        { label: "Why this size",  text: "Moving the full ₹62L. Partial moves leave the problem unsolved. He can redeem either fund T+1 if needed." },
      ],
    },
    opener: {
      text: "Suresh, I was reviewing your accounts and noticed ₹62L sitting in savings for the last four months. I want to suggest something that costs you nothing in risk but adds about ₹2L a year. Worth 5 minutes?",
      footnote: "Leads with observation, not product · frames as found money · low ask to open the conversation",
    },
    talkingPoints: [
      {
        headline: "Start with the number, not the product",
        body: "At your slab, that ₹62L is earning about 3.5% in SB. A liquid fund gives you 7%+ with the same overnight redemption. That gap is ₹2.1L a year — money you're currently giving to the bank.",
      },
      {
        headline: "Address the liquidity concern upfront",
        body: "I know you value access to this money. Liquid funds redeem T+1 — one business day. You will never be locked out. This is not an investment, it's just a better parking spot.",
      },
      {
        headline: "Keep it simple — two funds, done",
        body: "₹40L into a liquid fund, ₹22L into ultra-short. Both conservative-rated, both from fund houses you already hold. One instruction from you and it's set up this week.",
      },
    ],
    objections: [
      {
        q: "What if I need the money quickly?",
        a: "Liquid funds are T+1 — you'd have the money in your account the next business day. For anything truly urgent, the ₹40L liquid portion covers it. The ultra-short is for money you'd give at least a week's notice on anyway.",
      },
      {
        q: "Is this safe? I don't want any market risk.",
        a: "Liquid funds invest in instruments maturing in under 91 days — government securities, T-bills, top-rated commercial paper. In 20 years of liquid fund history in India, no retail investor has lost principal. It's the closest thing to risk-free outside a bank.",
      },
      {
        q: "I'll just move it to an FD instead.",
        a: "An FD at 6.5-7% is fine — but it locks you in for 6-12 months and breaks the liquidity. A liquid fund gives you the same yield, full flexibility, and better tax efficiency for your slab. I'd recommend the fund.",
      },
    ],
    snapshot: [
      [{ label: "AUM",        value: "₹2.4 Cr", sub: "+₹12L · 12mo",      mono: true  },
       { label: "Pulse",      value: "74/100",   sub: "+1 vs last week",   mono: true  }],
      [{ label: "Last review",      value: "Q4 FY25", sub: "5 Jan 2026",          mono: false },
       { label: "Touchpoints · 90d", value: "4",      sub: "2 calls, 2 messages", mono: false }],
    ],
    portfolio: [
      { label: "Debt / Liquid MF",   value: "₹1.4 Cr", pct: "58%" },
      { label: "Equity MF",          value: "₹0.7 Cr", pct: "29%" },
      { label: "Cash / SB (idle)",   value: "₹0.62 Cr", pct: "26%" },
      { label: "Other",              value: "₹0.1 Cr", pct: "4%"  },
    ],
    portfolioStatus: "idle cash",
    conversations: [
      { date: "7 Apr",  ago: "20d ago", topic: "Call · 12min",  text: "Routine check-in. Portfolio discussed briefly. Suresh mentioned keeping cash aside for a potential property purchase that fell through." },
      { date: "15 Mar", ago: "6w ago",  topic: "WhatsApp",      text: "Sent Q4 statement. No reply." },
      { date: "5 Jan",  ago: "4mo ago", topic: "Meeting · in person", text: "Annual review. Conservative profile confirmed. Discussed adding more to debt MFs in FY26." },
    ],
    actions: [
      { primary: true,  icon: "meeting",  label: "Call Suresh today",              desc: "Best window: 10am-12pm per call history" },
      { primary: false, icon: "file",     label: "Send liquid fund comparison",     desc: "SB vs liquid vs FD at his slab — 1 pager" },
      { primary: false, icon: "message",  label: "Draft WhatsApp note",            desc: "Short observation nudge if call misses" },
      { primary: false, icon: "schedule", label: "Set quarterly review",            desc: "Last review was Jan — overdue" },
    ],
  },
};

const FALLBACK_BRIEF = BRIEFS["priya-venkat"];

// ── Types ─────────────────────────────────────────────────────────────────────

interface BriefData {
  initials: string;
  tagType: "asked" | "critical" | "idle" | "life";
  tagLabel: string;
  eyebrow: string;
  title: string;
  titleEmphasis: string;
  meta: string[];
  fit: string;
  fitPct: number;
  situation: {
    cells: { label: string; value: string; sub: string }[];
    quoteDate: string;
    quote: string;
  };
  recommendation: {
    eyebrow: string;
    title: string;
    detail: string;
    amountLabel: string;
    amount: string;
    amountSub: string;
    whyCells: { label: string; text: string }[];
  };
  opener: { text: string; footnote: string };
  talkingPoints: { headline: string; body: string }[];
  objections: { q: string; a: string }[];
  snapshot: { label: string; value: string; sub: string; mono: boolean }[][];
  portfolio: { label: string; value: string; pct: string }[];
  portfolioStatus: string;
  conversations: { date: string; ago: string; topic: string; text: string }[];
  actions: { primary: boolean; icon: ActionIconType; label: string; desc: string }[];
}

type ActionIconType = "meeting" | "file" | "message" | "schedule";

// ── Tag styles keyed to the base project semantic colors ──────────────────────

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  asked:    { bg: "var(--qc-down-soft)",  color: "var(--qc-down)"  },
  critical: { bg: "var(--qc-down-soft)",  color: "var(--qc-down)"  },
  idle:     { bg: "var(--qc-blue-soft)",  color: "var(--qc-blue)"  },
  life:     { bg: "var(--qc-up-soft)",    color: "var(--qc-up)"    },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BriefPage({ params }: { params: { clientId: string } }) {
  const brief = BRIEFS[params.clientId] ?? FALLBACK_BRIEF;
  const tag = TAG_STYLES[brief.tagType];

  return (
    <div className="min-h-screen mb-16" style={{ background: "var(--qc-surface-base)" }}>

      {/* ── Breadcrumb bar ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3.5 sticky top-0 z-10"
        style={{ borderBottom: "1px solid var(--qc-border-default)", background: "var(--qc-surface-white)" }}
      >
        <div className="flex items-center gap-2 text-[12px]">
          <Link href="/" style={{ color: "var(--qc-text-muted)", textDecoration: "none" }}>Today</Link>
          <span style={{ color: "var(--qc-border-default)" }}>/</span>
          <span style={{ color: "var(--qc-text-muted)" }}>Opportunities</span>
          <span style={{ color: "var(--qc-border-default)" }}>/</span>
          <span style={{ color: "var(--qc-text-heading)", fontWeight: 500 }}>
            Brief — {brief.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {["Listen (90 sec)", "Print", "Dismiss"].map((label) => (
            <button
              key={label}
              className="text-[11px] font-medium px-3.5 py-1.5 rounded-md"
              style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)", color: "var(--qc-text-body)" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 pb-16">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div
          className="grid items-center gap-5 pb-5 mb-6"
          style={{ gridTemplateColumns: "auto 1fr auto", borderBottom: "1px solid var(--qc-border-default)" }}
        >
          {/* Avatar */}
          <div
            className="size-14 rounded-full flex items-center justify-center text-[18px] font-semibold flex-shrink-0"
            style={{ background: "var(--qc-text-heading)", color: "var(--qc-text-on-dark)" }}
          >
            {brief.initials}
          </div>

          {/* Title block */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm"
                style={{ background: tag.bg, color: tag.color }}
              >
                {brief.tagLabel}
              </span>
              <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{brief.eyebrow}</span>
            </div>
            <h1
              className="text-[28px] font-normal leading-[1.1] tracking-[-0.015em] mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}
            >
              {brief.title} · <span style={{ color: "var(--qc-text-muted)", fontWeight: 300 }}>{brief.titleEmphasis}</span>
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {brief.meta.map((m, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span style={{ color: "var(--qc-border-default)" }}>·</span>}
                  <span className="text-[12px]" style={{ color: "var(--qc-text-body)" }}>{m}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Fit score */}
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--qc-text-muted)" }}>
              Conversation fit
            </p>
            <p
              className="text-[32px] font-normal leading-none tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)", color: "var(--qc-text-heading)" }}
            >
              {brief.fit}
            </p>
            <div className="w-24 h-1 rounded-full overflow-hidden mt-2 ml-auto" style={{ background: "var(--qc-border-default)" }}>
              <div className="h-full rounded-full" style={{ background: "var(--qc-text-heading)", width: `${brief.fitPct}%` }} />
            </div>
          </div>
        </div>

        {/* ── Two-column body ────────────────────────────────────────────── */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "1.5fr 1fr" }}>

          {/* LEFT COLUMN */}
          <div>

            {/* 1. Situation */}
            <BriefSection num={1} title="The situation">
              {/* 2×2 stat grid — same pattern as BookAtAGlance */}
              <div
                className="grid grid-cols-2 rounded-[10px] overflow-hidden mb-4"
                style={{ gap: 1, background: "var(--qc-border-default)", border: "1px solid var(--qc-border-default)" }}
              >
                {brief.situation.cells.map((cell) => (
                  <div key={cell.label} className="px-4 py-3.5" style={{ background: "var(--qc-surface-card)" }}>
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--qc-text-muted)" }}>{cell.label}</p>
                    <p
                      className="text-[20px] font-normal leading-none tracking-[-0.01em]"
                      style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}
                    >
                      {cell.value}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{cell.sub}</p>
                  </div>
                ))}
              </div>

              {/* Quote block — dark card pattern from TodaysBriefing */}
              <div
                className="relative rounded-[10px] px-5 py-5 overflow-hidden"
                style={{ background: "var(--qc-text-heading)", color: "var(--qc-text-on-dark)" }}
              >
                <div
                  className="absolute top-0 right-0 pointer-events-none"
                  style={{ width: 180, height: "100%", background: "radial-gradient(circle at top right, rgba(255,255,255,0.06), transparent 70%)" }}
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-2 relative"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {brief.situation.quoteDate}
                </p>
                <p
                  className="text-[16px] leading-[1.55] relative"
                  style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-on-dark)" }}
                >
                  &ldquo;{brief.situation.quote}&rdquo;
                </p>
              </div>
            </BriefSection>

            {/* 2. Recommendation */}
            <BriefSection num={2} title="What to recommend">
              {/* Rec block */}
              <div
                className="rounded-[10px] overflow-hidden mb-4"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
              >
                <div
                  className="grid items-center gap-5 px-5 py-4"
                  style={{ gridTemplateColumns: "1fr auto", borderBottom: "1px solid var(--qc-border-default)" }}
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: "var(--qc-up)" }}>{brief.recommendation.eyebrow}</p>
                    <p className="text-[18px] font-normal leading-[1.2] tracking-[-0.01em] mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}>
                      {brief.recommendation.title}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--qc-text-body)" }}>{brief.recommendation.detail}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1" style={{ color: "var(--qc-text-muted)" }}>{brief.recommendation.amountLabel}</p>
                    <p className="text-[24px] font-normal leading-none tracking-[-0.01em]" style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}>
                      {brief.recommendation.amount}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: "var(--qc-up)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{brief.recommendation.amountSub}</p>
                  </div>
                </div>
                {/* Why cells — 3-col divider pattern */}
                <div className="grid grid-cols-3" style={{ gap: 1, background: "var(--qc-border-default)" }}>
                  {brief.recommendation.whyCells.map((cell) => (
                    <div key={cell.label} className="px-4 py-3.5" style={{ background: "var(--qc-surface-card)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--qc-text-muted)" }}>{cell.label}</p>
                      <p className="text-[12px] leading-[1.5]" style={{ color: "var(--qc-text-heading)" }}>{cell.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </BriefSection>

            {/* 3. What to say */}
            <BriefSection num={3} title="What to say" hint="Suggested · adapt freely">
              {/* Opener — dark card */}
              <div
                className="relative rounded-[10px] px-5 py-5 mb-4 overflow-hidden"
                style={{ background: "var(--qc-text-heading)", color: "var(--qc-text-on-dark)" }}
              >
                <div
                  className="absolute top-0 right-0 pointer-events-none"
                  style={{ width: 180, height: "100%", background: "radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 70%)" }}
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-2 relative"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Opener · use verbatim or adapt
                </p>
                <p
                  className="text-[15px] leading-[1.6] relative"
                  style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-on-dark)" }}
                >
                  &ldquo;{brief.opener.text}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-3.5 relative">
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{brief.opener.footnote}</span>
                  <button
                    className="text-[11px] font-medium px-3 py-1.5 rounded-md"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--qc-text-on-dark)" }}
                  >
                    Copy text
                  </button>
                </div>
              </div>

              {/* Talking points */}
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
              >
                {brief.talkingPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="grid gap-4 px-5 py-4"
                    style={{
                      gridTemplateColumns: "22px 1fr",
                      borderBottom: i < brief.talkingPoints.length - 1 ? "1px solid var(--qc-border-default)" : "none",
                    }}
                  >
                    <div
                      className="size-[22px] rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                      style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)", border: "1px solid var(--qc-border-default)" }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--qc-text-heading)" }}>{pt.headline}</p>
                      <p className="text-[12px] leading-[1.5]" style={{ color: "var(--qc-text-body)" }}>{pt.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </BriefSection>

            {/* 4. Objections */}
            <BriefSection num={4} title="Likely objections">
              <div
                className="rounded-[10px] overflow-hidden"
                style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
              >
                {brief.objections.map((obj, i) => (
                  <div
                    key={i}
                    className="px-5 py-4"
                    style={{ borderBottom: i < brief.objections.length - 1 ? "1px solid var(--qc-border-default)" : "none" }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm flex-shrink-0 mt-0.5"
                        style={{ background: "var(--qc-warn-soft)", color: "var(--qc-warn)", fontFamily: "var(--font-ibm-plex-mono, monospace)", letterSpacing: "0.1em" }}
                      >
                        Q
                      </span>
                      <p className="text-[13px] font-medium leading-[1.4]" style={{ color: "var(--qc-text-heading)" }}>
                        {obj.q}
                      </p>
                    </div>
                    <p
                      className="text-[12px] leading-[1.55] ml-7 pl-3"
                      style={{ color: "var(--qc-text-body)", borderLeft: "2px solid var(--qc-border-default)" }}
                    >
                      {obj.a}
                    </p>
                  </div>
                ))}
              </div>
            </BriefSection>

          </div>

          {/* RIGHT COLUMN */}
          <div>

            {/* Actions card — dark card with action chips */}
            <div
              className="relative rounded-[10px] px-5 py-5 mb-4 overflow-hidden"
              style={{ background: "var(--qc-text-heading)", color: "var(--qc-text-on-dark)" }}
            >
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{ width: 220, height: "100%", background: "radial-gradient(circle at top right, rgba(255,255,255,0.05), transparent 70%)" }}
              />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1 relative" style={{ color: "rgba(255,255,255,0.45)" }}>
                Next action
              </p>
              <h3
                className="text-[17px] font-normal mb-4 relative"
                style={{ fontFamily: "var(--font-ibm-plex-sans, sans-serif)" }}
              >
                Take it from here
              </h3>
              {brief.actions.map((action, i) => (
                <ActionButton key={i} {...action} />
              ))}
            </div>

            {/* Client snapshot — same grid pattern as BookAtAGlance */}
            <div className="rounded-[10px] overflow-hidden mb-4" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>Snapshot</h2>
                <button className="text-[11px] font-medium px-3 py-1 rounded-md" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)", color: "var(--qc-text-body)" }}>Full file →</button>
              </div>
              {brief.snapshot.map((row, ri) => (
                <div
                  key={ri}
                  className="grid grid-cols-2"
                  style={{ gap: 1, background: "var(--qc-border-default)", borderBottom: ri < brief.snapshot.length - 1 ? "1px solid var(--qc-border-default)" : "none" }}
                >
                  {row.map((cell) => (
                    <div key={cell.label} className="px-4 py-3" style={{ background: "var(--qc-surface-card)" }}>
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] mb-1" style={{ color: "var(--qc-text-muted)" }}>{cell.label}</p>
                      <p
                        className="text-[18px] font-normal leading-none"
                        style={{ fontFamily: cell.mono ? "var(--font-ibm-plex-mono, monospace)" : "var(--font-ibm-plex-sans, sans-serif)", color: "var(--qc-text-heading)" }}
                      >
                        {cell.value}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{cell.sub}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Portfolio mix */}
            <div className="rounded-[10px] overflow-hidden mb-4" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>Portfolio mix</h2>
                <span
                  className="text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: brief.portfolioStatus === "on track" ? "var(--qc-up-soft)" : "var(--qc-warn-soft)",
                    color: brief.portfolioStatus === "on track" ? "var(--qc-up)" : "var(--qc-warn)",
                  }}
                >
                  {brief.portfolioStatus}
                </span>
              </div>
              <div>
                {brief.portfolio.map((row, i) => (
                  <div
                    key={i}
                    className="grid items-center px-5 py-3 text-[12px]"
                    style={{
                      gridTemplateColumns: "1fr auto auto",
                      gap: 12,
                      borderBottom: i < brief.portfolio.length - 1 ? "1px solid var(--qc-border-default)" : "none",
                    }}
                  >
                    <span style={{ color: "var(--qc-text-body)" }}>{row.label}</span>
                    <span style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)", fontWeight: 500, color: "var(--qc-text-heading)" }}>{row.value}</span>
                    <span style={{ fontFamily: "var(--font-ibm-plex-mono, monospace)", fontSize: 11, color: "var(--qc-text-muted)" }}>{row.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent conversations */}
            <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}>
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid var(--qc-border-default)" }}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>Recent conversations</h2>
                <button className="text-[11px] font-medium px-3 py-1 rounded-md" style={{ border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-panel)", color: "var(--qc-text-body)" }}>Timeline →</button>
              </div>
              {brief.conversations.map((c, i) => (
                <div
                  key={i}
                  className="grid gap-3 px-5 py-3.5"
                  style={{
                    gridTemplateColumns: "64px 1fr",
                    borderBottom: i < brief.conversations.length - 1 ? "1px solid var(--qc-border-default)" : "none",
                  }}
                >
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: "var(--qc-text-body)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{c.date}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}>{c.ago}</p>
                  </div>
                  <div>
                    <span
                      className="inline-block text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm mr-1.5 mb-1"
                      style={{ background: "var(--qc-surface-panel)", color: "var(--qc-text-muted)", border: "1px solid var(--qc-border-default)", letterSpacing: "0.04em" }}
                    >
                      {c.topic}
                    </span>
                    <span className="text-[12px] leading-[1.5]" style={{ color: "var(--qc-text-body)" }}>{c.text}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── BriefSection ──────────────────────────────────────────────────────────────

function BriefSection({ num, title, hint, children }: { num?: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--qc-text-body)" }}>
          {num !== undefined && (
            <span
              className="size-[18px] rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
              style={{ background: "var(--qc-text-heading)", color: "var(--qc-text-on-dark)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
            >
              {num}
            </span>
          )}
          {title}
        </h2>
        {hint && <span className="text-[11px]" style={{ color: "var(--qc-text-muted)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────

const ACTION_ICONS: Record<ActionIconType, React.ReactNode> = {
  meeting:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4l3 3-3 3M19 8H8M19 16l-3-3 3-3M5 13h11"/></svg>,
  file:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l4 4v12H5z"/></svg>,
  message:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6l9 7 9-7M3 6h18v12H3z"/></svg>,
  schedule: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
};

function ActionButton({ primary, icon, label, desc }: { primary: boolean; icon: ActionIconType; label: string; desc: string }) {
  return (
    <button
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-md mb-2 text-left transition-colors relative"
      style={{
        background: primary ? "var(--qc-surface-card)" : "rgba(255,255,255,0.06)",
        border: primary ? "1px solid var(--qc-surface-card)" : "1px solid rgba(255,255,255,0.1)",
        color: primary ? "var(--qc-text-heading)" : "var(--qc-text-on-dark)",
      }}
    >
      <span
        className="size-6 rounded flex items-center justify-center flex-shrink-0"
        style={{
          background: primary ? "var(--qc-surface-panel)" : "rgba(255,255,255,0.1)",
          color: primary ? "var(--qc-text-body)" : "rgba(255,255,255,0.7)",
        }}
      >
        {ACTION_ICONS[icon]}
      </span>
      <span className="flex-1">
        <span className="block text-[12px] font-semibold">{label}</span>
        <span
          className="block text-[10px] mt-0.5"
          style={{ color: primary ? "var(--qc-text-muted)" : "rgba(255,255,255,0.45)" }}
        >
          {desc}
        </span>
      </span>
      <span style={{ color: primary ? "var(--qc-text-muted)" : "rgba(255,255,255,0.35)", fontSize: 13 }}>→</span>
    </button>
  );
}
