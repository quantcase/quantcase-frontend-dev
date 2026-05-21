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

function DiscussionCard({ item }: { item: CommunityThread | IpoDiscussion }) {
  const isIpo = item.kind === "ipo";
  const isCommunity = !isIpo;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E2E2",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          height: 3,
          background: isCommunity
            ? "linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)"
            : "linear-gradient(90deg, #0F172B 0%, #475569 100%)",
        }}
      />

      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Top meta row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#aaa",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </span>
          {isCommunity && (item as CommunityThread).liveTag && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 20,
                padding: "3px 8px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                letterSpacing: "0.06em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                  animation: "pulse 1.5s infinite",
                }}
              />
              LIVE
            </span>
          )}
          {isIpo && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#0F172B",
                background: "#F5F5F5",
                border: "1px solid #E2E2E2",
                borderRadius: 20,
                padding: "3px 10px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              OPENS {(item as IpoDiscussion).opensTag}
            </span>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 21,
            fontWeight: 400,
            color: "#0F172B",
            lineHeight: 1.3,
            marginBottom: 12,
            fontFamily: "Georgia, serif",
            letterSpacing: "-0.01em",
          }}
          dangerouslySetInnerHTML={{ __html: item.titleHtml }}
        />

        {/* Body */}
        <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>
          {item.body}
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 18,
            background: "#F8F8F8",
            borderRadius: 8,
            border: "1px solid #EFEFEF",
            overflow: "hidden",
          }}
        >
          {item.stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRight: i < item.stats.length - 1 ? "1px solid #EFEFEF" : "none",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172B", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 3, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={item.href}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: isCommunity ? "#7c3aed" : "#0F172B",
            background: isCommunity ? "#f5f3ff" : "#F5F5F5",
            border: `1px solid ${isCommunity ? "#ddd6fe" : "#E2E2E2"}`,
            borderRadius: 8,
            padding: "9px 18px",
            textDecoration: "none",
            display: "block",
            textAlign: "center",
            letterSpacing: "0.02em",
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
