"use client";

import { useState, Suspense } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { useWealthClientAnalytics } from "@/hooks/useWealthAnalytics";
import { useWealthRMAnalytics } from "@/hooks/useWealthAnalytics";
import { useWealthRMList } from "@/hooks/useWealthRM";
import { MetricTile } from "@/components/molecules/metric-tile";
import { SectionPanel } from "@/components/molecules/section-panel";
import { TabToggle } from "@/components/molecules/tab-toggle";
import { Users, TrendingUp, BarChart2, Activity, MessageSquare } from "lucide-react";

// Design system: primary series = dark heading, secondary = muted. Pie uses dark+muted alternating.
const CHART_COLORS = ["#0E0E0C", "#9A9A92", "#5A5A54", "#C8C8C0", "#333330", "#E0DFD8"];

function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState("Client Segmentation");
  const [selectedRmId, setSelectedRmId] = useState("");

  const { data: clientAnalytics, loading: clientLoading } = useWealthClientAnalytics();
  const { data: rms } = useWealthRMList();
  const { data: rmAnalytics, loading: rmLoading } = useWealthRMAnalytics(selectedRmId);

  return (
    <div className="p-6 space-y-5" style={{ background: "var(--qc-surface-base)", minHeight: "100vh" }}>
      <TabToggle
        options={["Client Segmentation", "RM Performance"]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "Client Segmentation" && (
        <div className="space-y-5">
          {clientLoading && (
            <p className="py-8 text-center" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>
              Loading analytics...
            </p>
          )}

          {clientAnalytics && (
            <>
              {/* Segment Bar Chart */}
              <SectionPanel title="Client Segmentation" subtitle="By segment — engagement and churn" contentClassName="px-6 pb-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientAnalytics.by_segment ?? []} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                      <XAxis dataKey="segment" tick={{ fontSize: 10, fill: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--qc-text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }}
                        itemStyle={{ padding: "0px 10px", color: "var(--qc-text-body)" }}
                        formatter={(value: number, name: string) => [
                          name === "avg_churn" ? `${(value * 100).toFixed(1)}%` : value.toFixed(1),
                          name === "avg_engagement" ? "Avg Engagement" : "Avg Churn %"
                        ]}
                      />
                      <Legend formatter={(value) => value === "avg_engagement" ? "Avg Engagement" : "Avg Churn"} wrapperStyle={{ fontSize: 11, color: "var(--qc-text-muted)" }} />
                      <Bar dataKey="avg_engagement" fill="var(--qc-text-heading)" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="avg_churn" fill="var(--qc-text-muted)" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionPanel>

              {/* Interaction Types Pie Chart */}
              <SectionPanel title="Interaction Channels" subtitle="Distribution by channel type" contentClassName="px-6 pb-6">
                <div className="flex items-center gap-8">
                  <div className="h-56 w-56 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientAnalytics.by_interaction_type ?? []}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                        >
                          {(clientAnalytics.by_interaction_type ?? []).map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--qc-border-default)", background: "var(--qc-surface-card)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {(clientAnalytics.by_interaction_type ?? []).map((item, i) => (
                      <div key={item.type} className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full shrink-0"
                          style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="capitalize" style={{ fontSize: 13, color: "var(--qc-text-body)" }}>
                          {item.type}
                        </span>
                        <span
                          className="ml-auto pl-4"
                          style={{ fontSize: 13, fontWeight: 600, color: "var(--qc-text-heading)", fontFamily: "var(--font-ibm-plex-mono, monospace)" }}
                        >
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionPanel>
            </>
          )}
        </div>
      )}

      {activeTab === "RM Performance" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--qc-text-muted)" }}>Select RM:</label>
            <select
              value={selectedRmId}
              onChange={e => setSelectedRmId(e.target.value)}
              style={{
                borderRadius: 6,
                border: "1px solid var(--qc-border-default)",
                background: "var(--qc-surface-card)",
                color: "var(--qc-text-heading)",
                fontSize: 13,
                padding: "5px 10px",
                outline: "none",
              }}
            >
              <option value="">— Select an RM —</option>
              {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
            </select>
          </div>

          {!selectedRmId && (
            <p className="py-8 text-center" style={{ fontSize: 13, color: "var(--qc-text-muted)" }}>
              Select an RM to view their performance metrics
            </p>
          )}

          {selectedRmId && rmLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="h-20 rounded-lg animate-pulse"
                  style={{ background: "var(--qc-surface-panel)", border: "1px solid var(--qc-border-default)" }}
                />
              ))}
            </div>
          )}

          {rmAnalytics && !rmLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricTile label="Total Clients" value={String(rmAnalytics.total_clients)} icon={Users} />
              <MetricTile label="Avg Engagement" value={rmAnalytics.avg_engagement_score.toFixed(1)} icon={Activity} />
              <MetricTile label="Avg Churn Prob" value={`${(rmAnalytics.avg_churn_probability * 100).toFixed(0)}%`} icon={TrendingUp} />
              <MetricTile label="Interactions (30d)" value={String(rmAnalytics.interactions_last_30d)} icon={MessageSquare} />
              <MetricTile label="Suggestion Adoption" value={`${(rmAnalytics.suggestion_adoption_rate * 100).toFixed(0)}%`} icon={BarChart2} />
              <MetricTile label="Avg Portfolio Risk" value={rmAnalytics.avg_portfolio_risk_score.toFixed(1)} icon={BarChart2} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WealthOSAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "var(--qc-text-muted)" }}>Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
