"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, X } from "lucide-react";
import { apiCall, apiPost, apiPut, apiDelete } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { Skill, Plugin, NewSkillForm, DEFAULT_NEW_SKILL } from "./_components/types";
import { PluginSidebar } from "./_components/PluginSidebar";
import { PluginChainTab } from "./_components/PluginChainTab";
import { SkillsLibraryTab } from "./_components/SkillsLibraryTab";
import { SkillDrawer } from "./_components/SkillDrawer";

export default function PipelinesPage() {
  // ── Data state ────────────────────────────────────────────────────────────
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [pluginSkillChain, setPluginSkillChain] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"plugin" | "skills">("plugin");
  const [loading, setLoading] = useState({ plugins: false, chain: false, skills: false });
  const [mutationError, setMutationError] = useState<string | null>(null);

  // ── Skill drawer ──────────────────────────────────────────────────────────
  const [drawerSkill, setDrawerSkill] = useState<Skill | null>(null);

  // ── Skills Library create state ───────────────────────────────────────────
  const [showNewSkillForm, setShowNewSkillForm] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState<NewSkillForm>(DEFAULT_NEW_SKILL);

  // ── Plugin tab add-skill state ────────────────────────────────────────────
  const [addSkillId, setAddSkillId] = useState("");

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadPluginChain = useCallback((pluginId: string) => {
    apiCall<{ success: boolean; data: { id: string; order: number; skill: Skill }[] }>(
      `${BACKEND_URL}/admin/plugins/${pluginId}/skills`,
      {
        onStart: () => setLoading((l) => ({ ...l, chain: true })),
        onSuccess: (res) => setPluginSkillChain(res.data.map((ps) => ps.skill)),
        onError: (err) => setMutationError(err),
        onComplete: () => setLoading((l) => ({ ...l, chain: false })),
      }
    );
  }, []);

  useEffect(() => {
    apiCall<{ success: boolean; data: Plugin[] }>(`${BACKEND_URL}/admin/plugins`, {
      onStart: () => setLoading((l) => ({ ...l, plugins: true })),
      onSuccess: (res) => {
        setPlugins(res.data);
        if (res.data.length > 0) setSelectedPluginId(res.data[0].id);
      },
      onError: (err) => setMutationError(err),
      onComplete: () => setLoading((l) => ({ ...l, plugins: false })),
    });

    apiCall<{ success: boolean; data: Skill[] }>(`${BACKEND_URL}/admin/skills`, {
      onStart: () => setLoading((l) => ({ ...l, skills: true })),
      onSuccess: (res) => setAllSkills(res.data),
      onError: (err) => setMutationError(err),
      onComplete: () => setLoading((l) => ({ ...l, skills: false })),
    });
  }, []);

  useEffect(() => {
    if (!selectedPluginId) return;
    loadPluginChain(selectedPluginId);
  }, [selectedPluginId, loadPluginChain]);

  // ── Plugin chain mutations ────────────────────────────────────────────────

  function moveSkill(index: number, dir: "up" | "down") {
    const swapIdx = dir === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= pluginSkillChain.length) return;
    const prev = pluginSkillChain;
    const next = [...pluginSkillChain];
    [next[index], next[swapIdx]] = [next[swapIdx], next[index]];
    setPluginSkillChain(next);
    apiPut<{ success: boolean }>(
      `${BACKEND_URL}/admin/plugins/${selectedPluginId}/skills/order`,
      {
        onSuccess: () => {},
        onError: (err) => { setPluginSkillChain(prev); setMutationError(err); },
      },
      { orderedSkillIds: next.map((s) => s.id) }
    );
  }

  function removeSkillFromChain(skillId: string) {
    const prev = pluginSkillChain;
    setPluginSkillChain((chain) => chain.filter((s) => s.id !== skillId));
    apiDelete<{ success: boolean }>(
      `${BACKEND_URL}/admin/plugins/${selectedPluginId}/skills/${skillId}`,
      {
        onSuccess: () => {},
        onError: (err) => { setPluginSkillChain(prev); setMutationError(err); },
      }
    );
  }

  function addSkillToChain() {
    if (!addSkillId || !selectedPluginId) return;
    apiPost<{ success: boolean }>(
      `${BACKEND_URL}/admin/plugins/${selectedPluginId}/skills`,
      {
        onSuccess: () => { setAddSkillId(""); loadPluginChain(selectedPluginId); },
        onError: (err) => setMutationError(err),
      },
      { skillId: addSkillId, order: pluginSkillChain.length + 1 }
    );
  }

  // ── Skills library mutations ──────────────────────────────────────────────

  function toggleSkillActive(skill: Skill) {
    const prev = allSkills;
    setAllSkills((skills) => skills.map((s) => (s.id === skill.id ? { ...s, isActive: !s.isActive } : s)));
    apiPut<{ success: boolean; data: Skill }>(
      `${BACKEND_URL}/admin/skills/${skill.id}`,
      {
        onSuccess: (res) => setAllSkills((skills) => skills.map((s) => (s.id === skill.id ? res.data : s))),
        onError: (err) => { setAllSkills(prev); setMutationError(err); },
      },
      { isActive: !skill.isActive }
    );
  }

  // Returns a Promise so the drawer can show saving/saved state
  function saveSkillFromDrawer(
    skillId: string,
    updates: Partial<Omit<Skill, "id" | "pluginSkills">>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      apiPut<{ success: boolean; data: Skill }>(
        `${BACKEND_URL}/admin/skills/${skillId}`,
        {
          onSuccess: (res) => {
            setAllSkills((skills) => skills.map((s) => (s.id === skillId ? res.data : s)));
            setDrawerSkill(res.data);
            resolve();
          },
          onError: (err) => { setMutationError(err); reject(new Error(err)); },
        },
        updates
      );
    });
  }

  function deleteSkill(skillId: string) {
    const prev = allSkills;
    setAllSkills((skills) => skills.filter((s) => s.id !== skillId));
    apiDelete<{ success: boolean }>(
      `${BACKEND_URL}/admin/skills/${skillId}`,
      {
        onSuccess: () => {},
        onError: (err) => { setAllSkills(prev); setMutationError(err); },
      }
    );
  }

  function createSkill() {
    let parsedSchema: Record<string, unknown> | null = null;
    if (newSkillForm.outputSchema.trim()) {
      try {
        parsedSchema = JSON.parse(newSkillForm.outputSchema);
      } catch {
        setMutationError("outputSchema must be valid JSON");
        return;
      }
    }
    apiPost<{ success: boolean; data: Skill }>(
      `${BACKEND_URL}/admin/skills`,
      {
        onSuccess: (res) => {
          setAllSkills((skills) => [...skills, res.data]);
          setShowNewSkillForm(false);
          setNewSkillForm(DEFAULT_NEW_SKILL);
        },
        onError: (err) => setMutationError(err),
      },
      { ...newSkillForm, outputSchema: parsedSchema }
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const selectedPlugin = plugins.find((p) => p.id === selectedPluginId) ?? null;
  const chainSkillIds = new Set(pluginSkillChain.map((s) => s.id));
  const availableToAdd = allSkills.filter((s) => !chainSkillIds.has(s.id));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      <PluginSidebar
        plugins={plugins}
        selectedPluginId={selectedPluginId}
        loading={loading.plugins}
        onSelect={setSelectedPluginId}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F5F5]">
        {/* Page header */}
        <div>
          <h1 className="text-[22px] font-[400] text-[#0F172B]">AI Pipelines</h1>
          <p className="text-[14px] text-[#888888] mt-0.5">Manage skills and plugin configurations</p>
        </div>

        {/* Error banner */}
        {mutationError && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{mutationError}</span>
            <button onClick={() => setMutationError(null)} className="text-red-500 hover:text-red-700">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-[#E2E2E2] bg-white rounded-t-[10px] px-4">
          {(["plugin", "skills"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#0F172B] text-[#0F172B]"
                  : "border-transparent text-[#888888] hover:text-[#0F172B]"
              }`}
            >
              {tab === "plugin" ? "Plugin Chain" : "Skills Library"}
            </button>
          ))}
        </div>

        {activeTab === "plugin" && (
          <PluginChainTab
            selectedPlugin={selectedPlugin}
            chain={pluginSkillChain}
            availableToAdd={availableToAdd}
            loading={loading.chain}
            addSkillId={addSkillId}
            onAddSkillIdChange={setAddSkillId}
            onAddSkill={addSkillToChain}
            onMoveSkill={moveSkill}
            onRemoveSkill={removeSkillFromChain}
          />
        )}

        {activeTab === "skills" && (
          <SkillsLibraryTab
            skills={allSkills}
            loading={loading.skills}
            showNewSkillForm={showNewSkillForm}
            newSkillForm={newSkillForm}
            onRowClick={setDrawerSkill}
            onToggleActive={toggleSkillActive}
            onDelete={deleteSkill}
            onNewSkillFormOpen={() => { setShowNewSkillForm(true); setMutationError(null); }}
            onNewSkillFormClose={() => { setShowNewSkillForm(false); setNewSkillForm(DEFAULT_NEW_SKILL); }}
            onNewSkillFormChange={setNewSkillForm}
            onNewSkillCreate={createSkill}
          />
        )}
      </main>

      {/* Skill detail drawer */}
      <SkillDrawer
        skill={drawerSkill}
        onClose={() => setDrawerSkill(null)}
        onSave={saveSkillFromDrawer}
      />
    </div>
  );
}
