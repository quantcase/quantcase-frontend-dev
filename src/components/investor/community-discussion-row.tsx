"use client";

import Link from "next/link";

export interface CommunityThread {
  kind: "community";
  label: string;
  liveTag?: boolean;
  titleHtml: string;
  body: string;
  stats: { value: string | number; label: string }[];
  cta: string;
  href: string;
}

export interface IpoDiscussion {
  kind: "ipo";
  label: string;
  opensTag: string;
  titleHtml: string;
  body: string;
  stats: { value: string | number; label: string }[];
  cta: string;
  href: string;
}

interface CommunityDiscussionRowProps {
  thread: CommunityThread;
  ipo: IpoDiscussion;
}

function DiscussionCard({
  item,
}: {
  item: CommunityThread | IpoDiscussion;
}) {
  const isIpo = item.kind === "ipo";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E2E2",
        borderRadius: 14,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        flex: 1,
      }}
    >
      {/* Top meta row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#aaa",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {item.label}
        </span>
        {!isIpo && (item as CommunityThread).liveTag && (
          <span style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            LIVE
          </span>
        )}
        {isIpo && (
          <span style={{ fontSize: 11, fontWeight: 500, color: "#888" }}>
            OPENS {(item as IpoDiscussion).opensTag}
          </span>
        )}
      </div>

      {/* Title */}
      <div
        style={{ fontSize: 22, fontWeight: 400, color: "#0F172B", lineHeight: 1.25, marginBottom: 10, fontFamily: "Georgia, serif" }}
        dangerouslySetInnerHTML={{ __html: item.titleHtml }}
      />

      {/* Body */}
      <p style={{ fontSize: 13, color: "#888", lineHeight: 1.55, margin: "0 0 18px" }}>
        {item.body}
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "#F0F0F0", marginBottom: 14 }} />

      {/* Footer: stats + CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {item.stats.map((s) => (
            <span key={s.label} style={{ fontSize: 12, color: "#555" }}>
              <span style={{ fontWeight: 700 }}>{s.value}</span>
              <span style={{ color: "#aaa", marginLeft: 4 }}>{s.label}</span>
            </span>
          ))}
        </div>
        <Link
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#0F172B",
            background: "#fff",
            border: "1px solid #E2E2E2",
            borderRadius: 8,
            padding: "6px 14px",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {item.cta}
        </Link>
      </div>
    </div>
  );
}

export function CommunityDiscussionRow({ thread, ipo }: CommunityDiscussionRowProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <DiscussionCard item={thread} />
      <DiscussionCard item={ipo} />
    </div>
  );
}
