"use client";

import { useState } from "react";
import { Layers, Activity } from "lucide-react";
import { RailRow } from "./RailRow";
import { PostHtmlDispatchPanel } from "./PostHtmlDispatchPanel";
import { TechnicalsBulkPanel } from "./TechnicalsBulkPanel";

type DispatchFlow = "posthtml" | "technicals";

/**
 * DispatchPanel — the Dispatch page. A left rail (mirroring ConfigsPanel) to pick
 * a dispatch flow, with the flow's form + results in the work pane on the right.
 */
export function DispatchPanel() {
  const [flow, setFlow] = useState<DispatchFlow>("posthtml");

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[480px] rounded-[10px] border border-hair bg-card overflow-hidden">
      {/* Flow rail */}
      <div className="w-[220px] shrink-0 border-r border-hair overflow-y-auto">
        <RailRow
          active={flow === "posthtml"}
          onClick={() => setFlow("posthtml")}
          marker={<Layers className="size-3.5 shrink-0 text-ink-3" />}
          name="Post-HTML"
          sublabel="l3 / l4"
        />
        <RailRow
          active={flow === "technicals"}
          onClick={() => setFlow("technicals")}
          marker={<Activity className="size-3.5 shrink-0 text-ink-3" />}
          name="Technicals"
          sublabel="bulk analysis"
        />
      </div>

      {/* Work pane */}
      <div className="flex-1 overflow-hidden">
        {flow === "posthtml" ? <PostHtmlDispatchPanel /> : <TechnicalsBulkPanel />}
      </div>
    </div>
  );
}
