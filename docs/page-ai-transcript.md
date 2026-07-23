# AI Transcript — Analysis Flow Spec

[← Back to docs hub](README.md) · related: [Async jobs](async-jobs.md) · [Pipeline & layers](pipeline-layers.md)

> [!NOTE]
> A flow spec for the AI transcript-analysis experience (the `/summary` + `/transcript` surfaces). The
> trigger→poll→animate mechanics are documented in [Async job pipeline](async-jobs.md).

Build a Next.js page route for /ai-transcript:

User selects an earnings call transcript from a dropdown

Clicks Summarize

Dashboard renders structured AI insights:
Guidance Accuracy
Disclosure Honesty
Capital Allocation
Governance Signals
Consistency Analysis
Promises vs Actuals Table

The dashboard is generated after summarizing an earnings call using:

- Transcript Text
- PPT Text
- Quarterly Result Text

Each widget is populated from extracted entities, promises, milestones, disclosures, and metrics.