"use client";

import { Plus, Circle } from "lucide-react";
import { HtmlSkill, CATEGORY_LABELS } from "./types";

interface Props {
  skills: HtmlSkill[];
  selectedSlug: string | null;
  loading: boolean;
  onSelect: (slug: string) => void;
  onNew: () => void;
}

export function SkillSidebar({ skills, selectedSlug, loading, onSelect, onNew }: Props) {
  const byCategory = skills.reduce<Record<string, HtmlSkill[]>>((acc, skill) => {
    const cat = skill.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <aside
      className="flex h-full w-[240px] shrink-0 flex-col border-r border-[var(--qc-border-default)] bg-[var(--qc-card)]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--qc-border-default)]">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888888]">
          HTML Skills
        </span>
        <button
          onClick={onNew}
          className="flex items-center justify-center size-6 rounded border border-[var(--qc-border-default)] text-[#888888] hover:text-[var(--qc-ink)] hover:border-[var(--qc-ink)] transition-colors"
          title="New skill"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="space-y-1 px-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded bg-[#F5F5F5] animate-pulse" />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] text-[#888888]">
            No skills yet. Create one.
          </p>
        ) : (
          Object.entries(byCategory).map(([cat, catSkills]) => (
            <div key={cat} className="mb-3">
              <div className="px-4 py-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                </span>
              </div>
              {catSkills.map((skill) => (
                <button
                  key={skill.slug}
                  onClick={() => onSelect(skill.slug)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                    selectedSlug === skill.slug
                      ? "bg-[var(--qc-section)] text-[var(--qc-ink)]"
                      : "text-[#888888] hover:bg-[var(--qc-section)] hover:text-[var(--qc-ink)]"
                  }`}
                >
                  <Circle
                    className={`size-1.5 shrink-0 ${skill.is_active ? "fill-emerald-500 text-emerald-500" : "fill-zinc-300 text-zinc-300"}`}
                  />
                  <span className="truncate text-[13px]">{skill.name}</span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
