import { Plus, X } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Skill } from "./types";

interface Props {
  skills: Skill[];
  loading: boolean;
  onRowClick: (skill: Skill) => void;
  onToggleActive: (skill: Skill) => void;
  onDelete: (skillId: string) => void;
  onNewSkillFormOpen: () => void;
}

const TABLE_HEADERS = ["Name", "Description", "Model", "Max Tokens", "Prompt Key", "Active", ""];

export function SkillsLibraryTab({
  skills,
  loading,
  onRowClick,
  onToggleActive,
  onDelete,
  onNewSkillFormOpen,
}: Props) {
  return (
    <SectionPanel
      title="Skills Library"
      headerAction={
        <button
          onClick={onNewSkillFormOpen}
          className="flex items-center gap-1.5 rounded-md bg-[#0F172B] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="size-3.5" />
          New Skill
        </button>
      }
    >
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-md bg-[#F5F5F5] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E2E2]">
                {TABLE_HEADERS.map((h, i) => (
                  <th
                    key={i}
                    className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-[#888888] px-3 first:pl-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2E2]">
              {skills.map((skill) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  onClick={() => onRowClick(skill)}
                  onToggleActive={() => onToggleActive(skill)}
                  onDelete={() => onDelete(skill.id)}
                />
              ))}
            </tbody>
          </table>

          {skills.length === 0 && (
            <p className="mt-4 text-center text-sm text-[#888888]">No skills found. Create the first one.</p>
          )}
        </div>
      )}
    </SectionPanel>
  );
}

// ── SkillRow ───────────────────────────────────────────────────────────────────

interface SkillRowProps {
  skill: Skill;
  onClick: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

function SkillRow({ skill, onClick, onToggleActive, onDelete }: SkillRowProps) {
  return (
    <tr
      className="group cursor-pointer hover:bg-[#FAFAFA] transition-colors"
      onClick={onClick}
    >
      <td className="py-3 px-3 pl-0 font-medium text-[#0F172B]">{skill.name}</td>

      <td className="py-3 px-3 max-w-[200px]">
        <span className="text-[11px] text-[#888888] line-clamp-1">
          {skill.description ?? <span className="italic opacity-50">—</span>}
        </span>
      </td>

      <td className="py-3 px-3">
        <span className="rounded-sm bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-mono text-[#888888]">
          {skill.model}
        </span>
      </td>

      <td className="py-3 px-3">
        <span className="text-[#888888]">{skill.maxTokens.toLocaleString()}</span>
      </td>

      <td className="py-3 px-3">
        <span className="font-mono text-[11px] text-[#888888]">{skill.promptKey}</span>
      </td>

      <td className="py-3 px-3">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-colors ${
            skill.isActive
              ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
              : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2] hover:bg-gray-100"
          }`}
        >
          {skill.isActive ? "Active" : "Inactive"}
        </button>
      </td>

      <td className="py-3 px-3">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
          className="flex size-7 items-center justify-center rounded border border-transparent text-transparent group-hover:border-[#E2E2E2] group-hover:text-[#888888] hover:!text-red-600 hover:!border-red-300 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </td>
    </tr>
  );
}
