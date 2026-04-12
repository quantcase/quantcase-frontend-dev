import { Plus, X } from "lucide-react";
import { SectionPanel } from "@/components/molecules/section-panel";
import { Skill, NewSkillForm } from "./types";

interface Props {
  skills: Skill[];
  loading: boolean;
  showNewSkillForm: boolean;
  newSkillForm: NewSkillForm;
  onRowClick: (skill: Skill) => void;
  onToggleActive: (skill: Skill) => void;
  onDelete: (skillId: string) => void;
  onNewSkillFormOpen: () => void;
  onNewSkillFormClose: () => void;
  onNewSkillFormChange: (form: NewSkillForm) => void;
  onNewSkillCreate: () => void;
}

const TABLE_HEADERS = ["Name", "Description", "Model", "Max Tokens", "Prompt Key", "Active", ""];

export function SkillsLibraryTab({
  skills,
  loading,
  showNewSkillForm,
  newSkillForm,
  onRowClick,
  onToggleActive,
  onDelete,
  onNewSkillFormOpen,
  onNewSkillFormClose,
  onNewSkillFormChange,
  onNewSkillCreate,
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

              {showNewSkillForm && (
                <NewSkillRow
                  form={newSkillForm}
                  onChange={onNewSkillFormChange}
                  onCreate={onNewSkillCreate}
                  onCancel={onNewSkillFormClose}
                />
              )}
            </tbody>
          </table>

          {showNewSkillForm && (
            <div className="mt-3 border-t border-[#E2E2E2] pt-3">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                Output Schema (JSON, optional)
              </label>
              <textarea
                rows={3}
                placeholder='{"type": "object", "properties": {...}}'
                value={newSkillForm.outputSchema}
                onChange={(e) => onNewSkillFormChange({ ...newSkillForm, outputSchema: e.target.value })}
                className="w-full rounded border border-[#E2E2E2] px-3 py-2 text-xs font-mono text-[#0F172B] focus:outline-none focus:border-[#0F172B] resize-none"
              />
            </div>
          )}

          {skills.length === 0 && !showNewSkillForm && (
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

// ── NewSkillRow ────────────────────────────────────────────────────────────────

import { Check, XCircle } from "lucide-react";

interface NewSkillRowProps {
  form: NewSkillForm;
  onChange: (form: NewSkillForm) => void;
  onCreate: () => void;
  onCancel: () => void;
}

function NewSkillRow({ form, onChange, onCreate, onCancel }: NewSkillRowProps) {
  return (
    <tr className="bg-[#FAFAFA]">
      <td className="py-3 px-3 pl-0">
        <input
          placeholder="skill_name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className="w-full rounded border border-[#E2E2E2] px-2 py-1 text-xs text-[#0F172B] focus:outline-none focus:border-[#0F172B]"
        />
      </td>
      <td className="py-3 px-3">
        <input
          placeholder="Description…"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="w-full rounded border border-[#E2E2E2] px-2 py-1 text-xs text-[#0F172B] focus:outline-none focus:border-[#0F172B]"
        />
      </td>
      <td className="py-3 px-3">
        <input
          placeholder="anthropic/claude-sonnet-4-6"
          value={form.model}
          onChange={(e) => onChange({ ...form, model: e.target.value })}
          className="w-full rounded border border-[#E2E2E2] px-2 py-1 text-xs font-mono text-[#0F172B] focus:outline-none focus:border-[#0F172B]"
        />
      </td>
      <td className="py-3 px-3">
        <input
          type="number"
          placeholder="16000"
          value={form.maxTokens}
          onChange={(e) => onChange({ ...form, maxTokens: parseInt(e.target.value) || 0 })}
          className="w-20 rounded border border-[#E2E2E2] px-2 py-1 text-xs text-[#0F172B] focus:outline-none focus:border-[#0F172B]"
        />
      </td>
      <td className="py-3 px-3">
        <input
          placeholder="promptKey"
          value={form.promptKey}
          onChange={(e) => onChange({ ...form, promptKey: e.target.value })}
          className="w-full rounded border border-[#E2E2E2] px-2 py-1 text-xs font-mono text-[#0F172B] focus:outline-none focus:border-[#0F172B]"
        />
      </td>
      <td className="py-3 px-3">
        <button
          onClick={() => onChange({ ...form, isActive: !form.isActive })}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-colors ${
            form.isActive
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-[#F5F5F5] text-[#888888] border-[#E2E2E2]"
          }`}
        >
          {form.isActive ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onCreate}
            title="Create"
            className="flex size-7 items-center justify-center rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <Check className="size-3.5" />
          </button>
          <button
            onClick={onCancel}
            title="Cancel"
            className="flex size-7 items-center justify-center rounded border border-[#E2E2E2] text-[#888888] hover:text-[#0F172B] transition-colors"
          >
            <XCircle className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export { };
