"use client";

import { User, Bell, Shield, Building2, Palette, Key, CreditCard } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Link as LinkIcon } from "lucide-react";
import { useSmallcaseStatus } from "@/hooks/useSmallcaseStatus";
import { useSmallcaseConnect } from "@/hooks/useSmallcaseConnect";
import { useSubscription } from "@/hooks/useSubscription";
import { apiAuthPost } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { useState } from "react";

interface SettingRow {
  label: string;
  description: string;
  value?: string;
  placeholder?: string;
}

interface SettingSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  rows: SettingRow[];
  /** span both columns */
  wide?: boolean;
}

const SECTIONS: SettingSection[] = [
  {
    id: "profile",
    title: "Profile",
    subtitle: "Your personal account details",
    icon: User,
    rows: [
      { label: "Full Name", description: "Your display name across the platform", value: "Alex Morgan", placeholder: "Enter full name" },
      { label: "Email", description: "Primary contact and login email", value: "alex.morgan@firm.com", placeholder: "Enter email" },
      { label: "Role", description: "Your designation within the organisation", value: "Relationship Manager", placeholder: "Enter role" },
    ],
  },
  {
    id: "organisation",
    title: "Organisation",
    subtitle: "Firm-level configuration",
    icon: Building2,
    rows: [
      { label: "Firm Name", description: "Legal entity name shown on reports", value: "QuantCase FinTech", placeholder: "Enter firm name" },
      { label: "Region", description: "Primary market jurisdiction", value: "India — NSE / BSE", placeholder: "Enter region" },
      { label: "Currency", description: "Default display currency", value: "INR", placeholder: "Enter currency" },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Control how and when you receive alerts",
    icon: Bell,
    rows: [
      { label: "Email Alerts", description: "Receive analysis completion notifications via email" },
      { label: "In-app Alerts", description: "Show badge counts and toasts within the platform" },
      { label: "Priority Client Digest", description: "Daily morning summary of high-priority client actions" },
    ],
  },
  {
    id: "security",
    title: "Security",
    subtitle: "Authentication and access control",
    icon: Shield,
    rows: [
      { label: "Password", description: "Change your account password", placeholder: "••••••••" },
      { label: "Two-factor Authentication", description: "Add an extra layer of login security" },
      { label: "Active Sessions", description: "View and revoke devices signed in to your account" },
    ],
  },
  {
    id: "api",
    title: "API Access",
    subtitle: "Manage keys for programmatic access",
    icon: Key,
    wide: true,
    rows: [
      { label: "API Key", description: "Use this key to authenticate requests to the QuantCase API", placeholder: "sk-••••••••••••••••" },
      { label: "Webhook URL", description: "Receive real-time event payloads at this endpoint", placeholder: "https://your-server.com/webhook" },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    subtitle: "Visual preferences",
    icon: Palette,
    rows: [
      { label: "Theme", description: "Light or dark interface mode" },
      { label: "Density", description: "Compact or comfortable spacing for tables and lists" },
    ],
  },
];

function SettingRowItem({ row, wide }: { row: SettingRow; wide?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-hair last:border-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-ink">{row.label}</span>
        <span className="text-xs text-ink-3">{row.description}</span>
      </div>
      <div>
        {row.value !== undefined || row.placeholder ? (
          <input
            type="text"
            defaultValue={row.value ?? ""}
            placeholder={row.placeholder}
            disabled
            className={`rounded-md border border-hair bg-secondary px-3 py-1.5 text-sm text-ink placeholder:text-ink-3 disabled:cursor-not-allowed focus:outline-none ${wide ? "w-full" : "w-full max-w-xs"}`}
          />
        ) : (
          <span className="text-xs font-medium text-ink-3 uppercase tracking-wide bg-secondary border border-hair rounded-sm px-2 py-1">
            Coming soon
          </span>
        )}
      </div>
    </div>
  );
}

function BrokerIntegrationSection() {
  const { status, loading, refetch } = useSmallcaseStatus();
  const { connect, step, error } = useSmallcaseConnect({
    onConnected: () => {
      refetch();
    }
  });

  const handleDisconnect = () => {
    apiAuthPost(
      `${BACKEND_URL}/api/smallcase/disconnect`,
      {
        onSuccess: () => refetch(),
        onError: (err) => alert("Failed to disconnect: " + err)
      },
      {}
    );
  };

  return (
    <SectionPanel
      title={
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] p-1">
            <LinkIcon className="size-4 text-ink-3" />
          </span>
          Broker Integration
        </span>
      }
      subtitle="Connect your brokerage account to import holdings securely"
    >
      <div className="py-4">
        {loading ? (
          <div className="text-sm text-ink-3">Loading status...</div>
        ) : status?.isConnected ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-ink">Connected to {status.broker || "Broker"}</div>
              <div className="text-xs text-ink-3 mt-0.5">Your holdings are synced.</div>
            </div>
            <button 
              onClick={handleDisconnect}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md border border-red-200 hover:bg-red-100 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-ink">Not Connected</div>
              <div className="text-xs text-ink-3 mt-0.5">Connect via smallcase to enable holdings tracking.</div>
              {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
            </div>
            <button 
              onClick={() => connect()}
              disabled={step === "creating" || step === "confirming"}
              className="px-3 py-1.5 text-xs font-medium text-ink bg-secondary rounded-md border border-hair hover:bg-[rgba(18,18,18,0.05)] transition-colors disabled:opacity-50"
            >
              {step === "creating" || step === "confirming" ? "Connecting..." : "Connect Broker"}
            </button>
          </div>
        )}
      </div>
    </SectionPanel>
  );
}

function SubscriptionSection() {
  const { data: sub, loading, refetch } = useSubscription();
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You will retain access until the end of the current billing cycle.")) return;
    
    setCancelling(true);
    apiAuthPost(
      `${BACKEND_URL}/api/billing/subscription/cancel`,
      {
        onSuccess: () => {
          alert("Subscription cancelled successfully.");
          refetch();
          setCancelling(false);
        },
        onError: (err: any) => {
          alert("Failed to cancel subscription: " + (err.message || err));
          setCancelling(false);
        }
      },
      {}
    );
  };

  if (loading) {
    return (
      <SectionPanel
        title={<span className="flex items-center gap-2"><span className="inline-flex items-center justify-center rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] p-1"><CreditCard className="size-4 text-ink-3" /></span> Subscription</span>}
        subtitle="Manage your billing and active plan"
      >
        <div className="py-4 text-sm text-ink-3">Loading subscription details...</div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel
      title={
        <span className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] p-1">
            <CreditCard className="size-4 text-ink-3" />
          </span>
          Subscription
        </span>
      }
      subtitle="Manage your billing and active plan"
    >
      <div className="py-4">
        {sub && sub.status && sub.status !== 'expired' && sub.status !== 'cancelled' ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-ink capitalize">{sub.plan_type} Plan ({sub.status})</div>
              <div className="text-xs text-ink-3 mt-0.5">
                {sub.cancelled_at 
                  ? `Cancels at the end of the cycle (${sub.days_remaining} days remaining).`
                  : `${sub.days_remaining} days remaining in current billing cycle.`}
              </div>
            </div>
            {!sub.cancelled_at && (
              <button 
                onClick={handleCancel}
                disabled={cancelling}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm text-ink-3">
            No active subscription found. Please subscribe to access premium features.
          </div>
        )}
      </div>
    </SectionPanel>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      {/* Page header */}
      <div>
        <h2 className="text-[22px] font-medium text-ink">Settings</h2>
        <p className="text-sm text-ink-3 mt-1">Manage your account, organisation, and platform preferences.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <div className="xl:col-span-2"><BrokerIntegrationSection /></div>
        <div className="xl:col-span-2"><SubscriptionSection /></div>
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className={section.wide ? "xl:col-span-2" : ""}>
              <SectionPanel
                title={
                  <span className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-[6px] border border-[rgba(18,18,18,0.10)] bg-[rgba(18,18,18,0.03)] p-1">
                      <Icon className="size-4 text-ink-3" />
                    </span>
                    {section.title}
                  </span>
                }
                subtitle={section.subtitle}
              >
                <div className={section.wide ? "grid grid-cols-2 gap-x-8" : ""}>
                  {section.rows.map((row) => (
                    <SettingRowItem key={row.label} row={row} wide={section.wide} />
                  ))}
                </div>
              </SectionPanel>
            </div>
          );
        })}
      </div>
    </div>
  );
}
