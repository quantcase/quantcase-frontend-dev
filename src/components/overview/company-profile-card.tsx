"use client";

import { Globe, Mail, Calendar, Building2, BarChart2, Layers, Package, Users } from "lucide-react";
import type { ScreenerData } from "@/types/screener";

interface Props {
  data: ScreenerData;
}

function TagPill({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color: "var(--qc-text-muted)", display: "flex" }}>{icon}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "var(--qc-text-muted)",
          }}
        >
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--qc-text-heading)",
          lineHeight: 1.3,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function QuickFact({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "12px 14px",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "rgba(200,180,255,0.7)", display: "flex" }}>{icon}</span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {label}
        </span>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            textDecoration: "none",
            lineHeight: 1.35,
            wordBreak: "break-all",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,180,255,1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
        >
          {value}
        </a>
      ) : (
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.3,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export function CompanyProfileCard({ data }: Props) {
  const co = data.company;

  const tags = [
    co.sector && { label: "Sector", value: co.sector, icon: <BarChart2 size={11} /> },
    co.industry && { label: "Industry", value: co.industry, icon: <Layers size={11} /> },
    co.mainProduct && { label: "Main Product", value: co.mainProduct, icon: <Package size={11} /> },
    co.ownershipGroup && { label: "Group", value: co.ownershipGroup, icon: <Users size={11} /> },
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode }[];

  const quickFacts = [
    co.listingDate && {
      icon: <Calendar size={11} />,
      label: "Listed",
      value: co.listingDate,
    },
    co.incorporationYear && {
      icon: <Building2 size={11} />,
      label: "Incorporated",
      value: String(co.incorporationYear),
    },
    co.website && {
      icon: <Globe size={11} />,
      label: "Website",
      value: co.website.replace(/^https?:\/\//, ""),
      href: co.website.startsWith("http") ? co.website : `https://${co.website}`,
    },
    co.email && {
      icon: <Mail size={11} />,
      label: "IR Email",
      value: co.email,
      href: `mailto:${co.email}`,
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
  }[];

  if (!co.description && tags.length === 0 && quickFacts.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 300px",
        gap: 14,
        padding: "0 16px 4px",
      }}
    >
      {/* LEFT: description + classification tags */}
      <section
        style={{
          background: "var(--qc-surface-white)",
          border: "1px solid var(--qc-border-default)",
          borderRadius: 16,
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "var(--qc-text-muted)",
            textTransform: "uppercase",
          }}
        >
          About
        </span>

        {co.description && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: "var(--qc-text-body)",
              margin: 0,
            }}
          >
            {co.description}
          </p>
        )}

        {tags.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tags.length}, 1fr)`,
              gap: "14px 0",
              paddingTop: 12,
              borderTop: "1px solid var(--qc-border-inner)",
            }}
          >
            {tags.map((t, i) => (
              <div
                key={t.label}
                style={{
                  paddingLeft: i === 0 ? 0 : 20,
                  borderLeft: i === 0 ? "none" : "1px solid var(--qc-border-inner)",
                }}
              >
                <TagPill label={t.label} value={t.value} icon={t.icon} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RIGHT: quick facts — purple gradient card */}
      {quickFacts.length > 0 && (
        <aside
          style={{
            background: "linear-gradient(160deg, #2d1b5e 0%, #18103a 55%, #0e0920 100%)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: 16,
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* glow orb top-right */}
          <div
            style={{
              position: "absolute",
              top: -50,
              right: -30,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          {/* glow orb bottom-left */}
          <div
            style={{
              position: "absolute",
              bottom: -40,
              left: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,60,200,0.15) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            Company Facts
          </span>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              flex: 1,
            }}
          >
            {quickFacts.map((f) => (
              <QuickFact
                key={f.label}
                icon={f.icon}
                label={f.label}
                value={f.value}
                href={f.href}
              />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
