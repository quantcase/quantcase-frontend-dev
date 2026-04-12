import { ChevronUp, ChevronDown, X } from "lucide-react";
import { Skill } from "./types";

interface Props {
  skill: Skill;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function SkillChainRow({ skill, index, total, onMoveUp, onMoveDown, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[#E2E2E2] bg-white px-4 py-3">
      {/* Index badge */}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[11px] font-semibold text-[#888888]">
        {index + 1}
      </span>

      {/* Skill info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#0F172B] truncate">{skill.name}</p>
        <p className="text-[11px] text-[#888888] font-mono truncate">{skill.promptKey}</p>
      </div>

      {/* Model badge */}
      <span className="shrink-0 rounded-sm bg-[#F5F5F5] px-2 py-0.5 text-[11px] font-medium text-[#888888] font-mono">
        {skill.model?.split("-").slice(0, 2).join("-") ?? skill.model}
      </span>

      {/* Active indicator */}
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          skill.isActive ? "bg-emerald-100 text-emerald-700" : "bg-[#F5F5F5] text-[#888888]"
        }`}
      >
        {skill.isActive ? "Active" : "Inactive"}
      </span>

      {/* Reorder + remove buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="flex size-7 items-center justify-center rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="flex size-7 items-center justify-center rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] hover:border-[#0F172B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="flex size-7 items-center justify-center rounded border border-[#E2E2E2] text-[#888888] hover:text-red-600 hover:border-red-300 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
