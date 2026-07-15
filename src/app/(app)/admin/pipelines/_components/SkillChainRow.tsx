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
    <div className="flex items-center gap-3 rounded-md border border-hair bg-card px-4 py-3">
      {/* Index badge */}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-ink-3">
        {index + 1}
      </span>

      {/* Skill info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{skill.name}</p>
        <p className="text-[11px] text-ink-3 font-mono truncate">{skill.promptKey}</p>
      </div>

      {/* Model badge */}
      <span className="shrink-0 rounded-sm bg-secondary px-2 py-0.5 text-[11px] font-medium text-ink-3 font-mono">
        {skill.model?.split("-").slice(0, 2).join("-") ?? skill.model}
      </span>

      {/* Active indicator */}
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          skill.isActive ? "bg-up-soft text-up" : "bg-secondary text-ink-3"
        }`}
      >
        {skill.isActive ? "Active" : "Inactive"}
      </span>

      {/* Reorder + remove buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="flex size-7 items-center justify-center rounded border border-hair text-ink-3 hover:text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="flex size-7 items-center justify-center rounded border border-hair text-ink-3 hover:text-ink hover:border-[var(--qc-ink)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="flex size-7 items-center justify-center rounded border border-hair text-ink-3 hover:text-down hover:border-down transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
