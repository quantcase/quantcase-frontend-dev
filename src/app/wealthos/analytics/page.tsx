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

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState("Client Segmentation");
  const [selectedRmId, setSelectedRmId] = useState("");

  const { data: clientAnalytics, loading: clientLoading } = useWealthClientAnalytics();
  const { data: rms } = useWealthRMList();
  const { data: rmAnalytics, loading: rmLoading } = useWealthRMAnalytics(selectedRmId);

  return (
    <div className="p-6 space-y-5">
      <TabToggle
        options={["Client Segmentation", "RM Performance"]}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "Client Segmentation" && (
        <div className="space-y-5">
          {clientLoading && <p className="text-sm text-zinc-400 py-8 text-center">Loading analytics...</p>}

          {clientAnalytics && (
            <>
              {/* Segment Bar Chart */}
              <SectionPanel title="Client Segmentation" subtitle="By segment — engagement and churn" contentClassName="px-6 pb-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clientAnalytics.by_segment ?? []} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                      <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        itemStyle={{ padding: '0px 10px' }}
                        formatter={(value: number, name: string) => [
                          name === "avg_churn" ? `${(value * 100).toFixed(1)}%` : value.toFixed(1),
                          name === "avg_engagement" ? "Avg Engagement" : "Avg Churn %"
                        ]}
                      />
                      <Legend formatter={(value) => value === "avg_engagement" ? "Avg Engagement" : "Avg Churn"} />
                      <Bar dataKey="avg_engagement" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="avg_churn" fill="#ef4444" radius={[3, 3, 0, 0]} />
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
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {(clientAnalytics.by_interaction_type ?? []).map((item, i) => (
                      <div key={item.type} className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{item.type}</span>
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 ml-auto pl-4">{item.count}</span>
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
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Select RM:</label>
            <select
              value={selectedRmId}
              onChange={e => setSelectedRmId(e.target.value)}
              className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">— Select an RM —</option>
              {rms.map(rm => <option key={rm.id} value={rm.id}>{rm.name}</option>)}
            </select>
          </div>

          {!selectedRmId && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 py-8 text-center">Select an RM to view their performance metrics</p>
          )}

          {selectedRmId && rmLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          )}

          {rmAnalytics && !rmLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetricTile label="Total Clients" value={String(rmAnalytics.total_clients)} icon={Users} iconColor="text-blue-500" />
              <MetricTile label="Avg Engagement" value={rmAnalytics.avg_engagement_score.toFixed(1)} icon={Activity} iconColor="text-green-500" />
              <MetricTile label="Avg Churn Prob" value={`${(rmAnalytics.avg_churn_probability * 100).toFixed(0)}%`} icon={TrendingUp} iconColor="text-red-500" />
              <MetricTile label="Interactions (30d)" value={String(rmAnalytics.interactions_last_30d)} icon={MessageSquare} iconColor="text-purple-500" />
              <MetricTile label="Suggestion Adoption" value={`${(rmAnalytics.suggestion_adoption_rate * 100).toFixed(0)}%`} icon={BarChart2} iconColor="text-amber-500" />
              <MetricTile label="Avg Portfolio Risk" value={rmAnalytics.avg_portfolio_risk_score.toFixed(1)} icon={BarChart2} iconColor="text-zinc-500" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WealthOSAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-400">Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
