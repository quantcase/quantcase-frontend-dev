"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { useWealthRMList } from "@/hooks/useWealthRM";
import type { WealthClient, Segment, RiskProfile, ClientStatus, KycStatus, ClientSource } from "@/types/wealthos";

const SEGMENTS: Segment[] = ["HNI", "UHNI", "Retail", "Institutional", "Private"];
const RISK_PROFILES: RiskProfile[] = ["conservative", "moderate", "aggressive"];
const LIFECYCLE_STATUSES: { label: string; value: ClientStatus }[] = [
  { label: "Prospect", value: "prospect" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Active", value: "active" },
  { label: "Dormant", value: "dormant" },
  { label: "Churned", value: "churned" },
];
const KYC_STATUSES: { label: string; value: KycStatus }[] = [
  { label: "Not Started", value: "not_started" },
  { label: "Pending", value: "pending" },
  { label: "Complete", value: "complete" },
  { label: "Expired", value: "expired" },
];
const SOURCES: { label: string; value: ClientSource }[] = [
  { label: "Referral", value: "referral" },
  { label: "Walk-in", value: "walk_in" },
  { label: "Digital", value: "digital" },
  { label: "Inherited", value: "inherited" },
  { label: "Cold Outreach", value: "cold_outreach" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 6,
  border: "1px solid var(--qc-hair)",
  background: "var(--qc-card)",
  color: "var(--qc-ink)",
  fontSize: 13,
  padding: "7px 12px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 500,
  color: "var(--qc-ink-2)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontFamily: "var(--font-ibm-plex-mono, monospace)",
};

export function CreateClientForm() {
  const router = useRouter();
  const { data: rms } = useWealthRMList();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [rmProfileId, setRmProfileId] = useState("");
  const [aumCr, setAumCr] = useState("");
  const [segment, setSegment] = useState<Segment>("HNI");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("moderate");
  const [lifecycleStatus, setLifecycleStatus] = useState<ClientStatus>("prospect");
  const [kycStatus, setKycStatus] = useState<KycStatus>("not_started");
  const [source, setSource] = useState<ClientSource | "">("");
  const [tagsInput, setTagsInput] = useState("");
  const [engagementScore, setEngagementScore] = useState("60");
  const [churnProbability, setChurnProbability] = useState("0.1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const body: Record<string, unknown> = {
      name: name.trim(),
      segment,
      risk_profile: riskProfile,
      lifecycle_status: lifecycleStatus,
      kyc_status: kycStatus,
      aum_cr: aumCr ? parseFloat(aumCr) : 0,
      engagement_score: engagementScore ? Number(engagementScore) : 60,
      churn_probability: churnProbability ? Number(churnProbability) : 0.1,
    };

    if (email.trim()) body.email = email.trim();
    if (phone.trim()) body.phone = phone.trim();
    if (city.trim()) body.city = city.trim();
    if (panNumber.trim()) body.pan_number = panNumber.trim().toUpperCase();
    if (dateOfBirth) body.date_of_birth = dateOfBirth;
    if (rmProfileId) body.rm_profile_id = rmProfileId;
    if (source) body.source = source;

    if (tagsInput.trim()) {
      body.tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    apiPost<{ data: WealthClient }>(
      `${BACKEND_URL}/api/wealthos/clients`,
      {
        onStart: () => setLoading(true),
        onSuccess: (response) => {
          setLoading(false);
          router.push(`/wealthos/clients/${response.data.id}`);
        },
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
      },
      body
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xs font-mono font-medium uppercase tracking-wider mb-3" style={{ color: "var(--qc-ink-3)" }}>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Rajan Mehta"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rajan@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91-9876543210"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>PAN Number</label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              placeholder="ABCDE1234F"
              maxLength={10}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t" style={{ borderColor: "var(--qc-hair)" }}>
        <h3 className="text-xs font-mono font-medium uppercase tracking-wider mb-3" style={{ color: "var(--qc-ink-3)" }}>
          Wealth Profile & Assignment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Relationship Manager</label>
            <select
              value={rmProfileId}
              onChange={(e) => setRmProfileId(e.target.value)}
              style={inputStyle}
            >
              <option value="">— Select RM Profile —</option>
              {rms.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.display_name || rm.name} {rm.team ? `(${rm.team})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Initial AUM (₹ Cr)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={aumCr}
              onChange={(e) => setAumCr(e.target.value)}
              placeholder="e.g. 25.5"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Segment *</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as Segment)}
              required
              style={inputStyle}
            >
              {SEGMENTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Risk Profile *</label>
            <select
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value as RiskProfile)}
              required
              style={inputStyle}
            >
              {RISK_PROFILES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Lifecycle Status *</label>
            <select
              value={lifecycleStatus}
              onChange={(e) => setLifecycleStatus(e.target.value as ClientStatus)}
              required
              style={inputStyle}
            >
              {LIFECYCLE_STATUSES.map((ls) => (
                <option key={ls.value} value={ls.value}>
                  {ls.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>KYC Status *</label>
            <select
              value={kycStatus}
              onChange={(e) => setKycStatus(e.target.value as KycStatus)}
              required
              style={inputStyle}
            >
              {KYC_STATUSES.map((ks) => (
                <option key={ks.value} value={ks.value}>
                  {ks.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Client Acquisition Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as ClientSource)}
              style={inputStyle}
            >
              <option value="">— Unspecified —</option>
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. founder, tech, pre_ipo"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Initial Engagement Score (0–100)</label>
            <input
              type="number"
              value={engagementScore}
              onChange={(e) => setEngagementScore(e.target.value)}
              min={0}
              max={100}
              placeholder="e.g. 60"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Initial Churn Probability (0–1)</label>
            <input
              type="number"
              value={churnProbability}
              onChange={(e) => setChurnProbability(e.target.value)}
              min={0}
              max={1}
              step={0.01}
              placeholder="e.g. 0.1"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {error && (
        <div
          className="p-3 rounded-md text-xs font-mono"
          style={{ background: "rgba(220, 38, 38, 0.1)", color: "var(--qc-down)", border: "1px solid var(--qc-down)" }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Client..." : "Create Client"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
