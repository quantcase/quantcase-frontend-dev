import { Plus } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Skill, Plugin } from "./types";
import { SkillChainRow } from "./SkillChainRow";

interface Props {
  selectedPlugin: Plugin | null;
  chain: Skill[];
  availableToAdd: Skill[];
  loading: boolean;
  addSkillId: string;
  onAddSkillIdChange: (id: string) => void;
  onAddSkill: () => void;
  onMoveSkill: (index: number, dir: "up" | "down") => void;
  onRemoveSkill: (skillId: string) => void;
}

export function PluginChainTab({
  selectedPlugin,
  chain,
  availableToAdd,
  loading,
  addSkillId,
  onAddSkillIdChange,
  onAddSkill,
  onMoveSkill,
  onRemoveSkill,
}: Props) {
  return (
    <SectionPanel
      title={
        selectedPlugin ? (
          <div>
            <span className="text-[14px] font-semibold text-[#0F172B] uppercase tracking-[0.01em] capitalize">
              {selectedPlugin.name}
            </span>
            {selectedPlugin.description && (
              <p className="text-[13px] text-[#888888] font-normal mt-0.5 normal-case tracking-normal">
                {selectedPlugin.description}
              </p>
            )}
          </div>
        ) : (
          "Select a plugin"
        )
      }
    >
      {!selectedPlugin ? (
        <p className="text-sm text-[#888888]">Select a plugin from the sidebar.</p>
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-md bg-[#F5F5F5] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {chain.length === 0 ? (
            <p className="text-sm text-[#888888]">No skills in this plugin&apos;s chain yet.</p>
          ) : (
            <div className="space-y-2">
              {chain.map((skill, idx) => (
                <SkillChainRow
                  key={skill.id}
                  skill={skill}
                  index={idx}
                  total={chain.length}
                  onMoveUp={() => onMoveSkill(idx, "up")}
                  onMoveDown={() => onMoveSkill(idx, "down")}
                  onRemove={() => onRemoveSkill(skill.id)}
                />
              ))}
            </div>
          )}

          {availableToAdd.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-[#E2E2E2]">
              <select
                value={addSkillId}
                onChange={(e) => onAddSkillIdChange(e.target.value)}
                className="flex-1 rounded-md border border-[#E2E2E2] bg-white px-3 py-2 text-sm text-[#0F172B] focus:outline-none focus:border-[#0F172B]"
              >
                <option value="">Select skill to add…</option>
                {availableToAdd.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onAddSkill}
                disabled={!addSkillId}
                className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              >
                <Plus className="size-3.5" />
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </SectionPanel>
  );
}
